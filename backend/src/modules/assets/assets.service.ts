import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateAssetDto, UpdateAssetDto, QueryAssetsDto } from './dto';
import { AssetCategory, AssetStatus, Prisma } from '@prisma/client';

/**
 * Interfaz para las estadisticas de activos
 */
export interface AssetStats {
  totalAssets: number;
  totalValorCompra: number;
  totalValorActual: number;
  depreciacionTotal: number;
  porcentajeDepreciacion: number;
  porEstado: Record<AssetStatus, number>;
  porCategoria: Record<AssetCategory, number>;
  activosRecientes: number;
  valorPromedioPorActivo: number;
}

/**
 * Interfaz para activos agrupados por categoria
 */
export interface AssetsByCategory {
  categoria: AssetCategory;
  count: number;
  valorTotal: number;
  valorActualTotal: number;
  assets: any[];
}

/**
 * Servicio para la gestion de activos
 * Maneja todas las operaciones CRUD y estadisticas
 */
@Injectable()
export class AssetsService {
  private readonly logger = new Logger(AssetsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Genera un codigo unico para el activo en formato ACT-YYYY-XXX
   * @param tenantId - ID del tenant
   * @returns Codigo generado
   */
  private async generateAssetCode(tenantId: string): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `ACT-${currentYear}-`;

    // Buscar el ultimo codigo del ano actual para este tenant
    const lastAsset = await this.prisma.asset.findFirst({
      where: {
        tenantId,
        codigo: { startsWith: prefix },
      },
      orderBy: { codigo: 'desc' },
      select: { codigo: true },
    });

    let sequenceNumber = 1;

    if (lastAsset) {
      // Extraer el numero secuencial del ultimo codigo
      const lastSequence = parseInt(lastAsset.codigo.replace(prefix, ''), 10);
      if (!isNaN(lastSequence)) {
        sequenceNumber = lastSequence + 1;
      }
    }

    // Formatear con ceros a la izquierda (3 digitos)
    const formattedSequence = sequenceNumber.toString().padStart(3, '0');
    return `${prefix}${formattedSequence}`;
  }

