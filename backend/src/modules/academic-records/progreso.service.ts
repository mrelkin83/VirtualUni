import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import {
  AcademicUnit,
  ProgramStatus,
  RecordOrigin,
  RecordStatus,
  StudyPlanStatus,
  SubjectType,
} from '@prisma/client';
import { CurrentUserData } from '@/common/decorators/current-user.decorator';
import { POLITICA_ACADEMICA_POR_DEFECTO } from '@/common/config/politica-academica';
import { horasDeAsignatura } from './calculo-notas';

const STAFF = ['TENANT_ADMIN', 'SUPER_ADMIN'];

export type EstadoDeAsignatura =
  | 'APROBADA'
  | 'EN_CURSO'
  | 'PENDIENTE'
  | 'BLOQUEADA_POR_PRERREQUISITO';

export interface AsignaturaDeProgreso {
  studyPlanSubjectId: string;
  subjectId: string;
  code: string;
  name: string;
  level: number;
  subjectType: SubjectType;
  credits: number | null;
  hours: number | null;
  blockId: string | null;
  estado: EstadoDeAsignatura;
  finalGrade: number | null;
  /** Cómo quedó aprobada; null si todavía no lo está. */
  origin: RecordOrigin | null;
  /** true cuando no la cursó en este programa (reconocida u homologada). */
  reconocida: boolean;
  /** Si se aprobó por equivalencia, la Subject que realmente cursó. */
  viaSubjectId: string | null;
  /** Nombres de los prerrequisitos que aún no ha aprobado. */
  prerrequisitosPendientes: string[];
}

export interface NivelDeProgreso {
  level: number;
  asignaturas: AsignaturaDeProgreso[];
}

/** Una Subject aprobada del historial, ya resuelta a lo mínimo necesario. */
interface Aprobada {
  subjectId: string;
  finalGrade: number | null;
  origin: RecordOrigin;
  creditsSnapshot: number | null;
  hoursSnapshot: number | null;
  recordId: string;
  /**
   * El estudiante tiene ALGÚN registro de esta asignatura que no es CURSADA:
   * la trae reconocida u homologada. Se mira sobre todos sus registros, no
   * solo sobre el que se conserva, porque el conservado es el original
   * cursado y por sí solo no lo diría.
   */
  reconocidaEnAlgunPrograma: boolean;
}

@Injectable()
export class ProgresoService {
  constructor(private prisma: PrismaService) {}

  // ----------------------------------------------------------------
  // Datos base
  // ----------------------------------------------------------------

  /** Asignaturas aprobadas y vigentes del estudiante, una por Subject. */
  private async aprobadasDelEstudiante(
    tenantId: string,
    studentId: string,
  ): Promise<Map<string, Aprobada>> {
    const registros = await this.prisma.studentSubjectRecord.findMany({
      where: {
        tenantId,
        studentId,
        passed: true,
        status: RecordStatus.VIGENTE,
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        subjectId: true,
        finalGrade: true,
        origin: true,
        creditsSnapshot: true,
        hoursSnapshot: true,
      },
    });

    // Varias filas para la misma Subject son posibles (p. ej. la cursada y su
    // reconocimiento en otro programa). Se conserva la primera —la cursada—,
    // pero se recuerda si alguna de las demás es un reconocimiento.
    const porSubject = new Map<string, Aprobada>();
    for (const r of registros) {
      const esReconocimiento = r.origin !== RecordOrigin.CURSADA;
      const yaVista = porSubject.get(r.subjectId);
      if (yaVista) {
        if (esReconocimiento) yaVista.reconocidaEnAlgunPrograma = true;
        continue;
      }
      porSubject.set(r.subjectId, {
        subjectId: r.subjectId,
        finalGrade: r.finalGrade,
        origin: r.origin,
        creditsSnapshot: r.creditsSnapshot,
        hoursSnapshot: r.hoursSnapshot,
        recordId: r.id,
        reconocidaEnAlgunPrograma: esReconocimiento,
      });
    }
    return porSubject;
  }

