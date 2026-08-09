import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateScheduleEventDto, UpdateScheduleEventDto } from './dto';

const COURSE_SELECT = {
  course: { select: { id: true, name: true, code: true, color: true } },
} as const;

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  constructor(private prisma: PrismaService) {}

  private async assertCourse(tenantId: string, courseId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, tenantId },
      select: { id: true },
    });

    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }
  }

  async create(tenantId: string, dto: CreateScheduleEventDto) {
    if (dto.courseId) {
      await this.assertCourse(tenantId, dto.courseId);
    }

    return this.prisma.scheduleEvent.create({
      data: {
        tenantId,
        courseId: dto.courseId ?? null,
        titulo: dto.titulo,
        tipo: dto.tipo ?? 'clase',
        diaSemana: dto.diaSemana,
        horaInicio: dto.horaInicio,
        horaFin: dto.horaFin,
        aula: dto.aula,
        color: dto.color ?? 'bg-blue-500',
      },
      include: COURSE_SELECT,
    });
  }

  async findAll(tenantId: string, courseId?: string) {
    return this.prisma.scheduleEvent.findMany({
      where: { tenantId, ...(courseId ? { courseId } : {}) },
      include: COURSE_SELECT,
      orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }],
    });
  }

  /** Horario del estudiante: eventos de los cursos en los que esta matriculado. */
  async findForStudent(tenantId: string, userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      select: { id: true, tenantId: true },
    });

    if (!student || student.tenantId !== tenantId) {
      throw new ForbiddenException('Estudiante no encontrado');
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId: student.id },
      select: { courseId: true },
    });

    const courseIds = enrollments.map((e) => e.courseId);

    if (courseIds.length === 0) {
      return [];
    }

    return this.prisma.scheduleEvent.findMany({
      where: { tenantId, courseId: { in: courseIds } },
      include: COURSE_SELECT,
      orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }],
    });
  }

  /** Horario del docente: eventos de los cursos que imparte. */
  async findForTeacher(tenantId: string, userId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
      select: { id: true, tenantId: true },
    });

    if (!teacher || teacher.tenantId !== tenantId) {
      throw new ForbiddenException('Docente no encontrado');
    }

    const courses = await this.prisma.course.findMany({
      where: { teacherId: teacher.id, tenantId },
      select: { id: true },
    });

    const courseIds = courses.map((c) => c.id);

    if (courseIds.length === 0) {
      return [];
    }

    return this.prisma.scheduleEvent.findMany({
      where: { tenantId, courseId: { in: courseIds } },
      include: COURSE_SELECT,
      orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }],
    });
  }

  async findOne(tenantId: string, id: string) {
    const event = await this.prisma.scheduleEvent.findFirst({
      where: { id, tenantId },
      include: COURSE_SELECT,
    });

    if (!event) {
      throw new NotFoundException('Evento de horario no encontrado');
    }

    return event;
  }

  async update(tenantId: string, id: string, dto: UpdateScheduleEventDto) {
    await this.findOne(tenantId, id);

    if (dto.courseId) {
      await this.assertCourse(tenantId, dto.courseId);
    }

    return this.prisma.scheduleEvent.update({
      where: { id },
      data: dto,
      include: COURSE_SELECT,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    await this.prisma.scheduleEvent.delete({ where: { id } });

    return { message: 'Evento eliminado correctamente' };
  }
}
