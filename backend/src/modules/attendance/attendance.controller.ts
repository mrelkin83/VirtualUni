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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import {
  BulkAttendanceDto,
  QueryAttendanceDto,
  MyAttendanceDto,
} from './dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

/**
 * Controlador para la gestión de asistencia
 */
@ApiTags('attendance')
@Controller('attendance')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  /**
   * Registrar masivamente la asistencia de un curso
   */
  @Post('bulk')
  @Roles('TEACHER', 'TENANT_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registro masivo de asistencia',
    description:
      'Registra o actualiza la asistencia de los estudiantes de un curso en una fecha específica.',
  })
  @ApiResponse({ status: 201, description: 'Asistencia registrada exitosamente' })
  @ApiResponse({ status: 404, description: 'Curso no encontrado' })
  bulk(
    @Body() dto: BulkAttendanceDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.attendanceService.bulkUpsert(tenantId, userId, dto);
  }

  /**
   * Obtener los registros de asistencia del estudiante actual
   */
  @Get('my')
  @Roles('STUDENT')
  @ApiOperation({
    summary: 'Mi asistencia',
    description:
      'Obtiene los registros de asistencia del estudiante autenticado, con filtro opcional por curso.',
  })
  @ApiResponse({ status: 200, description: 'Registros obtenidos exitosamente' })
  findMy(
    @Query() query: MyAttendanceDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.attendanceService.findMy(tenantId, userId, query);
  }

  /**
   * Obtener estadísticas de asistencia de un curso
   */
  @Get('course/:courseId/stats')
  @Roles('TEACHER', 'TENANT_ADMIN')
  @ApiOperation({
    summary: 'Estadísticas de asistencia por curso',
    description:
      'Retorna estadísticas de asistencia del curso: sesiones, totales por estado y detalle por estudiante.',
  })
  @ApiParam({ name: 'courseId', description: 'ID del curso' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas exitosamente' })
  @ApiResponse({ status: 404, description: 'Curso no encontrado' })
  getCourseStats(
    @Param('courseId') courseId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.attendanceService.getCourseStats(tenantId, courseId);
  }

  /**
   * Listar registros de asistencia del tenant con filtros
   */
  @Get()
  @Roles('TEACHER', 'TENANT_ADMIN')
  @ApiOperation({
    summary: 'Listar asistencia',
    description:
      'Lista los registros de asistencia del tenant, con filtros opcionales por curso, fecha exacta o rango.',
  })
  @ApiResponse({ status: 200, description: 'Registros obtenidos exitosamente' })
  findAll(
    @Query() query: QueryAttendanceDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.attendanceService.findAll(tenantId, query);
  }
}
