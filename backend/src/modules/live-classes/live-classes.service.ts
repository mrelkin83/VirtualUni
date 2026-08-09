import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { LiveClassStatus, Prisma } from '@prisma/client';
import { CreateLiveClassDto, UpdateLiveClassDto, QueryLiveClassesDto } from './dto';

@Injectable()
export class LiveClassesService {
  private readonly logger = new Logger(LiveClassesService.name);

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

  private async getStudentCourseIds(tenantId: string, userId: string): Promise<string[]> {
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

    return enrollments.map((e) => e.courseId);
  }

  private buildWhere(tenantId: string, query: QueryLiveClassesDto): Prisma.LiveClassWhereInput {
    const where: Prisma.LiveClassWhereInput = { tenantId };

    if (query.courseId) where.courseId = query.courseId;
    if (query.estado) where.estado = query.estado;
    if (query.soloGrabadas === 'true') where.grabacionUrl = { not: null };

    return where;
  }

  async create(tenantId: string, dto: CreateLiveClassDto) {
    await this.assertCourse(tenantId, dto.courseId);

    return this.prisma.liveClass.create({
      data: {
        tenantId,
        courseId: dto.courseId,
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        fechaInicio: new Date(dto.fechaInicio),
        fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : null,
        enlace: dto.enlace,
        plataforma: dto.plataforma,
        aula: dto.aula,
        estado: dto.estado ?? LiveClassStatus.PROGRAMADA,
        grabacionUrl: dto.grabacionUrl,
        duracionMinutos: dto.duracionMinutos,
      },
    });
  }

  async findAll(tenantId: string, query: QueryLiveClassesDto) {
    return this.prisma.liveClass.findMany({
      where: this.buildWhere(tenantId, query),
      include: { course: { select: { id: true, name: true, code: true, color: true } } },
      orderBy: { fechaInicio: 'desc' },
    });
  }

  /** Clases de los cursos en los que el estudiante esta matriculado. */
  async findForStudent(tenantId: string, userId: string, query: QueryLiveClassesDto) {
    const courseIds = await this.getStudentCourseIds(tenantId, userId);

    if (courseIds.length === 0) {
      return [];
    }

    const where = this.buildWhere(tenantId, query);
    where.courseId = query.courseId
      ? courseIds.includes(query.courseId)
        ? query.courseId
        : '__sin_acceso__'
      : { in: courseIds };

    return this.prisma.liveClass.findMany({
      where,
      include: { course: { select: { id: true, name: true, code: true, color: true } } },
      orderBy: { fechaInicio: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const liveClass = await this.prisma.liveClass.findFirst({
      where: { id, tenantId },
      include: { course: { select: { id: true, name: true, code: true, color: true } } },
    });

    if (!liveClass) {
      throw new NotFoundException('Clase no encontrada');
    }

    return liveClass;
  }

  async update(tenantId: string, id: string, dto: UpdateLiveClassDto) {
    await this.findOne(tenantId, id);

    if (dto.courseId) {
      await this.assertCourse(tenantId, dto.courseId);
    }

    return this.prisma.liveClass.update({
      where: { id },
      data: {
        ...dto,
        fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : undefined,
        fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : undefined,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    await this.prisma.liveClass.delete({ where: { id } });

    return { message: 'Clase eliminada correctamente' };
  }

  /** Marca la clase como iniciada. */
  async start(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.liveClass.update({
      where: { id },
      data: { estado: LiveClassStatus.EN_CURSO },
    });
  }

  /** Marca la clase como finalizada y guarda la grabacion si se envia. */
  async finish(tenantId: string, id: string, grabacionUrl?: string) {
    await this.findOne(tenantId, id);

    return this.prisma.liveClass.update({
      where: { id },
      data: {
        estado: LiveClassStatus.FINALIZADA,
        fechaFin: new Date(),
        ...(grabacionUrl ? { grabacionUrl } : {}),
      },
    });
  }

  /** Registra la asistencia de un estudiante a la clase en vivo. */
  async join(tenantId: string, id: string) {
    const liveClass = await this.findOne(tenantId, id);

    await this.prisma.liveClass.update({
      where: { id },
      data: { asistentes: { increment: 1 } },
    });

    return { enlace: liveClass.enlace, titulo: liveClass.titulo };
  }
}
