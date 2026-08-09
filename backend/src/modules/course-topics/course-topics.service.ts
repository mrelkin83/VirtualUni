import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import {
  CrearTemaDto,
  ActualizarTemaDto,
  CrearBloqueDto,
  ActualizarBloqueDto,
} from './dto/topic.dto';

@Injectable()
export class CourseTopicsService {
  constructor(private prisma: PrismaService) {}

  findByCourse(tenantId: string, courseId: string) {
    return this.prisma.courseTopic.findMany({
      where: { tenantId, courseId },
      orderBy: { orderIndex: 'asc' },
      include: { blocks: { orderBy: { orderIndex: 'asc' } } },
    });
  }

  private async tema(tenantId: string, id: string) {
    const t = await this.prisma.courseTopic.findFirst({ where: { id, tenantId } });
    if (!t) throw new NotFoundException('Tema no encontrado');
    return t;
  }

  async crear(tenantId: string, dto: CrearTemaDto) {
    // Si no se indica el orden, va al final del temario del curso.
    const orderIndex =
      dto.orderIndex ??
      (await this.prisma.courseTopic.count({
        where: { tenantId, courseId: dto.courseId },
      }));

    return this.prisma.courseTopic.create({
      data: {
        tenantId,
        courseId: dto.courseId,
        title: dto.title,
        description: dto.description,
        orderIndex,
      },
      include: { blocks: true },
    });
  }

  async actualizar(tenantId: string, id: string, dto: ActualizarTemaDto) {
    await this.tema(tenantId, id);
    return this.prisma.courseTopic.update({
      where: { id },
      data: dto,
      include: { blocks: { orderBy: { orderIndex: 'asc' } } },
    });
  }

  async eliminar(tenantId: string, id: string) {
    await this.tema(tenantId, id);
    // Los bloques caen con el tema por la cascada declarada en el esquema.
    await this.prisma.courseTopic.delete({ where: { id } });
    return { message: 'Tema eliminado' };
  }

  async crearBloque(tenantId: string, topicId: string, dto: CrearBloqueDto) {
    await this.tema(tenantId, topicId);
    const orderIndex =
      dto.orderIndex ??
      (await this.prisma.topicBlock.count({ where: { tenantId, topicId } }));

    return this.prisma.topicBlock.create({
      data: {
        tenantId,
        topicId,
        title: dto.title,
        content: dto.content,
        objectives: dto.objectives ?? [],
        keyIdeas: dto.keyIdeas ?? [],
        orderIndex,
      },
    });
  }

  async actualizarBloque(tenantId: string, id: string, dto: ActualizarBloqueDto) {
    const b = await this.prisma.topicBlock.findFirst({ where: { id, tenantId } });
    if (!b) throw new NotFoundException('Bloque no encontrado');
    return this.prisma.topicBlock.update({ where: { id }, data: dto });
  }

  async eliminarBloque(tenantId: string, id: string) {
    const b = await this.prisma.topicBlock.findFirst({ where: { id, tenantId } });
    if (!b) throw new NotFoundException('Bloque no encontrado');
    await this.prisma.topicBlock.delete({ where: { id } });
    return { message: 'Bloque eliminado' };
  }
}
