import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CrearAsignaturaDto, ActualizarAsignaturaDto } from './dto/subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  /** Toda lectura/mutación por id pasa por aquí: id de otro tenant → 404. */
  private async asignatura(tenantId: string, id: string) {
    const subject = await this.prisma.subject.findFirst({
      where: { id, tenantId },
    });
    if (!subject) throw new NotFoundException('Asignatura no encontrada');
    return subject;
  }

  async findAll(
    tenantId: string,
    page = 1,
    limit = 20,
    search?: string,
    area?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (area) where.area = { equals: area, mode: 'insensitive' };
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { area: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [subjects, total] = await Promise.all([
      this.prisma.subject.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { planEntries: true, courses: true } },
        },
      }),
      this.prisma.subject.count({ where }),
    ]);

    return {
      data: subjects,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(tenantId: string, id: string) {
    await this.asignatura(tenantId, id);
    return this.prisma.subject.findFirst({
      where: { id, tenantId },
      include: {
        _count: { select: { planEntries: true, courses: true } },
      },
    });
  }

  /**
   * Dónde se usa la asignatura: programas/pensums que la incluyen y cuántos
   * grupos la dictan. Alimenta la insignia "Transversal · N programas".
   */
  async usage(tenantId: string, id: string) {
    await this.asignatura(tenantId, id);

    const [entradas, totalGrupos] = await Promise.all([
      this.prisma.studyPlanSubject.findMany({
        where: { subjectId: id, tenantId },
        include: {
          studyPlan: {
            select: {
              id: true,
              version: true,
              status: true,
              program: { select: { id: true, code: true, name: true } },
            },
          },
        },
      }),
      this.prisma.course.count({ where: { subjectId: id, tenantId } }),
    ]);

    const programas = new Map<
      string,
      { id: string; code: string; name: string; pensums: { id: string; version: string; status: string; level: number }[] }
    >();
    for (const entrada of entradas) {
      const programa = entrada.studyPlan.program;
      if (!programas.has(programa.id)) {
        programas.set(programa.id, { ...programa, pensums: [] });
      }
      programas.get(programa.id)!.pensums.push({
        id: entrada.studyPlan.id,
        version: entrada.studyPlan.version,
        status: entrada.studyPlan.status,
        level: entrada.level,
      });
    }

    return {
      programas: [...programas.values()],
      totalProgramas: programas.size,
      totalGrupos,
    };
  }

  async create(tenantId: string, dto: CrearAsignaturaDto) {
    const existente = await this.prisma.subject.findFirst({
      where: { tenantId, code: dto.code },
      select: { id: true },
    });
    if (existente) {
      throw new ConflictException(`Ya existe una asignatura con el código ${dto.code}`);
    }
    return this.prisma.subject.create({ data: { tenantId, ...dto } });
  }

  async update(tenantId: string, id: string, dto: ActualizarAsignaturaDto) {
    const actual = await this.asignatura(tenantId, id);

    if (dto.code && dto.code !== actual.code) {
      const duplicado = await this.prisma.subject.findFirst({
        where: { tenantId, code: dto.code, id: { not: id } },
        select: { id: true },
      });
      if (duplicado) {
        throw new ConflictException(`Ya existe una asignatura con el código ${dto.code}`);
      }
    }

    return this.prisma.subject.update({ where: { id }, data: dto });
  }

  /**
   * Una asignatura usada en un pensum o dictada en un grupo no se elimina:
   * el pensum quedaría roto y los grupos huérfanos de catálogo. 409 con el
   * detalle para que la UI ofrezca desactivarla en su lugar.
   */
  async remove(tenantId: string, id: string) {
    await this.asignatura(tenantId, id);

    const [enPensums, enGrupos] = await Promise.all([
      this.prisma.studyPlanSubject.count({ where: { subjectId: id, tenantId } }),
      this.prisma.course.count({ where: { subjectId: id, tenantId } }),
    ]);

    if (enPensums > 0 || enGrupos > 0) {
      throw new ConflictException(
        `La asignatura está en uso (${enPensums} pensum(s), ${enGrupos} grupo(s)). ` +
          'Retírela de los pensums y grupos, o cámbiela a estado inactivo.',
      );
    }

    await this.prisma.subject.delete({ where: { id } });
    return { message: 'Asignatura eliminada' };
  }
}
