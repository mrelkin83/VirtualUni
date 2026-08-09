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
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ProceduresService } from './procedures.service';
import {
  CreateProcedureDto,
  UpdateProcedureDto,
  AssignProcedureDto,
  RespondProcedureDto,
  QueryProceduresDto,
} from './dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

/**
 * Controlador para la gestión de trámites
 * Proporciona endpoints CRUD y operaciones específicas para trámites
 */
@ApiTags('procedures')
@Controller('procedures')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class ProceduresController {
  constructor(private readonly proceduresService: ProceduresService) {}

  /**
   * Crear un nuevo trámite
   * Accesible por todos los roles autenticados
   */
  @Post()
  @Roles('TENANT_ADMIN', 'TEACHER', 'STUDENT', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear un nuevo trámite',
    description: 'Crea un nuevo trámite en el sistema.',
  })
  @ApiResponse({
    status: 201,
    description: 'Trámite creado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  create(
    @Body() createDto: CreateProcedureDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
  ) {
    return this.proceduresService.create(
      tenantId,
      user.id,
      user.firstName,
      createDto,
    );
  }

  @Get('my')
  @Roles('STUDENT', 'TEACHER', 'TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Mis trámites',
    description:
      'Trámites solicitados por el usuario autenticado. Listar todos los del tenant sigue reservado a la administración.',
  })
  findMine(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
  ) {
    return this.proceduresService.findMine(tenantId, user.userId ?? user.id);
  }

  @Patch('my/:id/cancel')
  @Roles('STUDENT', 'TEACHER', 'TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Cancelar un trámite propio que siga pendiente' })
  cancelarPropio(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
  ) {
    return this.proceduresService.cancelarPropio(
      tenantId,
      user.userId ?? user.id,
      id,
    );
  }

  /**
   * Obtener todos los trámites con filtros
   * Accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Get()
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Listar todos los trámites',
    description: 'Obtiene una lista paginada de trámites con opciones de filtrado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de trámites obtenida exitosamente',
  })
  findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: QueryProceduresDto,
  ) {
    return this.proceduresService.findAll(tenantId, query);
  }

  /**
   * Obtener estadísticas de trámites
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Get('stats')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Obtener estadísticas de trámites',
    description: 'Retorna estadísticas incluyendo total, por estado, por prioridad y tiempo promedio.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
  })
  getStats(@CurrentTenant() tenantId: string) {
    return this.proceduresService.getStats(tenantId);
  }

  /**
   * Obtener trámites por estado
   * Accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Get('status/:status')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Obtener trámites por estado',
    description: 'Obtiene todos los trámites filtrados por estado.',
  })
  @ApiParam({
    name: 'status',
    description: 'Estado del trámite',
    enum: ['PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'RECHAZADO'],
  })
  getByStatus(
    @Param('status') status: string,
    @CurrentTenant() tenantId: string,
  ) {
    const validStates = ['PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'RECHAZADO'];
    if (!validStates.includes(status)) {
      throw new BadRequestException('Estado inválido');
    }
    return this.proceduresService.findByStatus(tenantId, status as any);
  }

  /**
   * Obtener trámites por prioridad
   * Accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Get('priority/:priority')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Obtener trámites por prioridad',
    description: 'Obtiene todos los trámites filtrados por prioridad.',
  })
  @ApiParam({
    name: 'priority',
    description: 'Nivel de prioridad',
    enum: ['ALTA', 'MEDIA', 'BAJA'],
  })
  getByPriority(
    @Param('priority') priority: string,
    @CurrentTenant() tenantId: string,
  ) {
    if (!['ALTA', 'MEDIA', 'BAJA'].includes(priority)) {
      throw new BadRequestException('Prioridad inválida');
    }
    return this.proceduresService.findByPriority(tenantId, priority);
  }

  /**
   * Obtener un trámite por ID
   * Accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Get(':id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Obtener un trámite por ID',
    description: 'Retorna la información completa de un trámite específico.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del trámite',
  })
  @ApiResponse({
    status: 200,
    description: 'Trámite encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Trámite no encontrado',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.proceduresService.findOne(id, tenantId);
  }

  /**
   * Actualizar un trámite
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Patch(':id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Actualizar un trámite',
    description: 'Actualiza los campos especificados de un trámite existente.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del trámite',
  })
  @ApiResponse({
    status: 200,
    description: 'Trámite actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Trámite no encontrado',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateProcedureDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.proceduresService.update(id, tenantId, updateDto);
  }

  /**
   * Asignar un trámite a un usuario
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Post(':id/assign')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Asignar un trámite a un usuario',
    description: 'Asigna un trámite a un usuario específico para su procesamiento.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del trámite',
  })
  @ApiResponse({
    status: 200,
    description: 'Trámite asignado exitosamente',
  })
  assign(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignDto: AssignProcedureDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.proceduresService.assign(id, tenantId, assignDto);
  }

  /**
   * Responder a un trámite
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Post(':id/respond')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Responder a un trámite',
    description: 'Proporciona una respuesta a un trámite y actualiza su estado.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del trámite',
  })
  @ApiResponse({
    status: 200,
    description: 'Respuesta registrada exitosamente',
  })
  respond(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() respondDto: RespondProcedureDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.proceduresService.respond(id, tenantId, respondDto);
  }

  /**
   * Eliminar un trámite
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Delete(':id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar un trámite',
    description: 'Elimina permanentemente un trámite del sistema.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del trámite',
  })
  @ApiResponse({
    status: 200,
    description: 'Trámite eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Trámite no encontrado',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.proceduresService.remove(id, tenantId);
  }
}
