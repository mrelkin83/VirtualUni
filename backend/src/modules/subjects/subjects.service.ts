import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CrearAsignaturaDto, ActualizarAsignaturaDto } from './dto/subject.dto';
import { CurrentUserData } from '@/common/decorators/current-user.decorator';

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
   * Una asignatura usada en un pensum, dictada en un grupo o con contenido
   * maestro no se elimina: el pensum quedaría roto, los grupos huérfanos de
   * catálogo, y el contenido compartido se perdería en cascada. 409 con el
   * detalle para que la UI ofrezca desactivarla en su lugar.
   */
  async remove(tenantId: string, id: string) {
    await this.asignatura(tenantId, id);

    const [enPensums, enGrupos, temas, materiales, preguntas] = await Promise.all([
      this.prisma.studyPlanSubject.count({ where: { subjectId: id, tenantId } }),
      this.prisma.course.count({ where: { subjectId: id, tenantId } }),
      this.prisma.courseTopic.count({ where: { subjectId: id, tenantId } }),
      this.prisma.material.count({ where: { subjectId: id, tenantId } }),
      this.prisma.questionBank.count({ where: { subjectId: id, tenantId } }),
    ]);

    if (enPensums > 0 || enGrupos > 0) {
      throw new ConflictException(
        `La asignatura está en uso (${enPensums} pensum(s), ${enGrupos} grupo(s)). ` +
          'Retírela de los pensums y grupos, o cámbiela a estado inactivo.',
      );
    }

    if (temas > 0 || materiales > 0 || preguntas > 0) {
      throw new ConflictException(
        `La asignatura tiene contenido maestro (${temas} tema(s), ${materiales} ` +
          `material(es), ${preguntas} pregunta(s)); elimínelo primero o desactívela.`,
      );
    }

    await this.prisma.subject.delete({ where: { id } });
    return { message: 'Asignatura eliminada' };
  }

  // -------------------------------------------- editores de contenido maestro

  /**
   * ¿Puede este usuario editar el contenido maestro de la asignatura?
   * Administración siempre; un TEACHER solo si el admin lo habilitó como
   * editor de esa asignatura (SubjectEditor). Lo usan course-topics,
   * materials y question-bank antes de cualquier mutación con subjectId.
   */
  async puedeEditarContenidoMaestro(
    tenantId: string,
    subjectId: string,
    user: CurrentUserData,
  ): Promise<boolean> {
    if (user.role === 'TENANT_ADMIN' || user.role === 'SUPER_ADMIN') return true;
    if (user.role !== 'TEACHER') return false;

    const editor = await this.prisma.subjectEditor.findFirst({
      where: {
        tenantId,
        subjectId,
        teacher: { userId: user.id, tenantId },
      },
      select: { id: true },
    });
    return !!editor;
  }

  async asegurarEditorDeContenido(
    tenantId: string,
    subjectId: string,
    user: CurrentUserData,
  ): Promise<void> {
    if (!(await this.puedeEditarContenidoMaestro(tenantId, subjectId, user))) {
      throw new ForbiddenException(
        'El contenido maestro de la asignatura solo lo edita la administración ' +
          'o un docente habilitado como editor de la asignatura',
      );
    }
  }

  async listarEditores(tenantId: string, id: string) {
    await this.asignatura(tenantId, id);
    return this.prisma.subjectEditor.findMany({
      where: { subjectId: id, tenantId },
      include: {
        teacher: {
          select: {
            id: true,
            employeeCode: true,
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
      },
    });
  }

  /** Reemplaza el conjunto de docentes editores (solo administración). */
  async fijarEditores(tenantId: string, id: string, teacherIds: string[]) {
    await this.asignatura(tenantId, id);

    // teacherIds viene del cliente: todos deben ser docentes del tenant
    const docentes = await this.prisma.teacher.findMany({
      where: { id: { in: teacherIds }, tenantId },
      select: { id: true },
    });
    if (docentes.length !== teacherIds.length) {
      throw new BadRequestException('Todos los editores deben ser docentes del tenant');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.subjectEditor.deleteMany({ where: { subjectId: id, tenantId } });
      if (teacherIds.length > 0) {
        await tx.subjectEditor.createMany({
          data: teacherIds.map((teacherId) => ({ tenantId, subjectId: id, teacherId })),
        });
      }
    });

    return this.listarEditores(tenantId, id);
  }
}