  /**
   * Equivalencias del tenant como mapa "asignatura destino → asignaturas que
   * la satisfacen". Las bidireccionales cuentan en los dos sentidos.
   */
  private async equivalencias(tenantId: string): Promise<Map<string, string[]>> {
    const filas = await this.prisma.subjectEquivalence.findMany({
      where: { tenantId },
      select: {
        sourceSubjectId: true,
        targetSubjectId: true,
        bidirectional: true,
      },
    });

    const mapa = new Map<string, string[]>();
    const agregar = (destino: string, origen: string) => {
      const lista = mapa.get(destino) ?? [];
      if (!lista.includes(origen)) lista.push(origen);
      mapa.set(destino, lista);
    };

    for (const f of filas) {
      agregar(f.targetSubjectId, f.sourceSubjectId);
      if (f.bidirectional) agregar(f.sourceSubjectId, f.targetSubjectId);
    }
    return mapa;
  }

  /**
   * ¿Esta asignatura del pensum está aprobada? Primero por la misma Subject
   * (reconocimiento automático entre programas de la institución) y después
   * por equivalencia declarada.
   */
  private resolverAprobacion(
    subjectId: string,
    aprobadas: Map<string, Aprobada>,
    equivalencias: Map<string, string[]>,
  ): { aprobada: Aprobada; viaSubjectId: string | null } | null {
    const directa = aprobadas.get(subjectId);
    if (directa) return { aprobada: directa, viaSubjectId: null };

    for (const origen of equivalencias.get(subjectId) ?? []) {
      const porEquivalencia = aprobadas.get(origen);
      if (porEquivalencia) {
        return { aprobada: porEquivalencia, viaSubjectId: origen };
      }
    }
    return null;
  }

  /** Subjects que el estudiante está cursando ahora (grupo con matrícula activa). */
  private async enCurso(tenantId: string, studentId: string): Promise<Set<string>> {
    const matriculas = await this.prisma.enrollment.findMany({
      where: { tenantId, studentId, status: 'active' },
      select: { course: { select: { subjectId: true } } },
    });
    return new Set(
      matriculas
        .map((m) => m.course.subjectId)
        .filter((id): id is string => id != null),
    );
  }

  // ----------------------------------------------------------------
  // Fase B: progreso de un programa
  // ----------------------------------------------------------------

  /**
   * Avance del estudiante en SU programa. Los porcentajes se calculan siempre
   * sobre el total del pensum DESTINO (el de esta inscripción), no sobre el
   * programa de origen de las asignaturas reconocidas.
   */
  async progresoDeInscripcion(
    tenantId: string,
    programEnrollmentId: string,
    user: CurrentUserData,
  ) {
    const inscripcion = await this.prisma.programEnrollment.findFirst({
      where: { id: programEnrollmentId, tenantId },
      include: {
        student: { select: { id: true, userId: true, studentCode: true } },
        program: {
          select: {
            id: true,
            code: true,
            name: true,
            academicUnit: true,
            educationLevel: true,
            hoursPerCredit: true,
            totalCredits: true,
            totalHours: true,
          },
        },
        studyPlan: { select: { id: true, version: true, status: true } },
      },
    });
    if (!inscripcion) throw new NotFoundException('Inscripción no encontrada');

    if (user.role === 'STUDENT' && inscripcion.student.userId !== user.userId) {
      throw new ForbiddenException('Solo puedes consultar tu propio avance');
    }

    const progreso = await this.computarProgreso(
      tenantId,
      inscripcion.studentId,
      inscripcion.studyPlanId,
      inscripcion.program.hoursPerCredit,
      inscripcion.program.academicUnit,
    );

    return {
      programEnrollmentId: inscripcion.id,
      studentId: inscripcion.studentId,
      studentCode: inscripcion.student.studentCode,
      programId: inscripcion.program.id,
      programCode: inscripcion.program.code,
      programName: inscripcion.program.name,
      studyPlanId: inscripcion.studyPlan.id,
      studyPlanVersion: inscripcion.studyPlan.version,
      academicUnit: inscripcion.program.academicUnit,
      currentLevel: inscripcion.currentLevel,
      status: inscripcion.status,
      ...progreso,
    };
  }

