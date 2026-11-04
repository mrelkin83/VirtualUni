import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { SubjectsService } from '../subjects/subjects.service';
import { CurrentUserData } from '@/common/decorators/current-user.decorator';
import {
  CreateMaterialDto,
  UpdateMaterialDto,
  QueryMaterialsDto,
  CreateFolderDto,
  UpdateFolderDto,
  CopiarMaterialesDto,
} from './dto';

@Injectable()
export class MaterialsService {
  private readonly logger = new Logger(MaterialsService.name);

  constructor(
    private prisma: PrismaService,
    private subjects: SubjectsService,
  ) {}

  /** El curso debe existir dentro del tenant antes de colgarle materiales. */
  private async curso(tenantId: string, courseId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, tenantId },
      select: { id: true, subjectId: true, teacherId: true },
    });

    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }
    return course;
  }

  /**
   * Un TEACHER solo copia material entre grupos que él dicta. Sin esto podía
   * inyectar material en el grupo de otro docente (destino) o sacar el
   * material privado de un colega (origen) con solo compartir la asignatura.
   */
  private async asegurarDocenteDelGrupo(
    tenantId: string,
    course: { id: string; teacherId: string },
    user: CurrentUserData,
  ) {
    if (user.role !== 'TEACHER') return;

    const docente = await this.prisma.teacher.findFirst({
      where: { id: course.teacherId, tenantId },
      select: { userId: true },
    });
    if (docente?.userId !== user.id) {
      throw new ForbiddenException(
        'Solo puede copiar material entre grupos que usted dicta',
      );
    }
  }

  private async asignatura(tenantId: string, subjectId: string) {
    const subject = await this.prisma.subject.findFirst({
      where: { id: subjectId, tenantId },
      select: { id: true },
    });
    if (!subject) throw new NotFoundException('Asignatura no encontrada');
    return subject;
  }

  /** Contenido con subjectId = maestro: exige editor de la asignatura. */
  private async asegurarPermiso(
    tenantId: string,
    registro: { subjectId: string | null },
    user: CurrentUserData,
  ) {
    if (registro.subjectId) {
      await this.subjects.asegurarEditorDeContenido(tenantId, registro.subjectId, user);
    }
  }

  /**
   * Cursos matriculados del estudiante y asignaturas de esos cursos: el
   * contenido maestro de una Subject solo es visible para quien está
   * matriculado en algún grupo que la dicta.
   */
  private async getStudentScope(
    tenantId: string,
    userId: string,
  ): Promise<{ courseIds: string[]; subjectIds: string[] }> {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      select: { id: true, tenantId: true },
    });

    if (!student || student.tenantId !== tenantId) {
      throw new ForbiddenException('Estudiante no encontrado');
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId: student.id },
      select: { course: { select: { id: true, subjectId: true } } },
    });

    const courseIds = enrollments.map((e) => e.course.id);
    const subjectIds = [
      ...new Set(
        enrollments
          .map((e) => e.course.subjectId)
          .filter((s): s is string => !!s),
      ),
    ];
    return { courseIds, subjectIds };
  }

  // ------------------------------------------------------------------ Carpetas
  async createFolder(tenantId: string, dto: CreateFolderDto, user: CurrentUserData) {
    if (dto.courseId && dto.subjectId) {
      throw new BadRequestException(
        'Una carpeta pertenece al grupo O a la asignatura, no a ambos',
      );
    }

    if (dto.courseId) {
      await this.curso(tenantId, dto.courseId);
    }
    if (dto.subjectId) {
      await this.asignatura(tenantId, dto.subjectId);
      await this.subjects.asegurarEditorDeContenido(tenantId, dto.subjectId, user);
    }

    return this.prisma.materialFolder.create({
      data: {
        tenantId,
        courseId: dto.courseId ?? null,
        subjectId: dto.subjectId ?? null,
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        color: dto.color ?? 'bg-blue-500',
      },
    });
  }

  async findAllFolders(tenantId: string, courseId?: string) {
    // Al pedir las carpetas de un grupo se incluyen las maestras de su asignatura
    let where: Prisma.MaterialFolderWhereInput = { tenantId };
    if (courseId) {
      const curso = await this.curso(tenantId, courseId);
      where = {
        tenantId,
        OR: [
          { courseId },
          ...(curso.subjectId ? [{ subjectId: curso.subjectId }] : []),
        ],
      };
    }

    const folders = await this.prisma.materialFolder.findMany({
      where,
      include: { _count: { select: { materials: true } } },
      orderBy: { nombre: 'asc' },
    });
    return folders.map((f) => ({
      ...f,
      origen: f.subjectId ? ('asignatura' as const) : ('grupo' as const),
    }));
  }

  /**
   * Igual que findAllFolders, pero para un estudiante: sólo carpetas
   * generales (sin curso ni asignatura), de cursos matriculados, o maestras
   * de asignaturas que cursa. Antes cualquier STUDENT veía nombres y
   * cantidades de materiales de cursos ajenos vía GET /materials/folders.
   */
  async findAllFoldersForStudent(tenantId: string, userId: string, courseId?: string) {
    const { courseIds, subjectIds } = await this.getStudentScope(tenantId, userId);

    if (courseId && !courseIds.includes(courseId)) {
      return [];
    }

    let where: Prisma.MaterialFolderWhereInput;
    if (courseId) {
      const curso = await this.curso(tenantId, courseId);
      where = {
        tenantId,
        OR: [
          { courseId },
          ...(curso.subjectId && subjectIds.includes(curso.subjectId)
            ? [{ subjectId: curso.subjectId }]
            : []),
        ],
      };
    } else {
      where = {
        tenantId,
        OR: [
          { courseId: null, subjectId: null },
          { courseId: { in: courseIds } },
          { subjectId: { in: subjectIds } },
        ],
      };
    }

    return this.prisma.materialFolder.findMany({
      where,
      include: { _count: { select: { materials: true } } },
      orderBy: { nombre: 'asc' },
    });
  }

  /**
   * Un STUDENT sólo puede acceder a un material visible de un curso en el
   * que esté matriculado o al contenido maestro de una asignatura que cursa.
   * findOne()/registerDownload() no aplican este filtro por sí mismos porque
   * tambien los usan update/remove para TEACHER/TENANT_ADMIN.
   */
  async esAccesibleParaEstudiante(
    tenantId: string,
    userId: string,
    materialId: string,
  ): Promise<boolean> {
    const material = await this.prisma.material.findFirst({
      where: { id: materialId, tenantId },
      select: { visible: true, courseId: true, subjectId: true },
    });

    if (!material || !material.visible) return false;

    const { courseIds, subjectIds } = await this.getStudentScope(tenantId, userId);
    if (material.courseId) return courseIds.includes(material.courseId);
    if (material.subjectId) return subjectIds.includes(material.subjectId);
    return false;
  }

  async updateFolder(
    tenantId: string,
    id: string,
    dto: UpdateFolderDto,
    user: CurrentUserData,
  ) {
    const folder = await this.prisma.materialFolder.findFirst({
      where: { id, tenantId },
      select: { id: true, subjectId: true },
    });

    if (!folder) {
      throw new NotFoundException('Carpeta no encontrada');
    }
    await this.asegurarPermiso(tenantId, folder, user);

    // courseId/subjectId no se reasignan por PATCH: la pertenencia se fija al crear
    const { courseId: _c, subjectId: _s, ...data } = dto;
    return this.prisma.materialFolder.update({ where: { id }, data });
  }

  async removeFolder(tenantId: string, id: string, user: CurrentUserData) {
    const folder = await this.prisma.materialFolder.findFirst({
      where: { id, tenantId },
      select: { id: true, subjectId: true },
    });

    if (!folder) {
      throw new NotFoundException('Carpeta no encontrada');
    }
    await this.asegurarPermiso(tenantId, folder, user);

    await this.prisma.materialFolder.delete({ where: { id } });

    return { message: 'Carpeta eliminada correctamente' };
  }

  // ----------------------------------------------------------------- Materiales
  async create(tenantId: string, dto: CreateMaterialDto, user: CurrentUserData) {
    // Exclusividad: material propio del grupo O maestro de la asignatura
    if (!!dto.courseId === !!dto.subjectId) {
      throw new BadRequestException('Indique courseId o subjectId (exactamente uno)');
    }

    if (dto.courseId) {
      await this.curso(tenantId, dto.courseId);
    } else {
      await this.asignatura(tenantId, dto.subjectId!);
      await this.subjects.asegurarEditorDeContenido(tenantId, dto.subjectId!, user);
    }

    if (dto.folderId) {
      const folder = await this.prisma.materialFolder.findFirst({
        where: { id: dto.folderId, tenantId },
        select: { id: true },
      });
      if (!folder) throw new NotFoundException('Carpeta no encontrada');
    }

    return this.prisma.material.create({
      data: {
        tenantId,
        courseId: dto.courseId ?? null,
        subjectId: dto.subjectId ?? null,
        folderId: dto.folderId ?? null,
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        tipo: dto.tipo,
        url: dto.url,
        formato: dto.formato,
        tamanioKb: dto.tamanioKb,
        visible: dto.visible ?? true,
        subidoPor: user.userId,
      },
    });
  }

  async findAll(tenantId: string, query: QueryMaterialsDto) {
    const where: Prisma.MaterialWhereInput = { tenantId };

    if (query.courseId) {
      // El grupo ve su contenido propio + el maestro de su asignatura
      const curso = await this.curso(tenantId, query.courseId);
      where.OR = [
        { courseId: query.courseId },
        ...(curso.subjectId ? [{ subjectId: curso.subjectId }] : []),
      ];
    } else if (query.subjectId) {
      where.subjectId = query.subjectId;
    }
    if (query.folderId) where.folderId = query.folderId;
    if (query.tipo) where.tipo = query.tipo;
    if (query.search) {
      where.AND = [
        {
          OR: [
            { nombre: { contains: query.search, mode: 'insensitive' } },
            { descripcion: { contains: query.search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const materials = await this.prisma.material.findMany({
      where,
      include: {
        course: { select: { id: true, name: true, code: true } },
        subject: { select: { id: true, name: true, code: true } },
        folder: { select: { id: true, nombre: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return materials.map((m) => ({
      ...m,
      origen: m.subjectId ? ('asignatura' as const) : ('grupo' as const),
    }));
  }

  /**
   * Materiales visibles para el estudiante: los de sus cursos matriculados y
   * el contenido maestro de las asignaturas de esos cursos.
   */
  async findForStudent(tenantId: string, userId: string, query: QueryMaterialsDto) {
    const { courseIds, subjectIds } = await this.getStudentScope(tenantId, userId);

    if (courseIds.length === 0) {
      return [];
    }

    let alcance: Prisma.MaterialWhereInput[];
    if (query.courseId) {
      // Sólo si el curso pedido está entre los matriculados.
      if (!courseIds.includes(query.courseId)) return [];
      const curso = await this.curso(tenantId, query.courseId);
      alcance = [
        { courseId: query.courseId },
        ...(curso.subjectId && subjectIds.includes(curso.subjectId)
          ? [{ subjectId: curso.subjectId }]
          : []),
      ];
    } else {
      alcance = [
        { courseId: { in: courseIds } },
        { subjectId: { in: subjectIds } },
      ];
    }

    const where: Prisma.MaterialWhereInput = {
      tenantId,
      visible: true,
      OR: alcance,
    };

    if (query.tipo) where.tipo = query.tipo;

    const materials = await this.prisma.material.findMany({
      where,
      include: {
        course: { select: { id: true, name: true, code: true } },
        subject: { select: { id: true, name: true, code: true } },
        folder: { select: { id: true, nombre: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return materials.map((m) => ({
      ...m,
      origen: m.subjectId ? ('asignatura' as const) : ('grupo' as const),
    }));
  }

  async findOne(tenantId: string, id: string) {
    const material = await this.prisma.material.findFirst({
      where: { id, tenantId },
      include: {
        course: { select: { id: true, name: true, code: true } },
        subject: { select: { id: true, name: true, code: true } },
        folder: { select: { id: true, nombre: true } },
      },
    });

    if (!material) {
      throw new NotFoundException('Material no encontrado');
    }

    return material;
  }

  async update(tenantId: string, id: string, dto: UpdateMaterialDto, user: CurrentUserData) {
    const material = await this.findOne(tenantId, id);
    await this.asegurarPermiso(tenantId, material, user);

    // La pertenencia (grupo o asignatura) NO se reasigna por PATCH: se fija al
    // crear y solo cambia vía promover()/copiarDelGrupo(), que sí validan la
    // asignatura. Honrar dto.courseId aquí permitía colgar contenido maestro
    // de un curso ajeno y romper la exclusividad courseId XOR subjectId.
    const { courseId: _c, subjectId: _s, ...data } = dto;

    return this.prisma.material.update({ where: { id }, data });
  }

  async remove(tenantId: string, id: string, user: CurrentUserData) {
    const material = await this.findOne(tenantId, id);
    await this.asegurarPermiso(tenantId, material, user);

    await this.prisma.material.delete({ where: { id } });

    return { message: 'Material eliminado correctamente' };
  }

  /**
   * Promueve un material propio del grupo a contenido maestro de la
   * asignatura del grupo. Sale de su carpeta (las carpetas del grupo no se
   * comparten) y pasa a heredarse en todos los grupos de la asignatura.
   */
  async promover(tenantId: string, id: string, user: CurrentUserData) {
    const material = await this.findOne(tenantId, id);
    if (!material.courseId) {
      throw new BadRequestException('El material ya es contenido maestro de la asignatura');
    }

    const curso = await this.curso(tenantId, material.courseId);
    if (!curso.subjectId) {
      throw new BadRequestException(
        'El grupo no tiene asignatura de catálogo; asígnela antes de promover contenido',
      );
    }

    await this.subjects.asegurarEditorDeContenido(tenantId, curso.subjectId, user);

    return this.prisma.material.update({
      where: { id },
      data: { subjectId: curso.subjectId, courseId: null, folderId: null },
    });
  }

  /** Copia los materiales PROPIOS de otro grupo de la misma asignatura. */
  async copiarDelGrupo(tenantId: string, dto: CopiarMaterialesDto, user: CurrentUserData) {
    const [destino, origen] = await Promise.all([
      this.curso(tenantId, dto.courseId),
      this.curso(tenantId, dto.fromCourseId),
    ]);

    if (dto.courseId === dto.fromCourseId) {
      throw new BadRequestException('El grupo origen y el destino son el mismo');
    }
    if (!destino.subjectId || destino.subjectId !== origen.subjectId) {
      throw new BadRequestException(
        'Ambos grupos deben dictar la misma asignatura de catálogo',
      );
    }

    // Ambos grupos deben ser del docente que llama (la administración no)
    await this.asegurarDocenteDelGrupo(tenantId, destino, user);
    await this.asegurarDocenteDelGrupo(tenantId, origen, user);

    const materiales = await this.prisma.material.findMany({
      where: { tenantId, courseId: dto.fromCourseId },
    });

    if (materiales.length > 0) {
      await this.prisma.material.createMany({
        data: materiales.map((m) => ({
          tenantId,
          courseId: dto.courseId,
          folderId: null,
          nombre: m.nombre,
          descripcion: m.descripcion,
          tipo: m.tipo,
          url: m.url,
          formato: m.formato,
          tamanioKb: m.tamanioKb,
          visible: m.visible,
          subidoPor: user.userId,
        })),
      });
    }

    return {
      message: `Se copiaron ${materiales.length} material(es) del grupo anterior`,
      copiados: materiales.length,
    };
  }

  /** Incrementa el contador de descargas y devuelve la URL. */
  async registerDownload(tenantId: string, id: string) {
    const material = await this.findOne(tenantId, id);

    await this.prisma.material.update({
      where: { id },
      data: { descargas: { increment: 1 } },
    });

    return { url: material.url, nombre: material.nombre };
  }

  async getStats(tenantId: string, courseId?: string) {
    const where: Prisma.MaterialWhereInput = {
      tenantId,
      ...(courseId ? { courseId } : {}),
    };

    const [total, visibles, porTipo, descargas] = await Promise.all([
      this.prisma.material.count({ where }),
      this.prisma.material.count({ where: { ...where, visible: true } }),
      this.prisma.material.groupBy({
        by: ['tipo'],
        where,
        _count: { _all: true },
      }),
      this.prisma.material.aggregate({ where, _sum: { descargas: true } }),
    ]);

    return {
      total,
      visibles,
      ocultos: total - visibles,
      totalDescargas: descargas._sum.descargas ?? 0,
      porTipo: porTipo.reduce<Record<string, number>>((acc, row) => {
        acc[row.tipo] = row._count._all;
        return acc;
      }, {}),
    };
  }
}
