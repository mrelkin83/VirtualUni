import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { SubjectsService } from '../subjects/subjects.service';
import { CurrentUserData } from '@/common/decorators/current-user.decorator';
import { CrearPreguntaDto, ActualizarPreguntaDto } from './dto/pregunta.dto';

@Injectable()
export class QuestionBankService {
  constructor(
    private prisma: PrismaService,
    private subjects: SubjectsService,
  ) {}

  findAll(tenantId: string, categoria?: string, subjectId?: string) {
    return this.prisma.questionBank.findMany({
      where: {
        tenantId,
        ...(categoria ? { categoria } : {}),
        ...(subjectId ? { subjectId } : {}),
      },
      include: { subject: { select: { id: true, code: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async pregunta(tenantId: string, id: string) {
    const p = await this.prisma.questionBank.findFirst({ where: { id, tenantId } });
    if (!p) throw new NotFoundException('Pregunta no encontrada');
    return p;
  }

  /** Una pregunta con subjectId es maestra: exige editor de la asignatura. */
  private async asegurarPermiso(
    tenantId: string,
    p: { subjectId: string | null },
    user: CurrentUserData,
  ) {
    if (p.subjectId) {
      await this.subjects.asegurarEditorDeContenido(tenantId, p.subjectId, user);
    }
  }

  async create(tenantId: string, user: CurrentUserData, dto: CrearPreguntaDto) {
    if (dto.subjectId) {
      // subjectId viene del cliente: contra el tenant antes de usarse
      const subject = await this.prisma.subject.findFirst({
        where: { id: dto.subjectId, tenantId },
        select: { id: true },
      });
      if (!subject) throw new NotFoundException('Asignatura no encontrada');
      await this.subjects.asegurarEditorDeContenido(tenantId, dto.subjectId, user);
    }

    return this.prisma.questionBank.create({
      data: {
        tenantId,
        teacherId: user?.userId ?? null,
        subjectId: dto.subjectId ?? null,
        pregunta: dto.pregunta,
        tipo: dto.tipo ?? 'multiple',
        opciones: dto.opciones ?? [],
        respuestaCorrecta: dto.respuestaCorrecta ?? null,
        puntos: dto.puntos ?? 1,
        categoria: dto.categoria ?? 'General',
      },
    });
  }

  async update(
    tenantId: string,
    id: string,
    dto: ActualizarPreguntaDto,
    user: CurrentUserData,
  ) {
    const p = await this.pregunta(tenantId, id);
    await this.asegurarPermiso(tenantId, p, user);
    // La pertenencia a asignatura se fija al crear; no se reasigna por PATCH
    const { subjectId: _s, ...data } = dto;
    return this.prisma.questionBank.update({ where: { id }, data: data as any });
  }

  async remove(tenantId: string, id: string, user: CurrentUserData) {
    const p = await this.pregunta(tenantId, id);
    await this.asegurarPermiso(tenantId, p, user);
    await this.prisma.questionBank.delete({ where: { id } });
    return { message: 'Pregunta eliminada' };
  }
}
