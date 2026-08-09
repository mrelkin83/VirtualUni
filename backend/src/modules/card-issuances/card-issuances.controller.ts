import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { CardIssuancesService } from './card-issuances.service';
import { CreateCardIssuanceDto, QueryCardIssuancesDto } from './dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';

/**
 * Controlador para la gestión de expediciones de carnets
 * Proporciona endpoints para expediciones masivas y control
 */
@ApiTags('card-issuances')
@Controller('card-issuances')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class CardIssuancesController {
  constructor(private readonly cardIssuancesService: CardIssuancesService) {}

  /**
   * Crea una nueva expedición de carnets
   */
  @Post()
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear expedición de carnets',
    description: 'Crea una nueva expedición masiva de carnets.',
  })
  @ApiResponse({
    status: 201,
    description: 'Expedición creada y procesándose',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  create(
    @Body() createDto: CreateCardIssuanceDto,
    @CurrentTenant() tenantId: string,
    @Request() req: any,
  ) {
    const userId = req.user?.userId || req.user?.id || 'system';
    const userName = req.user?.firstName
      ? `${req.user.firstName} ${req.user.lastName}`
      : 'Administrador';

    return this.cardIssuancesService.create(tenantId, createDto, userId, userName);
  }

  /**
   * Lista todas las expediciones
   */
  @Get()
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Listar expediciones',
    description: 'Obtiene una lista paginada de expediciones con filtros.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de expediciones obtenida exitosamente',
  })
  findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: QueryCardIssuancesDto,
  ) {
    return this.cardIssuancesService.findAll(tenantId, query);
  }

  /**
   * Obtiene estadísticas de expediciones
   */
  @Get('stats')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Obtener estadísticas de expediciones',
    description: 'Retorna estadísticas de expediciones y carnets generados.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
  })
  getStats(@CurrentTenant() tenantId: string) {
    return this.cardIssuancesService.getStats(tenantId);
  }

  /**
   * Obtiene una expedición por ID
   */
  @Get(':id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Obtener expedición por ID',
    description: 'Retorna la información detallada de una expedición.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la expedición',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Expedición encontrada',
  })
  @ApiResponse({
    status: 404,
    description: 'Expedición no encontrada',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.cardIssuancesService.findOne(id, tenantId);
  }

  /**
   * Cancela una expedición en proceso
   */
  @Post(':id/cancel')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancelar expedición',
    description: 'Cancela una expedición que esté en proceso.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la expedición',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Expedición cancelada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede cancelar la expedición en su estado actual',
  })
  @ApiResponse({
    status: 404,
    description: 'Expedición no encontrada',
  })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.cardIssuancesService.cancel(id, tenantId);
  }
}
