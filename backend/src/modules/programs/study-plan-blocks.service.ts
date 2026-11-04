import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CertificateStatus, RecordStatus } from '@prisma/client';
import { CurrentUserData } from '@/common/decorators/current-user.decorator';
import { horasDeAsignatura } from '../academic-records/calculo-notas';
import {
  ActualizarBloqueDto,
  AsignarAsignaturasDto,
  CrearBloqueDto,
  EmitirCertificadoDeBloqueDto,
} from './dto/study-plan-block.dto';

const STAFF = ['TENANT_ADMIN', 'SUPER_ADMIN'];

/**
 * Bloques de competencia de un pensum y su certificación intermedia.
 *
 * Un bloque queda ELEGIBLE cuando el estudiante aprobó todas sus asignaturas
 * (cursadas, reconocidas u homologadas: el historial no distingue para esto).
 * El certificado NO se emite solo: la administración lo emite con la plantilla
 * del bloque, creando un CertificateRequest como cualquier otro certificado.
 */
@Injectable()
export class StudyPlanBlocksService {
  constructor(private prisma: PrismaService) {}

  private async pensum(tenantId: string, studyPlanId: string) {
    const plan = await this.prisma.studyPlan.findFirst({
      where: { id: studyPlanId, tenantId },
      select: {
        id: true,
        version: true,
        status: true,
        program: {
          select: { id: true, name: true, hoursPerCredit: true, passingGrade: true },
        },
      },
    });
    if (!plan) throw new NotFoundException('Pensum no encontrado');
    return plan;
  }

  private async bloque(tenantId: string, id: string) {
    const bloque = await this.prisma.studyPlanBlock.findFirst({
      where: { id, tenantId },
      include: {
        studyPlan: {
          select: {
            id: true,
            version: true,
            program: { select: { id: true, name: true, hoursPerCredit: true } },
          },
        },
      },
    });
    if (!bloque) throw new NotFoundException('Bloque no encontrado');
    return bloque;
  }

  // ---------------------------------------------------------------- CRUD

  async listar(tenantId: string, studyPlanId: string) {
    await this.pensum(tenantId, studyPlanId);

    const [bloques, filas] = await Promise.all([
      this.prisma.studyPlanBlock.findMany({
        where: { tenantId, studyPlanId },
        orderBy: { orderIndex: 'asc' },
        include: {
          certificateTemplate: { select: { id: true, nombre: true, estado: true } },
        },
      }),
      this.prisma.studyPlanSubject.findMany({
        where: { tenantId, studyPlanId },
        orderBy: [{ level: 'asc' }, { orderIndex: 'asc' }],
        include: {
          subject: {
            select: { id: true, code: true, name: true, credits: true, hours: true },
          },
        },
      }),
    ]);

    return bloques.map((bloque) => {
      const asignaturas = filas.filter((f) => f.blockId === bloque.id);
      return {
        ...bloque,
        asignaturas: asignaturas.map((f) => ({
          studyPlanSubjectId: f.id,
          subjectId: f.subjectId,
          code: f.subject.code,
          name: f.subject.name,
          level: f.level,
          credits: f.credits ?? f.subject.credits,
          hours: f.hours ?? f.subject.hours,
        })),
        totalCredits: asignaturas.reduce(
          (s, f) => s + (f.credits ?? f.subject.credits ?? 0),
          0,
        ),
        totalHours: asignaturas.reduce(
          (s, f) => s + (f.hours ?? f.subject.hours ?? 0),
          0,
        ),
      };
    });
  }

  async crear(tenantId: string, studyPlanId: string, dto: CrearBloqueDto) {
    await this.pensum(tenantId, studyPlanId);

    // certificateTemplateId viene del cliente: tiene que ser del tenant
    if (dto.certificateTemplateId) {
      await this.asegurarPlantilla(tenantId, dto.certificateTemplateId);
    }

    const orderIndex =
      dto.orderIndex ??
      (await this.prisma.studyPlanBlock.count({ where: { tenantId, studyPlanId } }));

    return this.prisma.studyPlanBlock.create({
      data: {
        tenantId,
        studyPlanId,
        name: dto.name,
        description: dto.description,
        orderIndex,
        certifiable: dto.certifiable ?? true,
        certificateTemplateId: dto.certificateTemplateId,
        competencyStandardCode: dto.competencyStandardCode,
      },
    });
  }

