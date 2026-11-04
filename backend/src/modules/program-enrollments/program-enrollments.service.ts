import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { ProgramEnrollmentStatus, StudyPlanStatus } from '@prisma/client';
import { StudyPlansService } from '../programs/study-plans.service';
import {
  CrearInscripcionDto,
  ActualizarInscripcionDto,
} from './dto/program-enrollment.dto';
import { CurrentUserData } from '@/common/decorators/current-user.decorator';

const INCLUDE_RESUMEN = {
  student: {
    select: {
      id: true,
      studentCode: true,
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  },
  program: { select: { id: true, code: true, name: true, educationLevel: true } },
  studyPlan: { select: { id: true, version: true, status: true } },
} as const;

@Injectable()
export class ProgramEnrollmentsService {
  constructor(
    private prisma: PrismaService,
    // Reutiliza el armado del pensum por niveles en vez de repetirlo aquí
    private studyPlans: StudyPlansService,
  ) {}

  private async inscripcion(tenantId: string, id: string) {
    const inscripcion = await this.prisma.programEnrollment.findFirst({
      where: { id, tenantId },
      include: { program: { select: { id: true, durationPeriods: true } } },
    });
    if (!inscripcion) throw new NotFoundException('Inscripción no encontrada');
    return inscripcion;
  }

  private validarNivel(level: number | undefined, durationPeriods: number | null) {
    if (level && durationPeriods && level > durationPeriods) {
      throw new BadRequestException(
        `El nivel ${level} supera la duración del programa (${durationPeriods} periodos)`,
      );
    }
  }

  async findAll(
    tenantId: string,
    page = 1,
    limit = 20,
    programId?: string,
    studentId?: string,
    status?: ProgramEnrollmentStatus,
  ) {
    const skip = (page - 1) * limit;
    // programId/studentId son filtros del cliente, pero el where siempre
    // lleva tenantId: un id ajeno simplemente no encuentra nada.
    const where: any = { tenantId };
    if (programId) where.programId = programId;
    if (studentId) where.studentId = studentId;
    if (status) where.status = status;

    const [inscripciones, total] = await Promise.all([
      this.prisma.programEnrollment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: INCLUDE_RESUMEN,
      }),
      this.prisma.programEnrollment.count({ where }),
    ]);

    return {
      data: inscripciones,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(tenantId: string, dto: CrearInscripcionDto) {
    // Todos los *Id del DTO se validan contra el tenant antes de usarse
    const [estudiante, programa] = await Promise.all([
      this.prisma.student.findFirst({
        where: { id: dto.studentId, tenantId },
        select: { id: true },
      }),
      this.prisma.program.findFirst({
        where: { id: dto.programId, tenantId },
        select: { id: true, durationPeriods: true },
      }),
    ]);
    if (!estudiante) throw new NotFoundException('Estudiante no encontrado');
    if (!programa) throw new NotFoundException('Programa no encontrado');

    let studyPlanId = dto.studyPlanId;
    if (studyPlanId) {
      // Debe ser un pensum del MISMO programa y tenant
      const plan = await this.prisma.studyPlan.findFirst({
        where: { id: studyPlanId, tenantId, programId: dto.programId },
        select: { id: true },
      });
      if (!plan) {
        throw new NotFoundException('Pensum no encontrado para ese programa');
      }
    } else {
      const vigente = await this.prisma.studyPlan.findFirst({
        where: { tenantId, programId: dto.programId, status: StudyPlanStatus.VIGENTE },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      });
      if (!vigente) {
        throw new BadRequestException(
          'El programa no tiene pensum VIGENTE; indique studyPlanId explícitamente',
        );
      }
      studyPlanId = vigente.id;
    }

    this.validarNivel(dto.currentLevel, programa.durationPeriods);

    const existente = await this.prisma.programEnrollment.findFirst({
      where: { studentId: dto.studentId, programId: dto.programId },
      select: { id: true },
    });
    if (existente) {
      throw new ConflictException('El estudiante ya está inscrito en este programa');
    }

    return this.prisma.programEnrollment.create({
      data: {
        tenantId,
        studentId: dto.studentId,
        programId: dto.programId,
        studyPlanId,
        currentLevel: dto.currentLevel ?? 1,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      },
      include: INCLUDE_RESUMEN,
    });
  }

  async update(tenantId: string, id: string, dto: ActualizarInscripcionDto) {
    const inscripcion = await this.inscripcion(tenantId, id);

    if (dto.studyPlanId) {
      const plan = await this.prisma.studyPlan.findFirst({
        where: { id: dto.studyPlanId, tenantId, programId: inscripcion.programId },
        select: { id: true },
      });
      if (!plan) {
        throw new NotFoundException('Pensum no encontrado para ese programa');
      }
    }

    this.validarNivel(dto.currentLevel, inscripcion.program.durationPeriods);

    return this.prisma.programEnrollment.update({
      where: { id },
      data: {
        studyPlanId: dto.studyPlanId,
        currentLevel: dto.currentLevel,
        status: dto.status,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      include: INCLUDE_RESUMEN,
    });
  }

  /**
   * Programas del estudiante que llama. El token lleva el id de usuario, no
   * el de la ficha de estudiante, así que hay que resolverlo: sin esto la UI
   * del estudiante no tenía forma de pedir sus propios programas.
   */
  async misProgramas(tenantId: string, user: CurrentUserData) {
    const estudiante = await this.prisma.student.findFirst({
      where: { userId: user.id, tenantId },
      select: { id: true },
    });
    if (!estudiante) {
      throw new NotFoundException('El usuario no tiene ficha de estudiante');
    }

    return this.prisma.programEnrollment.findMany({
      where: { tenantId, studentId: estudiante.id },
      orderBy: { createdAt: 'desc' },
      include: {
        program: true,
        studyPlan: { select: { id: true, version: true, status: true } },
      },
    });
  }

  /**
   * Pensum de UNA inscripción propia del estudiante, agrupado por nivel.
   *
   * Va por aquí en vez de abrir `GET /study-plans/:id/subjects` al alumnado:
   * así el estudiante solo ve el plan de estudios de un programa en el que
   * está inscrito, y el armado por niveles se reutiliza de StudyPlansService
   * en lugar de duplicarse.
   */
  async miPensum(tenantId: string, inscripcionId: string, user: CurrentUserData) {
    const inscripcion = await this.prisma.programEnrollment.findFirst({
      where: { id: inscripcionId, tenantId },
      select: {
        id: true,
        studyPlanId: true,
        currentLevel: true,
        student: { select: { userId: true } },
      },
    });
    if (!inscripcion) throw new NotFoundException('Inscripción no encontrada');

    if (user.role === 'STUDENT' && inscripcion.student.userId !== user.id) {
      throw new ForbiddenException('Solo puede consultar su propio pensum');
    }

    const pensum = await this.studyPlans.subjectsGrouped(
      tenantId,
      inscripcion.studyPlanId,
    );

    return { ...pensum, currentLevel: inscripcion.currentLevel };
  }

  /**
   * Programas de un estudiante. Un STUDENT solo puede consultar los suyos;
   * profesorado y administración, los de cualquier estudiante del tenant.
   */
  async studentPrograms(tenantId: string, studentId: string, user: CurrentUserData) {
    const estudiante = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
      select: { id: true, userId: true },
    });
    if (!estudiante) throw new NotFoundException('Estudiante no encontrado');

    if (user.role === 'STUDENT' && estudiante.userId !== user.id) {
      throw new ForbiddenException('Solo puede consultar sus propios programas');
    }

    return this.prisma.programEnrollment.findMany({
      where: { tenantId, studentId },
      orderBy: { createdAt: 'desc' },
      include: {
        program: true,
        studyPlan: { select: { id: true, version: true, status: true } },
      },
    });
  }
}