  /**
   * Núcleo del cálculo, sin autorización ni formato: estado de cada fila del
   * pensum y totales. Lo reutilizan el progreso, el simulador y la matriz.
   */
  async computarProgreso(
    tenantId: string,
    studentId: string,
    studyPlanId: string,
    hoursPerCredit: number,
    academicUnit: AcademicUnit,
  ) {
    const [filas, prerrequisitos, aprobadas, equivalencias, cursando] =
      await Promise.all([
        this.prisma.studyPlanSubject.findMany({
          where: { tenantId, studyPlanId },
          orderBy: [{ level: 'asc' }, { orderIndex: 'asc' }],
          include: {
            subject: {
              select: { id: true, code: true, name: true, credits: true, hours: true },
            },
          },
        }),
        this.prisma.studyPlanPrerequisite.findMany({
          where: { tenantId, entry: { studyPlanId } },
          select: {
            entryId: true,
            required: {
              select: {
                id: true,
                subjectId: true,
                subject: { select: { name: true } },
              },
            },
          },
        }),
        this.aprobadasDelEstudiante(tenantId, studentId),
        this.equivalencias(tenantId),
        this.enCurso(tenantId, studentId),
      ]);

    const porEntrada = new Map<
      string,
      Array<{ subjectId: string; nombre: string }>
    >();
    for (const p of prerrequisitos) {
      const lista = porEntrada.get(p.entryId) ?? [];
      lista.push({ subjectId: p.required.subjectId, nombre: p.required.subject.name });
      porEntrada.set(p.entryId, lista);
    }

    const asignaturas: AsignaturaDeProgreso[] = filas.map((fila) => {
      const credits = fila.credits ?? fila.subject.credits ?? null;
      const hours = horasDeAsignatura(
        fila.hours ?? fila.subject.hours,
        credits,
        hoursPerCredit,
      );
      const resuelta = this.resolverAprobacion(
        fila.subjectId,
        aprobadas,
        equivalencias,
      );

      const pendientesDePrerrequisito = (porEntrada.get(fila.id) ?? [])
        .filter(
          (p) => !this.resolverAprobacion(p.subjectId, aprobadas, equivalencias),
        )
        .map((p) => p.nombre);

      let estado: EstadoDeAsignatura;
      if (resuelta) estado = 'APROBADA';
      else if (cursando.has(fila.subjectId)) estado = 'EN_CURSO';
      else if (pendientesDePrerrequisito.length > 0)
        estado = 'BLOQUEADA_POR_PRERREQUISITO';
      else estado = 'PENDIENTE';

      return {
        studyPlanSubjectId: fila.id,
        subjectId: fila.subjectId,
        code: fila.subject.code,
        name: fila.subject.name,
        level: fila.level,
        subjectType: fila.subjectType,
        credits,
        hours,
        blockId: fila.blockId,
        estado,
        finalGrade: resuelta?.aprobada.finalGrade ?? null,
        origin: resuelta?.aprobada.origin ?? null,
        // Reconocida = no la cursó dentro de este programa: vino de otro
        // programa, de otra institución o de una asignatura equivalente.
        reconocida: resuelta
          ? resuelta.aprobada.origin !== RecordOrigin.CURSADA ||
            resuelta.aprobada.reconocidaEnAlgunPrograma ||
            resuelta.viaSubjectId != null
          : false,
        viaSubjectId: resuelta?.viaSubjectId ?? null,
        prerrequisitosPendientes: pendientesDePrerrequisito,
      };
    });

    const niveles: NivelDeProgreso[] = [];
    for (const a of asignaturas) {
      const nivel = niveles.find((n) => n.level === a.level);
      if (nivel) nivel.asignaturas.push(a);
      else niveles.push({ level: a.level, asignaturas: [a] });
    }

    const suma = (lista: AsignaturaDeProgreso[], campo: 'credits' | 'hours') =>
      lista.reduce((acc, a) => acc + (a[campo] ?? 0), 0);

    const aprobadasEnPlan = asignaturas.filter((a) => a.estado === 'APROBADA');
    const creditosTotales = suma(asignaturas, 'credits');
    const horasTotales = suma(asignaturas, 'hours');
    const creditosAprobados = suma(aprobadasEnPlan, 'credits');
    const horasAprobadas = suma(aprobadasEnPlan, 'hours');

    const pct = (parte: number, total: number) =>
      total > 0 ? Math.round((parte / total) * 1000) / 10 : 0;

    const porcentajeCreditos = pct(creditosAprobados, creditosTotales);
    const porcentajeHoras = pct(horasAprobadas, horasTotales);

    return {
      niveles,
      resumen: {
        asignaturasTotales: asignaturas.length,
        asignaturasAprobadas: aprobadasEnPlan.length,
        asignaturasReconocidas: aprobadasEnPlan.filter((a) => a.reconocida).length,
        asignaturasEnCurso: asignaturas.filter((a) => a.estado === 'EN_CURSO').length,
        asignaturasPendientes: asignaturas.filter((a) => a.estado === 'PENDIENTE')
          .length,
        asignaturasBloqueadas: asignaturas.filter(
          (a) => a.estado === 'BLOQUEADA_POR_PRERREQUISITO',
        ).length,
        creditosTotales,
        creditosAprobados,
        horasTotales,
        horasAprobadas,
        porcentajeCreditos,
        porcentajeHoras,
        // El % principal según la unidad académica del programa; el pensum
        // DESTINO es siempre el denominador.
        porcentajeAvance:
          academicUnit === AcademicUnit.CREDITOS
            ? porcentajeCreditos
            : porcentajeHoras,
      },
    };
  }

