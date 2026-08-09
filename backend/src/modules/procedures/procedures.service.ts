import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import {
  CreateProcedureDto,
  UpdateProcedureDto,
  AssignProcedureDto,
  RespondProcedureDto,
  QueryProceduresDto,
} from './dto';
import { Procedure, ProcedureStatus } from '@prisma/client';

@Injectable()
export class ProceduresService {
  private readonly logger = new Logger(ProceduresService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Crear un nuevo trámite
   */
  /**
   * Trámites del propio solicitante.
   *
   * Listar trámites estaba reservado a la administración, así que un
   * estudiante podía crear uno y no tenía ninguna forma de volver a verlo ni
   * de saber en qué estado quedaba.
   */
  async findMine(tenantId: string, solicitanteId: string) {
    return this.prisma.procedure.findMany({
      where: { tenantId, solicitanteId },
      orderBy: { fechaSolicitud: 'desc' },
    });
  }

  /**
   * Cancela un trámite propio. Solo mientras siga pendiente: una vez que la
   * administración lo ha tomado, retirarlo por detrás dejaría trabajo hecho
   * sobre un expediente que ya no existe.
   */
  async cancelarPropio(tenantId: string, solicitanteId: string, id: string) {
    const tramite = await this.prisma.procedure.findFirst({
      where: { id, tenantId, solicitanteId },
    });
    if (!tramite) {
      throw new NotFoundException('Trámite no encontrado');
    }
    if (tramite.estado !== ProcedureStatus.PENDIENTE) {
      throw new BadRequestException(
        'Solo puedes cancelar un trámite que siga pendiente',
      );
    }
    return this.prisma.procedure.update({
      where: { id },
      data: { estado: ProcedureStatus.RECHAZADO, respuesta: 'Cancelado por el solicitante' },
    });
  }

  async create(
    tenantId: string,
    solicitanteId: string,
    solicitante: string,
    createDto: CreateProcedureDto,
  ): Promise<Procedure> {
    try {
      const procedure = await this.prisma.procedure.create({
        data: {
          tenantId,
          tipo: createDto.tipo,
          solicitanteId,
          solicitante,
          descripcion: createDto.descripcion,
          estado: ProcedureStatus.PENDIENTE,
          prioridad: createDto.prioridad,
          adjuntos: createDto.adjuntos || [],
        },
      });

      this.logger.log(`Procedure created: ${procedure.id}`);
      return procedure;
    } catch (error) {
      this.logger.error(`Error creating procedure: ${error}`);
      throw new BadRequestException('Error al crear el trámite');
    }
  }

  /**
   * Obtener todos los trámites con filtros y paginación
   */
  async findAll(
    tenantId: string,
    query: QueryProceduresDto,
  ): Promise<{
    data: Procedure[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
    };

    if (query.search) {
      where.OR = [
        { tipo: { contains: query.search, mode: 'insensitive' } },
        { descripcion: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.estado) {
      where.estado = query.estado;
    }

    if (query.prioridad) {
      where.prioridad = query.prioridad;
    }

    if (query.tipo) {
      where.tipo = { contains: query.tipo, mode: 'insensitive' };
    }

    if (query.solicitanteId) {
      where.solicitanteId = query.solicitanteId;
    }

    if (query.asignadoA) {
      where.asignadoA = query.asignadoA;
    }

    const [data, total] = await Promise.all([
      this.prisma.procedure.findMany({
        where,
        skip,
        take: limit,
        orderBy: this.parseOrderBy(query.orderBy),
      }),
      this.prisma.procedure.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtener un trámite por ID
   */
  async findOne(id: string, tenantId: string): Promise<Procedure> {
    const procedure = await this.prisma.procedure.findUnique({
      where: { id },
    });

    if (!procedure || procedure.tenantId !== tenantId) {
      throw new NotFoundException('Trámite no encontrado');
    }

    return procedure;
  }

  /**
   * Actualizar un trámite
   */
  async update(
    id: string,
    tenantId: string,
    updateDto: UpdateProcedureDto,
  ): Promise<Procedure> {
    await this.findOne(id, tenantId);

    try {
      const procedure = await this.prisma.procedure.update({
        where: { id },
        data: {
          tipo: updateDto.tipo,
          descripcion: updateDto.descripcion,
          prioridad: updateDto.prioridad,
          adjuntos: updateDto.adjuntos,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Procedure updated: ${id}`);
      return procedure;
    } catch (error) {
      this.logger.error(`Error updating procedure: ${error}`);
      throw new BadRequestException('Error al actualizar el trámite');
    }
  }

  /**
   * Asignar un trámite a un usuario
   */
  async assign(
    id: string,
    tenantId: string,
    assignDto: AssignProcedureDto,
  ): Promise<Procedure> {
    const procedure = await this.findOne(id, tenantId);

    if (
      procedure.estado === ProcedureStatus.COMPLETADO ||
      procedure.estado === ProcedureStatus.RECHAZADO
    ) {
      throw new BadRequestException(
        'No se puede asignar un trámite completado o rechazado',
      );
    }

    try {
      const updated = await this.prisma.procedure.update({
        where: { id },
        data: {
          asignadoA: assignDto.usuarioId,
          estado: ProcedureStatus.EN_PROCESO,
        },
      });

      this.logger.log(`Procedure assigned: ${id} to ${assignDto.usuarioId}`);
      return updated;
    } catch (error) {
      this.logger.error(`Error assigning procedure: ${error}`);
      throw new BadRequestException('Error al asignar el trámite');
    }
  }

  /**
   * Responder a un trámite
   */
  async respond(
    id: string,
    tenantId: string,
    respondDto: RespondProcedureDto,
  ): Promise<Procedure> {
    const procedure = await this.findOne(id, tenantId);

    if (procedure.estado === ProcedureStatus.COMPLETADO) {
      throw new BadRequestException('Este trámite ya está completado');
    }

    try {
      // Agregar adjuntos de respuesta a los adjuntos originales
      const adjuntos = [...(procedure.adjuntos || [])];
      if (respondDto.adjuntosRespuesta) {
        adjuntos.push(...respondDto.adjuntosRespuesta);
      }

      const updated = await this.prisma.procedure.update({
        where: { id },
        data: {
          respuesta: respondDto.respuesta,
          estado: respondDto.estado,
          adjuntos,
          fechaRespuesta: new Date(),
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Procedure responded: ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(`Error responding to procedure: ${error}`);
      throw new BadRequestException('Error al responder el trámite');
    }
  }

  /**
   * Eliminar un trámite
   */
  async remove(id: string, tenantId: string): Promise<void> {
    await this.findOne(id, tenantId);

    try {
      await this.prisma.procedure.delete({
        where: { id },
      });

      this.logger.log(`Procedure deleted: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting procedure: ${error}`);
      throw new BadRequestException('Error al eliminar el trámite');
    }
  }

  /**
   * Obtener trámites por estado
   */
  async findByStatus(
    tenantId: string,
    estado: ProcedureStatus,
  ): Promise<Procedure[]> {
    return await this.prisma.procedure.findMany({
      where: {
        tenantId,
        estado,
      },
      orderBy: { fechaSolicitud: 'desc' },
    });
  }

  /**
   * Obtener trámites por prioridad
   */
  async findByPriority(tenantId: string, prioridad: string): Promise<Procedure[]> {
    return await this.prisma.procedure.findMany({
      where: {
        tenantId,
        prioridad: prioridad as any,
      },
      orderBy: { fechaSolicitud: 'desc' },
    });
  }

  /**
   * Obtener estadísticas de trámites
   */
  async getStats(tenantId: string): Promise<{
    total: number;
    pendientes: number;
    enProceso: number;
    completados: number;
    rechazados: number;
    porPrioridad: Record<string, number>;
    tiempoPromedio: number;
  }> {
    const [
      total,
      pendientes,
      enProceso,
      completados,
      rechazados,
    ] = await Promise.all([
      this.prisma.procedure.count({ where: { tenantId } }),
      this.prisma.procedure.count({
        where: { tenantId, estado: ProcedureStatus.PENDIENTE },
      }),
      this.prisma.procedure.count({
        where: { tenantId, estado: ProcedureStatus.EN_PROCESO },
      }),
      this.prisma.procedure.count({
        where: { tenantId, estado: ProcedureStatus.COMPLETADO },
      }),
      this.prisma.procedure.count({
        where: { tenantId, estado: ProcedureStatus.RECHAZADO },
      }),
    ]);

    const procedures = await this.prisma.procedure.findMany({
      where: { tenantId },
      select: { prioridad: true, fechaSolicitud: true, fechaRespuesta: true },
    });

    const porPrioridad: Record<string, number> = {
      ALTA: 0,
      MEDIA: 0,
      BAJA: 0,
    };

    let tiempoTotal = 0;
    let tiempoCount = 0;

    procedures.forEach((p) => {
      porPrioridad[p.prioridad]++;
      if (p.fechaRespuesta) {
        const diff = p.fechaRespuesta.getTime() - p.fechaSolicitud.getTime();
        tiempoTotal += diff;
        tiempoCount++;
      }
    });

    const tiempoPromedio = tiempoCount > 0 ? tiempoTotal / tiempoCount / (1000 * 60 * 60) : 0;

    return {
      total,
      pendientes,
      enProceso,
      completados,
      rechazados,
      porPrioridad,
      tiempoPromedio: Math.round(tiempoPromedio),
    };
  }

  /**
   * Parsear orderBy string a objeto Prisma
   */
  private parseOrderBy(
    orderBy?: string,
  ): Record<string, 'asc' | 'desc'> | undefined {
    if (!orderBy) {
      return { fechaSolicitud: 'desc' };
    }

    const [field, direction] = orderBy.split(':');
    return {
      [field]: (direction?.toLowerCase() || 'desc') as 'asc' | 'desc',
    };
  }
}
