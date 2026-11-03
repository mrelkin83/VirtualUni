/**
 * Backfill de la estructura académica (Programas, Asignaturas, Periodos).
 *
 * Puebla los modelos nuevos a partir de los datos legados que ya existen:
 *   - Cada Course existente produce (o reutiliza) una Subject del catálogo
 *     del tenant con el mismo code/name/description/credits, y queda
 *     enlazado vía course.subjectId.
 *   - Cada valor distinto de Course.semester produce un AcademicPeriod del
 *     tenant y los cursos de ese semestre quedan enlazados.
 *   - Cada valor distinto de Student.program produce un Program en BORRADOR
 *     (educationLevel OTRO — el admin completa el nivel real después), un
 *     StudyPlan v1 en BORRADOR y un ProgramEnrollment por estudiante.
 *
 * IDEMPOTENTE: se puede correr N veces; todo se busca antes de crearse y los
 * enlaces solo se escriben donde aún son null. No borra ni sobreescribe nada.
 *
 * CÓMO CORRERLO (desde backend/):
 *   npx ts-node prisma/scripts/backfill-estructura-academica.ts
 */

import {
  PrismaClient,
  EducationLevel,
  Modality,
  PeriodStructure,
  AcademicUnit,
  PeriodStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

const resumen = {
  subjects: { creadas: 0, reutilizadas: 0 },
  cursosEnlazadosASubject: 0,
  periodos: { creados: 0, reutilizados: 0 },
  cursosEnlazadosAPeriodo: 0,
  programas: { creados: 0, reutilizados: 0 },
  pensums: { creados: 0, reutilizados: 0 },
  inscripciones: { creadas: 0, reutilizadas: 0 },
  omitidos: [] as string[],
};

/** Código estable y legible a partir de un nombre libre (determinista → idempotente). */
function codigoDesdeNombre(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // sin tildes
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

/**
 * Fechas razonables para un periodo a partir del texto legado de semestre.
 * Reconoce "2026-1"/"2026-2" (semestres colombianos) y años sueltos "2026";
 * cualquier otro texto cae al rango createdAt..updatedAt de sus cursos.
 */
function fechasDePeriodo(
  codigo: string,
  fallback: { desde: Date; hasta: Date },
): { desde: Date; hasta: Date } {
  const semestre = codigo.match(/^(\d{4})\s*-\s*([12])$/);
  if (semestre) {
    const anio = Number(semestre[1]);
    return semestre[2] === '1'
      ? { desde: new Date(anio, 0, 15), hasta: new Date(anio, 5, 15) }
      : { desde: new Date(anio, 6, 15), hasta: new Date(anio, 11, 15) };
  }
  const anual = codigo.match(/^(\d{4})$/);
  if (anual) {
    const anio = Number(anual[1]);
    return { desde: new Date(anio, 0, 15), hasta: new Date(anio, 11, 15) };
  }
  return fallback;
}

function estadoDePeriodo(desde: Date, hasta: Date): PeriodStatus {
  const hoy = new Date();
  if (hasta < hoy) return PeriodStatus.CERRADO;
  if (desde <= hoy) return PeriodStatus.EN_CURSO;
  return PeriodStatus.PLANEADO;
}

async function backfillSubjects(tenantId: string) {
  const cursos = await prisma.course.findMany({
    where: { tenantId },
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      credits: true,
      subjectId: true,
    },
  });

  for (const curso of cursos) {
    let subject = await prisma.subject.findFirst({
      where: { tenantId, code: curso.code },
      select: { id: true },
    });

    if (subject) {
      resumen.subjects.reutilizadas++;
    } else {
      subject = await prisma.subject.create({
        data: {
          tenantId,
          code: curso.code,
          name: curso.name,
          description: curso.description,
          credits: curso.credits,
        },
        select: { id: true },
      });
      resumen.subjects.creadas++;
    }

    if (!curso.subjectId) {
      await prisma.course.update({
        where: { id: curso.id },
        data: { subjectId: subject.id },
      });
      resumen.cursosEnlazadosASubject++;
    }
  }
}

async function backfillPeriodos(tenantId: string) {
  const semestres = await prisma.course.groupBy({
    by: ['semester'],
    where: { tenantId, semester: { not: null } },
  });

  for (const { semester } of semestres) {
    const codigo = semester?.trim();
    if (!codigo) {
      resumen.omitidos.push(`tenant ${tenantId}: semestre vacío`);
      continue;
    }

    let periodo = await prisma.academicPeriod.findFirst({
      where: { tenantId, code: codigo },
      select: { id: true },
    });

    if (periodo) {
      resumen.periodos.reutilizados++;
    } else {
      const rango = await prisma.course.aggregate({
        where: { tenantId, semester: codigo },
        _min: { createdAt: true },
        _max: { updatedAt: true },
      });
      const fallback = {
        desde: rango._min.createdAt ?? new Date(),
        hasta: rango._max.updatedAt ?? new Date(),
      };
      const { desde, hasta } = fechasDePeriodo(codigo, fallback);

      periodo = await prisma.academicPeriod.create({
        data: {
          tenantId,
          code: codigo,
          name: `Periodo ${codigo}`,
          startDate: desde,
          endDate: hasta,
          status: estadoDePeriodo(desde, hasta),
        },
        select: { id: true },
      });
      resumen.periodos.creados++;
    }

    const enlazados = await prisma.course.updateMany({
      where: { tenantId, semester: codigo, academicPeriodId: null },
      data: { academicPeriodId: periodo.id },
    });
    resumen.cursosEnlazadosAPeriodo += enlazados.count;
  }
}

async function backfillProgramas(tenantId: string) {
  const programasLegados = await prisma.student.groupBy({
    by: ['program'],
    where: { tenantId, program: { not: null } },
  });

  for (const { program } of programasLegados) {
    const nombre = program?.trim();
    if (!nombre) {
      resumen.omitidos.push(`tenant ${tenantId}: programa vacío`);
      continue;
    }

    const code = codigoDesdeNombre(nombre);
    let programa = await prisma.program.findFirst({
      where: { tenantId, code },
      select: { id: true },
    });

    if (programa) {
      resumen.programas.reutilizados++;
    } else {
      // educationLevel OTRO y estructura genérica a propósito: el estado
      // BORRADOR marca que el admin debe completar nivel, modalidad y
      // periodicidad reales; el backfill no los puede adivinar.
      programa = await prisma.program.create({
        data: {
          tenantId,
          code,
          name: nombre,
          description:
            'Creado automáticamente desde el campo legado Student.program. ' +
            'Complete nivel de formación, modalidad y estructura.',
          educationLevel: EducationLevel.OTRO,
          modality: Modality.VIRTUAL,
          periodStructure: PeriodStructure.SEMESTRAL,
          academicUnit: AcademicUnit.CREDITOS,
        },
        select: { id: true },
      });
      resumen.programas.creados++;
    }

    let pensum = await prisma.studyPlan.findFirst({
      where: { programId: programa.id, version: 'v1' },
      select: { id: true },
    });
    if (pensum) {
      resumen.pensums.reutilizados++;
    } else {
      pensum = await prisma.studyPlan.create({
        data: {
          tenantId,
          programId: programa.id,
          version: 'v1',
          notes: 'Versión inicial creada por el backfill; sin asignaturas aún.',
        },
        select: { id: true },
      });
      resumen.pensums.creados++;
    }

    const estudiantes = await prisma.student.findMany({
      where: { tenantId, program: nombre },
      select: { id: true, semester: true },
    });

    for (const estudiante of estudiantes) {
      const existente = await prisma.programEnrollment.findFirst({
        where: { studentId: estudiante.id, programId: programa.id },
        select: { id: true },
      });
      if (existente) {
        resumen.inscripciones.reutilizadas++;
        continue;
      }

      const nivel = Number.parseInt(estudiante.semester ?? '', 10);
      await prisma.programEnrollment.create({
        data: {
          tenantId,
          studentId: estudiante.id,
          programId: programa.id,
          studyPlanId: pensum.id,
          currentLevel: Number.isInteger(nivel) && nivel > 0 ? nivel : 1,
        },
      });
      resumen.inscripciones.creadas++;
    }
  }
}

async function main() {
  const tenants = await prisma.tenant.findMany({ select: { id: true, slug: true } });
  console.log(`Backfill de estructura académica sobre ${tenants.length} tenant(s)...`);

  for (const tenant of tenants) {
    console.log(`\n→ tenant ${tenant.slug}`);
    await backfillSubjects(tenant.id);
    await backfillPeriodos(tenant.id);
    await backfillProgramas(tenant.id);
  }

  console.log('\n===== RESUMEN =====');
  console.log(JSON.stringify(resumen, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