  // ----------------------------------------------------------------
  // Fase B: reconocimiento automático al inscribir
  // ----------------------------------------------------------------

  /**
   * Qué se le reconocería al estudiante si se inscribiera en este programa.
   * Se consulta ANTES de confirmar la inscripción.
   */
  async previsualizarReconocimiento(
    tenantId: string,
    studentId: string,
    programId: string,
    studyPlanId?: string,
  ) {
    const [estudiante, programa] = await Promise.all([
      this.prisma.student.findFirst({
        where: { id: studentId, tenantId },
        select: { id: true },
      }),
      this.prisma.program.findFirst({
        where: { id: programId, tenantId },
        select: {
          id: true,
          code: true,
          name: true,
          academicUnit: true,
          hoursPerCredit: true,
        },
      }),
    ]);
    if (!estudiante) throw new NotFoundException('Estudiante no encontrado');
    if (!programa) throw new NotFoundException('Programa no encontrado');

    const plan = await this.planDestino(tenantId, programId, studyPlanId);

    const progreso = await this.computarProgreso(
      tenantId,
      studentId,
      plan.id,
      programa.hoursPerCredit,
      programa.academicUnit,
    );

    const todas = progreso.niveles.flatMap((n) => n.asignaturas);
    const reconocibles = todas.filter((a) => a.estado === 'APROBADA');

    return {
      programId: programa.id,
      programCode: programa.code,
      programName: programa.name,
      studyPlanId: plan.id,
      studyPlanVersion: plan.version,
      academicUnit: programa.academicUnit,
      reconocibles: reconocibles.map((a) => ({
        subjectId: a.subjectId,
        code: a.code,
        name: a.name,
        level: a.level,
        credits: a.credits,
        hours: a.hours,
        finalGrade: a.finalGrade,
        origin: a.origin,
        viaSubjectId: a.viaSubjectId,
      })),
      faltantes: todas
        .filter((a) => a.estado !== 'APROBADA')
        .map((a) => ({
          subjectId: a.subjectId,
          code: a.code,
          name: a.name,
          level: a.level,
          credits: a.credits,
          hours: a.hours,
        })),
      resumen: progreso.resumen,
    };
  }

