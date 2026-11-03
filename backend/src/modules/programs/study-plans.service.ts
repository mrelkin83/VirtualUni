import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { StudyPlanStatus } from '@prisma/client';
import {
  CrearPensumDto,
  ActualizarPensumDto,
  DuplicarPensumDto,
  CrearFilaPensumDto,
  ActualizarFilaPensumDto,
} from './dto/study-plan.dto';

@Injectable()
export class StudyPlansService {
  constructor(private prisma: PrismaService) {}

  // ------------------------------------------------------------ ownership

  private async pensum(tenantId: string, id: string) {
    const plan = await this.prisma.studyPlan.findFirst({
      where: { id, tenantId },
      include: {
        program: { select: { id: true, name: true, durationPeriods: true } },
        _count: { select: { programEnrollments: true } },
      },
    });
    if (!plan) throw new NotFoundException('Pensum no encontrado');
    return plan;
  }

  private async fila(tenantId: string, id: string) {
    const fila = await this.prisma.studyPlanSubject.findFirst({
      where: { id, tenantId },
      include: {
        studyPlan: {
          include: {
            program: { select: { id: true, durationPeriods: true } },
            _count: { select: { programEnrollments: true } },
          },
        },
      },
    });
    if (!fila) throw new NotFoundException('Fila del pensum no encontrada');
    return fila;
  }

  /**
   * Un pensum VIGENTE con estudiantes no se edita en sitio (los inscritos
   * verían cambiar su plan bajo los pies): se duplica a nueva versión. Un
   * CERRADO es histórico y tampoco se toca. Un BORRADOR (o un VIGENTE que
   * nadie cursa aún) sí se edita.
   */
  private asegurarEditable(plan: {
    status: StudyPlanStatus;
    _count: { programEnrollments: number };
  }) {
    if (plan.status === StudyPlanStatus.CERRADO) {
      throw new ConflictException(
        'El pensum está CERRADO; es histórico y no se edita.',
      );
    }
    if (
      plan.status === StudyPlanStatus.VIGENTE &&
      plan._count.programEnrollments > 0
    ) {
      throw new ConflictException(
        'El pensum VIGENTE tiene estudiantes inscritos; duplíquelo como nueva versión y edite la copia.',
      );
    }
  }

  private validarNivel(level: number, durationPeriods: number | null) {
    if (durationPeriods && level > durationPeriods) {
      throw new BadRequestException(
        `El nivel ${level} supera la duración del programa (${durationPeriods} periodos)`,
      );
    }
  }

  // ------------------------------------------------------------ pensums

