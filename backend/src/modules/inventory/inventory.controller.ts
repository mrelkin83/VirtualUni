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
import { InventoryService } from './inventory.service';
import {
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  CreateInventoryMovementDto,
  QueryInventoryDto,
  QueryInventoryMovementsDto,
  AdjustStockDto,
} from './dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';

/**
 * Controlador para la gestion de inventario
 * Proporciona endpoints CRUD para items y movimientos de inventario
 */
@ApiTags('inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // ============================================
  // ENDPOINTS DE ITEMS
  // ============================================

  /**
   * Crea un nuevo item de inventario
   * Solo accesible por TENANT_ADMIN y TEACHER
   */
  @Post('items')
  @Roles('TENANT_ADMIN', 'TEACHER')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear un nuevo item de inventario',
    description: 'Crea un nuevo producto/articulo en el inventario. Si no se proporciona codigo, se genera automaticamente (INV-YYYY-XXX).',
  })
  @ApiResponse({
    status: 201,
    description: 'Item creado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada invalidos',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un item con ese codigo',
  })
  createItem(
    @Body() createDto: CreateInventoryItemDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.inventoryService.createItem(tenantId, createDto);
  }

  /**
   * Lista todos los items de inventario con filtros y paginacion
   * Accesible por TENANT_ADMIN y TEACHER
   */
  @Get('items')
  @Roles('TENANT_ADMIN', 'TEACHER')
  @ApiOperation({
    summary: 'Listar todos los items de inventario',
    description: 'Obtiene una lista paginada de items con opciones de filtrado por categoria, estado, proveedor y busqueda general.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de items obtenida exitosamente',
  })
  findAllItems(
    @CurrentTenant() tenantId: string,
    @Query() query: QueryInventoryDto,
  ) {
    return this.inventoryService.findAllItems(tenantId, query);
  }

  /**
   * Obtiene estadisticas del inventario
   * Solo accesible por TENANT_ADMIN
   */
  @Get('stats')
  @Roles('TENANT_ADMIN')
  @ApiOperation({
    summary: 'Obtener estadisticas de inventario',
    description: 'Retorna estadisticas completas incluyendo valor total, items agotados, bajo stock, distribucion por categoria.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadisticas obtenidas exitosamente',
  })
  getStats(@CurrentTenant() tenantId: string) {
    return this.inventoryService.getInventoryStats(tenantId);
  }

  /**
   * Obtiene items con stock bajo o agotado
   * Accesible por TENANT_ADMIN y TEACHER
   */
  @Get('low-stock')
  @Roles('TENANT_ADMIN', 'TEACHER')
  @ApiOperation({
    summary: 'Obtener items con stock bajo',
    description: 'Retorna lista de items cuya cantidad esta por debajo del minimo o agotados.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de items con stock bajo obtenida exitosamente',
  })
  getLowStock(@CurrentTenant() tenantId: string) {
    return this.inventoryService.getLowStockItems(tenantId);
  }

  /**
   * Obtiene un item por su ID
   * Accesible por TENANT_ADMIN y TEACHER
   */
  @Get('items/:id')
  @Roles('TENANT_ADMIN', 'TEACHER')
  @ApiOperation({
    summary: 'Obtener un item por ID',
    description: 'Retorna la informacion detallada de un item incluyendo ultimos movimientos.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del item',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Item encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Item no encontrado',
  })
  findOneItem(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.inventoryService.findOneItem(id, tenantId);
  }

  /**
   * Obtiene el historial de movimientos de un item
   * Accesible por TENANT_ADMIN y TEACHER
   */
  @Get('items/:id/history')
  @Roles('TENANT_ADMIN', 'TEACHER')
  @ApiOperation({
    summary: 'Obtener historial de movimientos de un item',
    description: 'Retorna el historial completo de movimientos (entradas, salidas, ajustes) de un item especifico.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del item',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial obtenido exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Item no encontrado',
  })
  getItemHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.inventoryService.getItemMovementHistory(id, tenantId);
  }

  /**
   * Ajusta el stock de un item de forma sencilla
   * Solo accesible por TENANT_ADMIN y TEACHER
   */
  @Post('items/:id/adjust')
  @Roles('TENANT_ADMIN', 'TEACHER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Ajustar stock de un item',
    description: 'Permite agregar, reducir o establecer la cantidad de un item. Crea automaticamente un movimiento de ajuste.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del item',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Stock ajustado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede reducir mas de lo disponible',
  })
  @ApiResponse({
    status: 404,
    description: 'Item no encontrado',
  })
  adjustStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() adjustDto: AdjustStockDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.inventoryService.adjustStock(id, tenantId, adjustDto);
  }

  /**
   * Actualiza un item de inventario existente
   * Solo accesible por TENANT_ADMIN y TEACHER
   */
  @Patch('items/:id')
  @Roles('TENANT_ADMIN', 'TEACHER')
  @ApiOperation({
    summary: 'Actualizar un item de inventario',
    description: 'Actualiza los campos especificados de un item existente.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del item',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Item actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Item no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un item con ese codigo',
  })
  updateItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateInventoryItemDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.inventoryService.updateItem(id, tenantId, updateDto);
  }

  /**
   * Elimina un item de inventario
   * Solo accesible por TENANT_ADMIN
   */
  @Delete('items/:id')
  @Roles('TENANT_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar un item de inventario',
    description: 'Elimina permanentemente un item del inventario junto con su historial de movimientos.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del item',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Item eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Item no encontrado',
  })
  removeItem(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.inventoryService.removeItem(id, tenantId);
  }

  // ============================================
  // ENDPOINTS DE MOVIMIENTOS
  // ============================================

  /**
   * Registra un nuevo movimiento de inventario
   * Accesible por TENANT_ADMIN y TEACHER
   */
  @Post('movements')
  @Roles('TENANT_ADMIN', 'TEACHER')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar un movimiento de inventario',
    description: 'Registra una entrada, salida o ajuste de inventario. Actualiza automaticamente la cantidad del item.',
  })
  @ApiResponse({
    status: 201,
    description: 'Movimiento registrado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Stock insuficiente para salida',
  })
  @ApiResponse({
    status: 404,
    description: 'Item no encontrado',
  })
  createMovement(
    @Body() createDto: CreateInventoryMovementDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.inventoryService.createMovement(tenantId, createDto);
  }

  /**
   * Lista todos los movimientos de inventario
   * Accesible por TENANT_ADMIN y TEACHER
   */
  @Get('movements')
  @Roles('TENANT_ADMIN', 'TEACHER')
  @ApiOperation({
    summary: 'Listar todos los movimientos de inventario',
    description: 'Obtiene una lista paginada de movimientos con opciones de filtrado por item, tipo, responsable y rango de fechas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de movimientos obtenida exitosamente',
  })
  findAllMovements(
    @CurrentTenant() tenantId: string,
    @Query() query: QueryInventoryMovementsDto,
  ) {
    return this.inventoryService.findAllMovements(tenantId, query);
  }

  /**
   * Obtiene un movimiento por su ID
   * Accesible por TENANT_ADMIN y TEACHER
   */
  @Get('movements/:id')
  @Roles('TENANT_ADMIN', 'TEACHER')
  @ApiOperation({
    summary: 'Obtener un movimiento por ID',
    description: 'Retorna la informacion detallada de un movimiento especifico.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del movimiento',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Movimiento encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Movimiento no encontrado',
  })
  findOneMovement(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.inventoryService.findOneMovement(id, tenantId);
  }

  // ============================================
  // UTILIDADES
  // ============================================

  /**
   * Recalcula el estado de todos los items
   * Solo accesible por TENANT_ADMIN
   */
  @Post('recalculate-states')
  @Roles('TENANT_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Recalcular estados de inventario',
    description: 'Recalcula el estado (DISPONIBLE/BAJO/AGOTADO) de todos los items basado en su cantidad actual.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estados recalculados exitosamente',
  })
  recalculateStates(@CurrentTenant() tenantId: string) {
    return this.inventoryService.recalculateAllStates(tenantId);
  }
}
