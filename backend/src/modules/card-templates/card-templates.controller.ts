import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { CardTemplatesService } from './card-templates.service';
import {
  CreateCardTemplateDto,
  UpdateCardTemplateDto,
  QueryCardTemplatesDto,
} from './dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';

/**
 * Controlador para la gestión de plantillas de carnets
 * Proporciona endpoints para CRUD y operaciones especiales
 */
@ApiTags('card-templates')
@Controller('card-templates')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class CardTemplatesController {
  constructor(private readonly cardTemplatesService: CardTemplatesService) {}

  /**
   * Crea una nueva plantilla de carnet
   */
  @Post()
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear plantilla de carnet',
    description: 'Crea una nueva plantilla personalizable para carnets de identificación.',
  })
  @ApiResponse({
    status: 201,
    description: 'Plantilla creada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  create(
    @Body() createDto: CreateCardTemplateDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.cardTemplatesService.create(tenantId, createDto);
  }

  /**
   * Lista todas las plantillas
   */
  @Get()
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Listar plantillas de carnets',
    description: 'Obtiene una lista paginada de plantillas con filtros.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de plantillas obtenida exitosamente',
  })
  findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: QueryCardTemplatesDto,
  ) {
    return this.cardTemplatesService.findAll(tenantId, query);
  }

  /**
   * Obtiene estadísticas de plantillas
   */
  @Get('stats')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Obtener estadísticas de plantillas',
    description: 'Retorna estadísticas de uso de plantillas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
  })
  getStats(@CurrentTenant() tenantId: string) {
    return this.cardTemplatesService.getStats(tenantId);
  }

  /**
   * Obtiene la plantilla predeterminada para un tipo de usuario
   */
  @Get('default/:tipoUsuario')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Obtener plantilla predeterminada',
    description: 'Obtiene la plantilla predeterminada para un tipo de usuario.',
  })
  @ApiParam({
    name: 'tipoUsuario',
    description: 'Tipo de usuario (ESTUDIANTE, DOCENTE, ADMINISTRATIVO)',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Plantilla predeterminada encontrada',
  })
  @ApiResponse({
    status: 404,
    description: 'No hay plantilla predeterminada para este tipo',
  })
  findDefaultForType(
    @Param('tipoUsuario') tipoUsuario: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.cardTemplatesService.findDefaultForType(tenantId, tipoUsuario);
  }

  /**
   * Obtiene una plantilla por ID
   */
  @Get(':id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Obtener plantilla por ID',
    description: 'Retorna la información detallada de una plantilla.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la plantilla',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Plantilla encontrada',
  })
  @ApiResponse({
    status: 404,
    description: 'Plantilla no encontrada',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.cardTemplatesService.findOne(id, tenantId);
  }

  /**
   * Actualiza una plantilla
   */
  @Patch(':id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Actualizar plantilla',
    description: 'Actualiza los campos especificados de una plantilla.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la plantilla',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Plantilla actualizada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Plantilla no encontrada',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateCardTemplateDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.cardTemplatesService.update(id, tenantId, updateDto);
  }

  /**
   * Elimina una plantilla
   */
  @Delete(':id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar plantilla',
    description: 'Elimina una plantilla si no tiene carnets asociados.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la plantilla',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Plantilla eliminada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar: tiene carnets asociados',
  })
  @ApiResponse({
    status: 404,
    description: 'Plantilla no encontrada',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.cardTemplatesService.remove(id, tenantId);
  }

  /**
   * Duplica una plantilla
   */
  @Post(':id/duplicate')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Duplicar plantilla',
    description: 'Crea una copia de una plantilla existente.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la plantilla a duplicar',
    type: 'string',
  })
  @ApiResponse({
    status: 201,
    description: 'Plantilla duplicada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Plantilla no encontrada',
  })
  duplicate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.cardTemplatesService.duplicate(id, tenantId);
  }

  /**
   * Establece una plantilla como predeterminada
   */
  @Post(':id/set-default')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Establecer como predeterminada',
    description: 'Marca una plantilla como predeterminada para su tipo de usuario.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la plantilla',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Plantilla establecida como predeterminada',
  })
  @ApiResponse({
    status: 404,
    description: 'Plantilla no encontrada',
  })
  setAsDefault(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.cardTemplatesService.setAsDefault(id, tenantId);
  }
}
