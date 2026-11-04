import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { RecordOrigin, RecordStatus } from '@prisma/client';
import { CurrentUserData } from '@/common/decorators/current-user.decorator';
import { POLITICA_ACADEMICA_POR_DEFECTO } from '@/common/config/politica-academica';
import {
  calcularNotaDefinitiva,
  horasDeAsignatura,
  NotaParcial,
} from './calculo-notas';
import { CerrarNotasDto, ReabrirNotasDto } from './dto/academic-record.dto';

const STAFF = ['TENANT_ADMIN', 'SUPER_ADMIN'];

/** Política académica efectiva de un estudiante (la del programa más exigente). */
export interface PoliticaEfectiva {
  passingGrade: number;
  gradeScaleMax: number;
  hoursPerCredit: number;
  /** Programa del que salió la política, si el estudiante tiene alguno. */
  programId?: string;
  programName?: string;
  /** Varios programas con exigencias distintas: se usó la más alta. */
  conflicto?: string;
}

export interface FilaDePrevisualizacion {
  studentId: string;
  studentCode: string;
  nombre: string;
  parciales: number;
  promedio100: number | null;
  finalGrade: number | null;
  passed: boolean | null;
  politica: PoliticaEfectiva;
  avisos: string[];
}

@Injectable()
export class AcademicRecordsService {
  constructor(private prisma: PrismaService) {}

  // ----------------------------------------------------------------
  // Helpers de acceso
  // ----------------------------------------------------------------

