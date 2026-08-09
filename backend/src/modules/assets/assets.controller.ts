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
  ApiQuery,
} from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { CreateAssetDto, UpdateAssetDto, QueryAssetsDto } from './dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';
import { AssetCategory } from '@prisma/client';

/**
 * Controlador para la gestion de activos
 * Proporciona endpoints CRUD y estadisticas para activos del tenant
 */
@ApiTags('assets')
@Controller('assets')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  /**
   * Crea un nuevo activo
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Post()
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear un nuevo activo',
    description: 'Crea un nuevo activo en el inventario del tenant. Si no se proporciona codigo, se genera automaticamente.',
  })
  @ApiResponse({
    status: 201,
    description: 'Activo creado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada invalidos',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un activo con ese codigo',
  })
  create(
    @Body() createAssetDto: CreateAssetDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.assetsService.create(tenantId, createAssetDto);
  }

  /**
   * Lista todos los activos con filtros y paginacion
   * Accesible por TENANT_ADMIN, TEACHER y SUPER_ADMIN
   */
  @Get()
  @Roles('TENANT_ADMIN', 'TEACHER', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Listar todos los activos',
    description: 'Obtiene una lista paginada de activos con opciones de filtrado por categoria, estado, ubicacion y busqueda general.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de activos obtenida exitosamente',
  })
  findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: QueryAssetsDto,
  ) {
    return this.assetsService.findAll(tenantId, query);
  }

  /**
   * Obtiene estadisticas de activos
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Get('stats')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Obtener estadisticas de activos',
    description: 'Retorna estadisticas completas incluyendo valor total, depreciacion, distribucion por estado y categoria.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadisticas obtenidas exitosamente',
  })
  getStats(@CurrentTenant() tenantId: string) {
    return this.assetsService.getAssetStats(tenantId);
  }

  /**
   * Obtiene activos agrupados por categoria
   * Accesible por TENANT_ADMIN, TEACHER y SUPER_ADMIN
   */
  @Get('by-category')
  @Roles('TENANT_ADMIN', 'TEACHER', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Obtener activos agrupados por categoria',
    description: 'Retorna los activos agrupados por categoria con conteos y valores totales.',
  })
  @ApiQuery({
    name: 'categoria',
    required: false,
    enum: AssetCategory,
    description: 'Filtrar por una categoria especifica',
  })
  @ApiResponse({
    status: 200,
    description: 'Activos agrupados obtenidos exitosamente',
  })
  getByCategory(
    @CurrentTenant() tenantId: string,
    @Query('categoria') categoria?: AssetCategory,
  ) {
    return this.assetsService.getAssetsByCategory(tenantId, categoria);
  }

  /**
   * Obtiene activos que necesitan atencion
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Get('needs-attention')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Obtener activos que necesitan atencion',
    description: 'Retorna activos en estado MALO o DANADO que requieren mantenimiento o reemplazo.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de activos que necesitan atencion',
  })
  getNeedsAttention(@CurrentTenant() tenantId: string) {
    return this.assetsService.getAssetsNeedingAttention(tenantId);
  }

  /**
   * Recalcula la depreciacion de todos los activos
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Post('recalculate-depreciation')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Recalcular depreciacion de activos',
    description: 'Recalcula el valor actual de todos los activos basado en su fecha de compra y valor original.',
  })
  @ApiResponse({
    status: 200,
    description: 'Depreciacion recalculada exitosamente',
  })
  recalculateDepreciation(@CurrentTenant() tenantId: string) {
    return this.assetsService.recalculateDepreciation(tenantId);
  }

  /**
   * Obtiene un activo por su ID
   * Accesible por TENANT_ADMIN, TEACHER y SUPER_ADMIN
   */
  @Get(':id')
  @Roles('TENANT_ADMIN', 'TEACHER', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Obtener un activo por ID',
    description: 'Retorna la informacion detallada de un activo incluyendo calculo de depreciacion.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del activo',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Activo encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Activo no encontrado',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.assetsService.findOne(id, tenantId);
  }

  /**
   * Actualiza un activo existente
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Patch(':id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Actualizar un activo',
    description: 'Actualiza los campos especificados de un activo existente.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del activo',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Activo actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Activo no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un activo con ese codigo',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAssetDto: UpdateAssetDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.assetsService.update(id, tenantId, updateAssetDto);
  }

  /**
   * Elimina un activo
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Delete(':id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar un activo',
    description: 'Elimina permanentemente un activo del inventario.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del activo',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Activo eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Activo no encontrado',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.assetsService.remove(id, tenantId);
  }
}
