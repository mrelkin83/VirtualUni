import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import {
  CreateIdCardDto,
  UpdateIdCardDto,
  QueryIdCardsDto,
  RenewIdCardDto,
  BlockIdCardDto,
} from './dto';
import { CardStatus, UserCardType, Prisma } from '@prisma/client';

/**
 * Interfaz para estadisticas de carnets
 */
export interface IdCardStats {
  totalCarnets: number;
  porEstado: Record<CardStatus, number>;
  porTipoUsuario: Record<UserCardType, number>;
  carnetsVencidos: number;
  carnetsPorVencer: number;
  carnetsEmitidosEsteMes: number;
}

/**
 * Interfaz para datos de exportacion de carnet
 */
export interface IdCardExportData {
  id: string;
  numeroCarnet: string;
  nombre: string;
  identificacion: string;
  tipoUsuario: UserCardType;
  fechaEmision: string;
  fechaVencimiento: string;
  estado: CardStatus;
  fotoUrl: string;
  qrCode: string;
}

/**
 * Servicio para la gestion de carnets de identificacion
 * Maneja operaciones CRUD, generacion de QR y estadisticas
 */
@Injectable()
export class IdCardsService {
  private readonly logger = new Logger(IdCardsService.name);

  // Prefijo para numeros de carnet
  private readonly CARD_PREFIX = 'CARD';

  constructor(private readonly prisma: PrismaService) {}

  // =============================================
  // CRUD DE CARNETS
  // =============================================

  /**
   * Genera un numero de carnet unico
   * Formato: CARD-YYYY-XXX donde YYYY es el ano y XXX es secuencial
   */
  private async generateCardNumber(tenantId: string): Promise<string> {
    const currentYear = new Date().getFullYear();

    // Contar carnets del ano actual
    const count = await this.prisma.iDCard.count({
      where: {
        tenantId,
        numeroCarnet: { startsWith: `${this.CARD_PREFIX}-${currentYear}` },
      },
    });

    const sequentialNumber = (count + 1).toString().padStart(4, '0');
    return `${this.CARD_PREFIX}-${currentYear}-${sequentialNumber}`;
  }

