import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateTopicDto,
  UpdateTopicDto,
  QueryTopicsDto,
  CreateReplyDto,
  UpdateReplyDto,
} from './dto';

const AUTOR_SELECT = {
  select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true },
} as const;

const STAFF_ROLES = ['TENANT_ADMIN', 'SUPER_ADMIN', 'TEACHER'];

@Injectable()
export class ForumsService {
  private readonly logger = new Logger(ForumsService.name);

  constructor(private prisma: PrismaService) {}

  async createTopic(tenantId: string, autorId: string, dto: CreateTopicDto) {
    if (dto.courseId) {
      const course = await this.prisma.course.findFirst({
        where: { id: dto.courseId, tenantId },
        select: { id: true },
      });

      if (!course) {
        throw new NotFoundException('Curso no encontrado');
      }
    }

    return this.prisma.forumTopic.create({
      data: {
        tenantId,
        autorId,
        courseId: dto.courseId ?? null,
        titulo: dto.titulo,
        contenido: dto.contenido,
        categoria: dto.categoria ?? 'general',
      },
      include: { autor: AUTOR_SELECT, _count: { select: { replies: true } } },
    });
  }

  async findAllTopics(tenantId: string, query: QueryTopicsDto) {
    const where: Prisma.ForumTopicWhereInput = { tenantId };

    if (query.courseId) where.courseId = query.courseId;
    if (query.categoria) where.categoria = query.categoria;
    if (query.search) {
      where.OR = [
        { titulo: { contains: query.search, mode: 'insensitive' } },
        { contenido: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.forumTopic.findMany({
      where,
      include: { autor: AUTOR_SELECT, _count: { select: { replies: true } } },
      orderBy: [{ fijado: 'desc' }, { updatedAt: 'desc' }],
    });
  }

  /** Devuelve el tema con sus respuestas e incrementa el contador de vistas. */
  async findOneTopic(tenantId: string, id: string, registrarVista = true) {
    const topic = await this.prisma.forumTopic.findFirst({
      where: { id, tenantId },
      include: {
        autor: AUTOR_SELECT,
        replies: {
          include: { autor: AUTOR_SELECT },
          orderBy: [{ esSolucion: 'desc' }, { createdAt: 'asc' }],
        },
      },
    });

    if (!topic) {
      throw new NotFoundException('Tema no encontrado');
    }

    if (registrarVista) {
      await this.prisma.forumTopic.update({
        where: { id },
        data: { vistas: { increment: 1 } },
      });
    }

    return topic;
  }

  private async getTopicOrFail(tenantId: string, id: string) {
    const topic = await this.prisma.forumTopic.findFirst({
      where: { id, tenantId },
      select: { id: true, autorId: true, cerrado: true },
    });

    if (!topic) {
      throw new NotFoundException('Tema no encontrado');
    }

    return topic;
  }

  /** Solo el autor o el personal docente/administrativo puede modificar. */
  private assertCanModify(autorId: string, userId: string, role: string) {
    if (autorId !== userId && !STAFF_ROLES.includes(role)) {
      throw new ForbiddenException('No tienes permisos sobre este contenido');
    }
  }

  async updateTopic(
    tenantId: string,
    id: string,
    dto: UpdateTopicDto,
    userId: string,
    role: string,
  ) {
    const topic = await this.getTopicOrFail(tenantId, id);
    this.assertCanModify(topic.autorId, userId, role);

    // Fijar y cerrar son acciones de moderacion.
    if ((dto.fijado !== undefined || dto.cerrado !== undefined) && !STAFF_ROLES.includes(role)) {
      throw new ForbiddenException('Solo un moderador puede fijar o cerrar temas');
    }

    return this.prisma.forumTopic.update({
      where: { id },
      data: dto,
      include: { autor: AUTOR_SELECT, _count: { select: { replies: true } } },
    });
  }

  async removeTopic(tenantId: string, id: string, userId: string, role: string) {
    const topic = await this.getTopicOrFail(tenantId, id);
    this.assertCanModify(topic.autorId, userId, role);

    await this.prisma.forumTopic.delete({ where: { id } });

    return { message: 'Tema eliminado correctamente' };
  }

  // -------------------------------------------------------------- Respuestas
  async createReply(tenantId: string, topicId: string, autorId: string, dto: CreateReplyDto) {
    const topic = await this.getTopicOrFail(tenantId, topicId);

    if (topic.cerrado) {
      throw new BadRequestException('Este tema esta cerrado a nuevas respuestas');
    }

    const reply = await this.prisma.forumReply.create({
      data: { tenantId, topicId, autorId, contenido: dto.contenido },
      include: { autor: AUTOR_SELECT },
    });

    // Mantiene el tema arriba en el listado por actividad reciente.
    await this.prisma.forumTopic.update({
      where: { id: topicId },
      data: { updatedAt: new Date() },
    });

    return reply;
  }

  private async getReplyOrFail(tenantId: string, id: string) {
    const reply = await this.prisma.forumReply.findFirst({
      where: { id, tenantId },
      select: { id: true, autorId: true, topicId: true },
    });

    if (!reply) {
      throw new NotFoundException('Respuesta no encontrada');
    }

    return reply;
  }

  async updateReply(
    tenantId: string,
    id: string,
    dto: UpdateReplyDto,
    userId: string,
    role: string,
  ) {
    const reply = await this.getReplyOrFail(tenantId, id);

    // Marcar como solucion corresponde al autor del tema o a un moderador.
    if (dto.esSolucion !== undefined) {
      const topic = await this.getTopicOrFail(tenantId, reply.topicId);
      this.assertCanModify(topic.autorId, userId, role);
    } else {
      this.assertCanModify(reply.autorId, userId, role);
    }

    return this.prisma.forumReply.update({
      where: { id },
      data: dto,
      include: { autor: AUTOR_SELECT },
    });
  }

  async removeReply(tenantId: string, id: string, userId: string, role: string) {
    const reply = await this.getReplyOrFail(tenantId, id);
    this.assertCanModify(reply.autorId, userId, role);

    await this.prisma.forumReply.delete({ where: { id } });

    return { message: 'Respuesta eliminada correctamente' };
  }

  async likeReply(tenantId: string, id: string) {
    await this.getReplyOrFail(tenantId, id);

    return this.prisma.forumReply.update({
      where: { id },
      data: { likes: { increment: 1 } },
      include: { autor: AUTOR_SELECT },
    });
  }

  async getStats(tenantId: string) {
    const [temas, respuestas, categorias] = await Promise.all([
      this.prisma.forumTopic.count({ where: { tenantId } }),
      this.prisma.forumReply.count({ where: { tenantId } }),
      this.prisma.forumTopic.groupBy({
        by: ['categoria'],
        where: { tenantId },
        _count: { _all: true },
      }),
    ]);

    return {
      totalTemas: temas,
      totalRespuestas: respuestas,
      porCategoria: categorias.map((c) => ({
        categoria: c.categoria,
        total: c._count._all,
      })),
    };
  }
}
