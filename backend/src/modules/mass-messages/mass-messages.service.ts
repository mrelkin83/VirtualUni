import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import {
  CreateMassMessageDto,
  UpdateMassMessageDto,
  QueryMassMessagesDto,
} from './dto';
import { MassMessage, MessageStatus } from '@prisma/client';

@Injectable()
export class MassMessagesService {
  private readonly logger = new Logger(MassMessagesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Crear un nuevo mensaje masivo
   */
  async create(
    tenantId: string,
    createDto: CreateMassMessageDto,
    remitente: string,
  ): Promise<MassMessage> {
    try {
      // Validar que haya targets
      const hasTargets =
        (createDto.targetRoles && createDto.targetRoles.length > 0) ||
        (createDto.targetUsers && createDto.targetUsers.length > 0);

      if (!hasTargets) {
        throw new BadRequestException(
          'Debe seleccionar al menos un rol o usuario como destinatario',
        );
      }

      const isScheduled = createDto.programado
        ? new Date(createDto.programado) > new Date()
        : false;

      const message = await this.prisma.massMessage.create({
        data: {
          tenantId,
          asunto: createDto.asunto,
          contenido: createDto.contenido,
          remitente,
          targetRoles: createDto.targetRoles || [],
          targetUsers: createDto.targetUsers || [],
          adjuntos: createDto.adjuntos || [],
          estado: isScheduled ? MessageStatus.PROGRAMADO : MessageStatus.BORRADOR,
          programado: createDto.programado ? new Date(createDto.programado) : null,
        },
      });

      this.logger.log(`Mass message created: ${message.id}`);
      return message;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Error creating mass message: ${error}`);
      throw new BadRequestException('Error al crear el mensaje masivo');
    }
  }

  /**
   * Obtener todos los mensajes masivos con filtros y paginación
   */
  async findAll(
    tenantId: string,
    query: QueryMassMessagesDto,
  ): Promise<{
    data: MassMessage[];
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
        { asunto: { contains: query.search, mode: 'insensitive' } },
        { contenido: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.estado) {
      where.estado = query.estado;
    }

    const [data, total] = await Promise.all([
      this.prisma.massMessage.findMany({
        where,
        skip,
        take: limit,
        orderBy: this.parseOrderBy(query.orderBy),
      }),
      this.prisma.massMessage.count({ where }),
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
   * Obtener un mensaje masivo por ID
   */
  async findOne(id: string, tenantId: string): Promise<MassMessage> {
    const message = await this.prisma.massMessage.findUnique({
      where: { id },
    });

    if (!message || message.tenantId !== tenantId) {
      throw new NotFoundException('Mensaje masivo no encontrado');
    }

    return message;
  }

  /**
   * Actualizar un mensaje masivo
   */
  async update(
    id: string,
    tenantId: string,
    updateDto: UpdateMassMessageDto,
  ): Promise<MassMessage> {
    const message = await this.findOne(id, tenantId);

    // No se puede editar un mensaje ya enviado o fallido
    if (
      message.estado === MessageStatus.ENVIADO ||
      message.estado === MessageStatus.FALLIDO
    ) {
      throw new BadRequestException(
        'No se puede editar un mensaje enviado o fallido',
      );
    }

    try {
      const updated = await this.prisma.massMessage.update({
        where: { id },
        data: {
          asunto: updateDto.asunto,
          contenido: updateDto.contenido,
          targetRoles: updateDto.targetRoles,
          targetUsers: updateDto.targetUsers,
          adjuntos: updateDto.adjuntos,
          programado: updateDto.programado
            ? new Date(updateDto.programado)
            : undefined,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Mass message updated: ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(`Error updating mass message: ${error}`);
      throw new BadRequestException('Error al actualizar el mensaje masivo');
    }
  }

  /**
   * Enviar un mensaje masivo inmediatamente
   */
  async send(id: string, tenantId: string): Promise<MassMessage> {
    const message = await this.findOne(id, tenantId);

    if (message.estado === MessageStatus.ENVIADO) {
      throw new BadRequestException('Este mensaje ya ha sido enviado');
    }

    try {
      // Obtener usuarios objetivo basado en roles y usuarios específicos
      const targetUsers = await this.getTargetUsers(tenantId, message);

      // Aquí iría la lógica de envío real (email, notificaciones, etc.)
      // Por ahora simularemos que se envió correctamente
      this.logger.log(
        `Sending mass message ${id} to ${targetUsers.length} users`,
      );

      const updated = await this.prisma.massMessage.update({
        where: { id },
        data: {
          estado: MessageStatus.ENVIADO,
          enviadoAt: new Date(),
        },
      });

      return updated;
    } catch (error) {
      this.logger.error(`Error sending mass message: ${error}`);
      throw new BadRequestException('Error al enviar el mensaje masivo');
    }
  }

  /**
   * Eliminar un mensaje masivo
   */
  async remove(id: string, tenantId: string): Promise<void> {
    const message = await this.findOne(id, tenantId);

    // No se puede eliminar un mensaje ya enviado
    if (message.estado === MessageStatus.ENVIADO) {
      throw new BadRequestException('No se puede eliminar un mensaje enviado');
    }

    try {
      await this.prisma.massMessage.delete({
        where: { id },
      });

      this.logger.log(`Mass message deleted: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting mass message: ${error}`);
      throw new BadRequestException('Error al eliminar el mensaje masivo');
    }
  }

  /**
   * Obtener mensajes por estado
   */
  async findByStatus(
    tenantId: string,
    estado: MessageStatus,
  ): Promise<MassMessage[]> {
    return await this.prisma.massMessage.findMany({
      where: {
        tenantId,
        estado,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Obtener estadísticas de mensajes masivos
   */
  async getStats(tenantId: string): Promise<{
    total: number;
    borradores: number;
    programados: number;
    enviados: number;
    fallidos: number;
    destinatariosPromedio: number;
  }> {
    const [total, borradores, programados, enviados, fallidos] =
      await Promise.all([
        this.prisma.massMessage.count({ where: { tenantId } }),
        this.prisma.massMessage.count({
          where: { tenantId, estado: MessageStatus.BORRADOR },
        }),
        this.prisma.massMessage.count({
          where: { tenantId, estado: MessageStatus.PROGRAMADO },
        }),
        this.prisma.massMessage.count({
          where: { tenantId, estado: MessageStatus.ENVIADO },
        }),
        this.prisma.massMessage.count({
          where: { tenantId, estado: MessageStatus.FALLIDO },
        }),
      ]);

    const messages = await this.prisma.massMessage.findMany({
      where: { tenantId },
      select: { targetRoles: true, targetUsers: true },
    });

    let destinatariosTotal = 0;
    messages.forEach((m) => {
      destinatariosTotal += (m.targetUsers?.length || 0);
      // Estimamos 10 usuarios por rol
      destinatariosTotal += (m.targetRoles?.length || 0) * 10;
    });

    const destinatariosPromedio =
      messages.length > 0 ? Math.round(destinatariosTotal / messages.length) : 0;

    return {
      total,
      borradores,
      programados,
      enviados,
      fallidos,
      destinatariosPromedio,
    };
  }

  /**
   * Obtener usuarios objetivo para un mensaje
   */
  private async getTargetUsers(
    tenantId: string,
    message: MassMessage,
  ): Promise<any[]> {
    let users: any[] = [];

    // Obtener usuarios por roles
    if (message.targetRoles && message.targetRoles.length > 0) {
      const roleUsers = await this.prisma.user.findMany({
        where: {
          tenantId,
          role: { in: message.targetRoles as any },
        },
        select: { id: true, email: true },
      });
      users = [...users, ...roleUsers];
    }

    // Obtener usuarios específicos
    if (message.targetUsers && message.targetUsers.length > 0) {
      const specificUsers = await this.prisma.user.findMany({
        where: {
          tenantId,
          id: { in: message.targetUsers },
        },
        select: { id: true, email: true },
      });
      users = [...users, ...specificUsers];
    }

    // Eliminar duplicados
    return Array.from(new Map(users.map((u) => [u.id, u])).values());
  }

  /**
   * Procesar mensajes programados que deben ser enviados
   */
  async processProgrammedMessages(): Promise<void> {
    try {
      const now = new Date();
      const messages = await this.prisma.massMessage.findMany({
        where: {
          estado: MessageStatus.PROGRAMADO,
          programado: { lte: now },
        },
      });

      for (const message of messages) {
        await this.send(message.id, message.tenantId);
      }

      this.logger.log(
        `Processed ${messages.length} programmed mass messages`,
      );
    } catch (error) {
      this.logger.error(`Error processing programmed messages: ${error}`);
    }
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
