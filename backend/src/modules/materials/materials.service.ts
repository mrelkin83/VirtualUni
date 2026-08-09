import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateMaterialDto,
  UpdateMaterialDto,
  QueryMaterialsDto,
  CreateFolderDto,
  UpdateFolderDto,
} from './dto';

@Injectable()
export class MaterialsService {
  private readonly logger = new Logger(MaterialsService.name);

  constructor(private prisma: PrismaService) {}

  /** El curso debe existir dentro del tenant antes de colgarle materiales. */
  private async assertCourse(tenantId: string, courseId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, tenantId },
      select: { id: true },
    });

    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }
  }

  /** Cursos en los que el estudiante esta matriculado. */
  private async getStudentCourseIds(tenantId: string, userId: string): Promise<string[]> {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      select: { id: true, tenantId: true },
    });

    if (!student || student.tenantId !== tenantId) {
      throw new ForbiddenException('Estudiante no encontrado');
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId: student.id },
      select: { courseId: true },
    });

    return enrollments.map((e) => e.courseId);
  }

  // ------------------------------------------------------------------ Carpetas
  async createFolder(tenantId: string, dto: CreateFolderDto) {
    if (dto.courseId) {
      await this.assertCourse(tenantId, dto.courseId);
    }

    return this.prisma.materialFolder.create({
      data: {
        tenantId,
        courseId: dto.courseId ?? null,
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        color: dto.color ?? 'bg-blue-500',
      },
    });
  }

  async findAllFolders(tenantId: string, courseId?: string) {
    return this.prisma.materialFolder.findMany({
      where: { tenantId, ...(courseId ? { courseId } : {}) },
      include: { _count: { select: { materials: true } } },
      orderBy: { nombre: 'asc' },
    });
  }

  async updateFolder(tenantId: string, id: string, dto: UpdateFolderDto) {
    const folder = await this.prisma.materialFolder.findFirst({
      where: { id, tenantId },
      select: { id: true },
    });

    if (!folder) {
      throw new NotFoundException('Carpeta no encontrada');
    }

    return this.prisma.materialFolder.update({ where: { id }, data: dto });
  }

  async removeFolder(tenantId: string, id: string) {
    const folder = await this.prisma.materialFolder.findFirst({
      where: { id, tenantId },
      select: { id: true },
    });

    if (!folder) {
      throw new NotFoundException('Carpeta no encontrada');
    }

    await this.prisma.materialFolder.delete({ where: { id } });

    return { message: 'Carpeta eliminada correctamente' };
  }

  // ----------------------------------------------------------------- Materiales
  async create(tenantId: string, dto: CreateMaterialDto, subidoPor: string) {
    await this.assertCourse(tenantId, dto.courseId);

    return this.prisma.material.create({
      data: {
        tenantId,
        courseId: dto.courseId,
        folderId: dto.folderId ?? null,
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        tipo: dto.tipo,
        url: dto.url,
        formato: dto.formato,
        tamanioKb: dto.tamanioKb,
        visible: dto.visible ?? true,
        subidoPor,
      },
    });
  }

  async findAll(tenantId: string, query: QueryMaterialsDto) {
    const where: Prisma.MaterialWhereInput = { tenantId };

    if (query.courseId) where.courseId = query.courseId;
    if (query.folderId) where.folderId = query.folderId;
    if (query.tipo) where.tipo = query.tipo;
    if (query.search) {
      where.OR = [
        { nombre: { contains: query.search, mode: 'insensitive' } },
        { descripcion: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.material.findMany({
      where,
      include: {
        course: { select: { id: true, name: true, code: true } },
        folder: { select: { id: true, nombre: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Materiales visibles de los cursos en los que el estudiante esta matriculado. */
  async findForStudent(tenantId: string, userId: string, query: QueryMaterialsDto) {
    const courseIds = await this.getStudentCourseIds(tenantId, userId);

    if (courseIds.length === 0) {
      return [];
    }

    const where: Prisma.MaterialWhereInput = {
      tenantId,
      visible: true,
      courseId: query.courseId
        ? // Sólo si el curso pedido está entre los matriculados.
          courseIds.includes(query.courseId)
          ? query.courseId
          : '__sin_acceso__'
        : { in: courseIds },
    };

    if (query.tipo) where.tipo = query.tipo;

    return this.prisma.material.findMany({
      where,
      include: {
        course: { select: { id: true, name: true, code: true } },
        folder: { select: { id: true, nombre: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const material = await this.prisma.material.findFirst({
      where: { id, tenantId },
      include: {
        course: { select: { id: true, name: true, code: true } },
        folder: { select: { id: true, nombre: true } },
      },
    });

    if (!material) {
      throw new NotFoundException('Material no encontrado');
    }

    return material;
  }

  async update(tenantId: string, id: string, dto: UpdateMaterialDto) {
    await this.findOne(tenantId, id);

    if (dto.courseId) {
      await this.assertCourse(tenantId, dto.courseId);
    }

    return this.prisma.material.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    await this.prisma.material.delete({ where: { id } });

    return { message: 'Material eliminado correctamente' };
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
