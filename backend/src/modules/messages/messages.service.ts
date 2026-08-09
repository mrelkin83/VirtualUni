import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, tenantId: string) {
    return this.prisma.message.create({
      data: { ...data, tenantId },
    });
  }

  async findInbox(userId: string, tenantId: string) {
    return this.prisma.message.findMany({
      where: { recipientId: userId, tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findSent(userId: string, tenantId: string) {
    return this.prisma.message.findMany({
      where: { senderId: userId, tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const message = await this.prisma.message.findFirst({
      where: { id, tenantId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return message;
  }

  async markAsRead(id: string, tenantId: string) {
    const message = await this.prisma.message.findFirst({
      where: { id, tenantId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return this.prisma.message.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }

  async remove(id: string, tenantId: string) {
    const message = await this.prisma.message.findFirst({
      where: { id, tenantId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    await this.prisma.message.delete({ where: { id } });
    return { message: 'Message deleted successfully' };
  }

  async getUnreadCount(userId: string, tenantId: string) {
    return this.prisma.message.count({
      where: {
        recipientId: userId,
        tenantId,
        readAt: null,
      },
    });
  }
}