  /** Grupo del tenant con lo necesario para cerrar notas. */
  private async grupo(tenantId: string, courseId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, tenantId },
      include: {
        teacher: { select: { id: true, userId: true } },
        subject: {
          select: { id: true, code: true, name: true, credits: true, hours: true },
        },
        academicPeriod: { select: { id: true, code: true, status: true } },
      },
    });
    if (!course) throw new NotFoundException('Grupo no encontrado');
    return course;
  }

  /** Cerrar notas lo puede hacer el docente del grupo o la administración. */
  private asegurarDocenteDelGrupoOStaff(
    user: CurrentUserData,
    course: { teacher: { userId: string } },
  ) {
    if (STAFF.includes(user.role)) return;
    if (user.role === 'TEACHER' && course.teacher.userId === user.userId) return;
    throw new ForbiddenException(
      'Solo el docente del grupo o un administrador puede cerrar las notas',
    );
  }

  private asegurarStaff(user: CurrentUserData) {
    if (!STAFF.includes(user.role)) {
      throw new ForbiddenException('Solo un administrador puede reabrir notas');
    }
  }

  /**
   * Política del estudiante. Si está en varios programas se usa el MÁS
   * EXIGENTE, comparando la exigencia relativa (passingGrade ÷ gradeScaleMax)
   * porque las escalas pueden no coincidir, y se reporta el conflicto.
   */
  async politicaDelEstudiante(
    tenantId: string,
    studentId: string,
  ): Promise<PoliticaEfectiva> {
    const inscripciones = await this.prisma.programEnrollment.findMany({
      where: {
        tenantId,
        studentId,
        status: { in: ['ACTIVO', 'APLAZADO', 'GRADUADO'] },
      },
      select: {
        program: {
          select: {
            id: true,
            name: true,
            passingGrade: true,
            gradeScaleMax: true,
            hoursPerCredit: true,
          },
        },
      },
    });

    if (inscripciones.length === 0) {
      return { ...POLITICA_ACADEMICA_POR_DEFECTO };
    }

    const programas = inscripciones.map((i) => i.program);
    const exigencia = (p: { passingGrade: number; gradeScaleMax: number }) =>
      p.gradeScaleMax > 0 ? p.passingGrade / p.gradeScaleMax : 0;

    const elegido = programas.reduce((mas, p) =>
      exigencia(p) > exigencia(mas) ? p : mas,
    );

    const exigencias = new Set(programas.map((p) => exigencia(p).toFixed(4)));

    return {
      passingGrade: elegido.passingGrade,
      gradeScaleMax: elegido.gradeScaleMax,
      hoursPerCredit: elegido.hoursPerCredit,
      programId: elegido.id,
      programName: elegido.name,
      conflicto:
        exigencias.size > 1
          ? `El estudiante está en ${programas.length} programas con notas aprobatorias distintas; se aplicó la de "${elegido.name}" (${elegido.passingGrade}/${elegido.gradeScaleMax})`
          : undefined,
    };
  }

  // ----------------------------------------------------------------
  // Fase A: cierre de notas e historial
  // ----------------------------------------------------------------

  /**
   * Previsualización del cierre: nota definitiva de cada matriculado, la
   * política que se le aplicaría y los avisos. No escribe nada.
   */
  async previsualizarCierre(
    tenantId: string,
    courseId: string,
    user: CurrentUserData,
  ) {
    const course = await this.grupo(tenantId, courseId);
    this.asegurarDocenteDelGrupoOStaff(user, course);

    if (!course.subjectId || !course.subject) {
      throw new BadRequestException(
        'El grupo no está vinculado a una asignatura; asígnala antes de cerrar notas',
      );
    }

    const [matriculas, notas] = await Promise.all([
      this.prisma.enrollment.findMany({
        where: { tenantId, courseId, status: 'active' },
        include: {
          student: {
            select: {
              id: true,
              studentCode: true,
              user: { select: { firstName: true, lastName: true } },
            },
          },
        },
      }),
      this.prisma.grade.findMany({
        where: { tenantId, courseId },
        select: { studentId: true, gradeType: true, grade: true, weight: true },
      }),
    ]);

    const porEstudiante = new Map<string, NotaParcial[]>();
    for (const n of notas) {
      const lista = porEstudiante.get(n.studentId) ?? [];
      lista.push({ gradeType: n.gradeType, grade: n.grade, weight: n.weight });
      porEstudiante.set(n.studentId, lista);
    }

    const filas: FilaDePrevisualizacion[] = [];
    for (const m of matriculas) {
      const politica = await this.politicaDelEstudiante(tenantId, m.studentId);
      const parciales = porEstudiante.get(m.studentId) ?? [];
      const calculo = calcularNotaDefinitiva(parciales, politica.gradeScaleMax);
      const avisos: string[] = [];

      if (!calculo) avisos.push('Sin notas registradas: no se puede calcular');
      if (calculo && calculo.parcialesIgnorados.length > 0) {
        avisos.push(
          `Los pesos ya suman ${calculo.pesoDeclarado}; quedaron fuera del promedio: ${calculo.parcialesIgnorados.join(', ')}`,
        );
      }
      if (calculo && calculo.pesoDeclarado === 0) {
        avisos.push('Ninguna nota tiene peso: se promedió en partes iguales');
      }
      if (politica.conflicto) avisos.push(politica.conflicto);
      if (!politica.programId) {
        avisos.push(
          'El estudiante no está inscrito a ningún programa: se usó la política por defecto',
        );
      }

      filas.push({
        studentId: m.studentId,
        studentCode: m.student.studentCode,
        nombre: `${m.student.user.firstName} ${m.student.user.lastName}`,
        parciales: parciales.length,
        promedio100: calculo?.promedio100 ?? null,
        finalGrade: calculo?.finalGrade ?? null,
        passed: calculo ? calculo.finalGrade >= politica.passingGrade : null,
        politica,
        avisos,
      });
    }

    return {
      course: {
        id: course.id,
        code: course.code,
        name: course.name,
        groupCode: course.groupCode,
        gradesClosedAt: course.gradesClosedAt,
      },
      subject: course.subject,
      academicPeriod: course.academicPeriod,
      escalaDeCaptura: '0 a 100 (se normaliza a la escala del programa)',
      filas,
      totales: {
        matriculados: filas.length,
        calculables: filas.filter((f) => f.finalGrade != null).length,
        aprobados: filas.filter((f) => f.passed === true).length,
        reprobados: filas.filter((f) => f.passed === false).length,
      },
    };
  }

  /**
   * Cierra las notas del grupo: crea un StudentSubjectRecord por matriculado
   * con nota calculable y bloquea la edición de notas.
   */
  async cerrarNotas(
    tenantId: string,
    courseId: string,
    user: CurrentUserData,
    dto: CerrarNotasDto,
  ) {
    const course = await this.grupo(tenantId, courseId);
    this.asegurarDocenteDelGrupoOStaff(user, course);

    if (course.gradesClosedAt) {
      throw new ConflictException('Las notas de este grupo ya están cerradas');
    }

    const previsualizacion = await this.previsualizarCierre(
      tenantId,
      courseId,
      user,
    );
    const calculables = previsualizacion.filas.filter((f) => f.finalGrade != null);
    if (calculables.length === 0) {
      throw new BadRequestException(
        'Ningún matriculado tiene notas suficientes para calcular la definitiva',
      );
    }

    const subject = course.subject!;
    const ahora = new Date();

    await this.prisma.$transaction(async (tx) => {
      for (const fila of calculables) {
        // Un recierre sin reapertura no debería ocurrir, pero si quedaran
        // registros vigentes de este mismo grupo se anulan antes de insertar.
        await tx.studentSubjectRecord.updateMany({
          where: {
            tenantId,
            courseId,
            studentId: fila.studentId,
            status: RecordStatus.VIGENTE,
          },
          data: { status: RecordStatus.ANULADO },
        });

        await tx.studentSubjectRecord.create({
          data: {
            tenantId,
            studentId: fila.studentId,
            subjectId: subject.id,
            courseId,
            academicPeriodId: course.academicPeriodId,
            origin: RecordOrigin.CURSADA,
            finalGrade: fila.finalGrade,
            passed: fila.passed === true,
            creditsSnapshot: subject.credits,
            hoursSnapshot: horasDeAsignatura(
              subject.hours,
              subject.credits,
              fila.politica.hoursPerCredit,
            ),
            approvedById: user.userId,
            approvedAt: ahora,
            notes: dto.observaciones,
          },
        });
      }

      await tx.course.update({
        where: { id: courseId },
        data: { gradesClosedAt: ahora, gradesClosedById: user.userId },
      });
    });

    return {
      message: `Notas cerradas: ${calculables.length} registros en el historial`,
      cerradoEn: ahora,
      sinCalcular: previsualizacion.filas
        .filter((f) => f.finalGrade == null)
        .map((f) => ({ studentId: f.studentId, nombre: f.nombre, avisos: f.avisos })),
    };
  }

  /**
   * Reabre las notas (solo administración): anula los registros CURSADA de
   * este grupo dejando el motivo y libera la edición. Los registros anulados
   * no se borran: son la auditoría del cierre anterior.
   */
  async reabrirNotas(
    tenantId: string,
    courseId: string,
    user: CurrentUserData,
    dto: ReabrirNotasDto,
  ) {
    this.asegurarStaff(user);
    const course = await this.grupo(tenantId, courseId);

    if (!course.gradesClosedAt) {
      throw new ConflictException('Las notas de este grupo no están cerradas');
    }

    const anulados = await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.studentSubjectRecord.updateMany({
        where: { tenantId, courseId, status: RecordStatus.VIGENTE },
        data: {
          status: RecordStatus.ANULADO,
          notes: `Anulado por reapertura de notas (${user.email}): ${dto.motivo}`,
        },
      });

      await tx.course.update({
        where: { id: courseId },
        data: { gradesClosedAt: null, gradesClosedById: null },
      });

      return count;
    });

    return {
      message: `Notas reabiertas; ${anulados} registros del historial quedaron ANULADOS`,
      motivo: dto.motivo,
      reabiertoPor: user.email,
    };
  }

  /**
   * Historial académico completo del estudiante. Un STUDENT solo puede ver el
   * suyo; profesorado y administración, el de cualquiera del tenant.
   */
  async historialEstudiante(
    tenantId: string,
    studentId: string,
    user: CurrentUserData,
    incluirAnulados = false,
  ) {
    const estudiante = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
      select: {
        id: true,
        studentCode: true,
        userId: true,
        user: { select: { firstName: true, lastName: true } },
      },
    });
    if (!estudiante) throw new NotFoundException('Estudiante no encontrado');

    if (user.role === 'STUDENT' && estudiante.userId !== user.userId) {
      throw new ForbiddenException('Solo puedes consultar tu propio historial');
    }

    const registros = await this.prisma.studentSubjectRecord.findMany({
      where: {
        tenantId,
        studentId,
        ...(incluirAnulados ? {} : { status: RecordStatus.VIGENTE }),
      },
      orderBy: [{ createdAt: 'desc' }],
      include: {
        subject: { select: { id: true, code: true, name: true, area: true } },
        course: { select: { id: true, code: true, groupCode: true } },
        academicPeriod: { select: { id: true, code: true, name: true } },
      },
    });

    const vigentes = registros.filter((r) => r.status === RecordStatus.VIGENTE);
    const aprobados = vigentes.filter((r) => r.passed);

    return {
      estudiante: {
        id: estudiante.id,
        studentCode: estudiante.studentCode,
        nombre: `${estudiante.user.firstName} ${estudiante.user.lastName}`,
      },
      registros,
      resumen: {
        total: vigentes.length,
        aprobadas: aprobados.length,
        reprobadas: vigentes.length - aprobados.length,
        creditosAprobados: aprobados.reduce(
          (acc, r) => acc + (r.creditsSnapshot ?? 0),
          0,
        ),
        horasAprobadas: aprobados.reduce((acc, r) => acc + (r.hoursSnapshot ?? 0), 0),
      },
    };
  }
}
