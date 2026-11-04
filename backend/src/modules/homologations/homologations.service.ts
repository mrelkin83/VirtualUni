import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import {
  HomologationStatus,
  HomologationType,
  RecordOrigin,
  RecordStatus,
} from '@prisma/client';
import { CurrentUserData } from '@/common/decorators/current-user.decorator';
import { horasDeAsignatura } from '../academic-records/calculo-notas';
import {
  ActualizarEquivalenciaDto,
  CambiarEstadoSolicitudDto,
  CrearEquivalenciaDto,
  CrearSolicitudDto,
  ResolverSolicitudDto,
} from './dto/homologation.dto';

const STAFF = ['TENANT_ADMIN', 'SUPER_ADMIN'];

/** Origen del registro del historial según el tipo de solicitud. */
const ORIGEN_POR_TIPO: Record<HomologationType, RecordOrigin> = {
  EQUIVALENCIA_INTERNA: RecordOrigin.HOMOLOGACION_EQUIVALENCIA,
  EXTERNA: RecordOrigin.RECONOCIMIENTO_EXTERNO,
  VALIDACION_SUFICIENCIA: RecordOrigin.VALIDACION_SUFICIENCIA,
};

@Injectable()
export class HomologationsService {
  constructor(private prisma: PrismaService) {}

  private asegurarStaff(user: CurrentUserData) {
    if (!STAFF.includes(user.role)) {
      throw new ForbiddenException('Solo la administración puede hacer esto');
    }
  }

  // ================================================================
  // Equivalencias entre asignaturas (admin)
  // ================================================================

  async listarEquivalencias(tenantId: string) {
    return this.prisma.subjectEquivalence.findMany({
      where: { tenantId },
      include: {
        sourceSubject: { select: { id: true, code: true, name: true } },
        targetSubject: { select: { id: true, code: true, name: true } },
      },
      orderBy: { sourceSubject: { name: 'asc' } },
    });
  }

  async crearEquivalencia(tenantId: string, dto: CrearEquivalenciaDto) {
    if (dto.sourceSubjectId === dto.targetSubjectId) {
      throw new BadRequestException(
        'Una asignatura no puede ser equivalente a sí misma',
      );
    }

    // Ambos *Id se validan contra el tenant del llamador antes de usarse
    const asignaturas = await this.prisma.subject.findMany({
      where: {
        tenantId,
        id: { in: [dto.sourceSubjectId, dto.targetSubjectId] },
      },
      select: { id: true },
    });
    if (asignaturas.length !== 2) {
      throw new NotFoundException('Alguna de las asignaturas no existe');
    }

    const existente = await this.prisma.subjectEquivalence.findFirst({
      where: {
        tenantId,
        sourceSubjectId: dto.sourceSubjectId,
        targetSubjectId: dto.targetSubjectId,
      },
      select: { id: true },
    });
    if (existente) {
      throw new ConflictException('Esa equivalencia ya está registrada');
    }

    return this.prisma.subjectEquivalence.create({
      data: {
        tenantId,
        sourceSubjectId: dto.sourceSubjectId,
        targetSubjectId: dto.targetSubjectId,
        bidirectional: dto.bidirectional ?? false,
        notes: dto.notes,
      },
      include: {
        sourceSubject: { select: { id: true, code: true, name: true } },
        targetSubject: { select: { id: true, code: true, name: true } },
      },
    });
  }

  async actualizarEquivalencia(
    tenantId: string,
    id: string,
    dto: ActualizarEquivalenciaDto,
  ) {
    const equivalencia = await this.prisma.subjectEquivalence.findFirst({
      where: { id, tenantId },
      select: { id: true },
    });
    if (!equivalencia) throw new NotFoundException('Equivalencia no encontrada');

    return this.prisma.subjectEquivalence.update({
      where: { id },
      data: { bidirectional: dto.bidirectional, notes: dto.notes },
    });
  }

  async eliminarEquivalencia(tenantId: string, id: string) {
    const equivalencia = await this.prisma.subjectEquivalence.findFirst({
      where: { id, tenantId },
      select: { id: true },
    });
    if (!equivalencia) throw new NotFoundException('Equivalencia no encontrada');

    await this.prisma.subjectEquivalence.delete({ where: { id } });
    return { message: 'Equivalencia eliminada' };
  }

  // ================================================================
  // Solicitudes de homologación
  // ================================================================

