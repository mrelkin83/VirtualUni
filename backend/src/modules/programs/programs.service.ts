import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { EducationLevel, ProgramStatus } from '@prisma/client';
import { CrearProgramaDto, ActualizarProgramaDto } from './dto/program.dto';
import { PublicacionProgramaDto } from './dto/publicacion.dto';

@Injectable()
export class ProgramsService {
  constructor(private prisma: PrismaService) {}

  /** Id de otro tenant → 404, siempre antes de mutar. */
  private async programa(tenantId: string, id: string) {
    const programa = await this.prisma.program.findFirst({
      where: { id, tenantId },
    });
    if (!programa) throw new NotFoundException('Programa no encontrado');
    return programa;
  }

  async findAll(
    tenantId: string,
    page = 1,
    limit = 20,
    search?: string,
    educationLevel?: EducationLevel,
    status?: ProgramStatus,
  ) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (educationLevel) where.educationLevel = educationLevel;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { degreeTitle: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [programas, total] = await Promise.all([
      this.prisma.program.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { studyPlans: true, programEnrollments: true } },
        },
      }),
      this.prisma.program.count({ where }),
    ]);

    return {
      data: programas,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(tenantId: string, id: string) {
    await this.programa(tenantId, id);
    return this.prisma.program.findFirst({
      where: { id, tenantId },
      include: {
        studyPlans: {
          orderBy: { createdAt: 'desc' },
          include: {
            _count: { select: { subjects: true, programEnrollments: true } },
          },
        },
        _count: { select: { programEnrollments: true } },
      },
    });
  }

  async create(tenantId: string, dto: CrearProgramaDto) {
    const existente = await this.prisma.program.findFirst({
      where: { tenantId, code: dto.code },
      select: { id: true },
    });
    if (existente) {
      throw new ConflictException(`Ya existe un programa con el código ${dto.code}`);
    }
    return this.prisma.program.create({ data: { tenantId, ...dto } });
  }

  /**
   * Campos públicos del programa (sitio web). Publicar exige slug,
   * descripción corta y estado ACTIVO (§4); el slug es único por tenant.
   */
  async actualizarPublicacion(tenantId: string, id: string, dto: PublicacionProgramaDto) {
    const programa = await this.prisma.program.findFirst({ where: { id, tenantId } });
    if (!programa) throw new NotFoundException('Programa no encontrado');

    const slug = dto.slug !== undefined ? dto.slug : programa.slug;
    const shortDescription =
      dto.shortDescription !== undefined ? dto.shortDescription : programa.shortDescription;
    const publicado = dto.isPublished !== undefined ? dto.isPublished : programa.isPublished;

    if (publicado) {
      if (!slug || !shortDescription) {
        throw new BadRequestException(
          'Para publicar el programa necesita un slug y una descripción corta',
        );
      }
      if (programa.status !== 'ACTIVO') {
        throw new BadRequestException('Solo se publica un programa en estado ACTIVO');
      }
    }

    if (slug && slug !== programa.slug) {
      const duplicado = await this.prisma.program.findFirst({
        where: { tenantId, slug, id: { not: id } },
        select: { id: true },
      });
      if (duplicado) throw new BadRequestException('Ya hay otro programa con ese slug');
    }

    return this.prisma.program.update({
      where: { id: programa.id },
      data: {
        slug,
        isPublished: publicado,
        shortDescription,
        publicDescription: dto.publicDescription,
        graduateProfile: dto.graduateProfile,
        occupationalProfile: dto.occupationalProfile,
        imageUrl: dto.imageUrl,
        isNewUntil:
          dto.isNewUntil === undefined ? undefined : dto.isNewUntil ? new Date(dto.isNewUntil) : null,
        area: dto.area,
        schedule: dto.schedule,
        tuitionDisplay: dto.tuitionDisplay,
        faq: dto.faq === undefined ? undefined : (dto.faq as unknown as object[]),
      },
    });
  }

  async update(tenantId: string, id: string, dto: ActualizarProgramaDto) {
    const actual = await this.programa(tenantId, id);

    if (dto.code && dto.code !== actual.code) {
      const duplicado = await this.prisma.program.findFirst({
        where: { tenantId, code: dto.code, id: { not: id } },
        select: { id: true },
      });
      if (duplicado) {
        throw new ConflictException(`Ya existe un programa con el código ${dto.code}`);
      }
    }

    return this.prisma.program.update({ where: { id }, data: dto });
  }

  /**
   * Un programa con estudiantes inscritos no se borra: se perdería su
   * historial académico. 409 sugiriendo INACTIVO (deja de admitir inscripciones
   * pero conserva los datos).
   */
  async remove(tenantId: string, id: string) {
    await this.programa(tenantId, id);

    const inscritos = await this.prisma.programEnrollment.count({
      where: { programId: id, tenantId },
    });
    if (inscritos > 0) {
      throw new ConflictException(
        `El programa tiene ${inscritos} estudiante(s) inscrito(s). ` +
          'Cámbielo a estado INACTIVO en lugar de eliminarlo.',
      );
    }

    // Los pensums caen en cascada (relación declarada en el esquema).
    await this.prisma.program.delete({ where: { id } });
    return { message: 'Programa eliminado' };
  }
}