  async actualizar(tenantId: string, id: string, dto: ActualizarBloqueDto) {
    await this.bloque(tenantId, id);
    if (dto.certificateTemplateId) {
      await this.asegurarPlantilla(tenantId, dto.certificateTemplateId);
    }

    return this.prisma.studyPlanBlock.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        orderIndex: dto.orderIndex,
        certifiable: dto.certifiable,
        certificateTemplateId: dto.certificateTemplateId,
        competencyStandardCode: dto.competencyStandardCode,
      },
    });
  }

  async eliminar(tenantId: string, id: string) {
    await this.bloque(tenantId, id);
    // Las filas del pensum quedan sin bloque (blockId pasa a null por SetNull)
    await this.prisma.studyPlanBlock.delete({ where: { id } });
    return { message: 'Bloque eliminado; sus asignaturas quedaron sin bloque' };
  }

  /** Reemplaza las asignaturas del bloque. Todas deben ser del mismo pensum. */
  async asignarAsignaturas(
    tenantId: string,
    id: string,
    dto: AsignarAsignaturasDto,
  ) {
    const bloque = await this.bloque(tenantId, id);

    if (dto.studyPlanSubjectIds.length > 0) {
      const filas = await this.prisma.studyPlanSubject.findMany({
        where: {
          id: { in: dto.studyPlanSubjectIds },
          tenantId,
          studyPlanId: bloque.studyPlanId,
        },
        select: { id: true },
      });
      if (filas.length !== dto.studyPlanSubjectIds.length) {
        throw new BadRequestException(
          'Todas las asignaturas deben ser filas de este mismo pensum',
        );
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.studyPlanSubject.updateMany({
        where: { tenantId, studyPlanId: bloque.studyPlanId, blockId: id },
        data: { blockId: null },
      });
      if (dto.studyPlanSubjectIds.length > 0) {
        await tx.studyPlanSubject.updateMany({
          where: {
            tenantId,
            studyPlanId: bloque.studyPlanId,
            id: { in: dto.studyPlanSubjectIds },
          },
          data: { blockId: id },
        });
      }
    });

    return {
      message: `El bloque quedó con ${dto.studyPlanSubjectIds.length} asignaturas`,
    };
  }

  private async asegurarPlantilla(tenantId: string, certificateTemplateId: string) {
    const plantilla = await this.prisma.certificateTemplate.findFirst({
      where: { id: certificateTemplateId, tenantId },
      select: { id: true },
    });
    if (!plantilla) {
      throw new NotFoundException('Plantilla de certificado no encontrada');
    }
  }

  // ------------------------------------------------------- elegibilidad

  /**
   * Avance del estudiante por bloques del pensum de su inscripción, con la
   * marca de elegibilidad para el certificado intermedio.
   */
  async bloquesDeEstudiante(
    tenantId: string,
    programEnrollmentId: string,
    user: CurrentUserData,
  ) {
    const inscripcion = await this.prisma.programEnrollment.findFirst({
      where: { id: programEnrollmentId, tenantId },
      select: {
        id: true,
        studentId: true,
        studyPlanId: true,
        student: { select: { userId: true } },
        program: { select: { id: true, name: true, hoursPerCredit: true } },
      },
    });
    if (!inscripcion) throw new NotFoundException('Inscripción no encontrada');

    if (user.role === 'STUDENT' && inscripcion.student.userId !== user.userId) {
      throw new ForbiddenException('Solo puedes consultar tus propios bloques');
    }

    const [bloques, filas, aprobadas, certificados] = await Promise.all([
      this.prisma.studyPlanBlock.findMany({
        where: { tenantId, studyPlanId: inscripcion.studyPlanId },
        orderBy: { orderIndex: 'asc' },
        include: { certificateTemplate: { select: { id: true, nombre: true } } },
      }),
      this.prisma.studyPlanSubject.findMany({
        where: { tenantId, studyPlanId: inscripcion.studyPlanId },
        orderBy: [{ level: 'asc' }, { orderIndex: 'asc' }],
        include: {
          subject: {
            select: { id: true, code: true, name: true, credits: true, hours: true },
          },
        },
      }),
      this.prisma.studentSubjectRecord.findMany({
        where: {
          tenantId,
          studentId: inscripcion.studentId,
          passed: true,
          status: RecordStatus.VIGENTE,
        },
        select: { subjectId: true, origin: true, finalGrade: true },
      }),
      this.prisma.certificateRequest.findMany({
        where: { tenantId, studentId: inscripcion.studentId, tipo: 'BLOQUE' },
        select: { id: true, estado: true, motivo: true, fechaEmision: true },
      }),
    ]);

    const aprobadasPorSubject = new Map(aprobadas.map((a) => [a.subjectId, a]));
    const hpc = inscripcion.program.hoursPerCredit;

    return {
      programEnrollmentId: inscripcion.id,
      studentId: inscripcion.studentId,
      programId: inscripcion.program.id,
      programName: inscripcion.program.name,
      bloques: bloques.map((bloque) => {
        const delBloque = filas.filter((f) => f.blockId === bloque.id);
        const asignaturas = delBloque.map((f) => {
          const credits = f.credits ?? f.subject.credits ?? null;
          const aprobada = aprobadasPorSubject.get(f.subjectId);
          return {
            studyPlanSubjectId: f.id,
            subjectId: f.subjectId,
            code: f.subject.code,
            name: f.subject.name,
            level: f.level,
            credits,
            hours: horasDeAsignatura(f.hours ?? f.subject.hours, credits, hpc),
            aprobada: !!aprobada,
            finalGrade: aprobada?.finalGrade ?? null,
            origin: aprobada?.origin ?? null,
          };
        });

        const aprobadasDelBloque = asignaturas.filter((a) => a.aprobada).length;
        const completo =
          asignaturas.length > 0 && aprobadasDelBloque === asignaturas.length;
        // El certificado del bloque se identifica por su nombre en el motivo
        const certificado = certificados.find((c) =>
          (c.motivo ?? '').includes(bloque.name),
        );

        return {
          id: bloque.id,
          name: bloque.name,
          description: bloque.description,
          orderIndex: bloque.orderIndex,
          certifiable: bloque.certifiable,
          competencyStandardCode: bloque.competencyStandardCode,
          certificateTemplate: bloque.certificateTemplate,
          asignaturas,
          aprobadas: aprobadasDelBloque,
          totales: asignaturas.length,
          porcentaje:
            asignaturas.length > 0
              ? Math.round((aprobadasDelBloque / asignaturas.length) * 1000) / 10
              : 0,
          elegibleParaCertificado: completo && bloque.certifiable,
          certificado: certificado ?? null,
        };
      }),
    };
  }

  /**
   * Emite el certificado intermedio del bloque: lo pide la administración,
   * nunca se dispara solo. Exige que el estudiante haya aprobado todas las
   * asignaturas del bloque y que el bloque sea certificable.
   */
  async emitirCertificado(
    tenantId: string,
    blockId: string,
    dto: EmitirCertificadoDeBloqueDto,
    user: CurrentUserData,
  ) {
    if (!STAFF.includes(user.role)) {
      throw new ForbiddenException(
        'Solo la administración puede emitir el certificado del bloque',
      );
    }

    const bloque = await this.bloque(tenantId, blockId);
    if (!bloque.certifiable) {
      throw new BadRequestException('Este bloque no es certificable');
    }

    const estudiante = await this.prisma.student.findFirst({
      where: { id: dto.studentId, tenantId },
      select: { id: true, userId: true },
    });
    if (!estudiante) throw new NotFoundException('Estudiante no encontrado');

    const [filas, aprobadas] = await Promise.all([
      this.prisma.studyPlanSubject.findMany({
        where: { tenantId, studyPlanId: bloque.studyPlanId, blockId },
        include: { subject: { select: { name: true } } },
      }),
      this.prisma.studentSubjectRecord.findMany({
        where: {
          tenantId,
          studentId: dto.studentId,
          passed: true,
          status: RecordStatus.VIGENTE,
        },
        select: { subjectId: true },
      }),
    ]);

    if (filas.length === 0) {
      throw new BadRequestException('El bloque no tiene asignaturas asignadas');
    }

    const aprobadasIds = new Set(aprobadas.map((a) => a.subjectId));
    const faltantes = filas.filter((f) => !aprobadasIds.has(f.subjectId));
    if (faltantes.length > 0) {
      throw new ConflictException(
        `El estudiante aún no aprueba: ${faltantes.map((f) => f.subject.name).join(', ')}`,
      );
    }

    const yaEmitido = await this.prisma.certificateRequest.findFirst({
      where: {
        tenantId,
        studentId: dto.studentId,
        tipo: 'BLOQUE',
        motivo: { contains: bloque.name },
        estado: { not: CertificateStatus.RECHAZADO },
      },
      select: { id: true },
    });
    if (yaEmitido) {
      throw new ConflictException(
        'Ya existe un certificado de este bloque para el estudiante',
      );
    }

    return this.prisma.certificateRequest.create({
      data: {
        tenantId,
        studentId: dto.studentId,
        tipo: 'BLOQUE',
        motivo: `Certificado de competencia del bloque "${bloque.name}" (${bloque.studyPlan.program.name}, pensum ${bloque.studyPlan.version})`,
        estado: CertificateStatus.EN_PROCESO,
        observaciones: dto.observaciones,
      },
    });
  }
}
