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
import { PayrollService } from './payroll.service';
import {
  CreatePayrollEmployeeDto,
  UpdatePayrollEmployeeDto,
  CreatePayrollRecordDto,
  UpdatePayrollRecordDto,
  QueryPayrollEmployeesDto,
  QueryPayrollRecordsDto,
  ProcessPayrollDto,
} from './dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';

/**
 * Controlador para la gestion de nomina
 * Proporciona endpoints para empleados, registros, procesamiento y estadisticas
 */
@ApiTags('payroll')
@Controller('payroll')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  // ============================================
  // ENDPOINTS DE EMPLEADOS DE NOMINA
  // ============================================

  /**
   * Crea un nuevo empleado en el sistema de nomina
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Post('employees')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear un nuevo empleado de nomina',
    description: 'Registra un nuevo empleado en el sistema de nomina del tenant.',
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
    description: 'Ya existe un empleado con esa identificacion',
  })
  createEmployee(
    @Body() createDto: CreatePayrollEmployeeDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.payrollService.createEmployee(tenantId, createDto);
  }

  /**
   * Lista todos los empleados con filtros y paginacion
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Get('employees')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Listar empleados de nomina',
    description: 'Obtiene una lista paginada de empleados con opciones de filtrado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de empleados obtenida exitosamente',
  })
  findAllEmployees(
    @CurrentTenant() tenantId: string,
    @Query() query: QueryPayrollEmployeesDto,
  ) {
    return this.payrollService.findAllEmployees(tenantId, query);
  }

  /**
   * Obtiene un empleado por su ID
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Get('employees/:id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Obtener un empleado por ID',
    description: 'Retorna la informacion detallada de un empleado incluyendo sus ultimos registros de nomina.',
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
    return this.payrollService.findOneEmployee(id, tenantId);
  }

  /**
   * Obtiene el historial de pagos de un empleado
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Get('employees/:id/history')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Obtener historial de pagos de un empleado',
    description: 'Retorna el historial completo de registros de nomina de un empleado con estadisticas.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del empleado',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial obtenido exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Empleado no encontrado',
  })
  getEmployeeHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.payrollService.getEmployeePayrollHistory(id, tenantId);
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
    description: 'Ya existe un empleado con esa identificacion',
  })
  updateEmployee(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdatePayrollEmployeeDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.payrollService.updateEmployee(id, tenantId, updateDto);
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
    description: 'Elimina permanentemente un empleado del sistema de nomina.',
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
    return this.payrollService.removeEmployee(id, tenantId);
  }

  // ============================================
  // ENDPOINTS DE REGISTROS DE NOMINA
  // ============================================

  /**
   * Crea un nuevo registro de nomina
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Post('records')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear un registro de nomina',
    description: 'Crea un nuevo registro de nomina para un empleado en un periodo especifico.',
  })
  @ApiResponse({
    status: 201,
    description: 'Registro creado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada invalidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Empleado no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un registro para este empleado en el periodo',
  })
  createRecord(
    @Body() createDto: CreatePayrollRecordDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.payrollService.createRecord(tenantId, createDto);
  }

  /**
   * Lista todos los registros de nomina con filtros y paginacion
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Get('records')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Listar registros de nomina',
    description: 'Obtiene una lista paginada de registros con opciones de filtrado por periodo, estado, departamento.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de registros obtenida exitosamente',
  })
  findAllRecords(
    @CurrentTenant() tenantId: string,
    @Query() query: QueryPayrollRecordsDto,
  ) {
    return this.payrollService.findAllRecords(tenantId, query);
  }

  /**
   * Obtiene un registro de nomina por su ID
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Get('records/:id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Obtener un registro de nomina por ID',
    description: 'Retorna la informacion detallada de un registro de nomina.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del registro',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Registro encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Registro no encontrado',
  })
  findOneRecord(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.payrollService.findOneRecord(id, tenantId);
  }

  /**
   * Actualiza un registro de nomina existente
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Patch('records/:id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Actualizar un registro de nomina',
    description: 'Actualiza los campos especificados de un registro. No permite modificar registros pagados.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del registro',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Registro actualizado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede modificar un registro pagado o transicion de estado invalida',
  })
  @ApiResponse({
    status: 404,
    description: 'Registro no encontrado',
  })
  updateRecord(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdatePayrollRecordDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.payrollService.updateRecord(id, tenantId, updateDto);
  }

  /**
   * Elimina un registro de nomina
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Delete('records/:id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar un registro de nomina',
    description: 'Elimina un registro de nomina. No permite eliminar registros pagados.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del registro',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Registro eliminado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar un registro pagado',
  })
  @ApiResponse({
    status: 404,
    description: 'Registro no encontrado',
  })
  removeRecord(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.payrollService.removeRecord(id, tenantId);
  }

  // ============================================
  // ENDPOINTS DE PROCESAMIENTO Y ESTADISTICAS
  // ============================================

  /**
   * Procesa nomina masiva para un periodo
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Post('process')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Procesar nomina para un periodo',
    description: 'Genera automaticamente registros de nomina para todos los empleados activos en el periodo especificado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Nomina procesada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'No hay empleados activos para procesar',
  })
  @ApiResponse({
    status: 409,
    description: 'Todos los empleados ya tienen registro para el periodo',
  })
  processPayroll(
    @Body() processDto: ProcessPayrollDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.payrollService.processPayrollPeriod(tenantId, processDto);
  }

  /**
   * Obtiene estadisticas de nomina
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Get('stats')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Obtener estadisticas de nomina',
    description: 'Retorna estadisticas completas incluyendo totales, promedios y distribucion por departamento.',
  })
  @ApiQuery({
    name: 'periodo',
    required: false,
    description: 'Filtrar estadisticas por periodo (YYYY-MM)',
    example: '2024-01',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadisticas obtenidas exitosamente',
  })
  getStats(
    @CurrentTenant() tenantId: string,
    @Query('periodo') periodo?: string,
  ) {
    return this.payrollService.getPayrollStats(tenantId, periodo);
  }

  /**
   * Exporta nomina para un periodo (prepara datos para PDF)
   * Solo accesible por TENANT_ADMIN y SUPER_ADMIN
   */
  @Get('export/:periodo')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Exportar datos de nomina para PDF',
    description: 'Obtiene los datos estructurados de nomina para un periodo, listos para generar un PDF.',
  })
  @ApiParam({
    name: 'periodo',
    description: 'Periodo a exportar en formato YYYY-MM',
    type: 'string',
    example: '2024-01',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos de exportacion obtenidos exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'No hay registros para el periodo especificado',
  })
  exportPayroll(
    @Param('periodo') periodo: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.payrollService.exportPayrollToPDF(tenantId, periodo);
  }
}
