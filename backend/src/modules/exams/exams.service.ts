import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import {
  AttemptStatus,
  ExamStatus,
  Prisma,
  Student,
} from '@prisma/client';
import {
  CreateExamDto,
  UpdateExamDto,
  QueryExamsDto,
  SubmitAttemptDto,
  ExamQuestionDto,
} from './dto';

/**
 * Campos de una pregunta visibles para el estudiante (sin respuestaCorrecta)
 */
const STUDENT_QUESTION_SELECT = {
  id: true,
  tenantId: true,
  examId: true,
  pregunta: true,
  opciones: true,
  puntaje: true,
  orderIndex: true,
} as const;

@Injectable()
export class ExamsService {
  private readonly logger = new Logger(ExamsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Obtener el estudiante asociado al usuario actual (validando tenant)
   */
  private async getStudent(userId: string, tenantId: string): Promise<Student> {
    const student = await this.prisma.student.findUnique({
      where: { userId },
    });

    if (!student || student.tenantId !== tenantId) {
      throw new ForbiddenException('Estudiante no encontrado');
    }

    return student;
  }

  /**
   * Calcular el puntaje total a partir de las preguntas
   */
  private calcPuntajeTotal(preguntas: ExamQuestionDto[]): number {
    return preguntas.reduce((sum, p) => sum + (p.puntaje ?? 1), 0);
  }

  /**
   * Crear un examen con sus preguntas
   */
  async create(tenantId: string, dto: CreateExamDto) {
    const course = await this.prisma.course.findFirst({
      where: { id: dto.courseId, tenantId },
    });

    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    const preguntas = dto.preguntas ?? [];
    const puntajeTotal = this.calcPuntajeTotal(preguntas);

    const exam = await this.prisma.exam.create({
      data: {
        tenantId,
        courseId: dto.courseId,
        titulo: dto.titulo,
        instrucciones: dto.instrucciones,
        fecha: new Date(dto.fecha),
        duracion: dto.duracion,
        notaMinima: dto.notaMinima,
        intentosPermitidos: dto.intentosPermitidos,
        mostrarResultados: dto.mostrarResultados,
        mezclarPreguntas: dto.mezclarPreguntas,
        puntajeTotal,
        preguntas: {
          create: preguntas.map((p, i) => ({
            tenantId,
            pregunta: p.pregunta,
            opciones: p.opciones,
            respuestaCorrecta: p.respuestaCorrecta,
            puntaje: p.puntaje ?? 1,
            orderIndex: p.orderIndex ?? i,
          })),
        },
      },
      include: { preguntas: { orderBy: { orderIndex: 'asc' } } },
    });

    this.logger.log(`Exam created: ${exam.id}`);
    return exam;
  }

  /**
   * Listar exámenes.
   * - STUDENT: solo ACTIVO/FINALIZADO de sus cursos, sin respuestaCorrecta.
   * - Staff: todos los del tenant.
   */
  async findAll(
    tenantId: string,
    role: string,
    userId: string,
    query: QueryExamsDto,
  ) {
    if (role === 'STUDENT') {
      const student = await this.getStudent(userId, tenantId);

      const enrollments = await this.prisma.enrollment.findMany({
        where: { studentId: student.id },
        select: { courseId: true },
      });
      const courseIds = enrollments.map((e) => e.courseId);

      const where: Prisma.ExamWhereInput = {
        tenantId,
        courseId: query.courseId
          ? query.courseId
          : { in: courseIds },
        estado: query.estado
          ? query.estado
          : { in: [ExamStatus.ACTIVO, ExamStatus.FINALIZADO] },
      };

      // Si filtra por courseId, restringir a cursos inscritos
      if (query.courseId && !courseIds.includes(query.courseId)) {
        return [];
      }

      // Si filtra por estado, solo permitir ACTIVO/FINALIZADO
      const estadosVisibles: ExamStatus[] = [
        ExamStatus.ACTIVO,
        ExamStatus.FINALIZADO,
      ];
      if (query.estado && !estadosVisibles.includes(query.estado)) {
        return [];
      }

      return this.prisma.exam.findMany({
        where,
        include: {
          course: { select: { name: true, code: true } },
          preguntas: {
            select: STUDENT_QUESTION_SELECT,
            orderBy: { orderIndex: 'asc' },
          },
        },
        orderBy: { fecha: 'desc' },
      });
    }

    const where: Prisma.ExamWhereInput = {
      tenantId,
      ...(query.courseId ? { courseId: query.courseId } : {}),
      ...(query.estado ? { estado: query.estado } : {}),
    };

    return this.prisma.exam.findMany({
      where,
      include: {
        course: { select: { name: true, code: true } },
        _count: { select: { preguntas: true, intentos: true } },
      },
      orderBy: { fecha: 'desc' },
    });
  }

  /**
   * Intentos del estudiante actual
   */
  async findMyAttempts(tenantId: string, userId: string) {
    const student = await this.getStudent(userId, tenantId);

    return this.prisma.examAttempt.findMany({
      where: { tenantId, studentId: student.id },
      include: {
        exam: { select: { titulo: true, courseId: true } },
      },
      orderBy: { iniciadoAt: 'desc' },
    });
  }

  /**
   * Enviar y auto-calificar un intento
   */
  async submitAttempt(
    tenantId: string,
    userId: string,
    attemptId: string,
    dto: SubmitAttemptDto,
  ) {
    const student = await this.getStudent(userId, tenantId);

    const attempt = await this.prisma.examAttempt.findFirst({
      where: { id: attemptId, tenantId },
      include: { exam: { include: { preguntas: true } } },
    });

    if (!attempt) {
      throw new NotFoundException('Intento no encontrado');
    }

    if (attempt.studentId !== student.id) {
      throw new ForbiddenException('Este intento no te pertenece');
    }

    if (attempt.estado !== AttemptStatus.EN_CURSO) {
      throw new BadRequestException('El intento ya fue enviado');
    }

    const respuestas = dto.respuestas ?? {};
    let puntosObtenidos = 0;
    let correctas = 0;

    for (const pregunta of attempt.exam.preguntas) {
      if (respuestas[pregunta.id] === pregunta.respuestaCorrecta) {
        puntosObtenidos += pregunta.puntaje;
        correctas += 1;
      }
    }

    const puntajeTotal = attempt.exam.puntajeTotal;
    const calificacion =
      puntajeTotal > 0
        ? Math.round((puntosObtenidos / puntajeTotal) * 10 * 10) / 10
        : 0;

    const updated = await this.prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        respuestas: respuestas as Prisma.InputJsonValue,
        calificacion,
        correctas,
        estado: AttemptStatus.CALIFICADO,
        enviadoAt: new Date(),
      },
    });

    this.logger.log(`Attempt submitted: ${attemptId}`);

    return {
      ...updated,
      correctas,
      totalPreguntas: attempt.exam.preguntas.length,
    };
  }

  /**
   * Obtener un examen por ID.
   * STUDENT no recibe respuestaCorrecta.
   */
  async findOne(id: string, tenantId: string, role: string) {
    const exam = await this.prisma.exam.findFirst({
      where: { id, tenantId },
      include: {
        preguntas:
          role === 'STUDENT'
            ? {
                select: STUDENT_QUESTION_SELECT,
                orderBy: { orderIndex: 'asc' },
              }
            : { orderBy: { orderIndex: 'asc' } },
      },
    });

    if (!exam) {
      throw new NotFoundException('Examen no encontrado');
    }

    return exam;
  }

  /**
   * Actualizar un examen.
   * Si llegan preguntas, se borran las existentes y se recrean.
   */
  async update(id: string, tenantId: string, dto: UpdateExamDto) {
    const exam = await this.prisma.exam.findFirst({
      where: { id, tenantId },
    });

    if (!exam) {
      throw new NotFoundException('Examen no encontrado');
    }

    const data: Prisma.ExamUpdateInput = {};

    if (dto.titulo !== undefined) data.titulo = dto.titulo;
    if (dto.instrucciones !== undefined) data.instrucciones = dto.instrucciones;
    if (dto.fecha !== undefined) data.fecha = new Date(dto.fecha);
    if (dto.duracion !== undefined) data.duracion = dto.duracion;
    if (dto.notaMinima !== undefined) data.notaMinima = dto.notaMinima;
    if (dto.intentosPermitidos !== undefined)
      data.intentosPermitidos = dto.intentosPermitidos;
    if (dto.mostrarResultados !== undefined)
      data.mostrarResultados = dto.mostrarResultados;
    if (dto.mezclarPreguntas !== undefined)
      data.mezclarPreguntas = dto.mezclarPreguntas;

    if (dto.preguntas !== undefined) {
      const preguntas = dto.preguntas;
      data.puntajeTotal = this.calcPuntajeTotal(preguntas);

      await this.prisma.examQuestion.deleteMany({
        where: { examId: id, tenantId },
      });

      data.preguntas = {
        create: preguntas.map((p, i) => ({
          tenantId,
          pregunta: p.pregunta,
          opciones: p.opciones,
          respuestaCorrecta: p.respuestaCorrecta,
          puntaje: p.puntaje ?? 1,
          orderIndex: p.orderIndex ?? i,
        })),
      };
    }

    const updated = await this.prisma.exam.update({
      where: { id },
      data,
      include: { preguntas: { orderBy: { orderIndex: 'asc' } } },
    });

    this.logger.log(`Exam updated: ${id}`);
    return updated;
  }

  /**
   * Eliminar un examen
   */
  async remove(id: string, tenantId: string) {
    const exam = await this.prisma.exam.findFirst({
      where: { id, tenantId },
    });

    if (!exam) {
      throw new NotFoundException('Examen no encontrado');
    }

    await this.prisma.exam.delete({ where: { id } });

    this.logger.log(`Exam deleted: ${id}`);
    return { message: 'Examen eliminado correctamente' };
  }

  /**
   * Cambiar el estado de un examen
   */
  private async setEstado(id: string, tenantId: string, estado: ExamStatus) {
    const exam = await this.prisma.exam.findFirst({
      where: { id, tenantId },
    });

    if (!exam) {
      throw new NotFoundException('Examen no encontrado');
    }

    return this.prisma.exam.update({
      where: { id },
      data: { estado },
    });
  }

  /**
   * Publicar un examen (ACTIVO)
   */
  async publish(id: string, tenantId: string) {
    return this.setEstado(id, tenantId, ExamStatus.ACTIVO);
  }

  /**
   * Finalizar un examen (FINALIZADO)
   */
  async finalize(id: string, tenantId: string) {
    return this.setEstado(id, tenantId, ExamStatus.FINALIZADO);
  }

  /**
   * Resultados y estadísticas de un examen
   */
  async results(id: string, tenantId: string) {
    const exam = await this.prisma.exam.findFirst({
      where: { id, tenantId },
    });

    if (!exam) {
      throw new NotFoundException('Examen no encontrado');
    }

    const intentos = await this.prisma.examAttempt.findMany({
      where: { tenantId, examId: id },
      include: {
        student: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { enviadoAt: 'desc' },
    });

    const intentosMapped = intentos.map((i) => ({
      id: i.id,
      estudiante: `${i.student.user.firstName} ${i.student.user.lastName}`,
      studentCode: i.student.studentCode,
      estado: i.estado,
      calificacion: i.calificacion,
      correctas: i.correctas,
      enviadoAt: i.enviadoAt,
    }));

    const calificados = intentos.filter((i) => i.calificacion !== null);
    const presentados = calificados.length;
    const sumaCalif = calificados.reduce(
      (sum, i) => sum + (i.calificacion ?? 0),
      0,
    );
    const promedio =
      presentados > 0 ? Math.round((sumaCalif / presentados) * 10) / 10 : 0;
    const aprobados = calificados.filter(
      (i) => (i.calificacion ?? 0) >= exam.notaMinima,
    ).length;
    const reprobados = presentados - aprobados;

    return {
      examen: {
        id: exam.id,
        titulo: exam.titulo,
        puntajeTotal: exam.puntajeTotal,
        notaMinima: exam.notaMinima,
      },
      intentos: intentosMapped,
      stats: {
        presentados,
        promedio,
        aprobados,
        reprobados,
      },
    };
  }

  /**
   * Crear un intento de examen para el estudiante actual
   */
  async createAttempt(id: string, tenantId: string, userId: string) {
    const student = await this.getStudent(userId, tenantId);

    const exam = await this.prisma.exam.findFirst({
      where: { id, tenantId },
      include: { preguntas: { orderBy: { orderIndex: 'asc' } } },
    });

    if (!exam) {
      throw new NotFoundException('Examen no encontrado');
    }

    if (exam.estado !== ExamStatus.ACTIVO) {
      throw new BadRequestException('El examen no está activo');
    }

    const enrollment = await this.prisma.enrollment.findFirst({
      where: { studentId: student.id, courseId: exam.courseId },
    });

    if (!enrollment) {
      throw new ForbiddenException('No estás inscrito en este curso');
    }

    const intentosPrevios = await this.prisma.examAttempt.count({
      where: {
        tenantId,
        examId: id,
        studentId: student.id,
        estado: { in: [AttemptStatus.ENVIADO, AttemptStatus.CALIFICADO] },
      },
    });

    if (intentosPrevios >= exam.intentosPermitidos) {
      throw new BadRequestException(
        'Has alcanzado el número máximo de intentos permitidos',
      );
    }

    const attempt = await this.prisma.examAttempt.create({
      data: {
        tenantId,
        examId: id,
        studentId: student.id,
        estado: AttemptStatus.EN_CURSO,
        respuestas: {},
      },
    });

    this.logger.log(`Attempt created: ${attempt.id}`);

    const { preguntas, ...examData } = exam;
    return {
      ...attempt,
      exam: {
        ...examData,
        preguntas: preguntas.map(
          ({ respuestaCorrecta, ...rest }) => rest,
        ),
      },
    };
  }
}
