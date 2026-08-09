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
import { IdCardsService } from './idcards.service';
import {
  CreateIdCardDto,
  UpdateIdCardDto,
  QueryIdCardsDto,
  RenewIdCardDto,
  BlockIdCardDto,
} from './dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';

/**
 * Controlador para la gestion de Carnets de Identificacion
 * Proporciona endpoints para CRUD, renovacion, bloqueo y verificacion
 */
@ApiTags('idcards')
@Controller('idcards')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class IdCardsController {
  constructor(private readonly idCardsService: IdCardsService) {}

  // ============================================
  // ENDPOINTS CRUD
  // ============================================

  /**
   * Crea un nuevo carnet de identificacion
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Post()
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear un nuevo carnet de identificacion',
    description: 'Emite un nuevo carnet con numero unico y codigo QR generado automaticamente.',
  })
  @ApiResponse({
    status: 201,
    description: 'Carnet creado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada invalidos',
  })
  @ApiResponse({
    status: 409,
    description: 'El usuario ya tiene un carnet activo',
  })
  create(
    @Body() createIdCardDto: CreateIdCardDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.idCardsService.create(tenantId, createIdCardDto);
  }

  /**
   * Lista todos los carnets con filtros y paginacion
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Get()
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Listar carnets de identificacion',
    description: 'Obtiene una lista paginada de carnets con opciones de filtrado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de carnets obtenida exitosamente',
  })
  findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: QueryIdCardsDto,
  ) {
    return this.idCardsService.findAll(tenantId, query);
  }

  /**
   * Obtiene estadisticas de carnets
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Get('stats')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Obtener estadisticas de carnets',
    description: 'Retorna estadisticas completas de los carnets del tenant.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadisticas obtenidas exitosamente',
  })
  getStats(@CurrentTenant() tenantId: string) {
    return this.idCardsService.getStats(tenantId);
  }

  /**
   * Obtiene carnets por usuario
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Get('user/:usuarioId')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Obtener carnets de un usuario',
    description: 'Retorna el historial de carnets de un usuario especifico.',
  })
  @ApiParam({
    name: 'usuarioId',
    description: 'UUID del usuario',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de carnets del usuario',
  })
  getCardsByUser(
    @Param('usuarioId') usuarioId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.idCardsService.getCardsByUser(usuarioId, tenantId);
  }

  /**
   * Busca un carnet por su numero
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Get('number/:numeroCarnet')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Buscar carnet por numero',
    description: 'Obtiene un carnet por su numero unico (ej: CARD-2024-0001).',
  })
  @ApiParam({
    name: 'numeroCarnet',
    description: 'Numero del carnet',
    type: 'string',
    example: 'CARD-2024-0001',
  })
  @ApiResponse({
    status: 200,
    description: 'Carnet encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Carnet no encontrado',
  })
  findByNumber(
    @Param('numeroCarnet') numeroCarnet: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.idCardsService.findByNumber(numeroCarnet, tenantId);
  }

  /**
   * Obtiene un carnet por su ID
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Get(':id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Obtener un carnet por ID',
    description: 'Retorna la informacion detallada de un carnet.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del carnet',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Carnet encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Carnet no encontrado',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.idCardsService.findOne(id, tenantId);
  }

  /**
   * Actualiza un carnet existente
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Patch(':id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Actualizar un carnet',
    description: 'Actualiza los campos especificados de un carnet existente.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del carnet',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Carnet actualizado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede modificar un carnet bloqueado o perdido',
  })
  @ApiResponse({
    status: 404,
    description: 'Carnet no encontrado',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateIdCardDto: UpdateIdCardDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.idCardsService.update(id, tenantId, updateIdCardDto);
  }

  /**
   * Elimina un carnet
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Delete(':id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar un carnet',
    description: 'Elimina permanentemente un carnet del sistema.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del carnet',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Carnet eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Carnet no encontrado',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.idCardsService.remove(id, tenantId);
  }

  // ============================================
  // ENDPOINTS DE OPERACIONES ESPECIALES
  // ============================================

  /**
   * Renueva un carnet existente
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Post(':id/renew')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Renovar un carnet',
    description: 'Extiende la validez de un carnet y opcionalmente actualiza la foto.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del carnet',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Carnet renovado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede renovar un carnet bloqueado',
  })
  @ApiResponse({
    status: 404,
    description: 'Carnet no encontrado',
  })
  renewCard(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() renewDto: RenewIdCardDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.idCardsService.renewCard(id, tenantId, renewDto);
  }

  /**
   * Bloquea un carnet
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Post(':id/block')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Bloquear un carnet',
    description: 'Bloquea un carnet impidiendo su uso hasta que sea desbloqueado.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del carnet',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Carnet bloqueado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'El carnet ya esta bloqueado',
  })
  @ApiResponse({
    status: 404,
    description: 'Carnet no encontrado',
  })
  blockCard(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() blockDto: BlockIdCardDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.idCardsService.blockCard(id, tenantId, blockDto);
  }

  /**
   * Desbloquea un carnet
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Post(':id/unblock')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Desbloquear un carnet',
    description: 'Reactiva un carnet previamente bloqueado.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del carnet',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Carnet desbloqueado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'El carnet no esta bloqueado',
  })
  @ApiResponse({
    status: 404,
    description: 'Carnet no encontrado',
  })
  unblockCard(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.idCardsService.unblockCard(id, tenantId);
  }

  /**
   * Reporta un carnet como perdido
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Post(':id/report-lost')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reportar carnet como perdido',
    description: 'Marca un carnet como perdido, invalidandolo inmediatamente.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del carnet',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Carnet reportado como perdido',
  })
  @ApiResponse({
    status: 400,
    description: 'El carnet ya esta reportado como perdido',
  })
  @ApiResponse({
    status: 404,
    description: 'Carnet no encontrado',
  })
  reportLost(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.idCardsService.reportLost(id, tenantId);
  }

  /**
   * Genera o regenera el codigo QR de un carnet
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Post(':id/generate-qr')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generar codigo QR',
    description: 'Genera o regenera el codigo QR de verificacion del carnet.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del carnet',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Codigo QR generado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Carnet no encontrado',
  })
  generateQR(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.idCardsService.generateQR(id, tenantId);
  }

  /**
   * Verifica un carnet usando datos del codigo QR
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Post('verify')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verificar carnet por QR',
    description: 'Verifica la validez de un carnet usando los datos escaneados del codigo QR.',
  })
  @ApiResponse({
    status: 200,
    description: 'Resultado de la verificacion',
  })
  verifyCard(
    @Body('qrData') qrData: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.idCardsService.verifyCard(qrData, tenantId);
  }

  /**
   * Exporta datos de un carnet para impresion
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Get(':id/export')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Exportar datos del carnet',
    description: 'Obtiene los datos estructurados de un carnet para impresion o exportacion.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del carnet',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos de exportacion obtenidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Carnet no encontrado',
  })
  exportCardData(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.idCardsService.exportCardData(id, tenantId);
  }
}
