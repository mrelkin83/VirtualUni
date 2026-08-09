import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import {
  CrearPlantillaMensajeDto,
  ActualizarPlantillaMensajeDto,
} from './dto/plantilla-mensaje.dto';

@Injectable()
export class MessageTemplatesService {
  constructor(private prisma: PrismaService) {}

  findAll(tenantId: string) {
    return this.prisma.messageTemplate.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'asc' },
    });
  }

  private async plantilla(tenantId: string, id: string) {
    const p = await this.prisma.messageTemplate.findFirst({ where: { id, tenantId } });
    if (!p) throw new NotFoundException('Plantilla no encontrada');
    return p;
  }

  create(tenantId: string, autorId: string | null, dto: CrearPlantillaMensajeDto) {
    return this.prisma.messageTemplate.create({
      data: {
        tenantId,
        autorId,
        nombre: dto.nombre,
        contenido: dto.contenido,
        categoria: dto.categoria ?? 'general',
      },
    });
  }

  async update(tenantId: string, id: string, dto: ActualizarPlantillaMensajeDto) {
    await this.plantilla(tenantId, id);
    return this.prisma.messageTemplate.update({ where: { id }, data: dto as any });
  }

  async remove(tenantId: string, id: string) {
    await this.plantilla(tenantId, id);
    await this.prisma.messageTemplate.delete({ where: { id } });
    return { message: 'Plantilla eliminada' };
  }
}