  /**
   * Crea los registros RECONOCIMIENTO_INTERNO de una inscripción ya hecha.
   *
   * El historial es del estudiante, así que el avance ya se vería correcto sin
   * estas filas; se crean porque dejan constancia de QUÉ se reconoció al
   * entrar a este programa y quién lo autorizó. Es idempotente: si ya existe
   * el reconocimiento de esa asignatura para ese registro original, no se
   * duplica. No recalcula nada: copia nota y `passed` del original.
   */
  async aplicarReconocimientoInterno(
    tenantId: string,
    programEnrollmentId: string,
    user: CurrentUserData,
  ) {
    if (!STAFF.includes(user.role)) {
      throw new ForbiddenException(
        'Solo un administrador puede aplicar el reconocimiento',
      );
    }

    const inscripcion = await this.prisma.programEnrollment.findFirst({
      where: { id: programEnrollmentId, tenantId },
      include: {
        program: { select: { id: true, name: true, hoursPerCredit: true } },
      },
    });
    if (!inscripcion) throw new NotFoundException('Inscripción no encontrada');

    const [filas, aprobadas, equivalencias, yaReconocidas] = await Promise.all([
      this.prisma.studyPlanSubject.findMany({
        where: { tenantId, studyPlanId: inscripcion.studyPlanId },
        include: {
          subject: { select: { id: true, credits: true, hours: true } },
        },
      }),
      this.aprobadasDelEstudiante(tenantId, inscripcion.studentId),
      this.equivalencias(tenantId),
      this.prisma.studentSubjectRecord.findMany({
        where: {
          tenantId,
          studentId: inscripcion.studentId,
          origin: RecordOrigin.RECONOCIMIENTO_INTERNO,
          status: RecordStatus.VIGENTE,
        },
        select: { subjectId: true, sourceRecordId: true },
      }),
    ]);

    const yaHecho = new Set(
      yaReconocidas.map((r) => `${r.subjectId}|${r.sourceRecordId ?? ''}`),
    );
    const ahora = new Date();
    const creados: string[] = [];

    for (const fila of filas) {
      const resuelta = this.resolverAprobacion(
        fila.subjectId,
        aprobadas,
        equivalencias,
      );
      // Solo el reconocimiento por MISMA Subject es automático; lo demás pasa
      // por una solicitud de homologación.
      if (!resuelta || resuelta.viaSubjectId != null) continue;
      if (resuelta.aprobada.origin === RecordOrigin.RECONOCIMIENTO_INTERNO) continue;
      if (yaHecho.has(`${fila.subjectId}|${resuelta.aprobada.recordId}`)) continue;

      const credits = fila.credits ?? fila.subject.credits ?? null;
      await this.prisma.studentSubjectRecord.create({
        data: {
          tenantId,
          studentId: inscripcion.studentId,
          subjectId: fila.subjectId,
          origin: RecordOrigin.RECONOCIMIENTO_INTERNO,
          finalGrade: resuelta.aprobada.finalGrade,
          passed: true,
          creditsSnapshot: credits,
          hoursSnapshot: horasDeAsignatura(
            fila.hours ?? fila.subject.hours,
            credits,
            inscripcion.program.hoursPerCredit,
          ),
          approvedById: user.userId,
          approvedAt: ahora,
          sourceRecordId: resuelta.aprobada.recordId,
          notes: `Reconocida al inscribirse en "${inscripcion.program.name}"`,
        },
      });
      creados.push(fila.subjectId);
    }

    return {
      message: `${creados.length} asignaturas reconocidas automáticamente`,
      reconocidas: creados,
    };
  }

  // ----------------------------------------------------------------
  // Fase C: matriz de articulación y doble titulación
  // ----------------------------------------------------------------

  /** Pensum destino: el indicado, o el VIGENTE del programa. */
  private async planDestino(
    tenantId: string,
    programId: string,
    studyPlanId?: string,
  ) {
    if (studyPlanId) {
      const plan = await this.prisma.studyPlan.findFirst({
        where: { id: studyPlanId, tenantId, programId },
        select: { id: true, version: true },
      });
      if (!plan) throw new NotFoundException('Pensum no encontrado para ese programa');
      return plan;
    }

    const vigente = await this.prisma.studyPlan.findFirst({
      where: { tenantId, programId, status: StudyPlanStatus.VIGENTE },
      orderBy: { createdAt: 'desc' },
      select: { id: true, version: true },
    });
    if (!vigente) {
      throw new NotFoundException('El programa no tiene pensum VIGENTE');
    }
    return vigente;
  }

