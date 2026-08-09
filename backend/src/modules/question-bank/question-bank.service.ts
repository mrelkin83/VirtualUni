import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CrearPreguntaDto, ActualizarPreguntaDto } from './dto/pregunta.dto';

@Injectable()
export class QuestionBankService {
  constructor(private prisma: PrismaService) {}

  findAll(tenantId: string, categoria?: string) {
    return this.prisma.questionBank.findMany({
      where: { tenantId, ...(categoria ? { categoria } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async pregunta(tenantId: string, id: string) {
    const p = await this.prisma.questionBank.findFirst({ where: { id, tenantId } });
    if (!p) throw new NotFoundException('Pregunta no encontrada');
    return p;
  }

  create(tenantId: string, teacherId: string | null, dto: CrearPreguntaDto) {
    return this.prisma.questionBank.create({
      data: {
        tenantId,
        teacherId,
        pregunta: dto.pregunta,
        tipo: dto.tipo ?? 'multiple',
        opciones: dto.opciones ?? [],
        respuestaCorrecta: dto.respuestaCorrecta ?? null,
        puntos: dto.puntos ?? 1,
        categoria: dto.categoria ?? 'General',
      },
    });
  }

  async update(tenantId: string, id: string, dto: ActualizarPreguntaDto) {
    await this.pregunta(tenantId, id);
    return this.prisma.questionBank.update({ where: { id }, data: dto as any });
  }

  async remove(tenantId: string, id: string) {
    await this.pregunta(tenantId, id);
    await this.prisma.questionBank.delete({ where: { id } });
    return { message: 'Pregunta eliminada' };
  }
}