  private readonly INCLUDE_SOLICITUD = {
    student: {
      select: {
        id: true,
        studentCode: true,
        userId: true,
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    },
    programEnrollment: {
      select: {
        id: true,
        studyPlanId: true,
        program: { select: { id: true, code: true, name: true } },
      },
    },
    items: {
      include: {
        targetSubject: {
          select: { id: true, code: true, name: true, credits: true, hours: true },
        },
      },
    },
  } as const;

  async listarSolicitudes(
    tenantId: string,
    user: CurrentUserData,
    filtros: { status?: HomologationStatus; studentId?: string } = {},
  ) {
    // Un estudiante solo ve las suyas, sea cual sea el studentId que pida
    let studentId = filtros.studentId;
    if (user.role === 'STUDENT') {
      const propio = await this.prisma.student.findFirst({
        where: { userId: user.userId, tenantId },
        select: { id: true },
      });
      if (!propio) {
        throw new ForbiddenException('El usuario no tiene ficha de estudiante');
      }
      studentId = propio.id;
    }

    return this.prisma.homologationRequest.findMany({
      where: {
        tenantId,
        ...(filtros.status ? { status: filtros.status } : {}),
        ...(studentId ? { studentId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: this.INCLUDE_SOLICITUD,
    });
  }

  async obtenerSolicitud(tenantId: string, id: string, user: CurrentUserData) {
    const solicitud = await this.prisma.homologationRequest.findFirst({
      where: { id, tenantId },
      include: this.INCLUDE_SOLICITUD,
    });
    if (!solicitud) throw new NotFoundException('Solicitud no encontrada');

    if (user.role === 'STUDENT' && solicitud.student.userId !== user.userId) {
      throw new ForbiddenException('Solo puedes consultar tus propias solicitudes');
    }
    return solicitud;
  }

  /**
   * Crea la solicitud. La puede crear la administración para cualquiera, o el
   * propio estudiante para sí mismo. Todos los `*Id` se validan contra el
   * tenant y contra la propia inscripción antes de confiar en ellos.
   */
  async crearSolicitud(
    tenantId: string,
    dto: CrearSolicitudDto,
    user: CurrentUserData,
  ) {
    const estudiante = await this.prisma.student.findFirst({
      where: { id: dto.studentId, tenantId },
      select: { id: true, userId: true },
    });
    if (!estudiante) throw new NotFoundException('Estudiante no encontrado');

    if (user.role === 'STUDENT' && estudiante.userId !== user.userId) {
      throw new ForbiddenException('Solo puedes solicitar homologación para ti');
    }
    if (!STAFF.includes(user.role) && user.role !== 'STUDENT') {
      throw new ForbiddenException(
        'Solo el estudiante o la administración pueden crear la solicitud',
      );
    }

    // La inscripción tiene que ser del tenant Y del mismo estudiante
    const inscripcion = await this.prisma.programEnrollment.findFirst({
      where: {
        id: dto.programEnrollmentId,
        tenantId,
        studentId: dto.studentId,
      },
      select: { id: true, studyPlanId: true },
    });
    if (!inscripcion) {
      throw new NotFoundException('Inscripción no encontrada para ese estudiante');
    }

    // Cada targetSubjectId debe estar en el pensum DESTINO de la inscripción
    const idsPedidos = dto.items.map((i) => i.targetSubjectId);
    const enElPensum = await this.prisma.studyPlanSubject.findMany({
      where: {
        tenantId,
        studyPlanId: inscripcion.studyPlanId,
        subjectId: { in: idsPedidos },
      },
      select: { subjectId: true },
    });
    const validos = new Set(enElPensum.map((f) => f.subjectId));
    const fuera = idsPedidos.filter((id) => !validos.has(id));
    if (fuera.length > 0) {
      throw new BadRequestException(
        `Estas asignaturas no están en el pensum del programa destino: ${fuera.join(', ')}`,
      );
    }
    if (new Set(idsPedidos).size !== idsPedidos.length) {
      throw new BadRequestException('La solicitud repite alguna asignatura destino');
    }

    return this.prisma.homologationRequest.create({
      data: {
        tenantId,
        studentId: dto.studentId,
        programEnrollmentId: dto.programEnrollmentId,
        type: dto.type,
        originInstitution: dto.originInstitution,
        supportFiles: dto.supportFiles ?? [],
        items: {
          create: dto.items.map((item) => ({
            tenantId,
            targetSubjectId: item.targetSubjectId,
            originName: item.originName,
            originHours: item.originHours,
            originGrade: item.originGrade,
          })),
        },
      },
      include: this.INCLUDE_SOLICITUD,
    });
  }

  /** Pasa la solicitud a EN_REVISION o la rechaza sin entrar al detalle. */
  async cambiarEstado(
    tenantId: string,
    id: string,
    dto: CambiarEstadoSolicitudDto,
    user: CurrentUserData,
  ) {
    this.asegurarStaff(user);
    const solicitud = await this.prisma.homologationRequest.findFirst({
      where: { id, tenantId },
      select: { id: true, status: true },
    });
    if (!solicitud) throw new NotFoundException('Solicitud no encontrada');

    const permitidos: HomologationStatus[] = [
      HomologationStatus.EN_REVISION,
      HomologationStatus.RECHAZADA,
    ];
    if (!permitidos.includes(dto.status)) {
      throw new BadRequestException(
        'Desde aquí solo se puede pasar a EN_REVISION o RECHAZADA; la aprobación se decide por ítems',
      );
    }
    if (
      solicitud.status === HomologationStatus.APROBADA ||
      solicitud.status === HomologationStatus.APROBADA_PARCIAL
    ) {
      throw new ConflictException('La solicitud ya fue resuelta');
    }

    return this.prisma.homologationRequest.update({
      where: { id },
      data: {
        status: dto.status,
        decisionNotes: dto.decisionNotes,
        reviewedById: user.userId,
        reviewedAt: new Date(),
      },
      include: this.INCLUDE_SOLICITUD,
    });
  }

  /**
   * Resuelve la solicitud ítem por ítem. Valida nota mínima, horas y el tope
   * `maxRecognitionPct` del programa destino (solo para homologación
   * EXTERNA); el admin puede forzar con justificación obligatoria, que queda
   * escrita en el ítem y en el registro del historial.
   */
  async resolverSolicitud(
    tenantId: string,
    id: string,
    dto: ResolverSolicitudDto,
    user: CurrentUserData,
  ) {
    this.asegurarStaff(user);

    const solicitud = await this.prisma.homologationRequest.findFirst({
      where: { id, tenantId },
      include: {
        items: {
          include: {
            targetSubject: {
              select: {
                id: true,
                code: true,
                name: true,
                credits: true,
                hours: true,
              },
            },
          },
        },
        programEnrollment: {
          select: {
            id: true,
            studyPlanId: true,
            program: {
              select: {
                id: true,
                name: true,
                hoursPerCredit: true,
                maxRecognitionPct: true,
                minRecognitionGrade: true,
                gradeScaleMax: true,
              },
            },
          },
        },
        student: { select: { id: true, userId: true } },
      },
    });
    if (!solicitud) throw new NotFoundException('Solicitud no encontrada');
    if (
      solicitud.status === HomologationStatus.APROBADA ||
      solicitud.status === HomologationStatus.APROBADA_PARCIAL
    ) {
      throw new ConflictException('La solicitud ya fue resuelta');
    }

    const porId = new Map(solicitud.items.map((i) => [i.id, i]));
    const desconocidos = dto.decisiones.filter((d) => !porId.has(d.itemId));
    if (desconocidos.length > 0) {
      throw new BadRequestException(
        'Alguna decisión apunta a un ítem que no es de esta solicitud',
      );
    }

    const programa = solicitud.programEnrollment.program;
    const esExterna = solicitud.type === HomologationType.EXTERNA;

    // Totales del pensum destino y lo ya reconocido por vía externa, para el
    // tope maxRecognitionPct. El denominador es siempre el pensum DESTINO.
    const [filasDestino, yaExternas] = await Promise.all([
      this.prisma.studyPlanSubject.findMany({
        where: { tenantId, studyPlanId: solicitud.programEnrollment.studyPlanId },
        include: { subject: { select: { credits: true, hours: true } } },
      }),
      this.prisma.studentSubjectRecord.findMany({
        where: {
          tenantId,
          studentId: solicitud.studentId,
          status: RecordStatus.VIGENTE,
          origin: RecordOrigin.RECONOCIMIENTO_EXTERNO,
        },
        select: { subjectId: true, creditsSnapshot: true },
      }),
    ]);

    const creditosDeFila = (fila: {
      credits: number | null;
      subject: { credits: number | null };
    }) => fila.credits ?? fila.subject.credits ?? 0;

    const creditosTotales = filasDestino.reduce(
      (acc, f) => acc + creditosDeFila(f),
      0,
    );
    const subjectsDelDestino = new Set(filasDestino.map((f) => f.subjectId));
    let creditosExternos = yaExternas
      .filter((r) => subjectsDelDestino.has(r.subjectId))
      .reduce((acc, r) => acc + (r.creditsSnapshot ?? 0), 0);

    const topeCreditos =
      creditosTotales > 0 ? (creditosTotales * programa.maxRecognitionPct) / 100 : 0;

    const resultados: Array<{
      itemId: string;
      targetSubjectId: string;
      decision: 'APROBADO' | 'RECHAZADO';
      motivo?: string;
    }> = [];
    const ahora = new Date();

    await this.prisma.$transaction(async (tx) => {
      for (const decision of dto.decisiones) {
        const item = porId.get(decision.itemId)!;

        if (!decision.aprobado) {
          await tx.homologationItem.update({
            where: { id: item.id },
            data: {
              decision: 'RECHAZADO',
              decisionNotes: decision.justificacion,
            },
          });
          resultados.push({
            itemId: item.id,
            targetSubjectId: item.targetSubjectId,
            decision: 'RECHAZADO',
          });
          continue;
        }

        const credits =
          filasDestino.find((f) => f.subjectId === item.targetSubjectId)?.credits ??
          item.targetSubject.credits ??
          0;
        const horasDestino = horasDeAsignatura(
          item.targetSubject.hours,
          credits || null,
          programa.hoursPerCredit,
        );

        // Validaciones de la homologación externa
        const fallos: string[] = [];
        if (esExterna) {
          if (item.originGrade == null) {
            fallos.push('no se registró la nota de origen');
          } else if (item.originGrade < programa.minRecognitionGrade) {
            fallos.push(
              `la nota de origen (${item.originGrade}) es menor que la mínima para homologar (${programa.minRecognitionGrade})`,
            );
          }
          if (
            horasDestino != null &&
            item.originHours != null &&
            item.originHours < horasDestino
          ) {
            fallos.push(
              `las horas de origen (${item.originHours}) son menos que las de la asignatura destino (${horasDestino})`,
            );
          }
          if (creditosExternos + credits > topeCreditos) {
            fallos.push(
              `se superaría el máximo reconocible por homologación externa (${programa.maxRecognitionPct} % del pensum)`,
            );
          }
        }

        if (fallos.length > 0 && !decision.forzar) {
          throw new BadRequestException(
            `No se puede aprobar "${item.targetSubject.name}": ${fallos.join('; ')}. Un administrador puede forzarlo con justificación.`,
          );
        }
        if (fallos.length > 0 && decision.forzar && !decision.justificacion) {
          throw new BadRequestException(
            `Forzar la aprobación de "${item.targetSubject.name}" exige una justificación`,
          );
        }

        const forzado = fallos.length > 0;
        const notaDeAuditoria = forzado
          ? `Aprobado forzando validaciones (${fallos.join('; ')}). Justificación de ${user.email}: ${decision.justificacion}`
          : decision.justificacion;

        await tx.homologationItem.update({
          where: { id: item.id },
          data: { decision: 'APROBADO', decisionNotes: notaDeAuditoria },
        });

        // Nota del historial: la de origen, normalizada a la escala del
        // programa solo si venía en escala 0-100.
        const finalGrade =
          item.originGrade != null
            ? item.originGrade > programa.gradeScaleMax
              ? Math.round((item.originGrade / 100) * programa.gradeScaleMax * 100) /
                100
              : item.originGrade
            : null;

        await tx.studentSubjectRecord.create({
          data: {
            tenantId,
            studentId: solicitud.studentId,
            subjectId: item.targetSubjectId,
            origin: ORIGEN_POR_TIPO[solicitud.type],
            finalGrade,
            passed: true,
            creditsSnapshot: credits || null,
            hoursSnapshot: horasDestino,
            approvedById: user.userId,
            approvedAt: ahora,
            sourceRequestId: solicitud.id,
            notes: notaDeAuditoria,
          },
        });

        if (esExterna) creditosExternos += credits;
        resultados.push({
          itemId: item.id,
          targetSubjectId: item.targetSubjectId,
          decision: 'APROBADO',
          motivo: forzado ? 'forzado con justificación' : undefined,
        });
      }

      const aprobados = resultados.filter((r) => r.decision === 'APROBADO').length;
      const decididos = solicitud.items.length === dto.decisiones.length;
      const status =
        aprobados === 0
          ? HomologationStatus.RECHAZADA
          : aprobados === solicitud.items.length && decididos
            ? HomologationStatus.APROBADA
            : HomologationStatus.APROBADA_PARCIAL;

      await tx.homologationRequest.update({
        where: { id: solicitud.id },
        data: {
          status,
          decisionNotes: dto.decisionNotes,
          reviewedById: user.userId,
          reviewedAt: ahora,
        },
      });

      // Aviso al estudiante con el módulo de notificaciones existente
      await tx.notification.create({
        data: {
          tenantId,
          userId: solicitud.student.userId,
          titulo: 'Resultado de tu solicitud de homologación',
          mensaje:
            aprobados === 0
              ? 'Tu solicitud de homologación fue rechazada. Consulta las observaciones en tu panel.'
              : `Se te homologaron ${aprobados} de ${solicitud.items.length} asignaturas en "${programa.name}".`,
          tipo: aprobados === 0 ? 'ERROR' : 'SUCCESS',
          icono: 'GraduationCap',
        },
      });
    });

    return {
      message: 'Solicitud resuelta',
      resultados,
      creditosExternosReconocidos: creditosExternos,
      topeCreditosExternos: Math.round(topeCreditos * 100) / 100,
    };
  }
}