  /**
   * Matriz de articulación del programa origen contra los demás programas
   * ACTIVO del tenant: qué se reconocería a un egresado suyo. Reemplaza la
   * tabla escrita a mano: se calcula desde los pensums reales.
   */
  async matrizDeArticulacion(tenantId: string, programId: string) {
    const origen = await this.prisma.program.findFirst({
      where: { id: programId, tenantId },
      select: {
        id: true,
        code: true,
        name: true,
        academicUnit: true,
        hoursPerCredit: true,
      },
    });
    if (!origen) throw new NotFoundException('Programa no encontrado');

    const planOrigen = await this.planDestino(tenantId, programId);
    const [filasOrigen, destinos, equivalencias] = await Promise.all([
      this.prisma.studyPlanSubject.findMany({
        where: { tenantId, studyPlanId: planOrigen.id },
        include: {
          subject: {
            select: { id: true, code: true, name: true, credits: true, hours: true },
          },
        },
      }),
      this.prisma.program.findMany({
        where: { tenantId, status: ProgramStatus.ACTIVO, id: { not: programId } },
        select: {
          id: true,
          code: true,
          name: true,
          educationLevel: true,
          academicUnit: true,
          hoursPerCredit: true,
          studyPlans: {
            where: { status: StudyPlanStatus.VIGENTE },
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { id: true, version: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
      this.equivalencias(tenantId),
    ]);

    // Un egresado del origen trae aprobadas todas las asignaturas de su pensum.
    const aprobadasSimuladas = new Map<string, Aprobada>();
    for (const fila of filasOrigen) {
      aprobadasSimuladas.set(fila.subjectId, {
        subjectId: fila.subjectId,
        finalGrade: null,
        origin: RecordOrigin.CURSADA,
        creditsSnapshot: fila.credits ?? fila.subject.credits ?? null,
        hoursSnapshot: horasDeAsignatura(
          fila.hours ?? fila.subject.hours,
          fila.credits ?? fila.subject.credits,
          origen.hoursPerCredit,
        ),
        recordId: `simulado:${fila.subjectId}`,
        // En la matriz se simula un egresado que cursó todo su pensum
        reconocidaEnAlgunPrograma: false,
      });
    }

    const filas = [];
    for (const destino of destinos) {
      const plan = destino.studyPlans[0];
      if (!plan) continue;

      const filasDestino = await this.prisma.studyPlanSubject.findMany({
        where: { tenantId, studyPlanId: plan.id },
        orderBy: [{ level: 'asc' }, { orderIndex: 'asc' }],
        include: {
          subject: {
            select: { id: true, code: true, name: true, credits: true, hours: true },
          },
        },
      });

      const reconocidas = [];
      const faltantes = [];
      let creditosTotales = 0;
      let horasTotales = 0;
      let creditosReconocidos = 0;
      let horasReconocidas = 0;

      for (const fila of filasDestino) {
        const credits = fila.credits ?? fila.subject.credits ?? 0;
        const hours =
          horasDeAsignatura(
            fila.hours ?? fila.subject.hours,
            fila.credits ?? fila.subject.credits,
            destino.hoursPerCredit,
          ) ?? 0;
        creditosTotales += credits;
        horasTotales += hours;

        const resuelta = this.resolverAprobacion(
          fila.subjectId,
          aprobadasSimuladas,
          equivalencias,
        );
        const item = {
          subjectId: fila.subjectId,
          code: fila.subject.code,
          name: fila.subject.name,
          level: fila.level,
          credits: credits || null,
          hours: hours || null,
          viaSubjectId: resuelta?.viaSubjectId ?? null,
        };

        if (resuelta) {
          creditosReconocidos += credits;
          horasReconocidas += hours;
          reconocidas.push(item);
        } else {
          faltantes.push(item);
        }
      }

      const pct = (parte: number, total: number) =>
        total > 0 ? Math.round((parte / total) * 1000) / 10 : 0;

      filas.push({
        programId: destino.id,
        programCode: destino.code,
        programName: destino.name,
        educationLevel: destino.educationLevel,
        academicUnit: destino.academicUnit,
        studyPlanId: plan.id,
        studyPlanVersion: plan.version,
        asignaturasReconocidas: reconocidas.length,
        asignaturasTotales: filasDestino.length,
        creditosReconocidos,
        creditosTotales,
        horasReconocidas,
        horasTotales,
        // Porcentaje sobre el pensum DESTINO, que es lo que al estudiante le
        // falta por cursar allí; no sobre el programa de origen.
        porcentajeCreditos: pct(creditosReconocidos, creditosTotales),
        porcentajeHoras: pct(horasReconocidas, horasTotales),
        porcentajeAvance:
          destino.academicUnit === AcademicUnit.CREDITOS
            ? pct(creditosReconocidos, creditosTotales)
            : pct(horasReconocidas, horasTotales),
        reconocidas,
        faltantes,
      });
    }

    filas.sort((a, b) => b.porcentajeAvance - a.porcentajeAvance);

    return {
      origen: {
        programId: origen.id,
        programCode: origen.code,
        programName: origen.name,
        studyPlanId: planOrigen.id,
        studyPlanVersion: planOrigen.version,
        asignaturas: filasOrigen.length,
      },
      destinos: filas,
      nota: 'Los porcentajes se calculan sobre el total del pensum destino.',
    };
  }

  /**
   * Rutas de doble titulación de un estudiante concreto, calculadas desde su
   * historial real (no desde el pensum completo de su programa).
   */
  async opcionesDobleTitulacion(
    tenantId: string,
    studentId: string,
    user: CurrentUserData,
  ) {
    const estudiante = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
      select: {
        id: true,
        userId: true,
        studentCode: true,
        user: { select: { firstName: true, lastName: true } },
      },
    });
    if (!estudiante) throw new NotFoundException('Estudiante no encontrado');
    if (user.role === 'STUDENT' && estudiante.userId !== user.userId) {
      throw new ForbiddenException('Solo puedes consultar tus propias opciones');
    }

    const [inscritos, programas] = await Promise.all([
      this.prisma.programEnrollment.findMany({
        where: { tenantId, studentId },
        select: { programId: true },
      }),
      this.prisma.program.findMany({
        where: { tenantId, status: ProgramStatus.ACTIVO },
        select: {
          id: true,
          code: true,
          name: true,
          degreeTitle: true,
          educationLevel: true,
          academicUnit: true,
          hoursPerCredit: true,
          studyPlans: {
            where: { status: StudyPlanStatus.VIGENTE },
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { id: true, version: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
    ]);

    const yaInscrito = new Set(inscritos.map((i) => i.programId));
    const opciones = [];

    for (const programa of programas) {
      if (yaInscrito.has(programa.id)) continue;
      const plan = programa.studyPlans[0];
      if (!plan) continue;

      const progreso = await this.computarProgreso(
        tenantId,
        studentId,
        plan.id,
        programa.hoursPerCredit,
        programa.academicUnit,
      );
      const todas = progreso.niveles.flatMap((n) => n.asignaturas);

      opciones.push({
        programId: programa.id,
        programCode: programa.code,
        programName: programa.name,
        degreeTitle: programa.degreeTitle,
        educationLevel: programa.educationLevel,
        academicUnit: programa.academicUnit,
        studyPlanId: plan.id,
        studyPlanVersion: plan.version,
        resumen: progreso.resumen,
        reconocidas: todas
          .filter((a) => a.estado === 'APROBADA')
          .map((a) => ({ subjectId: a.subjectId, code: a.code, name: a.name })),
        faltantes: todas
          .filter((a) => a.estado !== 'APROBADA')
          .map((a) => ({
            subjectId: a.subjectId,
            code: a.code,
            name: a.name,
            level: a.level,
            credits: a.credits,
            hours: a.hours,
          })),
      });
    }

    opciones.sort((a, b) => b.resumen.porcentajeAvance - a.resumen.porcentajeAvance);

    return {
      estudiante: {
        id: estudiante.id,
        studentCode: estudiante.studentCode,
        nombre: `${estudiante.user.firstName} ${estudiante.user.lastName}`,
      },
      opciones,
      hoursPerCreditPorDefecto: POLITICA_ACADEMICA_POR_DEFECTO.hoursPerCredit,
    };
  }
}
