import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, createNotificationDto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        ...createNotificationDto,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: {
          tenantId,
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({
        where: {
          tenantId,
          userId,
        },
      }),
    ]);

    return {
      notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findUnreadCount(tenantId: string, userId: string) {
    return this.prisma.notification.count({
      where: {
        tenantId,
        userId,
        leida: false,
      },
    });
  }

  /**
   * Prisma lanza P2025 cuando `update` o `delete` no encuentran la fila, y sin
   * capturarlo Nest lo traduce a 500: pedir una notificacion inexistente --o
   * ajena-- se reportaba como caida del servidor en vez de un 404.
   */
  private async asegurarQueExiste(
    tenantId: string,
    userId: string,
    id: string,
  ) {
    const existe = await this.prisma.notification.findFirst({
      where: { id, tenantId, userId },
      select: { id: true },
    });
    if (!existe) {
      throw new NotFoundException('Notificación no encontrada');
    }
  }

  async markAsRead(tenantId: string, userId: string, id: string) {
    await this.asegurarQueExiste(tenantId, userId, id);
    return this.prisma.notification.update({
      where: {
        id,
        tenantId,
        userId,
      },
      data: {
        leida: true,
      },
    });
  }

  async markAllAsRead(tenantId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        tenantId,
        userId,
        leida: false,
      },
      data: {
        leida: true,
      },
    });
  }

  async remove(tenantId: string, userId: string, id: string) {
    await this.asegurarQueExiste(tenantId, userId, id);
    return this.prisma.notification.delete({
      where: {
        id,
        tenantId,
        userId,
      },
    });
  }

  async removeAll(tenantId: string, userId: string) {
    return this.prisma.notification.deleteMany({
      where: {
        tenantId,
        userId,
        leida: true,
      },
    });
  }
}
