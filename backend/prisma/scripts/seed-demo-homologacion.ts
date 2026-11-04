/**
 * Datos demo del caso real de homologación (tenant `uniprueba`).
 *
 * Carga el **Técnico Laboral en Auxiliar Contable y Financiero** con sus 12
 * módulos y 3 bloques de competencia, los 4 programas destino con las
 * asignaturas compartidas EXACTAS del documento de la institución, y un
 * estudiante egresado con las 12 asignaturas aprobadas en el historial, para
 * que el simulador muestre 8/9/6/5 de entrada.
 *
 * Las asignaturas propias de los programas destino no existen en el documento
 * de la institución: se crean con el sufijo "(ejemplo)" en el nombre para
 * completar cada pensum sin inventar un plan de estudios real.
 *
 * IDEMPOTENTE: se puede correr N veces. Todo se busca antes de crearse y nada
 * se borra ni se sobreescribe.
 *
 * CÓMO CORRERLO (desde backend/):
 *   npx ts-node prisma/scripts/seed-demo-homologacion.ts
 */

import {
  PrismaClient,
  AcademicUnit,
  EducationLevel,
  Modality,
  PeriodStructure,
  ProgramStatus,
  RecordOrigin,
  StudyPlanStatus,
  SubjectType,
  UserRole,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SUBDOMINIO = 'uniprueba';
const EGRESADO_EMAIL = 'egresado.contable@uniprueba.com';
const EGRESADO_PASSWORD = 'Estudiante123!';

/** Los 12 módulos del programa contable, con su bloque de competencia. */
const MODULOS = [
  { code: 'ADM1', name: 'Administración 1', bloque: 'ADMIN' },
  { code: 'ADM2', name: 'Administración 2', bloque: 'ADMIN' },
  { code: 'CONT1', name: 'Contabilidad 1', bloque: 'CONTABLE' },
  { code: 'CONT2', name: 'Contabilidad 2', bloque: 'CONTABLE' },
  { code: 'ECON', name: 'Economía', bloque: 'ADMIN' },
  { code: 'MATFIN', name: 'Matemáticas Financieras', bloque: 'CONTABLE' },
  { code: 'ANFIN', name: 'Análisis Financiero', bloque: 'CONTABLE' },
  { code: 'COSTOS', name: 'Costos y Presupuestos', bloque: 'CONTABLE' },
  { code: 'LEGLAB', name: 'Legislación Laboral', bloque: 'LEGAL' },
  { code: 'ING1', name: 'Inglés 1', bloque: 'LEGAL' },
  { code: 'LEGCOM', name: 'Legislación Comercial', bloque: 'LEGAL' },
  { code: 'PROY', name: 'Gestión de Proyectos', bloque: 'LEGAL' },
] as const;

/**
 * Bloques de competencia. El documento nombra los tres bloques pero no dice
 * qué módulo va en cada uno: este reparto es una PROPUESTA y el admin lo
 * puede cambiar desde el editor de pensum.
 */
const BLOQUES = [
  {
    clave: 'ADMIN',
    name: 'Bloque Administrativo',
    description:
      'Competencias administrativas y económicas. Reparto propuesto: el documento de la institución nombra los bloques pero no asigna los módulos.',
  },
  {
    clave: 'CONTABLE',
    name: 'Bloque Contable-Financiero',
    description:
      'Competencias contables y financieras. Reparto propuesto, ajustable por la institución.',
  },
  {
    clave: 'LEGAL',
    name: 'Bloque Legal y de Proyectos',
    description:
      'Competencias legales, de idioma y de gestión de proyectos. Reparto propuesto, ajustable.',
  },
] as const;

/** Programas destino con las asignaturas compartidas EXACTAS del documento. */
const DESTINOS = [
  {
    code: 'TL-ADMIN-EMP',
    name: 'Técnico Laboral en Administración de Empresas',
    degreeTitle: 'Técnico Laboral en Administración de Empresas',
    compartidas: [
      'ADM1',
      'ADM2',
      'ECON',
      'COSTOS',
      'LEGLAB',
      'LEGCOM',
      'ING1',
      'PROY',
    ],
  },
  {
    code: 'TL-ASIS-ADMIN',
    name: 'Técnico Laboral en Asistente Administrativo',
    degreeTitle: 'Técnico Laboral en Asistente Administrativo',
    compartidas: [
      'ADM1',
      'ADM2',
      'ECON',
      'COSTOS',
      'LEGLAB',
      'LEGCOM',
      'ING1',
      'PROY',
      'CONT1',
    ],
  },
  {
    code: 'TL-MERCADEO',
    name: 'Técnico Laboral en Mercadeo y Comercio Internacional',
    degreeTitle: 'Técnico Laboral en Mercadeo y Comercio Internacional',
    compartidas: ['ADM1', 'ECON', 'COSTOS', 'LEGCOM', 'ING1', 'PROY'],
  },
  {
    code: 'TL-TALENTO',
    name: 'Técnico Laboral en Gestión del Talento Humano',
    degreeTitle: 'Técnico Laboral en Gestión del Talento Humano',
    compartidas: ['ADM1', 'LEGLAB', 'LEGCOM', 'ING1', 'PROY'],
  },
] as const;

const resumen = {
  asignaturas: { creadas: 0, reutilizadas: 0 },
  programas: { creados: 0, reutilizados: 0 },
  pensums: { creados: 0, reutilizados: 0 },
  filas: { creadas: 0, reutilizadas: 0 },
  bloques: { creados: 0, reutilizados: 0 },
  historial: { creados: 0, reutilizados: 0 },
  notas: [] as string[],
};

async function asignatura(
  tenantId: string,
  code: string,
  name: string,
  opciones: { credits?: number; hours?: number; area?: string } = {},
) {
  const existente = await prisma.subject.findFirst({
    where: { tenantId, code },
  });
  if (existente) {
    resumen.asignaturas.reutilizadas++;
    return existente;
  }
  resumen.asignaturas.creadas++;
  return prisma.subject.create({
    data: {
      tenantId,
      code,
      name,
      credits: opciones.credits ?? 1,
      hours: opciones.hours,
      area: opciones.area,
    },
  });
}

async function programaConPensum(
  tenantId: string,
  datos: {
    code: string;
    name: string;
    degreeTitle: string;
    durationPeriods: number;
    totalCredits: number;
  },
) {
  let programa = await prisma.program.findFirst({
    where: { tenantId, code: datos.code },
  });
  if (programa) {
    resumen.programas.reutilizados++;
  } else {
    resumen.programas.creados++;
    programa = await prisma.program.create({
      data: {
        tenantId,
        code: datos.code,
        name: datos.name,
        degreeTitle: datos.degreeTitle,
        educationLevel: EducationLevel.TECNICO_LABORAL,
        modality: Modality.PRESENCIAL,
        periodStructure: PeriodStructure.MODULAR,
        academicUnit: AcademicUnit.CREDITOS,
        durationPeriods: datos.durationPeriods,
        totalCredits: datos.totalCredits,
        status: ProgramStatus.ACTIVO,
        // Política académica: 1 crédito = 48 h según el documento
        hoursPerCredit: 48,
        passingGrade: 3.0,
        gradeScaleMax: 5.0,
      },
    });
  }

  let pensum = await prisma.studyPlan.findFirst({
    where: { tenantId, programId: programa.id, version: '2027-1' },
  });
  if (pensum) {
    resumen.pensums.reutilizados++;
  } else {
    resumen.pensums.creados++;
    pensum = await prisma.studyPlan.create({
      data: {
        tenantId,
        programId: programa.id,
        version: '2027-1',
        status: StudyPlanStatus.VIGENTE,
        validFrom: new Date('2027-01-15'),
        notes: 'Pensum demo cargado por seed-demo-homologacion',
      },
    });
  }

  return { programa, pensum };
}

async function filaDePensum(
  tenantId: string,
  studyPlanId: string,
  subjectId: string,
  level: number,
  blockId?: string,
) {
  const existente = await prisma.studyPlanSubject.findFirst({
    where: { studyPlanId, subjectId },
  });
  if (existente) {
    resumen.filas.reutilizadas++;
    // Solo completa el bloque si aún no lo tiene: no sobreescribe decisiones
    if (blockId && !existente.blockId) {
      await prisma.studyPlanSubject.update({
        where: { id: existente.id },
        data: { blockId },
      });
    }
    return existente;
  }
  resumen.filas.creadas++;
  return prisma.studyPlanSubject.create({
    data: {
      tenantId,
      studyPlanId,
      subjectId,
      level,
      subjectType: SubjectType.OBLIGATORIA,
      credits: 1,
      // El documento no desglosa horas teóricas/prácticas: se deja sin
      // desglosar a propósito, y el editor avisará de ello.
      orderIndex: level - 1,
      blockId,
    },
  });
}

async function main() {
  const tenant = await prisma.tenant.findFirst({
    where: { subdomain: SUBDOMINIO },
    select: { id: true, name: true },
  });
  if (!tenant) {
    throw new Error(
      `No existe el tenant "${SUBDOMINIO}". Corre primero npm run prisma:seed.`,
    );
  }
  const tenantId = tenant.id;
  console.log(`\nTenant: ${tenant.name} (${SUBDOMINIO})\n`);

  // ---- 1. Programa origen: Técnico Laboral Auxiliar Contable -------
  const { programa: origen, pensum: pensumOrigen } = await programaConPensum(
    tenantId,
    {
      code: 'TL-AUX-CONTABLE',
      name: 'Técnico Laboral en Auxiliar Contable y Financiero',
      degreeTitle: 'Técnico Laboral en Auxiliar Contable y Financiero',
      durationPeriods: 12,
      totalCredits: 12,
    },
  );

  // Bloques de competencia del pensum origen
  const bloquePorClave = new Map<string, string>();
  for (const [i, bloque] of BLOQUES.entries()) {
    const existente = await prisma.studyPlanBlock.findFirst({
      where: { tenantId, studyPlanId: pensumOrigen.id, name: bloque.name },
    });
    if (existente) {
      resumen.bloques.reutilizados++;
      bloquePorClave.set(bloque.clave, existente.id);
      continue;
    }
    resumen.bloques.creados++;
    const creado = await prisma.studyPlanBlock.create({
      data: {
        tenantId,
        studyPlanId: pensumOrigen.id,
        name: bloque.name,
        description: bloque.description,
        orderIndex: i,
        certifiable: true,
      },
    });
    bloquePorClave.set(bloque.clave, creado.id);
  }

  // Los 12 módulos, uno por nivel (programa MODULAR)
  const subjectPorCodigo = new Map<string, string>();
  for (const [i, modulo] of MODULOS.entries()) {
    const sub = await asignatura(tenantId, modulo.code, modulo.name, {
      credits: 1,
      area: modulo.bloque === 'CONTABLE' ? 'Contable-Financiera' : undefined,
    });
    subjectPorCodigo.set(modulo.code, sub.id);
    await filaDePensum(
      tenantId,
      pensumOrigen.id,
      sub.id,
      i + 1,
      bloquePorClave.get(modulo.bloque),
    );
  }

  // ---- 2. Programas destino ----------------------------------------
  for (const destino of DESTINOS) {
    const { pensum } = await programaConPensum(tenantId, {
      code: destino.code,
      name: destino.name,
      degreeTitle: destino.degreeTitle,
      durationPeriods: 12,
      totalCredits: 12,
    });

    // Compartidas: la MISMA Subject del origen (así el reconocimiento
    // interno es automático, sin equivalencias declaradas)
    let nivel = 1;
    for (const code of destino.compartidas) {
      const subjectId = subjectPorCodigo.get(code)!;
      await filaDePensum(tenantId, pensum.id, subjectId, nivel++);
    }

    // Propias: no existen en el documento, se marcan "(ejemplo)"
    const faltan = 12 - destino.compartidas.length;
    for (let i = 1; i <= faltan; i++) {
      const code = `${destino.code}-P${i}`;
      const sub = await asignatura(
        tenantId,
        code,
        `Módulo propio ${i} de ${destino.name} (ejemplo)`,
        { credits: 1 },
      );
      await filaDePensum(tenantId, pensum.id, sub.id, nivel++);
    }
  }

  // ---- 3. Estudiante egresado del programa contable ----------------
  const existente = await prisma.user.findFirst({
    where: { tenantId, email: EGRESADO_EMAIL },
    include: { student: true },
  });

  let studentId: string;
  if (existente?.student) {
    studentId = existente.student.id;
    resumen.notas.push(`Egresado demo reutilizado: ${EGRESADO_EMAIL}`);
  } else {
    const passwordHash = await bcrypt.hash(EGRESADO_PASSWORD, 10);
    const creado = await prisma.user.create({
      data: {
        tenantId,
        email: EGRESADO_EMAIL,
        passwordHash,
        firstName: 'Marcela',
        lastName: 'Duarte',
        role: UserRole.STUDENT,
        student: {
          create: {
            tenantId,
            studentCode: 'EGR-CONT-001',
            status: 'active',
            enrollmentDate: new Date('2026-01-20'),
          },
        },
      },
      include: { student: true },
    });
    studentId = creado.student!.id;
    resumen.notas.push(
      `Egresado demo creado: ${EGRESADO_EMAIL} / ${EGRESADO_PASSWORD}`,
    );
  }

  // Inscripción al programa contable, ya GRADUADO
  const inscripcion = await prisma.programEnrollment.findFirst({
    where: { tenantId, studentId, programId: origen.id },
  });
  if (!inscripcion) {
    await prisma.programEnrollment.create({
      data: {
        tenantId,
        studentId,
        programId: origen.id,
        studyPlanId: pensumOrigen.id,
        currentLevel: 12,
        status: 'GRADUADO',
        startDate: new Date('2026-01-20'),
        endDate: new Date('2026-12-15'),
      },
    });
  }

  // Historial: las 12 asignaturas aprobadas (origen CURSADA, sin grupo)
  for (const modulo of MODULOS) {
    const subjectId = subjectPorCodigo.get(modulo.code)!;
    const existente = await prisma.studentSubjectRecord.findFirst({
      where: { tenantId, studentId, subjectId },
    });
    if (existente) {
      resumen.historial.reutilizados++;
      continue;
    }
    resumen.historial.creados++;
    await prisma.studentSubjectRecord.create({
      data: {
        tenantId,
        studentId,
        subjectId,
        origin: RecordOrigin.CURSADA,
        finalGrade: 4.2,
        passed: true,
        creditsSnapshot: 1,
        hoursSnapshot: 48,
        approvedAt: new Date('2026-12-15'),
        notes: 'Historial demo del egresado contable',
      },
    });
  }

  // ---- 4. Resumen --------------------------------------------------
  console.log('Asignaturas:', resumen.asignaturas);
  console.log('Programas:  ', resumen.programas);
  console.log('Pensums:    ', resumen.pensums);
  console.log('Filas:      ', resumen.filas);
  console.log('Bloques:    ', resumen.bloques);
  console.log('Historial:  ', resumen.historial);
  resumen.notas.forEach((n) => console.log('-', n));

  console.log(
    '\nReconocimiento esperado para el egresado contable:\n' +
      '  T.L. Administración de Empresas .......... 8 de 12\n' +
      '  T.L. Asistente Administrativo ............ 9 de 12\n' +
      '  T.L. Mercadeo y Comercio Internacional ... 6 de 12\n' +
      '  T.L. Gestión del Talento Humano .......... 5 de 12\n' +
      '\nAdvertencia esperada en el pensum origen: 12 créditos × 48 h = 576 h,\n' +
      'por debajo del mínimo de 600 h para formación laboral.\n',
  );
}

main()
  .catch((error) => {
    console.error('Falló el seed demo de homologación:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
