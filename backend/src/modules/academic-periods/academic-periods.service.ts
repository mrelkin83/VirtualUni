import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { PeriodStatus } from '@prisma/client';
import { CrearPeriodoDto, ActualizarPeriodoDto } from './dto/academic-period.dto';

@Injectable()
export class AcademicPeriodsService {
  constructor(private prisma: PrismaService) {}

  private async periodo(tenantId: string, id: string) {
    const periodo = await this.prisma.academicPeriod.findFirst({
      where: { id, tenantId },
    });
    if (!periodo) throw new NotFoundException('Periodo académico no encontrado');
    return periodo;
  }

  /**
   * Solapamientos con otros periodos del tenant. Se ADVIERTE pero no se
   * bloquea: cohortes y calendarios A/B legítimamente se traslapan.
   */
  private async advertenciasDeSolape(
    tenantId: string,
    desde: Date,
    hasta: Date,
    exceptoId?: string,
  ): Promise<string[]> {
    const solapados = await this.prisma.academicPeriod.findMany({
      where: {
        tenantId,
        ...(exceptoId ? { id: { not: exceptoId } } : {}),
        startDate: { lte: hasta },
        endDate: { gte: desde },
      },
      select: { code: true },
    });
    return solapados.map(
      (p) => `El rango de fechas se solapa con el periodo ${p.code}`,
    );
  }

  async findAll(tenantId: string, page = 1, limit = 20, status?: PeriodStatus) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (status) where.status = status;

    const [periodos, total] = await Promise.all([
      this.prisma.academicPeriod.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: 'desc' },
        include: { _count: { select: { courses: true } } },
      }),
      this.prisma.academicPeriod.count({ where }),
    ]);

    return {
      data: periodos,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Periodo en curso: el marcado EN_CURSO (el más reciente si hay varios) o,
   * en su defecto, el que contiene la fecha de hoy.
   */
  async current(tenantId: string) {
    const enCurso = await this.prisma.academicPeriod.findFirst({
      where: { tenantId, status: PeriodStatus.EN_CURSO },
      orderBy: { startDate: 'desc' },
    });
    if (enCurso) return enCurso;

    const hoy = new Date();
    return this.prisma.academicPeriod.findFirst({
      where: { tenantId, startDate: { lte: hoy }, endDate: { gte: hoy } },
      orderBy: { startDate: 'desc' },
    });
  }

  async create(tenantId: string, dto: CrearPeriodoDto) {
    const desde = new Date(dto.startDate);
    const hasta = new Date(dto.endDate);
    if (desde >= hasta) {
      throw new BadRequestException('startDate debe ser anterior a endDate');
    }

    const existente = await this.prisma.academicPeriod.findFirst({
      where: { tenantId, code: dto.code },
      select: { id: true },
    });
    if (existente) {
      throw new ConflictException(`Ya existe un periodo con el código ${dto.code}`);
    }

    const advertencias = await this.advertenciasDeSolape(tenantId, desde, hasta);

    const periodo = await this.prisma.academicPeriod.create({
      data: {
        tenantId,
        code: dto.code,
        name: dto.name,
        startDate: desde,
        endDate: hasta,
        status: dto.status,
      },
    });

    return { ...periodo, advertencias };
  }

  async update(tenantId: string, id: string, dto: ActualizarPeriodoDto) {
    const actual = await this.periodo(tenantId, id);

    const desde = dto.startDate ? new Date(dto.startDate) : actual.startDate;
    const hasta = dto.endDate ? new Date(dto.endDate) : actual.endDate;
    if (desde >= hasta) {
      throw new BadRequestException('startDate debe ser anterior a endDate');
    }

    if (dto.code && dto.code !== actual.code) {
      const duplicado = await this.prisma.academicPeriod.findFirst({
        where: { tenantId, code: dto.code, id: { not: id } },
        select: { id: true },
      });
      if (duplicado) {
        throw new ConflictException(`Ya existe un periodo con el código ${dto.code}`);
      }
    }

    const advertencias = await this.advertenciasDeSolape(tenantId, desde, hasta, id);

    const periodo = await this.prisma.academicPeriod.update({
      where: { id },
      data: {
        code: dto.code,
        name: dto.name,
        startDate: dto.startDate ? desde : undefined,
        endDate: dto.endDate ? hasta : undefined,
        status: dto.status,
      },
    });

    return { ...periodo, advertencias };
  }
}
