import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import {
  CreateCardTemplateDto,
  UpdateCardTemplateDto,
  QueryCardTemplatesDto,
} from './dto';
import { Prisma } from '@prisma/client';

/**
 * Servicio para la gestión de plantillas de carnets
 * Maneja operaciones CRUD y validaciones de plantillas
 */
@Injectable()
export class CardTemplatesService {
  private readonly logger = new Logger(CardTemplatesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea una nueva plantilla de carnet
   * @param tenantId - ID del tenant
   * @param createDto - Datos de la plantilla
   * @returns Plantilla creada
   */
  async create(tenantId: string, createDto: CreateCardTemplateDto) {
    this.logger.log(`Creating card template for tenant ${tenantId}`);

    // Si se marca como predeterminada, desactivar otras predeterminadas del mismo tipo
    if (createDto.esPredeterminada) {
      await this.removeDefaultFromOthers(tenantId, createDto.tiposUsuario);
    }

    try {
      const template = await this.prisma.cardTemplate.create({
        data: {
          tenantId,
          nombre: createDto.nombre,
          descripcion: createDto.descripcion,
          tiposUsuario: createDto.tiposUsuario,
          layoutConfig: createDto.layoutConfig,
          campos: createDto.campos,
          ancho: createDto.ancho,
          alto: createDto.alto,
          orientacion: createDto.orientacion,
          colorPrimario: createDto.colorPrimario,
          colorSecundario: createDto.colorSecundario,
          colorTexto: createDto.colorTexto,
          fuentePrincipal: createDto.fuentePrincipal,
          fuenteSecundaria: createDto.fuenteSecundaria,
          logoUrl: createDto.logoUrl,
          fondoFrontalUrl: createDto.fondoFrontalUrl,
          fondoPosteriorUrl: createDto.fondoPosteriorUrl,
          esActiva: createDto.esActiva ?? true,
          esPredeterminada: createDto.esPredeterminada ?? false,
          incluirQR: createDto.incluirQR ?? true,
          incluirCodigoBarras: createDto.incluirCodigoBarras ?? false,
          doblesCara: createDto.doblesCara ?? true,
        },
      });

      this.logger.log(`Template ${template.id} created successfully`);
      return template;
    } catch (error) {
      this.logger.error(`Error creating template: ${error.message}`);
      throw error;
    }
  }

  /**
   * Lista todas las plantillas con filtros y paginación
   * @param tenantId - ID del tenant
   * @param query - Parámetros de consulta
   * @returns Lista paginada de plantillas
   */
  async findAll(tenantId: string, query: QueryCardTemplatesDto) {
    const {
      page = 1,
      limit = 20,
      search,
      tipoUsuario,
      esActiva,
      esPredeterminada,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    // Construir condiciones de filtrado
    const where: Prisma.CardTemplateWhereInput = { tenantId };

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { descripcion: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tipoUsuario) {
      where.tiposUsuario = { has: tipoUsuario };
    }

    if (esActiva !== undefined) {
      where.esActiva = esActiva;
    }

    if (esPredeterminada !== undefined) {
      where.esPredeterminada = esPredeterminada;
    }

    // Validar campo de ordenamiento
    const validSortFields = [
      'createdAt',
      'updatedAt',
      'nombre',
      'version',
      'esActiva',
      'esPredeterminada',
    ];

    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderBy: Prisma.CardTemplateOrderByWithRelationInput = {
      [orderByField]: sortOrder,
    };

    const [templates, total] = await Promise.all([
      this.prisma.cardTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          _count: {
            select: {
              carnets: true,
              expediciones: true,
            },
          },
        },
      }),
      this.prisma.cardTemplate.count({ where }),
    ]);

