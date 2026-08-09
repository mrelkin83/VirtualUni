import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import {
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  CreateInventoryMovementDto,
  QueryInventoryDto,
  QueryInventoryMovementsDto,
  AdjustStockDto,
  AdjustmentType,
} from './dto';
import { InventoryStatus, MovementType, Prisma } from '@prisma/client';

/**
 * Interfaz para las estadisticas de inventario
 */
export interface InventoryStats {
  totalItems: number;
  valorTotalInventario: number;
  itemsAgotados: number;
  itemsBajoStock: number;
  itemsDisponibles: number;
  itemsDescontinuados: number;
  categorias: number;
  proveedores: number;
  porCategoria: Record<string, CategoryStats>;
  movimientosRecientes: number;
}

/**
 * Interfaz para estadisticas por categoria
 */
interface CategoryStats {
  items: number;
  cantidad: number;
  valorTotal: number;
}

/**
 * Servicio para la gestion de inventario
 * Maneja operaciones CRUD para items y movimientos de inventario
 * Incluye ajustes de stock y estadisticas
 */
@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================
  // GENERACION DE CODIGO
  // ============================================

  /**
   * Genera un codigo unico para el item en formato INV-YYYY-XXX
   * @param tenantId - ID del tenant
   * @returns Codigo generado
   */
  private async generateItemCode(tenantId: string): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `INV-${currentYear}-`;

    // Buscar el ultimo codigo del ano actual para este tenant
    const lastItem = await this.prisma.inventoryItem.findFirst({
      where: {
        tenantId,
        codigo: { startsWith: prefix },
      },
      orderBy: { codigo: 'desc' },
      select: { codigo: true },
    });

    let sequenceNumber = 1;

    if (lastItem) {
      // Extraer el numero secuencial del ultimo codigo
      const lastSequence = parseInt(lastItem.codigo.replace(prefix, ''), 10);
      if (!isNaN(lastSequence)) {
        sequenceNumber = lastSequence + 1;
      }
    }

    // Formatear con ceros a la izquierda (3 digitos)
    const formattedSequence = sequenceNumber.toString().padStart(3, '0');
    return `${prefix}${formattedSequence}`;
  }

  // ============================================
  // CALCULO DE ESTADO
  // ============================================

  /**
   * Calcula el estado del inventario basado en la cantidad
   * @param cantidad - Cantidad actual
   * @param cantidadMinima - Cantidad minima requerida
   * @param estadoActual - Estado actual (para preservar DESCONTINUADO)
   * @returns Estado calculado
   */
  private calculateInventoryStatus(
    cantidad: number,
    cantidadMinima: number,
    estadoActual?: InventoryStatus,
  ): InventoryStatus {
    // Preservar estado DESCONTINUADO si ya esta asi
    if (estadoActual === InventoryStatus.DESCONTINUADO) {
      return InventoryStatus.DESCONTINUADO;
    }

    if (cantidad === 0) {
      return InventoryStatus.AGOTADO;
    }

    if (cantidad > 0 && cantidad < cantidadMinima) {
      return InventoryStatus.BAJO;
    }

    return InventoryStatus.DISPONIBLE;
  }

  // ============================================
  // CRUD DE ITEMS DE INVENTARIO
  // ============================================

  /**
   * Crea un nuevo item de inventario
   * @param tenantId - ID del tenant
   * @param createDto - Datos del item a crear
   * @returns Item creado
   */
  async createItem(tenantId: string, createDto: CreateInventoryItemDto) {
    this.logger.log(`Creating inventory item for tenant ${tenantId}`);

    // Generar codigo si no se proporciona
    const codigo = createDto.codigo || (await this.generateItemCode(tenantId));

    // Verificar que el codigo no exista para este tenant
    const existingItem = await this.prisma.inventoryItem.findFirst({
      where: { tenantId, codigo },
    });

    if (existingItem) {
      throw new ConflictException(`Ya existe un item con el codigo ${codigo}`);
    }

    // Calcular estado si no se proporciona
    const estado =
      createDto.estado ||
      this.calculateInventoryStatus(createDto.cantidad, createDto.cantidadMinima);

    try {
      const item = await this.prisma.inventoryItem.create({
        data: {
          tenantId,
          codigo,
          nombre: createDto.nombre,
          categoria: createDto.categoria,
          cantidad: createDto.cantidad,
          cantidadMinima: createDto.cantidadMinima,
          unidadMedida: createDto.unidadMedida,
          precioUnitario: createDto.precioUnitario,
          ubicacion: createDto.ubicacion,
          proveedor: createDto.proveedor,
          fechaUltimaCompra: new Date(createDto.fechaUltimaCompra),
          estado,
        },
      });

      this.logger.log(`Inventory item created successfully with ID: ${item.id}`);
      return item;
    } catch (error) {
      this.logger.error(`Error creating inventory item: ${error.message}`);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Ya existe un item con ese codigo');
        }
      }
      throw error;
    }
  }

  /**
   * Lista todos los items con filtros y paginacion
   * @param tenantId - ID del tenant
   * @param query - Parametros de consulta
   * @returns Lista paginada de items
   */
  async findAllItems(tenantId: string, query: QueryInventoryDto) {
    const {
      page = 1,
      limit = 20,
      categoria,
      estado,
      proveedor,
      ubicacion,
      search,
      precioMin,
      precioMax,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    // Construir condiciones de filtrado
    const where: Prisma.InventoryItemWhereInput = { tenantId };

    // Filtros con busqueda parcial
    if (categoria) {
      where.categoria = { contains: categoria, mode: 'insensitive' };
    }

    if (estado) {
      where.estado = estado;
    }

    if (proveedor) {
      where.proveedor = { contains: proveedor, mode: 'insensitive' };
    }

    if (ubicacion) {
      where.ubicacion = { contains: ubicacion, mode: 'insensitive' };
    }

    // Filtro por rango de precio
    if (precioMin !== undefined || precioMax !== undefined) {
      where.precioUnitario = {};
      if (precioMin !== undefined) {
        where.precioUnitario.gte = precioMin;
      }
      if (precioMax !== undefined) {
        where.precioUnitario.lte = precioMax;
      }
    }

    // Busqueda general
    if (search) {
      where.OR = [
        { codigo: { contains: search, mode: 'insensitive' } },
        { nombre: { contains: search, mode: 'insensitive' } },
        { categoria: { contains: search, mode: 'insensitive' } },
        { proveedor: { contains: search, mode: 'insensitive' } },
        { ubicacion: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Validar campo de ordenamiento
    const validSortFields = [
      'createdAt',
      'updatedAt',
      'nombre',
      'codigo',
      'cantidad',
      'precioUnitario',
      'fechaUltimaCompra',
      'categoria',
      'estado',
    ];

    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderBy: Prisma.InventoryItemOrderByWithRelationInput = {
      [orderByField]: sortOrder,
    };

    // Ejecutar consultas en paralelo
    const [items, total] = await Promise.all([
      this.prisma.inventoryItem.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          _count: {
            select: { movements: true },
          },
        },
      }),
      this.prisma.inventoryItem.count({ where }),
    ]);

    // Agregar valor total por item
    const itemsWithValue = items.map((item) => ({
      ...item,
      valorTotal: item.cantidad * item.precioUnitario,
    }));

    return {
      data: itemsWithValue,
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
   * Obtiene un item por su ID
   * @param id - ID del item
   * @param tenantId - ID del tenant
   * @returns Item encontrado
   */
  async findOneItem(id: string, tenantId: string) {
    const item = await this.prisma.inventoryItem.findFirst({
      where: { id, tenantId },
      include: {
        movements: {
          orderBy: { fecha: 'desc' },
          take: 10, // Ultimos 10 movimientos
        },
        _count: {
          select: { movements: true },
        },
      },
    });

    if (!item) {
      throw new NotFoundException(`Item de inventario con ID ${id} no encontrado`);
    }

    return {
      ...item,
      valorTotal: item.cantidad * item.precioUnitario,
      diasDesdeUltimaCompra: Math.floor(
        (new Date().getTime() - item.fechaUltimaCompra.getTime()) / (1000 * 60 * 60 * 24),
      ),
    };
  }

  /**
   * Actualiza un item de inventario existente
   * @param id - ID del item
   * @param tenantId - ID del tenant
   * @param updateDto - Datos a actualizar
   * @returns Item actualizado
   */
  async updateItem(id: string, tenantId: string, updateDto: UpdateInventoryItemDto) {
    const existingItem = await this.prisma.inventoryItem.findFirst({
      where: { id, tenantId },
    });

    if (!existingItem) {
      throw new NotFoundException(`Item de inventario con ID ${id} no encontrado`);
    }

    // Si se cambia el codigo, verificar que no exista
    if (updateDto.codigo && updateDto.codigo !== existingItem.codigo) {
      const codeExists = await this.prisma.inventoryItem.findFirst({
        where: {
          tenantId,
          codigo: updateDto.codigo,
          id: { not: id },
        },
      });

      if (codeExists) {
        throw new ConflictException(
          `Ya existe un item con el codigo ${updateDto.codigo}`,
        );
      }
    }

    // Preparar datos para actualizar
    const updateData: Prisma.InventoryItemUpdateInput = {};

    if (updateDto.codigo !== undefined) updateData.codigo = updateDto.codigo;
    if (updateDto.nombre !== undefined) updateData.nombre = updateDto.nombre;
    if (updateDto.categoria !== undefined) updateData.categoria = updateDto.categoria;
    if (updateDto.cantidad !== undefined) updateData.cantidad = updateDto.cantidad;
    if (updateDto.cantidadMinima !== undefined) updateData.cantidadMinima = updateDto.cantidadMinima;
    if (updateDto.unidadMedida !== undefined) updateData.unidadMedida = updateDto.unidadMedida;
    if (updateDto.precioUnitario !== undefined) updateData.precioUnitario = updateDto.precioUnitario;
    if (updateDto.ubicacion !== undefined) updateData.ubicacion = updateDto.ubicacion;
    if (updateDto.proveedor !== undefined) updateData.proveedor = updateDto.proveedor;
    if (updateDto.fechaUltimaCompra !== undefined) {
      updateData.fechaUltimaCompra = new Date(updateDto.fechaUltimaCompra);
    }

    // Recalcular estado si cambio la cantidad o cantidad minima
    const newCantidad = updateDto.cantidad ?? existingItem.cantidad;
    const newCantidadMinima = updateDto.cantidadMinima ?? existingItem.cantidadMinima;

    if (updateDto.estado !== undefined) {
      updateData.estado = updateDto.estado;
    } else if (updateDto.cantidad !== undefined || updateDto.cantidadMinima !== undefined) {
      updateData.estado = this.calculateInventoryStatus(
        newCantidad,
        newCantidadMinima,
        existingItem.estado,
      );
    }

    try {
      const updatedItem = await this.prisma.inventoryItem.update({
        where: { id },
        data: updateData,
      });

      this.logger.log(`Inventory item ${id} updated successfully`);
      return updatedItem;
    } catch (error) {
      this.logger.error(`Error updating inventory item ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Elimina un item de inventario
   * @param id - ID del item
   * @param tenantId - ID del tenant
   * @returns Mensaje de confirmacion
   */
  async removeItem(id: string, tenantId: string) {
    const item = await this.prisma.inventoryItem.findFirst({
      where: { id, tenantId },
      include: {
        _count: {
          select: { movements: true },
        },
      },
    });

    if (!item) {
      throw new NotFoundException(`Item de inventario con ID ${id} no encontrado`);
    }

    // Advertir si tiene movimientos
    if (item._count.movements > 0) {
      this.logger.warn(
        `Deleting inventory item ${id} with ${item._count.movements} movements`,
      );
    }

    await this.prisma.inventoryItem.delete({ where: { id } });

    this.logger.log(`Inventory item ${id} deleted successfully`);

    return {
      message: 'Item de inventario eliminado exitosamente',
      deletedItem: {
        id: item.id,
        codigo: item.codigo,
        nombre: item.nombre,
      },
    };
  }

  // ============================================
  // CRUD DE MOVIMIENTOS
  // ============================================

  /**
   * Registra un nuevo movimiento de inventario
   * Actualiza automaticamente la cantidad del item
   * @param tenantId - ID del tenant
   * @param createDto - Datos del movimiento
   * @returns Movimiento creado y item actualizado
   */
  async createMovement(tenantId: string, createDto: CreateInventoryMovementDto) {
    this.logger.log(`Creating inventory movement for tenant ${tenantId}`);

    // Verificar que el item existe
    const item = await this.prisma.inventoryItem.findFirst({
      where: { id: createDto.itemId, tenantId },
    });

    if (!item) {
      throw new NotFoundException(`Item de inventario con ID ${createDto.itemId} no encontrado`);
    }

    // Calcular nueva cantidad
    let newCantidad: number;

    switch (createDto.tipo) {
      case MovementType.ENTRADA:
        newCantidad = item.cantidad + createDto.cantidad;
        break;

      case MovementType.SALIDA:
        // Validar que hay suficiente stock
        if (createDto.cantidad > item.cantidad) {
          throw new BadRequestException(
            `No hay suficiente stock. Disponible: ${item.cantidad}, Solicitado: ${createDto.cantidad}`,
          );
        }
        newCantidad = item.cantidad - createDto.cantidad;
        break;

      case MovementType.AJUSTE:
        // En ajuste, la cantidad puede ser positiva o negativa relativa al actual
        // Pero usamos el valor absoluto como nuevo stock
        newCantidad = createDto.cantidad;
        break;

      default:
        throw new BadRequestException('Tipo de movimiento no valido');
    }

    // Calcular nuevo estado
    const newEstado = this.calculateInventoryStatus(newCantidad, item.cantidadMinima, item.estado);

    // Crear movimiento y actualizar item en una transaccion
    const result = await this.prisma.$transaction(async (tx) => {
      // Crear el movimiento
      const movement = await tx.inventoryMovement.create({
        data: {
          tenantId,
          itemId: createDto.itemId,
          tipo: createDto.tipo,
          cantidad: createDto.cantidad,
          motivo: createDto.motivo,
          responsable: createDto.responsable,
          fecha: createDto.fecha ? new Date(createDto.fecha) : new Date(),
        },
      });

      // Actualizar el item
      const updatedItem = await tx.inventoryItem.update({
        where: { id: createDto.itemId },
        data: {
          cantidad: newCantidad,
          estado: newEstado,
          // Actualizar fecha de ultima compra si es entrada
          ...(createDto.tipo === MovementType.ENTRADA && {
            fechaUltimaCompra: new Date(),
          }),
        },
      });

      return { movement, item: updatedItem };
    });

    this.logger.log(`Movement created successfully. Item ${item.codigo}: ${item.cantidad} -> ${newCantidad}`);

    return {
      message: 'Movimiento registrado exitosamente',
      movement: result.movement,
      item: {
        id: result.item.id,
        codigo: result.item.codigo,
        nombre: result.item.nombre,
        cantidadAnterior: item.cantidad,
        cantidadNueva: result.item.cantidad,
        estadoAnterior: item.estado,
        estadoNuevo: result.item.estado,
      },
    };
  }

  /**
   * Lista todos los movimientos con filtros y paginacion
   * @param tenantId - ID del tenant
   * @param query - Parametros de consulta
   * @returns Lista paginada de movimientos
   */
  async findAllMovements(tenantId: string, query: QueryInventoryMovementsDto) {
    const {
      page = 1,
      limit = 20,
      itemId,
      tipo,
      responsable,
      fechaInicio,
      fechaFin,
      sortBy = 'fecha',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    // Construir condiciones de filtrado
    const where: Prisma.InventoryMovementWhereInput = { tenantId };

    if (itemId) {
      where.itemId = itemId;
    }

    if (tipo) {
      where.tipo = tipo as MovementType;
    }

    if (responsable) {
      where.responsable = { contains: responsable, mode: 'insensitive' };
    }

    // Filtro por rango de fechas
    if (fechaInicio || fechaFin) {
      where.fecha = {};
      if (fechaInicio) {
        where.fecha.gte = new Date(fechaInicio);
      }
      if (fechaFin) {
        where.fecha.lte = new Date(fechaFin);
      }
    }

    // Validar campo de ordenamiento
    const validSortFields = ['createdAt', 'fecha', 'cantidad', 'tipo'];
    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'fecha';
    const orderBy: Prisma.InventoryMovementOrderByWithRelationInput = {
      [orderByField]: sortOrder,
    };

    const [movements, total] = await Promise.all([
      this.prisma.inventoryMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          item: {
            select: {
              id: true,
              codigo: true,
              nombre: true,
              categoria: true,
              unidadMedida: true,
            },
          },
        },
      }),
      this.prisma.inventoryMovement.count({ where }),
    ]);

    return {
      data: movements,
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
   * Obtiene un movimiento por su ID
   * @param id - ID del movimiento
   * @param tenantId - ID del tenant
   * @returns Movimiento encontrado
   */
  async findOneMovement(id: string, tenantId: string) {
    const movement = await this.prisma.inventoryMovement.findFirst({
      where: { id, tenantId },
      include: {
        item: true,
      },
    });

    if (!movement) {
      throw new NotFoundException(`Movimiento con ID ${id} no encontrado`);
    }

    return movement;
  }

  // ============================================
  // AJUSTE DE STOCK SIMPLIFICADO
  // ============================================

  /**
   * Ajusta el stock de un item de forma sencilla
   * @param itemId - ID del item
   * @param tenantId - ID del tenant
   * @param adjustDto - Datos del ajuste
   * @returns Item actualizado con el movimiento creado
   */
  async adjustStock(itemId: string, tenantId: string, adjustDto: AdjustStockDto) {
    this.logger.log(`Adjusting stock for item ${itemId}`);

    // Verificar que el item existe
    const item = await this.prisma.inventoryItem.findFirst({
      where: { id: itemId, tenantId },
    });

    if (!item) {
      throw new NotFoundException(`Item de inventario con ID ${itemId} no encontrado`);
    }

    let movementCantidad: number;
    let newCantidad: number;

    switch (adjustDto.tipo) {
      case AdjustmentType.AGREGAR:
        movementCantidad = adjustDto.cantidad;
        newCantidad = item.cantidad + adjustDto.cantidad;
        break;

      case AdjustmentType.REDUCIR:
        if (adjustDto.cantidad > item.cantidad) {
          throw new BadRequestException(
            `No se puede reducir mas de lo disponible. Disponible: ${item.cantidad}`,
          );
        }
        movementCantidad = adjustDto.cantidad;
        newCantidad = item.cantidad - adjustDto.cantidad;
        break;

      case AdjustmentType.ESTABLECER:
        movementCantidad = Math.abs(adjustDto.cantidad - item.cantidad);
        newCantidad = adjustDto.cantidad;
        break;

      default:
        throw new BadRequestException('Tipo de ajuste no valido');
    }

    // Calcular nuevo estado
    const newEstado = this.calculateInventoryStatus(newCantidad, item.cantidadMinima, item.estado);

    // Determinar el motivo completo para el movimiento
    const motivoCompleto = `[${adjustDto.tipo}] ${adjustDto.motivo} (Anterior: ${item.cantidad}, Nuevo: ${newCantidad})`;

    // Crear movimiento y actualizar item en una transaccion
    const result = await this.prisma.$transaction(async (tx) => {
      // Crear el movimiento de ajuste
      const movement = await tx.inventoryMovement.create({
        data: {
          tenantId,
          itemId,
          tipo: MovementType.AJUSTE,
          cantidad: movementCantidad,
          motivo: motivoCompleto,
          responsable: adjustDto.responsable,
          fecha: new Date(),
        },
      });

      // Actualizar el item
      const updatedItem = await tx.inventoryItem.update({
        where: { id: itemId },
        data: {
          cantidad: newCantidad,
          estado: newEstado,
        },
      });

      return { movement, item: updatedItem };
    });

    this.logger.log(`Stock adjusted for item ${item.codigo}: ${item.cantidad} -> ${newCantidad}`);

    return {
      message: 'Stock ajustado exitosamente',
      item: {
        id: result.item.id,
        codigo: result.item.codigo,
        nombre: result.item.nombre,
        cantidadAnterior: item.cantidad,
        cantidadNueva: result.item.cantidad,
        estadoAnterior: item.estado,
        estadoNuevo: result.item.estado,
      },
      movement: result.movement,
    };
  }

  // ============================================
  // CONSULTAS ESPECIALIZADAS
  // ============================================

  /**
   * Obtiene items con stock bajo (cantidad < cantidadMinima)
   * @param tenantId - ID del tenant
   * @returns Lista de items con stock bajo o agotado
   */
  async getLowStockItems(tenantId: string) {
    const items = await this.prisma.inventoryItem.findMany({
      where: {
        tenantId,
        estado: { in: [InventoryStatus.BAJO, InventoryStatus.AGOTADO] },
      },
      orderBy: [
        { estado: 'asc' }, // AGOTADO primero
        { cantidad: 'asc' },
      ],
    });

    // Agrupar por estado
    const agotados = items.filter((i) => i.estado === InventoryStatus.AGOTADO);
    const bajoStock = items.filter((i) => i.estado === InventoryStatus.BAJO);

    return {
      total: items.length,
      agotados: {
        count: agotados.length,
        items: agotados,
      },
      bajoStock: {
        count: bajoStock.length,
        items: bajoStock,
      },
    };
  }

  /**
   * Obtiene el historial de movimientos de un item especifico
   * @param itemId - ID del item
   * @param tenantId - ID del tenant
   * @returns Historial de movimientos con estadisticas
   */
  async getItemMovementHistory(itemId: string, tenantId: string) {
    // Verificar que el item existe
    const item = await this.prisma.inventoryItem.findFirst({
      where: { id: itemId, tenantId },
    });

    if (!item) {
      throw new NotFoundException(`Item de inventario con ID ${itemId} no encontrado`);
    }

    const movements = await this.prisma.inventoryMovement.findMany({
      where: { itemId, tenantId },
      orderBy: { fecha: 'desc' },
    });

    // Calcular estadisticas
    const entradas = movements.filter((m) => m.tipo === MovementType.ENTRADA);
    const salidas = movements.filter((m) => m.tipo === MovementType.SALIDA);
    const ajustes = movements.filter((m) => m.tipo === MovementType.AJUSTE);

    const totalEntradas = entradas.reduce((sum, m) => sum + m.cantidad, 0);
    const totalSalidas = salidas.reduce((sum, m) => sum + m.cantidad, 0);

    return {
      item: {
        id: item.id,
        codigo: item.codigo,
        nombre: item.nombre,
        categoria: item.categoria,
        cantidadActual: item.cantidad,
        estado: item.estado,
      },
      estadisticas: {
        totalMovimientos: movements.length,
        entradas: entradas.length,
        salidas: salidas.length,
        ajustes: ajustes.length,
        totalUnidadesEntradas: totalEntradas,
        totalUnidadesSalidas: totalSalidas,
      },
      historial: movements,
    };
  }

  // ============================================
  // ESTADISTICAS
  // ============================================

  /**
   * Obtiene estadisticas completas del inventario
   * @param tenantId - ID del tenant
   * @returns Estadisticas de inventario
   */
  async getInventoryStats(tenantId: string): Promise<InventoryStats> {
    // Obtener todos los items del tenant
    const items = await this.prisma.inventoryItem.findMany({
      where: { tenantId },
    });

    const totalItems = items.length;

    if (totalItems === 0) {
      return {
        totalItems: 0,
        valorTotalInventario: 0,
        itemsAgotados: 0,
        itemsBajoStock: 0,
        itemsDisponibles: 0,
        itemsDescontinuados: 0,
        categorias: 0,
        proveedores: 0,
        porCategoria: {},
        movimientosRecientes: 0,
      };
    }

    // Calcular valor total
    const valorTotalInventario = items.reduce(
      (sum, item) => sum + item.cantidad * item.precioUnitario,
      0,
    );

    // Contar por estado
    const itemsAgotados = items.filter((i) => i.estado === InventoryStatus.AGOTADO).length;
    const itemsBajoStock = items.filter((i) => i.estado === InventoryStatus.BAJO).length;
    const itemsDisponibles = items.filter((i) => i.estado === InventoryStatus.DISPONIBLE).length;
    const itemsDescontinuados = items.filter((i) => i.estado === InventoryStatus.DESCONTINUADO).length;

    // Contar categorias y proveedores unicos
    const categoriasUnicas = new Set(items.map((i) => i.categoria));
    const proveedoresUnicos = new Set(items.map((i) => i.proveedor));

    // Estadisticas por categoria
    const porCategoria: Record<string, CategoryStats> = {};
    for (const item of items) {
      if (!porCategoria[item.categoria]) {
        porCategoria[item.categoria] = {
          items: 0,
          cantidad: 0,
          valorTotal: 0,
        };
      }
      porCategoria[item.categoria].items++;
      porCategoria[item.categoria].cantidad += item.cantidad;
      porCategoria[item.categoria].valorTotal += item.cantidad * item.precioUnitario;
    }

    // Contar movimientos de los ultimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const movimientosRecientes = await this.prisma.inventoryMovement.count({
      where: {
        tenantId,
        fecha: { gte: thirtyDaysAgo },
      },
    });

    return {
      totalItems,
      valorTotalInventario: Math.round(valorTotalInventario * 100) / 100,
      itemsAgotados,
      itemsBajoStock,
      itemsDisponibles,
      itemsDescontinuados,
      categorias: categoriasUnicas.size,
      proveedores: proveedoresUnicos.size,
      porCategoria,
      movimientosRecientes,
    };
  }

  // ============================================
  // UTILIDADES
  // ============================================

  /**
   * Recalcula el estado de todos los items basado en su cantidad actual
   * Util despues de importaciones masivas o correcciones
   * @param tenantId - ID del tenant
   * @returns Numero de items actualizados
   */
  async recalculateAllStates(tenantId: string) {
    const items = await this.prisma.inventoryItem.findMany({
      where: { tenantId },
    });

    let updatedCount = 0;

    for (const item of items) {
      const newEstado = this.calculateInventoryStatus(
        item.cantidad,
        item.cantidadMinima,
        item.estado,
      );

      if (newEstado !== item.estado) {
        await this.prisma.inventoryItem.update({
          where: { id: item.id },
          data: { estado: newEstado },
        });
        updatedCount++;
      }
    }

    this.logger.log(`Recalculated states for ${updatedCount} items`);

    return {
      message: `Estados recalculados para ${updatedCount} items`,
      updatedCount,
    };
  }
}
