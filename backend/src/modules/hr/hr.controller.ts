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
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { HrService } from './hr.service';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  QueryEmployeesDto,
  CreateVacationRequestDto,
  UpdateVacationRequestDto,
  ApproveVacationDto,
} from './dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';

/**
 * Controlador para la gestion de Recursos Humanos
 * Proporciona endpoints para empleados y solicitudes de vacaciones
 */
@ApiTags('hr')
@Controller('hr')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class HrController {
  constructor(private readonly hrService: HrService) {}

  // ============================================
  // ENDPOINTS DE EMPLEADOS
  // ============================================

  /**
   * Crea un nuevo empleado
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Post('employees')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear un nuevo empleado',
    description: 'Registra un nuevo empleado en el sistema de recursos humanos.',
  })
  @ApiResponse({
    status: 201,
    description: 'Empleado creado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada invalidos',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un empleado con esa identificacion o email',
  })
  createEmployee(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.hrService.createEmployee(tenantId, createEmployeeDto);
  }

  /**
   * Lista todos los empleados con filtros y paginacion
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Get('employees')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Listar empleados',
    description: 'Obtiene una lista paginada de empleados con opciones de filtrado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de empleados obtenida exitosamente',
  })
  findAllEmployees(
    @CurrentTenant() tenantId: string,
    @Query() query: QueryEmployeesDto,
  ) {
    return this.hrService.findAllEmployees(tenantId, query);
  }

  /**
   * Obtiene estadisticas de empleados
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Get('employees/stats')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Obtener estadisticas de empleados',
    description: 'Retorna estadisticas completas de los empleados del tenant.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadisticas obtenidas exitosamente',
  })
  getEmployeeStats(@CurrentTenant() tenantId: string) {
    return this.hrService.getEmployeeStats(tenantId);
  }

  /**
   * Obtiene empleados por departamento
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Get('employees/by-department/:departamento')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Obtener empleados por departamento',
    description: 'Retorna la lista de empleados de un departamento especifico.',
  })
  @ApiParam({
    name: 'departamento',
    description: 'Nombre del departamento',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de empleados del departamento',
  })
  getEmployeesByDepartment(
    @Param('departamento') departamento: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.hrService.getEmployeesByDepartment(tenantId, departamento);
  }

  /**
   * Obtiene un empleado por su ID
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Get('employees/:id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Obtener un empleado por ID',
    description: 'Retorna la informacion detallada de un empleado incluyendo su balance de vacaciones.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del empleado',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Empleado encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Empleado no encontrado',
  })
  findOneEmployee(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.hrService.findOneEmployee(id, tenantId);
  }

  /**
   * Obtiene el balance de vacaciones de un empleado
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Get('employees/:id/vacation-balance')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Obtener balance de vacaciones de un empleado',
    description: 'Retorna los dias acumulados, usados y disponibles de vacaciones.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del empleado',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Balance de vacaciones obtenido',
  })
  @ApiResponse({
    status: 404,
    description: 'Empleado no encontrado',
  })
  getVacationBalance(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.hrService.calculateVacationDays(id, tenantId);
  }

  /**
   * Actualiza un empleado existente
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Patch('employees/:id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Actualizar un empleado',
    description: 'Actualiza los campos especificados de un empleado existente.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del empleado',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Empleado actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Empleado no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un empleado con esa identificacion o email',
  })
  updateEmployee(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.hrService.updateEmployee(id, tenantId, updateEmployeeDto);
  }

  /**
   * Elimina un empleado
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Delete('employees/:id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar un empleado',
    description: 'Elimina permanentemente un empleado del sistema de recursos humanos.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del empleado',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Empleado eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Empleado no encontrado',
  })
  removeEmployee(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.hrService.removeEmployee(id, tenantId);
  }

  // ============================================
  // ENDPOINTS DE SOLICITUDES DE VACACIONES
  // ============================================

  /**
   * Crea una nueva solicitud de vacaciones
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Post('vacations')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear una solicitud de vacaciones',
    description: 'Crea una nueva solicitud de vacaciones para un empleado.',
  })
  @ApiResponse({
    status: 201,
    description: 'Solicitud creada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada invalidos o dias insuficientes',
  })
  @ApiResponse({
    status: 404,
    description: 'Empleado no encontrado',
  })
  createVacationRequest(
    @Body() createVacationRequestDto: CreateVacationRequestDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.hrService.createVacationRequest(tenantId, createVacationRequestDto);
  }

  /**
   * Lista todas las solicitudes de vacaciones
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Get('vacations')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Listar solicitudes de vacaciones',
    description: 'Obtiene una lista paginada de solicitudes de vacaciones.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Numero de pagina',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Registros por pagina',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de solicitudes obtenida exitosamente',
  })
  findAllVacationRequests(
    @CurrentTenant() tenantId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.hrService.findAllVacationRequests(tenantId, page, limit);
  }

  /**
   * Obtiene solicitudes pendientes de aprobacion
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Get('vacations/pending')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Obtener solicitudes pendientes',
    description: 'Retorna todas las solicitudes de vacaciones en estado PENDIENTE.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de solicitudes pendientes',
  })
  getPendingRequests(@CurrentTenant() tenantId: string) {
    return this.hrService.getPendingRequests(tenantId);
  }

  /**
   * Obtiene las proximas vacaciones aprobadas
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Get('vacations/upcoming')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Obtener proximas vacaciones',
    description: 'Retorna las vacaciones aprobadas programadas para los proximos dias.',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Numero de dias hacia adelante (default: 30)',
    example: 30,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de proximas vacaciones',
  })
  getUpcomingVacations(
    @CurrentTenant() tenantId: string,
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    return this.hrService.getUpcomingVacations(tenantId, days);
  }

  /**
   * Obtiene una solicitud de vacaciones por su ID
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Get('vacations/:id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Obtener una solicitud de vacaciones por ID',
    description: 'Retorna la informacion detallada de una solicitud de vacaciones.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la solicitud',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Solicitud encontrada',
  })
  @ApiResponse({
    status: 404,
    description: 'Solicitud no encontrada',
  })
  findOneVacationRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.hrService.findOneVacationRequest(id, tenantId);
  }

  /**
   * Actualiza una solicitud de vacaciones (solo si esta PENDIENTE)
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Patch('vacations/:id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Actualizar una solicitud de vacaciones',
    description: 'Actualiza los campos de una solicitud en estado PENDIENTE.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la solicitud',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Solicitud actualizada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Solo se pueden modificar solicitudes en estado PENDIENTE',
  })
  @ApiResponse({
    status: 404,
    description: 'Solicitud no encontrada',
  })
  updateVacationRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVacationRequestDto: UpdateVacationRequestDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.hrService.updateVacationRequest(id, tenantId, updateVacationRequestDto);
  }

  /**
   * Aprueba o rechaza una solicitud de vacaciones
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Post('vacations/:id/approve')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Aprobar o rechazar una solicitud de vacaciones',
    description: 'Cambia el estado de una solicitud PENDIENTE a APROBADA o RECHAZADA.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la solicitud',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Solicitud procesada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'La solicitud ya fue procesada o falta motivo de rechazo',
  })
  @ApiResponse({
    status: 404,
    description: 'Solicitud no encontrada',
  })
  approveVacationRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() approveVacationDto: ApproveVacationDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.hrService.approveVacationRequest(id, tenantId, approveVacationDto);
  }

  /**
   * Elimina una solicitud de vacaciones (solo si esta PENDIENTE)
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Delete('vacations/:id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar una solicitud de vacaciones',
    description: 'Elimina una solicitud en estado PENDIENTE.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la solicitud',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Solicitud eliminada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Solo se pueden eliminar solicitudes en estado PENDIENTE',
  })
  @ApiResponse({
    status: 404,
    description: 'Solicitud no encontrada',
  })
  removeVacationRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.hrService.removeVacationRequest(id, tenantId);
  }
}
