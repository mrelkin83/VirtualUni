import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  QueryAnnouncementsDto,
} from './dto';
import { Announcement, AnnouncementStatus } from '@prisma/client';

@Injectable()
export class AnnouncementsService {
  private readonly logger = new Logger(AnnouncementsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Crear un nuevo anuncio
   */
  async create(
    tenantId: string,
    createDto: CreateAnnouncementDto,
    autor: string,
  ): Promise<Announcement> {
    try {
      const announcement = await this.prisma.announcement.create({
        data: {
          tenantId,
          titulo: createDto.titulo,
          contenido: createDto.contenido,
          autor,
          prioridad: createDto.prioridad,
          estado: createDto.publicar
            ? AnnouncementStatus.PUBLICADO
            : AnnouncementStatus.BORRADOR,
          adjuntos: createDto.adjuntos || [],
          targetRoles: createDto.targetRoles || ['STUDENT', 'TEACHER'],
          publishedAt: createDto.publicar ? new Date() : null,
        },
      });

      this.logger.log(`Announcement created: ${announcement.id}`);
      return announcement;
    } catch (error) {
      this.logger.error(`Error creating announcement: ${error}`);
      throw new BadRequestException('Error al crear el anuncio');
    }
  }

  /**
   * Obtener todos los anuncios con filtros y paginación
   */
  async findAll(
    tenantId: string,
    query: QueryAnnouncementsDto,
  ): Promise<{
    data: Announcement[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
    };

    if (query.search) {
      where.OR = [
        { titulo: { contains: query.search, mode: 'insensitive' } },
        { contenido: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.prioridad) {
      where.prioridad = query.prioridad;
    }

    if (query.estado) {
      where.estado = query.estado;
    }

    const [data, total] = await Promise.all([
      this.prisma.announcement.findMany({
        where,
        skip,
        take: limit,
        orderBy: this.parseOrderBy(query.orderBy),
      }),
      this.prisma.announcement.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtener un anuncio por ID
   */
  async findOne(id: string, tenantId: string): Promise<Announcement> {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement || announcement.tenantId !== tenantId) {
      throw new NotFoundException('Anuncio no encontrado');
    }

    return announcement;
  }

  /**
   * Actualizar un anuncio
   */
  async update(
    id: string,
    tenantId: string,
    updateDto: UpdateAnnouncementDto,
  ): Promise<Announcement> {
    await this.findOne(id, tenantId);

    try {
      const announcement = await this.prisma.announcement.update({
        where: { id },
        data: {
          titulo: updateDto.titulo,
          contenido: updateDto.contenido,
          prioridad: updateDto.prioridad,
          adjuntos: updateDto.adjuntos,
          targetRoles: updateDto.targetRoles,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Announcement updated: ${id}`);
      return announcement;
    } catch (error) {
      this.logger.error(`Error updating announcement: ${error}`);
      throw new BadRequestException('Error al actualizar el anuncio');
    }
  }

  /**
   * Eliminar un anuncio
   */
  async remove(id: string, tenantId: string): Promise<void> {
    await this.findOne(id, tenantId);

    try {
      await this.prisma.announcement.delete({
        where: { id },
      });

      this.logger.log(`Announcement deleted: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting announcement: ${error}`);
      throw new BadRequestException('Error al eliminar el anuncio');
    }
  }

  /**
   * Publicar un anuncio
   */
  async publish(id: string, tenantId: string): Promise<Announcement> {
    const announcement = await this.findOne(id, tenantId);

    if (announcement.estado === AnnouncementStatus.PUBLICADO) {
      throw new BadRequestException('El anuncio ya está publicado');
    }

    return await this.prisma.announcement.update({
      where: { id },
      data: {
        estado: AnnouncementStatus.PUBLICADO,
        publishedAt: new Date(),
      },
    });
  }

  /**
   * Archivar un anuncio
   */
  async archive(id: string, tenantId: string): Promise<Announcement> {
    await this.findOne(id, tenantId);

    return await this.prisma.announcement.update({
      where: { id },
      data: {
        estado: AnnouncementStatus.ARCHIVADO,
      },
    });
  }

  /**
   * Obtener anuncios por prioridad
   */
  async findByPriority(
    tenantId: string,
    prioridad: string,
  ): Promise<Announcement[]> {
    return await this.prisma.announcement.findMany({
      where: {
        tenantId,
        prioridad: prioridad as any,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Obtener anuncios por estado
   */
  async findByStatus(
    tenantId: string,
    estado: AnnouncementStatus,
  ): Promise<Announcement[]> {
    return await this.prisma.announcement.findMany({
      where: {
        tenantId,
        estado,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Obtener estadísticas de anuncios
   */
  async getStats(tenantId: string): Promise<{
    total: number;
    publicados: number;
    borradores: number;
    archivados: number;
    porPrioridad: Record<string, number>;
  }> {
    const [total, publicados, borradores, archivados] = await Promise.all([
      this.prisma.announcement.count({ where: { tenantId } }),
      this.prisma.announcement.count({
        where: { tenantId, estado: AnnouncementStatus.PUBLICADO },
      }),
      this.prisma.announcement.count({
        where: { tenantId, estado: AnnouncementStatus.BORRADOR },
      }),
      this.prisma.announcement.count({
        where: { tenantId, estado: AnnouncementStatus.ARCHIVADO },
      }),
    ]);

    const announcements = await this.prisma.announcement.findMany({
      where: { tenantId },
      select: { prioridad: true },
    });

    const porPrioridad: Record<string, number> = {
      ALTA: 0,
      MEDIA: 0,
      BAJA: 0,
    };

    announcements.forEach((a) => {
      porPrioridad[a.prioridad]++;
    });

    return {
      total,
      publicados,
      borradores,
      archivados,
      porPrioridad,
    };
  }

  /**
   * Parsear orderBy string a objeto Prisma
   */
  private parseOrderBy(
    orderBy?: string,
  ): Record<string, 'asc' | 'desc'> | undefined {
    if (!orderBy) {
      return { createdAt: 'desc' };
    }

    const [field, direction] = orderBy.split(':');
    return {
      [field]: (direction?.toLowerCase() || 'desc') as 'asc' | 'desc',
    };
  }
}