    return {
      data: templates,
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
   * Obtiene una plantilla por su ID
   * @param id - ID de la plantilla
   * @param tenantId - ID del tenant
   * @returns Plantilla encontrada
   */
  async findOne(id: string, tenantId: string) {
    const template = await this.prisma.cardTemplate.findFirst({
      where: { id, tenantId },
      include: {
        _count: {
          select: {
            carnets: true,
            expediciones: true,
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException(`Plantilla con ID ${id} no encontrada`);
    }

    return template;
  }

  /**
   * Obtiene la plantilla predeterminada para un tipo de usuario
   * @param tenantId - ID del tenant
   * @param tipoUsuario - Tipo de usuario
   * @returns Plantilla predeterminada
   */
  async findDefaultForType(tenantId: string, tipoUsuario: string) {
    const template = await this.prisma.cardTemplate.findFirst({
      where: {
        tenantId,
        tiposUsuario: { has: tipoUsuario },
        esPredeterminada: true,
        esActiva: true,
      },
    });

    if (!template) {
      throw new NotFoundException(
        `No hay plantilla predeterminada para el tipo ${tipoUsuario}`,
      );
    }

    return template;
  }

  /**
   * Actualiza una plantilla existente
   * @param id - ID de la plantilla
   * @param tenantId - ID del tenant
   * @param updateDto - Datos a actualizar
   * @returns Plantilla actualizada
   */
  async update(id: string, tenantId: string, updateDto: UpdateCardTemplateDto) {
    const existingTemplate = await this.prisma.cardTemplate.findFirst({
      where: { id, tenantId },
    });

    if (!existingTemplate) {
      throw new NotFoundException(`Plantilla con ID ${id} no encontrada`);
    }

    // Si se marca como predeterminada, desactivar otras
    if (updateDto.esPredeterminada && !existingTemplate.esPredeterminada) {
      const tiposUsuario = updateDto.tiposUsuario || existingTemplate.tiposUsuario;
      await this.removeDefaultFromOthers(tenantId, tiposUsuario as string[], id);
    }

    try {
      const updatedTemplate = await this.prisma.cardTemplate.update({
        where: { id },
        data: {
          ...updateDto,
          version: { increment: 1 }, // Incrementar versión
        },
      });

      this.logger.log(`Template ${id} updated successfully`);
      return updatedTemplate;
    } catch (error) {
      this.logger.error(`Error updating template ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Elimina una plantilla
   * @param id - ID de la plantilla
   * @param tenantId - ID del tenant
   * @returns Mensaje de confirmación
   */
  async remove(id: string, tenantId: string) {
    const template = await this.prisma.cardTemplate.findFirst({
      where: { id, tenantId },
      include: {
        _count: {
          select: { carnets: true },
        },
      },
    });

    if (!template) {
      throw new NotFoundException(`Plantilla con ID ${id} no encontrada`);
    }

    // No permitir eliminar si hay carnets asociados
    if (template._count.carnets > 0) {
      throw new BadRequestException(
        `No se puede eliminar la plantilla porque tiene ${template._count.carnets} carnets asociados`,
      );
    }

    await this.prisma.cardTemplate.delete({ where: { id } });

    this.logger.log(`Template ${id} deleted successfully`);

    return {
      message: 'Plantilla eliminada exitosamente',
      deletedTemplate: {
        id: template.id,
        nombre: template.nombre,
      },
    };
  }

  /**
   * Duplica una plantilla existente
   * @param id - ID de la plantilla a duplicar
   * @param tenantId - ID del tenant
   * @returns Nueva plantilla duplicada
   */
  async duplicate(id: string, tenantId: string) {
    const originalTemplate = await this.findOne(id, tenantId);

    const duplicatedTemplate = await this.prisma.cardTemplate.create({
      data: {
        tenantId,
        nombre: `${originalTemplate.nombre} (Copia)`,
        descripcion: originalTemplate.descripcion,
        tiposUsuario: originalTemplate.tiposUsuario,
        layoutConfig: originalTemplate.layoutConfig,
        campos: originalTemplate.campos,
        ancho: originalTemplate.ancho,
        alto: originalTemplate.alto,
        orientacion: originalTemplate.orientacion,
        colorPrimario: originalTemplate.colorPrimario,
        colorSecundario: originalTemplate.colorSecundario,
        colorTexto: originalTemplate.colorTexto,
        fuentePrincipal: originalTemplate.fuentePrincipal,
        fuenteSecundaria: originalTemplate.fuenteSecundaria,
        logoUrl: originalTemplate.logoUrl,
        fondoFrontalUrl: originalTemplate.fondoFrontalUrl,
        fondoPosteriorUrl: originalTemplate.fondoPosteriorUrl,
        esActiva: false, // La copia inicia inactiva
        esPredeterminada: false, // La copia no es predeterminada
        incluirQR: originalTemplate.incluirQR,
        incluirCodigoBarras: originalTemplate.incluirCodigoBarras,
        doblesCara: originalTemplate.doblesCara,
      },
    });

    this.logger.log(`Template ${id} duplicated successfully as ${duplicatedTemplate.id}`);

    return duplicatedTemplate;
  }

  /**
   * Establece una plantilla como predeterminada
   * @param id - ID de la plantilla
   * @param tenantId - ID del tenant
   * @returns Plantilla actualizada
   */
  async setAsDefault(id: string, tenantId: string) {
    const template = await this.findOne(id, tenantId);

    // Remover predeterminada de otras plantillas del mismo tipo
    await this.removeDefaultFromOthers(tenantId, template.tiposUsuario, id);

    const updatedTemplate = await this.prisma.cardTemplate.update({
      where: { id },
      data: {
        esPredeterminada: true,
        esActiva: true, // Activar automáticamente
      },
    });

    this.logger.log(`Template ${id} set as default`);

    return updatedTemplate;
  }

  /**
   * Remueve el flag de predeterminada de otras plantillas
   * @param tenantId - ID del tenant
   * @param tiposUsuario - Tipos de usuario
   * @param excludeId - ID de plantilla a excluir (opcional)
   */
  private async removeDefaultFromOthers(
    tenantId: string,
    tiposUsuario: string[],
    excludeId?: string,
  ) {
    const where: Prisma.CardTemplateWhereInput = {
      tenantId,
      esPredeterminada: true,
      tiposUsuario: { hasSome: tiposUsuario },
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    await this.prisma.cardTemplate.updateMany({
      where,
      data: { esPredeterminada: false },
    });
  }

  /**
   * Obtiene estadísticas de plantillas
   * @param tenantId - ID del tenant
   * @returns Estadísticas
   */
  async getStats(tenantId: string) {
    const [total, activas, predeterminadas, conCarnets] = await Promise.all([
      this.prisma.cardTemplate.count({ where: { tenantId } }),
      this.prisma.cardTemplate.count({ where: { tenantId, esActiva: true } }),
      this.prisma.cardTemplate.count({ where: { tenantId, esPredeterminada: true } }),
      this.prisma.cardTemplate.count({
        where: {
          tenantId,
          carnets: { some: {} },
        },
      }),
    ]);

    return {
      total,
      activas,
      predeterminadas,
      conCarnets,
      sinUsar: total - conCarnets,
    };
  }
}