  async listByProgram(tenantId: string, programId: string) {
    const programa = await this.prisma.program.findFirst({
      where: { id: programId, tenantId },
      select: { id: true },
    });
    if (!programa) throw new NotFoundException('Programa no encontrado');

    return this.prisma.studyPlan.findMany({
      where: { programId, tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { subjects: true, programEnrollments: true } },
      },
    });
  }

  async createForProgram(tenantId: string, programId: string, dto: CrearPensumDto) {
    const programa = await this.prisma.program.findFirst({
      where: { id: programId, tenantId },
      select: { id: true },
    });
    if (!programa) throw new NotFoundException('Programa no encontrado');

    const existente = await this.prisma.studyPlan.findFirst({
      where: { programId, version: dto.version },
      select: { id: true },
    });
    if (existente) {
      throw new ConflictException(`Ya existe la versión ${dto.version} del pensum`);
    }

    return this.prisma.studyPlan.create({
      data: {
        tenantId,
        programId,
        version: dto.version,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : undefined,
        notes: dto.notes,
      },
    });
  }

  async update(tenantId: string, id: string, dto: ActualizarPensumDto) {
    const plan = await this.pensum(tenantId, id);
    this.asegurarEditable(plan);

    if (dto.version && dto.version !== plan.version) {
      const duplicado = await this.prisma.studyPlan.findFirst({
        where: { programId: plan.programId, version: dto.version, id: { not: id } },
        select: { id: true },
      });
      if (duplicado) {
        throw new ConflictException(`Ya existe la versión ${dto.version} del pensum`);
      }
    }

    return this.prisma.studyPlan.update({
      where: { id },
      data: {
        version: dto.version,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : undefined,
        notes: dto.notes,
      },
    });
  }

  /** Activa esta versión; la VIGENTE anterior del mismo programa pasa a CERRADO. */
  async activate(tenantId: string, id: string) {
    const plan = await this.pensum(tenantId, id);
    if (plan.status === StudyPlanStatus.VIGENTE) return plan;

    return this.prisma.$transaction(async (tx) => {
      await tx.studyPlan.updateMany({
        where: {
          programId: plan.programId,
          status: StudyPlanStatus.VIGENTE,
          id: { not: id },
        },
        data: { status: StudyPlanStatus.CERRADO },
      });

      return tx.studyPlan.update({
        where: { id },
        data: {
          status: StudyPlanStatus.VIGENTE,
          validFrom: plan.validFrom ?? new Date(),
        },
      });
    });
  }

  /** Copia filas Y prerrequisitos a una versión nueva en BORRADOR. */
  async duplicate(tenantId: string, id: string, dto: DuplicarPensumDto) {
    const plan = await this.pensum(tenantId, id);

    const duplicado = await this.prisma.studyPlan.findFirst({
      where: { programId: plan.programId, version: dto.version },
      select: { id: true },
    });
    if (duplicado) {
      throw new ConflictException(`Ya existe la versión ${dto.version} del pensum`);
    }

    const filas = await this.prisma.studyPlanSubject.findMany({
      where: { studyPlanId: id, tenantId },
      include: { prerequisites: true },
    });

    return this.prisma.$transaction(async (tx) => {
      const nuevo = await tx.studyPlan.create({
        data: {
          tenantId,
          programId: plan.programId,
          version: dto.version,
          status: StudyPlanStatus.BORRADOR,
          notes: `Duplicado de la versión ${plan.version}`,
        },
      });

      // Mapa fila vieja → fila nueva para remapear los prerrequisitos
      const mapa = new Map<string, string>();
      for (const fila of filas) {
        const creada = await tx.studyPlanSubject.create({
          data: {
            tenantId,
            studyPlanId: nuevo.id,
            subjectId: fila.subjectId,
            level: fila.level,
            subjectType: fila.subjectType,
            credits: fila.credits,
            hours: fila.hours,
            orderIndex: fila.orderIndex,
          },
          select: { id: true },
        });
        mapa.set(fila.id, creada.id);
      }

      const prerrequisitos = filas.flatMap((fila) =>
        fila.prerequisites
          .filter((p) => mapa.has(p.requiredId))
          .map((p) => ({
            tenantId,
            entryId: mapa.get(fila.id)!,
            requiredId: mapa.get(p.requiredId)!,
          })),
      );
      if (prerrequisitos.length > 0) {
        await tx.studyPlanPrerequisite.createMany({ data: prerrequisitos });
      }

      return tx.studyPlan.findUnique({
        where: { id: nuevo.id },
        include: { _count: { select: { subjects: true } } },
      });
    });
  }

  // ------------------------------------------------------------ filas

  /** Filas del pensum agrupadas por nivel, con totales para el editor. */
  async subjectsGrouped(tenantId: string, id: string) {
    const plan = await this.pensum(tenantId, id);

    const filas = await this.prisma.studyPlanSubject.findMany({
      where: { studyPlanId: id, tenantId },
      orderBy: [{ level: 'asc' }, { orderIndex: 'asc' }],
      include: {
        // planEntries alimenta la insignia "Transversal · N" del editor
        subject: { include: { _count: { select: { planEntries: true, courses: true } } } },
        prerequisites: {
          include: {
            required: {
              select: {
                id: true,
                level: true,
                subject: { select: { id: true, code: true, name: true } },
              },
            },
          },
        },
      },
    });

    const niveles = new Map<number, typeof filas>();
    for (const fila of filas) {
      if (!niveles.has(fila.level)) niveles.set(fila.level, []);
      niveles.get(fila.level)!.push(fila);
    }

    const creditosDe = (fila: (typeof filas)[number]) =>
      fila.credits ?? fila.subject.credits ?? 0;
    const horasDe = (fila: (typeof filas)[number]) =>
      fila.hours ?? fila.subject.hours ?? 0;

    return {
      studyPlan: {
        id: plan.id,
        version: plan.version,
        status: plan.status,
        program: plan.program,
      },
      niveles: [...niveles.entries()].map(([level, items]) => ({
        level,
        subjects: items,
        totalCredits: items.reduce((s, f) => s + creditosDe(f), 0),
        totalHours: items.reduce((s, f) => s + horasDe(f), 0),
      })),
      totalCredits: filas.reduce((s, f) => s + creditosDe(f), 0),
      totalHours: filas.reduce((s, f) => s + horasDe(f), 0),
    };
  }

  async addSubject(tenantId: string, planId: string, dto: CrearFilaPensumDto) {
    const plan = await this.pensum(tenantId, planId);
    this.asegurarEditable(plan);
    this.validarNivel(dto.level, plan.program.durationPeriods);

    // subjectId viene del cliente: se valida contra el tenant antes de usarse
    const subject = await this.prisma.subject.findFirst({
      where: { id: dto.subjectId, tenantId },
      select: { id: true },
    });
    if (!subject) throw new NotFoundException('Asignatura no encontrada');

    const existente = await this.prisma.studyPlanSubject.findFirst({
      where: { studyPlanId: planId, subjectId: dto.subjectId },
      select: { id: true },
    });
    if (existente) {
      throw new ConflictException('La asignatura ya está en este pensum');
    }

    const orderIndex =
      dto.orderIndex ??
      (await this.prisma.studyPlanSubject.count({
        where: { studyPlanId: planId, level: dto.level },
      }));

    return this.prisma.studyPlanSubject.create({
      data: {
        tenantId,
        studyPlanId: planId,
        subjectId: dto.subjectId,
        level: dto.level,
        subjectType: dto.subjectType,
        credits: dto.credits,
        hours: dto.hours,
        orderIndex,
      },
      include: { subject: true },
    });
  }

  async updateRow(tenantId: string, rowId: string, dto: ActualizarFilaPensumDto) {
    const fila = await this.fila(tenantId, rowId);
    this.asegurarEditable(fila.studyPlan);

    if (dto.level !== undefined && dto.level !== fila.level) {
      this.validarNivel(dto.level, fila.studyPlan.program.durationPeriods);

      // El cambio de nivel no puede invalidar los prerrequisitos existentes:
      // lo requerido siempre va en un nivel ANTERIOR al de la fila que lo exige.
      const [requisitosPropios, requeridaPor] = await Promise.all([
        this.prisma.studyPlanPrerequisite.findMany({
          where: { entryId: rowId },
          include: { required: { select: { level: true, subject: { select: { code: true } } } } },
        }),
        this.prisma.studyPlanPrerequisite.findMany({
          where: { requiredId: rowId },
          include: { entry: { select: { level: true, subject: { select: { code: true } } } } },
        }),
      ]);

      const requisitoInvalido = requisitosPropios.find(
        (p) => p.required.level >= dto.level!,
      );
      if (requisitoInvalido) {
        throw new BadRequestException(
          `No se puede mover al nivel ${dto.level}: su prerrequisito ` +
            `${requisitoInvalido.required.subject.code} está en el nivel ${requisitoInvalido.required.level}`,
        );
      }

      const dependienteInvalido = requeridaPor.find(
        (p) => p.entry.level <= dto.level!,
      );
      if (dependienteInvalido) {
        throw new BadRequestException(
          `No se puede mover al nivel ${dto.level}: es prerrequisito de ` +
            `${dependienteInvalido.entry.subject.code} (nivel ${dependienteInvalido.entry.level})`,
        );
      }
    }

    return this.prisma.studyPlanSubject.update({
      where: { id: rowId },
      data: dto,
      include: { subject: true },
    });
  }

  async deleteRow(tenantId: string, rowId: string) {
    const fila = await this.fila(tenantId, rowId);
    this.asegurarEditable(fila.studyPlan);
    // Sus prerrequisitos (en ambas direcciones) caen en cascada.
    await this.prisma.studyPlanSubject.delete({ where: { id: rowId } });
    return { message: 'Asignatura retirada del pensum' };
  }

  // ------------------------------------------------------------ prerrequisitos

  /**
   * Reemplaza el conjunto de prerrequisitos de una fila. Reglas: mismas filas
   * del MISMO pensum, nivel del requisito menor que el de la fila, y sin
   * ciclos. La regla de nivel estricto ya hace imposible un ciclo, pero el
   * DFS queda como defensa ante datos legados con niveles inconsistentes.
   */
  async setPrerequisites(tenantId: string, rowId: string, requiredIds: string[]) {
    const fila = await this.fila(tenantId, rowId);
    this.asegurarEditable(fila.studyPlan);

    if (requiredIds.includes(rowId)) {
      throw new BadRequestException('Una asignatura no puede ser prerrequisito de sí misma');
    }

    // Todos los ids vienen del cliente: deben existir en el MISMO pensum (y
    // por tanto en el mismo tenant)
    const requeridas = await this.prisma.studyPlanSubject.findMany({
      where: { id: { in: requiredIds }, studyPlanId: fila.studyPlanId, tenantId },
      select: { id: true, level: true, subject: { select: { code: true } } },
    });
    if (requeridas.length !== requiredIds.length) {
      throw new BadRequestException(
        'Todos los prerrequisitos deben ser filas del mismo pensum',
      );
    }

    const nivelInvalido = requeridas.find((r) => r.level >= fila.level);
    if (nivelInvalido) {
      throw new BadRequestException(
        `${nivelInvalido.subject.code} está en el nivel ${nivelInvalido.level}; ` +
          `un prerrequisito debe estar en un nivel anterior al ${fila.level}`,
      );
    }

    // DFS sobre el grafo del pensum con las aristas nuevas de esta fila
    const aristas = await this.prisma.studyPlanPrerequisite.findMany({
      where: { entry: { studyPlanId: fila.studyPlanId }, entryId: { not: rowId } },
      select: { entryId: true, requiredId: true },
    });
    const grafo = new Map<string, string[]>();
    for (const a of aristas) {
      if (!grafo.has(a.entryId)) grafo.set(a.entryId, []);
      grafo.get(a.entryId)!.push(a.requiredId);
    }
    grafo.set(rowId, [...requiredIds]);

    const enCamino = new Set<string>();
    const visitados = new Set<string>();
    const hayCiclo = (nodo: string): boolean => {
      if (enCamino.has(nodo)) return true;
      if (visitados.has(nodo)) return false;
      enCamino.add(nodo);
      for (const vecino of grafo.get(nodo) ?? []) {
        if (hayCiclo(vecino)) return true;
      }
      enCamino.delete(nodo);
      visitados.add(nodo);
      return false;
    };
    if (hayCiclo(rowId)) {
      throw new BadRequestException(
        'Los prerrequisitos formarían un ciclo; revise la cadena de requisitos',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.studyPlanPrerequisite.deleteMany({ where: { entryId: rowId } });
      if (requiredIds.length > 0) {
        await tx.studyPlanPrerequisite.createMany({
          data: requiredIds.map((requiredId) => ({
            tenantId,
            entryId: rowId,
            requiredId,
          })),
        });
      }
    });

    return this.prisma.studyPlanSubject.findUnique({
      where: { id: rowId },
      include: {
        prerequisites: {
          include: {
            required: {
              select: {
                id: true,
                level: true,
                subject: { select: { id: true, code: true, name: true } },
              },
            },
          },
        },
      },
    });
  }
}