  /**
   * Genera un codigo QR para el carnet
   * El QR contiene la informacion basica del carnet en formato JSON
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

    // En produccion, esto seria encriptado o firmado digitalmente
    return Buffer.from(JSON.stringify(qrData)).toString('base64');
  }

  /**
   * Crea un nuevo carnet de identificacion
   * @param tenantId - ID del tenant
   * @param createIdCardDto - Datos del carnet a crear
   * @returns Carnet creado
   */
  async create(tenantId: string, createIdCardDto: CreateIdCardDto) {
    this.logger.log(`Creating new ID card for tenant ${tenantId}`);

    // Verificar que no exista un carnet activo para este usuario
    const existingCard = await this.prisma.iDCard.findFirst({
      where: {
        tenantId,
        usuarioId: createIdCardDto.usuarioId,
        estado: { in: [CardStatus.ACTIVO] },
      },
    });

    if (existingCard) {
      throw new ConflictException(
        `El usuario ya tiene un carnet activo (${existingCard.numeroCarnet}). ` +
        'Debe bloquearlo o esperar a que venza antes de crear uno nuevo.',
      );
    }

    // Validar fechas
    const fechaEmision = new Date(createIdCardDto.fechaEmision);
    const fechaVencimiento = new Date(createIdCardDto.fechaVencimiento);

    if (fechaVencimiento <= fechaEmision) {
      throw new BadRequestException(
        'La fecha de vencimiento debe ser posterior a la fecha de emision',
      );
    }

    // Generar numero de carnet unico
    const numeroCarnet = await this.generateCardNumber(tenantId);

    try {
      const idCard = await this.prisma.iDCard.create({
        data: {
          tenantId,
          usuarioId: createIdCardDto.usuarioId,
          nombre: createIdCardDto.nombre,
          identificacion: createIdCardDto.identificacion,
          tipoUsuario: createIdCardDto.tipoUsuario,
          numeroCarnet,
          fechaEmision,
          fechaVencimiento,
          estado: createIdCardDto.estado || CardStatus.ACTIVO,
          fotoUrl: createIdCardDto.fotoUrl,
          qrCode: '', // Se genera despues
        },
      });

      // Generar y actualizar el codigo QR
      const qrCode = this.generateQRData(idCard.id, numeroCarnet, tenantId);

      const updatedCard = await this.prisma.iDCard.update({
        where: { id: idCard.id },
        data: { qrCode },
      });

      this.logger.log(`ID card created successfully with number: ${numeroCarnet}`);
      return updatedCard;
    } catch (error) {
      this.logger.error(`Error creating ID card: ${error.message}`);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Ya existe un carnet con ese numero');
        }
      }
      throw error;
    }
  }

  /**
   * Lista todos los carnets con filtros y paginacion
   * @param tenantId - ID del tenant
   * @param query - Parametros de consulta
   * @returns Lista paginada de carnets
   */
  async findAll(tenantId: string, query: QueryIdCardsDto) {
    const {
      page = 1,
      limit = 20,
      tipoUsuario,
      estado,
      search,
      vencidos,
      porVencer,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    // Construir condiciones de filtrado
    const where: Prisma.IDCardWhereInput = { tenantId };

    if (tipoUsuario) {
      where.tipoUsuario = tipoUsuario;
    }

    if (estado) {
      where.estado = estado;
    }

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { identificacion: { contains: search, mode: 'insensitive' } },
        { numeroCarnet: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (vencidos) {
      where.fechaVencimiento = { lt: today };
    }

    if (porVencer) {
      where.fechaVencimiento = {
        gte: today,
        lte: thirtyDaysFromNow,
      };
      where.estado = CardStatus.ACTIVO;
    }

    // Validar campo de ordenamiento
    const validSortFields = [
      'createdAt',
      'updatedAt',
      'nombre',
      'numeroCarnet',
      'fechaEmision',
      'fechaVencimiento',
      'tipoUsuario',
      'estado',
    ];

    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderBy: Prisma.IDCardOrderByWithRelationInput = {
      [orderByField]: sortOrder,
    };

    const [cards, total] = await Promise.all([
      this.prisma.iDCard.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.iDCard.count({ where }),
    ]);

    // Agregar informacion de vencimiento
    const cardsWithInfo = cards.map((card) => {
      const diasParaVencer = Math.ceil(
        (card.fechaVencimiento.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

      return {
        ...card,
        diasParaVencer,
        estaVencido: diasParaVencer < 0,
        estaPorVencer: diasParaVencer >= 0 && diasParaVencer <= 30,
      };
    });

    return {
      data: cardsWithInfo,
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
   * Obtiene un carnet por su ID
   * @param id - ID del carnet
   * @param tenantId - ID del tenant
   * @returns Carnet encontrado
   */
  async findOne(id: string, tenantId: string) {
    const card = await this.prisma.iDCard.findFirst({
      where: { id, tenantId },
    });

    if (!card) {
      throw new NotFoundException(`Carnet con ID ${id} no encontrado`);
    }

    const today = new Date();
    const diasParaVencer = Math.ceil(
      (card.fechaVencimiento.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    return {
      ...card,
      diasParaVencer,
      estaVencido: diasParaVencer < 0,
      estaPorVencer: diasParaVencer >= 0 && diasParaVencer <= 30,
    };
  }

  /**
   * Obtiene un carnet por su numero
   * @param numeroCarnet - Numero del carnet
   * @param tenantId - ID del tenant
   * @returns Carnet encontrado
   */
  async findByNumber(numeroCarnet: string, tenantId: string) {
    const card = await this.prisma.iDCard.findFirst({
      where: { numeroCarnet, tenantId },
    });

    if (!card) {
      throw new NotFoundException(`Carnet ${numeroCarnet} no encontrado`);
    }

    return this.findOne(card.id, tenantId);
  }

  /**
   * Actualiza un carnet existente
   * @param id - ID del carnet
   * @param tenantId - ID del tenant
   * @param updateIdCardDto - Datos a actualizar
   * @returns Carnet actualizado
   */
  async update(id: string, tenantId: string, updateIdCardDto: UpdateIdCardDto) {
    const existingCard = await this.prisma.iDCard.findFirst({
      where: { id, tenantId },
    });

    if (!existingCard) {
      throw new NotFoundException(`Carnet con ID ${id} no encontrado`);
    }

    // No permitir modificar carnets bloqueados o perdidos directamente
    if (
      existingCard.estado === CardStatus.BLOQUEADO ||
      existingCard.estado === CardStatus.PERDIDO
    ) {
      throw new BadRequestException(
        `No se puede modificar un carnet en estado ${existingCard.estado}`,
      );
    }

    // Validar fechas si se proporcionan
    if (updateIdCardDto.fechaEmision || updateIdCardDto.fechaVencimiento) {
      const fechaEmision = updateIdCardDto.fechaEmision
        ? new Date(updateIdCardDto.fechaEmision)
        : existingCard.fechaEmision;
      const fechaVencimiento = updateIdCardDto.fechaVencimiento
        ? new Date(updateIdCardDto.fechaVencimiento)
        : existingCard.fechaVencimiento;

      if (fechaVencimiento <= fechaEmision) {
        throw new BadRequestException(
          'La fecha de vencimiento debe ser posterior a la fecha de emision',
        );
      }
    }

    const updateData: Prisma.IDCardUpdateInput = {};

    if (updateIdCardDto.nombre !== undefined) updateData.nombre = updateIdCardDto.nombre;
    if (updateIdCardDto.identificacion !== undefined)
      updateData.identificacion = updateIdCardDto.identificacion;
    if (updateIdCardDto.tipoUsuario !== undefined)
      updateData.tipoUsuario = updateIdCardDto.tipoUsuario;
    if (updateIdCardDto.fechaEmision !== undefined)
      updateData.fechaEmision = new Date(updateIdCardDto.fechaEmision);
    if (updateIdCardDto.fechaVencimiento !== undefined)
      updateData.fechaVencimiento = new Date(updateIdCardDto.fechaVencimiento);
    if (updateIdCardDto.fotoUrl !== undefined) updateData.fotoUrl = updateIdCardDto.fotoUrl;
    if (updateIdCardDto.estado !== undefined) updateData.estado = updateIdCardDto.estado;

    try {
      const updatedCard = await this.prisma.iDCard.update({
        where: { id },
        data: updateData,
      });

      this.logger.log(`ID card ${id} updated successfully`);
      return updatedCard;
    } catch (error) {
      this.logger.error(`Error updating ID card ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Elimina un carnet
   * @param id - ID del carnet
   * @param tenantId - ID del tenant
   * @returns Mensaje de confirmacion
   */
  async remove(id: string, tenantId: string) {
    const card = await this.prisma.iDCard.findFirst({
      where: { id, tenantId },
    });

    if (!card) {
      throw new NotFoundException(`Carnet con ID ${id} no encontrado`);
    }

    await this.prisma.iDCard.delete({ where: { id } });

    this.logger.log(`ID card ${id} deleted successfully`);

    return {
      message: 'Carnet eliminado exitosamente',
      deletedCard: {
        id: card.id,
        numeroCarnet: card.numeroCarnet,
        nombre: card.nombre,
      },
    };
  }

  // =============================================
  // OPERACIONES ESPECIALES
  // =============================================

  /**
   * Renueva un carnet existente
   * @param id - ID del carnet a renovar
   * @param tenantId - ID del tenant
   * @param renewDto - Datos de renovacion
   * @returns Carnet renovado
   */
  async renewCard(id: string, tenantId: string, renewDto: RenewIdCardDto) {
    const existingCard = await this.prisma.iDCard.findFirst({
      where: { id, tenantId },
    });

    if (!existingCard) {
      throw new NotFoundException(`Carnet con ID ${id} no encontrado`);
    }

    if (existingCard.estado === CardStatus.BLOQUEADO) {
      throw new BadRequestException(
        'No se puede renovar un carnet bloqueado',
      );
    }

    const nuevaFechaVencimiento = new Date(renewDto.fechaVencimiento);
    const today = new Date();

    if (nuevaFechaVencimiento <= today) {
      throw new BadRequestException(
        'La nueva fecha de vencimiento debe ser futura',
      );
    }

    // Generar nuevo QR para la renovacion
    const nuevoQR = this.generateQRData(
      existingCard.id,
      existingCard.numeroCarnet,
      tenantId,
    );

    const updateData: Prisma.IDCardUpdateInput = {
      fechaVencimiento: nuevaFechaVencimiento,
      estado: CardStatus.ACTIVO,
      qrCode: nuevoQR,
    };

    if (renewDto.nuevaFoto) {
      updateData.fotoUrl = renewDto.nuevaFoto;
    }

    const renewedCard = await this.prisma.iDCard.update({
      where: { id },
      data: updateData,
    });

    this.logger.log(`ID card ${existingCard.numeroCarnet} renewed successfully`);

    return {
      ...renewedCard,
      mensaje: 'Carnet renovado exitosamente',
      motivoRenovacion: renewDto.motivo,
    };
  }

  /**
   * Bloquea un carnet
   * @param id - ID del carnet
   * @param tenantId - ID del tenant
   * @param blockDto - Datos del bloqueo
   * @returns Carnet bloqueado
   */
  async blockCard(id: string, tenantId: string, blockDto: BlockIdCardDto) {
    const card = await this.prisma.iDCard.findFirst({
      where: { id, tenantId },
    });

    if (!card) {
      throw new NotFoundException(`Carnet con ID ${id} no encontrado`);
    }

    if (card.estado === CardStatus.BLOQUEADO) {
      throw new BadRequestException('El carnet ya esta bloqueado');
    }

    const blockedCard = await this.prisma.iDCard.update({
      where: { id },
      data: { estado: CardStatus.BLOQUEADO },
    });

    this.logger.log(`ID card ${card.numeroCarnet} blocked. Reason: ${blockDto.motivo}`);

    return {
      ...blockedCard,
      mensaje: 'Carnet bloqueado exitosamente',
      motivoBloqueo: blockDto.motivo,
    };
  }

  /**
   * Desbloquea un carnet
   * @param id - ID del carnet
   * @param tenantId - ID del tenant
   * @returns Carnet desbloqueado
   */
  async unblockCard(id: string, tenantId: string) {
    const card = await this.prisma.iDCard.findFirst({
      where: { id, tenantId },
    });

    if (!card) {
      throw new NotFoundException(`Carnet con ID ${id} no encontrado`);
    }

    if (card.estado !== CardStatus.BLOQUEADO) {
      throw new BadRequestException(
        `El carnet no esta bloqueado. Estado actual: ${card.estado}`,
      );
    }

    // Verificar si esta vencido
    const today = new Date();
    const nuevoEstado =
      card.fechaVencimiento < today ? CardStatus.VENCIDO : CardStatus.ACTIVO;

    const unblockedCard = await this.prisma.iDCard.update({
      where: { id },
      data: { estado: nuevoEstado },
    });

    this.logger.log(`ID card ${card.numeroCarnet} unblocked. New status: ${nuevoEstado}`);

    return {
      ...unblockedCard,
      mensaje: `Carnet desbloqueado exitosamente. Nuevo estado: ${nuevoEstado}`,
    };
  }

  /**
   * Reporta un carnet como perdido
   * @param id - ID del carnet
   * @param tenantId - ID del tenant
   * @returns Carnet marcado como perdido
   */
  async reportLost(id: string, tenantId: string) {
    const card = await this.prisma.iDCard.findFirst({
      where: { id, tenantId },
    });

    if (!card) {
      throw new NotFoundException(`Carnet con ID ${id} no encontrado`);
    }

    if (card.estado === CardStatus.PERDIDO) {
      throw new BadRequestException('El carnet ya esta reportado como perdido');
    }

    const lostCard = await this.prisma.iDCard.update({
      where: { id },
      data: { estado: CardStatus.PERDIDO },
    });

    this.logger.log(`ID card ${card.numeroCarnet} reported as lost`);

    return {
      ...lostCard,
      mensaje: 'Carnet reportado como perdido exitosamente',
    };
  }

  /**
   * Genera o regenera el codigo QR de un carnet
   * @param id - ID del carnet
   * @param tenantId - ID del tenant
   * @returns Datos del QR generado
   */
  async generateQR(id: string, tenantId: string) {
    const card = await this.prisma.iDCard.findFirst({
      where: { id, tenantId },
    });

    if (!card) {
      throw new NotFoundException(`Carnet con ID ${id} no encontrado`);
    }

    const qrCode = this.generateQRData(card.id, card.numeroCarnet, tenantId);

    const updatedCard = await this.prisma.iDCard.update({
      where: { id },
      data: { qrCode },
    });

    return {
      id: updatedCard.id,
      numeroCarnet: updatedCard.numeroCarnet,
      qrCode: updatedCard.qrCode,
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCode)}`,
      mensaje: 'Codigo QR generado exitosamente',
    };
  }

  /**
   * Verifica un carnet por su codigo QR
   * @param qrData - Datos del codigo QR
   * @param tenantId - ID del tenant
   * @returns Estado de verificacion
   */
  async verifyCard(qrData: string, tenantId: string) {
    try {
      const decodedData = JSON.parse(
        Buffer.from(qrData, 'base64').toString('utf-8'),
      );

      if (decodedData.type !== 'virtualuni_idcard') {
        return {
          valid: false,
          mensaje: 'Codigo QR no valido',
        };
      }

      const card = await this.prisma.iDCard.findFirst({
        where: {
          id: decodedData.cardId,
          tenantId,
          numeroCarnet: decodedData.cardNumber,
        },
      });

      if (!card) {
        return {
          valid: false,
          mensaje: 'Carnet no encontrado en el sistema',
        };
      }

      const today = new Date();
      const estaVencido = card.fechaVencimiento < today;

      if (card.estado !== CardStatus.ACTIVO) {
        return {
          valid: false,
          mensaje: `Carnet no valido. Estado: ${card.estado}`,
          carnet: {
            numeroCarnet: card.numeroCarnet,
            nombre: card.nombre,
            estado: card.estado,
          },
        };
      }

      if (estaVencido) {
        return {
          valid: false,
          mensaje: 'Carnet vencido',
          carnet: {
            numeroCarnet: card.numeroCarnet,
            nombre: card.nombre,
            fechaVencimiento: card.fechaVencimiento,
          },
        };
      }

      return {
        valid: true,
        mensaje: 'Carnet valido',
        carnet: {
          numeroCarnet: card.numeroCarnet,
          nombre: card.nombre,
          identificacion: card.identificacion,
          tipoUsuario: card.tipoUsuario,
          fechaVencimiento: card.fechaVencimiento,
          fotoUrl: card.fotoUrl,
        },
      };
    } catch {
      return {
        valid: false,
        mensaje: 'Codigo QR invalido o corrupto',
      };
    }
  }

  // =============================================
  // ESTADISTICAS
  // =============================================

  /**
   * Obtiene estadisticas de carnets
   * @param tenantId - ID del tenant
   * @returns Estadisticas completas
   */
  async getStats(tenantId: string): Promise<IdCardStats> {
    const cards = await this.prisma.iDCard.findMany({
      where: { tenantId },
    });

    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const totalCarnets = cards.length;

    if (totalCarnets === 0) {
      return {
        totalCarnets: 0,
        porEstado: {
          ACTIVO: 0,
          VENCIDO: 0,
          BLOQUEADO: 0,
          PERDIDO: 0,
        },
        porTipoUsuario: {
          ESTUDIANTE: 0,
          DOCENTE: 0,
          ADMINISTRATIVO: 0,
        },
        carnetsVencidos: 0,
        carnetsPorVencer: 0,
        carnetsEmitidosEsteMes: 0,
      };
    }

    // Contar por estado
    const porEstado: Record<CardStatus, number> = {
      ACTIVO: 0,
      VENCIDO: 0,
      BLOQUEADO: 0,
      PERDIDO: 0,
    };
    cards.forEach((card) => porEstado[card.estado]++);

    // Contar por tipo de usuario
    const porTipoUsuario: Record<UserCardType, number> = {
      ESTUDIANTE: 0,
      DOCENTE: 0,
      ADMINISTRATIVO: 0,
    };
    cards.forEach((card) => porTipoUsuario[card.tipoUsuario]++);

    // Carnets vencidos (fecha < hoy)
    const carnetsVencidos = cards.filter(
      (card) => card.fechaVencimiento < today,
    ).length;

    // Carnets por vencer (proximos 30 dias, activos)
    const carnetsPorVencer = cards.filter(
      (card) =>
        card.estado === CardStatus.ACTIVO &&
        card.fechaVencimiento >= today &&
        card.fechaVencimiento <= thirtyDaysFromNow,
    ).length;

    // Carnets emitidos este mes
    const carnetsEmitidosEsteMes = cards.filter(
      (card) => card.fechaEmision >= startOfMonth,
    ).length;

    return {
      totalCarnets,
      porEstado,
      porTipoUsuario,
      carnetsVencidos,
      carnetsPorVencer,
      carnetsEmitidosEsteMes,
    };
  }

  /**
   * Obtiene los carnets de un usuario
   * @param usuarioId - ID del usuario
   * @param tenantId - ID del tenant
   * @returns Lista de carnets del usuario
   */
  async getCardsByUser(usuarioId: string, tenantId: string) {
    const cards = await this.prisma.iDCard.findMany({
      where: { usuarioId, tenantId },
      orderBy: { fechaEmision: 'desc' },
    });

    return {
      usuarioId,
      totalCarnets: cards.length,
      carnetActivo: cards.find((c) => c.estado === CardStatus.ACTIVO) || null,
      historial: cards,
    };
  }

  /**
   * Prepara datos de un carnet para exportacion/impresion
   * @param id - ID del carnet
   * @param tenantId - ID del tenant
   * @returns Datos para exportacion
   */
  async exportCardData(id: string, tenantId: string): Promise<IdCardExportData> {
    const card = await this.findOne(id, tenantId);

    return {
      id: card.id,
      numeroCarnet: card.numeroCarnet,
      nombre: card.nombre,
      identificacion: card.identificacion,
      tipoUsuario: card.tipoUsuario,
      fechaEmision: card.fechaEmision.toISOString(),
      fechaVencimiento: card.fechaVencimiento.toISOString(),
      estado: card.estado,
      fotoUrl: card.fotoUrl,
      qrCode: card.qrCode || '',
    };
  }
}
