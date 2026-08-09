import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateGroupDto, UpdateGroupDto, AddMembersDto } from './dto';

const MEMBER_INCLUDE = {
  members: {
    include: {
      student: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
        },
      },
    },
  },
  course: { select: { id: true, name: true, code: true, color: true } },
} as const;

@Injectable()
export class GroupsService {
  private readonly logger = new Logger(GroupsService.name);

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

  async create(tenantId: string, dto: CreateGroupDto) {
    await this.assertCourse(tenantId, dto.courseId);

    return this.prisma.courseGroup.create({
      data: {
        tenantId,
        courseId: dto.courseId,
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        capacidadMaxima: dto.capacidadMaxima,
        horario: dto.horario,
        aula: dto.aula,
        color: dto.color ?? 'bg-purple-500',
      },
      include: MEMBER_INCLUDE,
    });
  }

  async findAll(tenantId: string, courseId?: string) {
    return this.prisma.courseGroup.findMany({
      where: { tenantId, ...(courseId ? { courseId } : {}) },
      include: MEMBER_INCLUDE,
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const group = await this.prisma.courseGroup.findFirst({
      where: { id, tenantId },
      include: MEMBER_INCLUDE,
    });

    if (!group) {
      throw new NotFoundException('Grupo no encontrado');
    }

    return group;
  }

  async update(tenantId: string, id: string, dto: UpdateGroupDto) {
    await this.findOne(tenantId, id);

    if (dto.courseId) {
      await this.assertCourse(tenantId, dto.courseId);
    }

    return this.prisma.courseGroup.update({
      where: { id },
      data: dto,
      include: MEMBER_INCLUDE,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    await this.prisma.courseGroup.delete({ where: { id } });

    return { message: 'Grupo eliminado correctamente' };
  }

  /** Agrega estudiantes al grupo respetando la capacidad maxima. */
  async addMembers(tenantId: string, id: string, dto: AddMembersDto) {
    const group = await this.findOne(tenantId, id);

    const students = await this.prisma.student.findMany({
      where: { id: { in: dto.studentIds }, tenantId },
      select: { id: true },
    });

    if (students.length !== dto.studentIds.length) {
      throw new BadRequestException(
        'Uno o mas estudiantes no existen en este tenant',
      );
    }

    const yaEnGrupo = new Set(group.members.map((m) => m.studentId));
    const nuevos = students.filter((s) => !yaEnGrupo.has(s.id));

    if (
      group.capacidadMaxima != null &&
      group.members.length + nuevos.length > group.capacidadMaxima
    ) {
      throw new BadRequestException(
        `El grupo admite un maximo de ${group.capacidadMaxima} estudiantes`,
      );
    }

    if (nuevos.length > 0) {
      await this.prisma.groupMember.createMany({
        data: nuevos.map((s) => ({
          tenantId,
          groupId: id,
          studentId: s.id,
        })),
        skipDuplicates: true,
      });
    }

    return this.findOne(tenantId, id);
  }

  async removeMember(tenantId: string, id: string, studentId: string) {
    await this.findOne(tenantId, id);

    const member = await this.prisma.groupMember.findFirst({
      where: { groupId: id, studentId, tenantId },
      select: { id: true },
    });

    if (!member) {
      throw new NotFoundException('El estudiante no pertenece a este grupo');
    }

    await this.prisma.groupMember.delete({ where: { id: member.id } });

    return this.findOne(tenantId, id);
  }
}
