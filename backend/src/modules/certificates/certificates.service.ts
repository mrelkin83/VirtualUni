import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CertificateStatus, Prisma, Student } from '@prisma/client';
import {
  CreateCertificateRequestDto,
  UpdateCertificateRequestDto,
  QueryCertificatesDto,
} from './dto';

const STUDENT_INCLUDE = {
  student: {
    include: { user: { select: { firstName: true, lastName: true, email: true } } },
  },
} as const;

@Injectable()
export class CertificatesService {
  private readonly logger = new Logger(CertificatesService.name);

  constructor(private prisma: PrismaService) {}

  private async getStudent(userId: string, tenantId: string): Promise<Student> {
    const student = await this.prisma.student.findUnique({ where: { userId } });

    if (!student || student.tenantId !== tenantId) {
      throw new ForbiddenException('Estudiante no encontrado');
    }

    return student;
  }

  async create(tenantId: string, userId: string, dto: CreateCertificateRequestDto) {
    const student = await this.getStudent(userId, tenantId);

    return this.prisma.certificateRequest.create({
      data: {
        tenantId,
        studentId: student.id,
        tipo: dto.tipo,
        motivo: dto.motivo,
        costo: dto.costo ?? 0,
      },
      include: STUDENT_INCLUDE,
    });
  }

  async findAll(tenantId: string, query: QueryCertificatesDto) {
    const where: Prisma.CertificateRequestWhereInput = { tenantId };

    if (query.estado) where.estado = query.estado;
    if (query.studentId) where.studentId = query.studentId;
    if (query.tipo) where.tipo = query.tipo;

    return this.prisma.certificateRequest.findMany({
      where,
      include: STUDENT_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMy(tenantId: string, userId: string) {
    const student = await this.getStudent(userId, tenantId);

    return this.prisma.certificateRequest.findMany({
      where: { tenantId, studentId: student.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const request = await this.prisma.certificateRequest.findFirst({
      where: { id, tenantId },
      include: STUDENT_INCLUDE,
    });

    if (!request) {
      throw new NotFoundException('Solicitud de certificado no encontrada');
    }

    return request;
  }

  /** Actualiza el estado de la solicitud; al emitir se sella la fecha. */
  async update(tenantId: string, id: string, dto: UpdateCertificateRequestDto) {
    await this.findOne(tenantId, id);

    return this.prisma.certificateRequest.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.estado === CertificateStatus.EMITIDO
          ? { fechaEmision: new Date() }
          : {}),
      },
      include: STUDENT_INCLUDE,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    await this.prisma.certificateRequest.delete({ where: { id } });

    return { message: 'Solicitud eliminada correctamente' };
  }

  async getStats(tenantId: string) {
    const [total, porEstado, recaudado] = await Promise.all([
      this.prisma.certificateRequest.count({ where: { tenantId } }),
      this.prisma.certificateRequest.groupBy({
        by: ['estado'],
        where: { tenantId },
        _count: { _all: true },
      }),
      this.prisma.certificateRequest.aggregate({
        where: { tenantId, estado: CertificateStatus.EMITIDO },
        _sum: { costo: true },
      }),
    ]);

    return {
      total,
      totalRecaudado: recaudado._sum.costo ?? 0,
      porEstado: porEstado.reduce<Record<string, number>>((acc, row) => {
        acc[row.estado] = row._count._all;
        return acc;
      }, {}),
    };
  }
}
