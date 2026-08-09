import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateCardIssuanceDto, QueryCardIssuancesDto } from './dto';
import { Prisma, IssuanceStatus, CardStatus } from '@prisma/client';

/**
 * Servicio para la gestión de expediciones de carnets
 * Maneja la creación masiva y control de expediciones
 */
@Injectable()
export class CardIssuancesService {
  private readonly logger = new Logger(CardIssuancesService.name);

  // Prefijo para números de lote
  private readonly LOTE_PREFIX = 'LOTE';

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Genera un número de lote único
   * Formato: LOTE-YYYY-MM-DD-XXX
   */
  private async generateLoteNumber(tenantId: string): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

    // Contar expediciones del día actual
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const count = await this.prisma.cardIssuance.count({
      where: {
        tenantId,
        fechaExpedicion: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const sequentialNumber = (count + 1).toString().padStart(3, '0');
    return `${this.LOTE_PREFIX}-${dateStr}-${sequentialNumber}`;
  }

  /**
   * Crea una nueva expedición de carnets
   * @param tenantId - ID del tenant
   * @param createDto - Datos de la expedición
   * @param userId - ID del usuario que crea
   * @param userName - Nombre del usuario que crea
   * @returns Expedición creada
   */
  async create(
    tenantId: string,
    createDto: CreateCardIssuanceDto,
    userId: string,
    userName: string,
  ) {
    this.logger.log(
      `Creating card issuance for tenant ${tenantId} with ${createDto.usuarios.length} cards`,
    );

    // Generar número de lote
    const lote = await this.generateLoteNumber(tenantId);

    // Obtener o validar plantilla
    let templateId = createDto.templateId;

    if (!templateId) {
      // Si no se especificó plantilla, usar la predeterminada del primer usuario
      const tipoUsuario = createDto.usuarios[0]?.tipoUsuario;
      if (!tipoUsuario) {
        throw new BadRequestException('Debe especificar el tipo de usuario');
      }

      const defaultTemplate = await this.prisma.cardTemplate.findFirst({
        where: {
          tenantId,
          tiposUsuario: { has: tipoUsuario },
          esPredeterminada: true,
          esActiva: true,
        },
      });

      if (!defaultTemplate) {
        throw new NotFoundException(
          `No hay plantilla predeterminada activa para ${tipoUsuario}`,
        );
      }

      templateId = defaultTemplate.id;
    } else {
      // Validar que la plantilla existe y está activa
      const template = await this.prisma.cardTemplate.findFirst({
        where: {
          id: templateId,
          tenantId,
          esActiva: true,
        },
      });

      if (!template) {
        throw new NotFoundException('Plantilla no encontrada o inactiva');
      }
    }

    try {
      // Crear registro de expedición
      const issuance = await this.prisma.cardIssuance.create({
        data: {
          tenantId,
          templateId,
          lote,
          tipoExpedicion: createDto.tipoExpedicion,
          cantidad: createDto.usuarios.length,
          expedidoPor: userId,
          expedidoPorNombre: userName,
          motivo: createDto.motivo,
          observaciones: createDto.observaciones,
          estado: IssuanceStatus.PROCESANDO,
        },
      });

      // Procesar la expedición de carnets
      this.processIssuance(issuance.id, tenantId, createDto.usuarios)
        .catch((error) => {
          this.logger.error(`Error processing issuance ${issuance.id}: ${error.message}`);
        });

      this.logger.log(`Issuance ${issuance.id} created with lote ${lote}`);

      return {
        ...issuance,
        message: 'Expedición creada y procesándose en segundo plano',
      };
    } catch (error) {
      this.logger.error(`Error creating issuance: ${error.message}`);
      throw error;
    }
  }

  /**
   * Procesa la expedición de carnets (método asíncrono)
   * @param issuanceId - ID de la expedición
   * @param tenantId - ID del tenant
   * @param usuarios - Datos de usuarios
   */
  private async processIssuance(
    issuanceId: string,
    tenantId: string,
    usuarios: any[],
  ) {
    const carnetsGenerados: string[] = [];
    const errores: any[] = [];
    let cantidadExitosa = 0;
    let cantidadFallida = 0;

    try {
      // Obtener la expedición con su plantilla
      const issuance = await this.prisma.cardIssuance.findUnique({
        where: { id: issuanceId },
        include: { template: true },
      });

      if (!issuance) {
        throw new NotFoundException('Expedición no encontrada');
      }

      // Generar carnets para cada usuario
      for (const usuarioData of usuarios) {
        try {
          // Generar número de carnet único
          const numeroCarnet = await this.generateCardNumber(tenantId);

          // Crear el carnet
          const carnet = await this.prisma.iDCard.create({
            data: {
              tenantId,
              usuarioId: usuarioData.usuarioId,
              nombre: usuarioData.nombre,
              identificacion: usuarioData.identificacion,
              tipoUsuario: usuarioData.tipoUsuario,
              numeroCarnet,
              fechaEmision: new Date(),
              fechaVencimiento: this.calculateExpirationDate(),
              estado: CardStatus.ACTIVO,
              fotoUrl: usuarioData.fotoUrl,
              templateId: issuance.templateId,
              issuanceId: issuance.id,
            },
          });

          // Generar QR Code
          const qrCode = this.generateQRData(carnet.id, numeroCarnet, tenantId);

          // Actualizar con QR
          await this.prisma.iDCard.update({
            where: { id: carnet.id },
            data: { qrCode },
          });

          carnetsGenerados.push(carnet.id);
          cantidadExitosa++;

          this.logger.log(`Card ${numeroCarnet} created successfully for user ${usuarioData.usuarioId}`);
        } catch (error) {
          this.logger.error(
            `Error creating card for user ${usuarioData.usuarioId}: ${error.message}`,
          );
          errores.push({
            usuario: usuarioData.nombre,
            usuarioId: usuarioData.usuarioId,
            error: error.message,
          });
          cantidadFallida++;
        }
      }

      // Determinar estado final
      let estadoFinal: IssuanceStatus;
      if (cantidadFallida === 0) {
        estadoFinal = IssuanceStatus.COMPLETADO;
      } else if (cantidadExitosa === 0) {
        estadoFinal = IssuanceStatus.FALLIDO;
      } else {
        estadoFinal = IssuanceStatus.COMPLETADO_CON_ERRORES;
      }

      // Actualizar expedición
      await this.prisma.cardIssuance.update({
        where: { id: issuanceId },
        data: {
          carnetsGenerados,
          cantidadExitosa,
          cantidadFallida,
          errores: errores.length > 0 ? errores : null,
          estado: estadoFinal,
          fechaCompletado: new Date(),
        },
      });

      this.logger.log(
        `Issuance ${issuanceId} completed: ${cantidadExitosa} success, ${cantidadFallida} failed`,
      );
    } catch (error) {
      this.logger.error(`Critical error processing issuance ${issuanceId}: ${error.message}`);

      // Marcar como fallido
      await this.prisma.cardIssuance.update({
        where: { id: issuanceId },
        data: {
          estado: IssuanceStatus.FALLIDO,
          errores: [{ error: error.message }],
          fechaCompletado: new Date(),
        },
      });
    }
  }

  /**
   * Genera un número de carnet único
   */
  private async generateCardNumber(tenantId: string): Promise<string> {
    const currentYear = new Date().getFullYear();
    const count = await this.prisma.iDCard.count({
      where: {
        tenantId,
        numeroCarnet: { startsWith: `CARD-${currentYear}` },
      },
    });

    const sequentialNumber = (count + 1).toString().padStart(4, '0');
    return `CARD-${currentYear}-${sequentialNumber}`;
  }

  /**
   * Calcula la fecha de vencimiento (1 año desde hoy)
   */
  private calculateExpirationDate(): Date {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date;
  }

  /**
   * Genera datos del QR Code
   */
  private generateQRData(cardId: string, cardNumber: string, tenantId: string): string {
    const qrData = {
      type: 'virtualuni_idcard',
      cardId,
      cardNumber,
      tenantId,
      timestamp: new Date().toISOString(),
      verifyUrl: `https://verify.virtualuni.app/card/${cardNumber}`,
    };

    return Buffer.from(JSON.stringify(qrData)).toString('base64');
  }

  /**
   * Lista todas las expediciones con filtros y paginación
   * @param tenantId - ID del tenant
   * @param query - Parámetros de consulta
   * @returns Lista paginada de expediciones
   */
  async findAll(tenantId: string, query: QueryCardIssuancesDto) {
    const {
      page = 1,
      limit = 20,
      search,
      tipoExpedicion,
      estado,
      expedidoPor,
      sortBy = 'fechaExpedicion',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    // Construir condiciones de filtrado
    const where: Prisma.CardIssuanceWhereInput = { tenantId };

    if (search) {
      where.lote = { contains: search, mode: 'insensitive' };
    }

    if (tipoExpedicion) {
      where.tipoExpedicion = tipoExpedicion;
    }

    if (estado) {
      where.estado = estado;
    }

    if (expedidoPor) {
      where.expedidoPor = expedidoPor;
    }

    // Validar campo de ordenamiento
    const validSortFields = [
      'fechaExpedicion',
      'fechaCompletado',
      'lote',
      'cantidad',
      'estado',
      'tipoExpedicion',
    ];

    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'fechaExpedicion';
    const orderBy: Prisma.CardIssuanceOrderByWithRelationInput = {
      [orderByField]: sortOrder,
    };

    const [issuances, total] = await Promise.all([
      this.prisma.cardIssuance.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          template: {
            select: {
              id: true,
              nombre: true,
            },
          },
          _count: {
            select: {
              carnets: true,
            },
          },
        },
      }),
      this.prisma.cardIssuance.count({ where }),
    ]);

    return {
      data: issuances,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Obtiene una expedición por su ID
   * @param id - ID de la expedición
   * @param tenantId - ID del tenant
   * @returns Expedición encontrada
   */
  async findOne(id: string, tenantId: string) {
    const issuance = await this.prisma.cardIssuance.findFirst({
      where: { id, tenantId },
      include: {
        template: true,
        carnets: {
          select: {
            id: true,
            numeroCarnet: true,
            nombre: true,
            estado: true,
            fechaEmision: true,
          },
        },
      },
    });

    if (!issuance) {
      throw new NotFoundException(`Expedición con ID ${id} no encontrada`);
    }

    return issuance;
  }

  /**
   * Cancela una expedición en proceso
   * @param id - ID de la expedición
   * @param tenantId - ID del tenant
   * @returns Expedición cancelada
   */
  async cancel(id: string, tenantId: string) {
    const issuance = await this.prisma.cardIssuance.findFirst({
      where: { id, tenantId },
    });

    if (!issuance) {
      throw new NotFoundException(`Expedición con ID ${id} no encontrada`);
    }

    if (issuance.estado !== IssuanceStatus.PROCESANDO) {
      throw new BadRequestException(
        `Solo se pueden cancelar expediciones en proceso. Estado actual: ${issuance.estado}`,
      );
    }

    const updatedIssuance = await this.prisma.cardIssuance.update({
      where: { id },
      data: {
        estado: IssuanceStatus.CANCELADO,
        fechaCompletado: new Date(),
      },
    });

    this.logger.log(`Issuance ${id} cancelled`);

    return {
      ...updatedIssuance,
      message: 'Expedición cancelada exitosamente',
    };
  }

  /**
   * Obtiene estadísticas de expediciones
   * @param tenantId - ID del tenant
   * @returns Estadísticas
   */
  async getStats(tenantId: string) {
    const [total, completadas, procesando, fallidas, totalCarnets] = await Promise.all([
      this.prisma.cardIssuance.count({ where: { tenantId } }),
      this.prisma.cardIssuance.count({
        where: { tenantId, estado: IssuanceStatus.COMPLETADO },
      }),
      this.prisma.cardIssuance.count({
        where: { tenantId, estado: IssuanceStatus.PROCESANDO },
      }),
      this.prisma.cardIssuance.count({
        where: { tenantId, estado: IssuanceStatus.FALLIDO },
      }),
      this.prisma.cardIssuance.aggregate({
        where: { tenantId },
        _sum: { cantidadExitosa: true },
      }),
    ]);

    return {
      total,
      completadas,
      procesando,
      fallidas,
      canceladas: await this.prisma.cardIssuance.count({
        where: { tenantId, estado: IssuanceStatus.CANCELADO },
      }),
      totalCarnetsGenerados: totalCarnets._sum.cantidadExitosa || 0,
    };
  }
}