  /**
   * Calcula la depreciacion de un activo basado en su fecha de compra
   * Usa el metodo de linea recta con una vida util estimada de 5 anos
   * @param valorCompra - Valor original de compra
   * @param fechaCompra - Fecha de adquisicion
   * @param vidaUtilAnos - Anos de vida util (default: 5)
   * @returns Valor actual depreciado
   */
  private calculateDepreciation(
    valorCompra: number,
    fechaCompra: Date,
    vidaUtilAnos: number = 5,
  ): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - fechaCompra.getTime());
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365);

    // Valor residual del 10%
    const valorResidual = valorCompra * 0.1;
    const depreciacionAnual = (valorCompra - valorResidual) / vidaUtilAnos;
    const depreciacionAcumulada = depreciacionAnual * Math.min(diffYears, vidaUtilAnos);

    const valorActual = valorCompra - depreciacionAcumulada;
    return Math.max(valorActual, valorResidual);
  }

  /**
   * Crea un nuevo activo
   * @param tenantId - ID del tenant
   * @param createAssetDto - Datos del activo a crear
   * @returns Activo creado
   */
  async create(tenantId: string, createAssetDto: CreateAssetDto) {
    this.logger.log(`Creating new asset for tenant ${tenantId}`);

    // Generar codigo si no se proporciona
    const codigo = createAssetDto.codigo || (await this.generateAssetCode(tenantId));

    // Verificar que el codigo no exista para este tenant
    const existingAsset = await this.prisma.asset.findFirst({
      where: { tenantId, codigo },
    });

    if (existingAsset) {
      throw new ConflictException(`Ya existe un activo con el codigo ${codigo}`);
    }

    const fechaCompra = new Date(createAssetDto.fechaCompra);

    // Calcular valor actual si no se proporciona
    const valorActual =
      createAssetDto.valorActual ??
      this.calculateDepreciation(createAssetDto.valorCompra, fechaCompra);

    try {
      const asset = await this.prisma.asset.create({
        data: {
          tenantId,
          codigo,
          nombre: createAssetDto.nombre,
          categoria: createAssetDto.categoria,
          descripcion: createAssetDto.descripcion,
          valorCompra: createAssetDto.valorCompra,
          valorActual,
          fechaCompra,
          estado: createAssetDto.estado,
          ubicacion: createAssetDto.ubicacion,
          responsable: createAssetDto.responsable,
          imagenUrl: createAssetDto.imagenUrl,
          numeroSerie: createAssetDto.numeroSerie,
          proveedor: createAssetDto.proveedor,
        },
      });

      this.logger.log(`Asset created successfully with ID: ${asset.id}`);
      return asset;
    } catch (error) {
      this.logger.error(`Error creating asset: ${error.message}`);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Ya existe un activo con ese codigo');
        }
      }
      throw error;
    }
  }

  /**
   * Lista todos los activos con filtros y paginacion
   * @param tenantId - ID del tenant
   * @param query - Parametros de consulta (filtros, paginacion, ordenamiento)
   * @returns Lista paginada de activos
   */
  async findAll(tenantId: string, query: QueryAssetsDto) {
    const {
      page = 1,
      limit = 20,
      categoria,
      estado,
      ubicacion,
      search,
      responsable,
      valorMin,
      valorMax,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    // Construir condiciones de filtrado
    const where: Prisma.AssetWhereInput = { tenantId };

    // Filtros exactos
    if (categoria) {
      where.categoria = categoria;
    }

    if (estado) {
      where.estado = estado;
    }

    // Filtros con busqueda parcial (case-insensitive)
    if (ubicacion) {
      where.ubicacion = { contains: ubicacion, mode: 'insensitive' };
    }

    if (responsable) {
      where.responsable = { contains: responsable, mode: 'insensitive' };
    }

    // Filtro por rango de valor
    if (valorMin !== undefined || valorMax !== undefined) {
      where.valorCompra = {};
      if (valorMin !== undefined) {
        where.valorCompra.gte = valorMin;
      }
      if (valorMax !== undefined) {
        where.valorCompra.lte = valorMax;
      }
    }

    // Busqueda general
    if (search) {
      where.OR = [
        { codigo: { contains: search, mode: 'insensitive' } },
        { nombre: { contains: search, mode: 'insensitive' } },
        { descripcion: { contains: search, mode: 'insensitive' } },
        { responsable: { contains: search, mode: 'insensitive' } },
        { proveedor: { contains: search, mode: 'insensitive' } },
        { numeroSerie: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Validar campo de ordenamiento
    const validSortFields = [
      'createdAt',
      'updatedAt',
      'nombre',
      'codigo',
      'valorCompra',
      'valorActual',
      'fechaCompra',
      'categoria',
      'estado',
    ];

    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderBy: Prisma.AssetOrderByWithRelationInput = {
      [orderByField]: sortOrder,
    };

    // Ejecutar consultas en paralelo
    const [assets, total] = await Promise.all([
      this.prisma.asset.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.asset.count({ where }),
    ]);

    // Calcular depreciacion actualizada para cada activo
    const assetsWithDepreciation = assets.map((asset) => ({
      ...asset,
      depreciacionCalculada: this.calculateDepreciation(
        asset.valorCompra,
        asset.fechaCompra,
      ),
      porcentajeDepreciacion:
        ((asset.valorCompra - asset.valorActual) / asset.valorCompra) * 100,
    }));

    return {
      data: assetsWithDepreciation,
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
   * Obtiene un activo por su ID
   * @param id - ID del activo
   * @param tenantId - ID del tenant
   * @returns Activo encontrado
   */
  async findOne(id: string, tenantId: string) {
    const asset = await this.prisma.asset.findFirst({
      where: { id, tenantId },
    });

    if (!asset) {
      throw new NotFoundException(`Activo con ID ${id} no encontrado`);
    }

    // Agregar informacion de depreciacion
    const depreciacionCalculada = this.calculateDepreciation(
      asset.valorCompra,
      asset.fechaCompra,
    );

    return {
      ...asset,
      depreciacionCalculada,
      porcentajeDepreciacion:
        ((asset.valorCompra - asset.valorActual) / asset.valorCompra) * 100,
      diasDesdeCompra: Math.floor(
        (new Date().getTime() - asset.fechaCompra.getTime()) / (1000 * 60 * 60 * 24),
      ),
    };
  }

  /**
   * Actualiza un activo existente
   * @param id - ID del activo
   * @param tenantId - ID del tenant
   * @param updateAssetDto - Datos a actualizar
   * @returns Activo actualizado
   */
  async update(id: string, tenantId: string, updateAssetDto: UpdateAssetDto) {
    // Verificar que el activo existe
    const existingAsset = await this.prisma.asset.findFirst({
      where: { id, tenantId },
    });

    if (!existingAsset) {
      throw new NotFoundException(`Activo con ID ${id} no encontrado`);
    }

    // Si se cambia el codigo, verificar que no exista
    if (updateAssetDto.codigo && updateAssetDto.codigo !== existingAsset.codigo) {
      const codeExists = await this.prisma.asset.findFirst({
        where: {
          tenantId,
          codigo: updateAssetDto.codigo,
          id: { not: id },
        },
      });

      if (codeExists) {
        throw new ConflictException(
          `Ya existe un activo con el codigo ${updateAssetDto.codigo}`,
        );
      }
    }

    // Preparar datos para actualizar
    const updateData: Prisma.AssetUpdateInput = {};

    if (updateAssetDto.codigo !== undefined) updateData.codigo = updateAssetDto.codigo;
    if (updateAssetDto.nombre !== undefined) updateData.nombre = updateAssetDto.nombre;
    if (updateAssetDto.categoria !== undefined) updateData.categoria = updateAssetDto.categoria;
    if (updateAssetDto.descripcion !== undefined) updateData.descripcion = updateAssetDto.descripcion;
    if (updateAssetDto.valorCompra !== undefined) updateData.valorCompra = updateAssetDto.valorCompra;
    if (updateAssetDto.valorActual !== undefined) updateData.valorActual = updateAssetDto.valorActual;
    if (updateAssetDto.fechaCompra !== undefined) updateData.fechaCompra = new Date(updateAssetDto.fechaCompra);
    if (updateAssetDto.estado !== undefined) updateData.estado = updateAssetDto.estado;
    if (updateAssetDto.ubicacion !== undefined) updateData.ubicacion = updateAssetDto.ubicacion;
    if (updateAssetDto.responsable !== undefined) updateData.responsable = updateAssetDto.responsable;
    if (updateAssetDto.imagenUrl !== undefined) updateData.imagenUrl = updateAssetDto.imagenUrl;
    if (updateAssetDto.numeroSerie !== undefined) updateData.numeroSerie = updateAssetDto.numeroSerie;
    if (updateAssetDto.proveedor !== undefined) updateData.proveedor = updateAssetDto.proveedor;

    try {
      const updatedAsset = await this.prisma.asset.update({
        where: { id },
        data: updateData,
      });

      this.logger.log(`Asset ${id} updated successfully`);
      return updatedAsset;
    } catch (error) {
      this.logger.error(`Error updating asset ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Elimina un activo
   * @param id - ID del activo
   * @param tenantId - ID del tenant
   * @returns Mensaje de confirmacion
   */
  async remove(id: string, tenantId: string) {
    const asset = await this.prisma.asset.findFirst({
      where: { id, tenantId },
    });

    if (!asset) {
      throw new NotFoundException(`Activo con ID ${id} no encontrado`);
    }

    await this.prisma.asset.delete({ where: { id } });

    this.logger.log(`Asset ${id} deleted successfully`);

    return {
      message: 'Activo eliminado exitosamente',
      deletedAsset: {
        id: asset.id,
        codigo: asset.codigo,
        nombre: asset.nombre,
      },
    };
  }

  /**
   * Obtiene activos agrupados por categoria
   * @param tenantId - ID del tenant
   * @param categoria - Categoria opcional para filtrar
   * @returns Activos agrupados por categoria
   */
  async getAssetsByCategory(
    tenantId: string,
    categoria?: AssetCategory,
  ): Promise<AssetsByCategory[]> {
    const where: Prisma.AssetWhereInput = { tenantId };

    if (categoria) {
      where.categoria = categoria;
    }

    // Agrupar por categoria
    const groupedAssets = await this.prisma.asset.groupBy({
      by: ['categoria'],
      where,
      _count: { id: true },
      _sum: {
        valorCompra: true,
        valorActual: true,
      },
    });

    // Para cada categoria, obtener los activos si se solicita una categoria especifica
    const result: AssetsByCategory[] = [];

    for (const group of groupedAssets) {
      const assets = categoria
        ? await this.prisma.asset.findMany({
            where: { tenantId, categoria: group.categoria },
            orderBy: { nombre: 'asc' },
          })
        : [];

      result.push({
        categoria: group.categoria,
        count: group._count.id,
        valorTotal: group._sum.valorCompra || 0,
        valorActualTotal: group._sum.valorActual || 0,
        assets,
      });
    }

    return result;
  }

  /**
   * Obtiene estadisticas completas de activos
   * @param tenantId - ID del tenant
   * @returns Estadisticas de activos
   */
  async getAssetStats(tenantId: string): Promise<AssetStats> {
    // Obtener todos los activos del tenant
    const assets = await this.prisma.asset.findMany({
      where: { tenantId },
    });

    const totalAssets = assets.length;

    if (totalAssets === 0) {
      return {
        totalAssets: 0,
        totalValorCompra: 0,
        totalValorActual: 0,
        depreciacionTotal: 0,
        porcentajeDepreciacion: 0,
        porEstado: {
          EXCELENTE: 0,
          BUENO: 0,
          REGULAR: 0,
          MALO: 0,
          DANADO: 0,
        },
        porCategoria: {
          TECNOLOGIA: 0,
          MOBILIARIO: 0,
          EQUIPAMIENTO: 0,
          VEHICULO: 0,
          OTRO: 0,
        },
        activosRecientes: 0,
        valorPromedioPorActivo: 0,
      };
    }

    // Calcular totales
    const totalValorCompra = assets.reduce((sum, a) => sum + a.valorCompra, 0);
    const totalValorActual = assets.reduce((sum, a) => sum + a.valorActual, 0);
    const depreciacionTotal = totalValorCompra - totalValorActual;
    const porcentajeDepreciacion = (depreciacionTotal / totalValorCompra) * 100;

    // Contar por estado
    const porEstado: Record<AssetStatus, number> = {
      EXCELENTE: 0,
      BUENO: 0,
      REGULAR: 0,
      MALO: 0,
      DANADO: 0,
    };

    assets.forEach((asset) => {
      porEstado[asset.estado]++;
    });

    // Contar por categoria
    const porCategoria: Record<AssetCategory, number> = {
      TECNOLOGIA: 0,
      MOBILIARIO: 0,
      EQUIPAMIENTO: 0,
      VEHICULO: 0,
      OTRO: 0,
    };

    assets.forEach((asset) => {
      porCategoria[asset.categoria]++;
    });

    // Activos adquiridos en los ultimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activosRecientes = assets.filter(
      (a) => a.fechaCompra >= thirtyDaysAgo,
    ).length;

    return {
      totalAssets,
      totalValorCompra,
      totalValorActual,
      depreciacionTotal,
      porcentajeDepreciacion: Math.round(porcentajeDepreciacion * 100) / 100,
      porEstado,
      porCategoria,
      activosRecientes,
      valorPromedioPorActivo: Math.round(totalValorCompra / totalAssets),
    };
  }

  /**
   * Obtiene activos que necesitan atencion (estado malo o danado)
   * @param tenantId - ID del tenant
   * @returns Lista de activos que requieren atencion
   */
  async getAssetsNeedingAttention(tenantId: string) {
    const assets = await this.prisma.asset.findMany({
      where: {
        tenantId,
        estado: { in: [AssetStatus.MALO, AssetStatus.DANADO] },
      },
      orderBy: { estado: 'asc' },
    });

    return {
      count: assets.length,
      assets,
    };
  }

  /**
   * Recalcula el valor actual de todos los activos basado en depreciacion
   * @param tenantId - ID del tenant
   * @returns Numero de activos actualizados
   */
  async recalculateDepreciation(tenantId: string) {
    const assets = await this.prisma.asset.findMany({
      where: { tenantId },
    });

    let updatedCount = 0;

    for (const asset of assets) {
      const newValorActual = this.calculateDepreciation(
        asset.valorCompra,
        asset.fechaCompra,
      );

      // Solo actualizar si hay diferencia significativa
      if (Math.abs(asset.valorActual - newValorActual) > 0.01) {
        await this.prisma.asset.update({
          where: { id: asset.id },
          data: { valorActual: newValorActual },
        });
        updatedCount++;
      }
    }

    this.logger.log(`Recalculated depreciation for ${updatedCount} assets`);

    return {
      message: `Depreciacion recalculada para ${updatedCount} activos`,
      updatedCount,
    };
  }
}
