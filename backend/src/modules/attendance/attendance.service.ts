import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import {
  BulkAttendanceDto,
  QueryAttendanceDto,
  MyAttendanceDto,
} from './dto';
import { AttendanceStatus } from '@prisma/client';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Registrar (o actualizar) masivamente la asistencia de un curso en una fecha
   */
  async bulkUpsert(
    tenantId: string,
    userId: string,
    dto: BulkAttendanceDto,
  ): Promise<{ total: number; registrados: number }> {
    const course = await this.prisma.course.findFirst({
      where: { id: dto.courseId, tenantId },
    });

    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    const fecha = new Date(dto.fecha);

    const results = await this.prisma.$transaction(
      dto.registros.map((registro) =>
        this.prisma.attendance.upsert({
          where: {
            courseId_studentId_fecha: {
              courseId: dto.courseId,
              studentId: registro.studentId,
              fecha,
            },
          },
          create: {
            tenantId,
            courseId: dto.courseId,
            studentId: registro.studentId,
            fecha,
            estado: registro.estado,
            observacion: registro.observacion,
            registradoPor: userId,
          },
          update: {
            estado: registro.estado,
            observacion: registro.observacion,
            registradoPor: userId,
          },
        }),
      ),
    );

    this.logger.log(
      `Bulk attendance upserted for course ${dto.courseId} on ${dto.fecha}: ${results.length} records`,
    );

    return {
      total: dto.registros.length,
      registrados: results.length,
    };
  }

  /**
   * Listar registros de asistencia del tenant con filtros opcionales
   */
  async findAll(tenantId: string, query: QueryAttendanceDto) {
    const where: any = { tenantId };

    if (query.courseId) {
      where.courseId = query.courseId;
    }

    if (query.fecha) {
      where.fecha = new Date(query.fecha);
    } else if (query.from || query.to) {
      where.fecha = {};
      if (query.from) {
        where.fecha.gte = new Date(query.from);
      }
      if (query.to) {
        where.fecha.lte = new Date(query.to);
      }
    }

    return this.prisma.attendance.findMany({
      where,
      include: {
        student: {
          select: {
            studentCode: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { fecha: 'desc' },
    });
  }

  /**
   * Listar los registros de asistencia del estudiante actual
   */
  async findMy(tenantId: string, userId: string, query: MyAttendanceDto) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
    });

    if (!student || student.tenantId !== tenantId) {
      throw new ForbiddenException('Estudiante no encontrado');
    }

    const where: any = { tenantId, studentId: student.id };

    if (query.courseId) {
      where.courseId = query.courseId;
    }

    return this.prisma.attendance.findMany({
      where,
      orderBy: { fecha: 'desc' },
    });
  }

  /**
   * Estadísticas de asistencia de un curso
   */
  async getCourseStats(tenantId: string, courseId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, tenantId },
    });

    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    const registros = await this.prisma.attendance.findMany({
      where: { tenantId, courseId },
      include: {
        student: {
          select: {
            id: true,
            studentCode: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    const sesiones = new Set<string>();
    const porEstado: Record<AttendanceStatus, number> = {
      PRESENTE: 0,
      AUSENTE: 0,
      TARDE: 0,
      JUSTIFICADO: 0,
    };

    const estudiantesMap = new Map<
      string,
      {
        studentId: string;
        nombre: string;
        studentCode: string;
        presentes: number;
        ausentes: number;
        tardes: number;
        justificados: number;
      }
    >();

    for (const r of registros) {
      sesiones.add(r.fecha.toISOString());
      porEstado[r.estado]++;

      let est = estudiantesMap.get(r.studentId);
      if (!est) {
        est = {
          studentId: r.studentId,
          nombre: `${r.student.user.firstName} ${r.student.user.lastName}`,
          studentCode: r.student.studentCode,
          presentes: 0,
          ausentes: 0,
          tardes: 0,
          justificados: 0,
        };
        estudiantesMap.set(r.studentId, est);
      }

      switch (r.estado) {
        case AttendanceStatus.PRESENTE:
          est.presentes++;
          break;
        case AttendanceStatus.AUSENTE:
          est.ausentes++;
          break;
        case AttendanceStatus.TARDE:
          est.tardes++;
          break;
        case AttendanceStatus.JUSTIFICADO:
          est.justificados++;
          break;
      }
    }

    const totalSesiones = sesiones.size;

    const porEstudiante = Array.from(estudiantesMap.values()).map((est) => {
      const asistidas = est.presentes + est.tardes + est.justificados;
      const porcentajeAsistencia =
        totalSesiones > 0
          ? Math.round((asistidas / totalSesiones) * 1000) / 10
          : 0;

      return {
        ...est,
        porcentajeAsistencia,
      };
    });

    return {
      courseId,
      totalSesiones,
      porEstado,
      porEstudiante,
    };
  }
}
