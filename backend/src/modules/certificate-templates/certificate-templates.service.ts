import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import {
  CrearPlantillaDto,
  ActualizarPlantillaDto,
} from './dto/plantilla.dto';

@Injectable()
export class CertificateTemplatesService {
  constructor(private prisma: PrismaService) {}

  findAll(tenantId: string) {
    return this.prisma.certificateTemplate.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const plantilla = await this.prisma.certificateTemplate.findFirst({
      where: { id, tenantId },
    });
    if (!plantilla) throw new NotFoundException('Plantilla no encontrada');
    return plantilla;
  }

  create(tenantId: string, dto: CrearPlantillaDto) {
    return this.prisma.certificateTemplate.create({
      data: {
        tenantId,
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        estado: dto.estado ?? 'borrador',
        componentes: (dto.componentes ?? []) as any,
        configuracion: (dto.configuracion ?? {}) as any,
      },
    });
  }

  async update(tenantId: string, id: string, dto: ActualizarPlantillaDto) {
    await this.findOne(tenantId, id);
    return this.prisma.certificateTemplate.update({
      where: { id },
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        estado: dto.estado,
        componentes: dto.componentes as any,
        configuracion: dto.configuracion as any,
      },
    });
  }

  /** Duplicar era una de las acciones del compositor y no guardaba nada. */
  async duplicate(tenantId: string, id: string) {
    const original = await this.findOne(tenantId, id);
    return this.prisma.certificateTemplate.create({
      data: {
        tenantId,
        nombre: `${original.nombre} (copia)`,
        descripcion: original.descripcion,
        // La copia nace como borrador: publicarla es una decisión aparte.
        estado: 'borrador',
        componentes: original.componentes as any,
        configuracion: original.configuracion as any,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    await this.prisma.certificateTemplate.delete({ where: { id } });
    return { message: 'Plantilla eliminada' };
  }
}
