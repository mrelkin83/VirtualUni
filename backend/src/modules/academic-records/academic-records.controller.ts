import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AcademicRecordsService } from './academic-records.service';
import { ProgresoService } from './progreso.service';
import { CerrarNotasDto, ReabrirNotasDto } from './dto/academic-record.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';
import {
  CurrentUser,
  CurrentUserData,
} from '@/common/decorators/current-user.decorator';

const STAFF = ['TENANT_ADMIN', 'SUPER_ADMIN'] as const;

@ApiTags('academic-records')
@Controller('academic-records')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class AcademicRecordsController {
  constructor(
    private readonly service: AcademicRecordsService,
    private readonly progreso: ProgresoService,
  ) {}

  @Get('courses/:courseId/grade-closure-preview')
  @Roles('TEACHER', ...STAFF)
  @ApiOperation({
    summary: 'Previsualizar el cierre de notas de un grupo (no escribe nada)',
  })
  previsualizarCierre(
    @Param('courseId') courseId: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.service.previsualizarCierre(tenantId, courseId, user);
  }

  @Post('courses/:courseId/close-grades')
  @Roles('TEACHER', ...STAFF)
  @ApiOperation({
    summary: 'Cerrar notas del grupo y pasarlas al historial académico',
  })
  cerrarNotas(
    @Param('courseId') courseId: string,
    @Body() dto: CerrarNotasDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.service.cerrarNotas(tenantId, courseId, user, dto);
  }

  @Post('courses/:courseId/reopen-grades')
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Reabrir notas del grupo (anula los registros)' })
  reabrirNotas(
    @Param('courseId') courseId: string,
    @Body() dto: ReabrirNotasDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.service.reabrirNotas(tenantId, courseId, user, dto);
  }

  @Get('recognition-preview')
  @Roles(...STAFF)
  @ApiOperation({
    summary:
      'Qué se le reconocería al estudiante si se inscribe en este programa',
  })
  previsualizarReconocimiento(
    @CurrentTenant() tenantId: string,
    @Query('studentId') studentId: string,
    @Query('programId') programId: string,
    @Query('studyPlanId') studyPlanId?: string,
  ) {
    return this.progreso.previsualizarReconocimiento(
      tenantId,
      studentId,
      programId,
      studyPlanId,
    );
  }

  @Post('enrollments/:id/apply-recognition')
  @Roles(...STAFF)
  @ApiOperation({
    summary: 'Crear los reconocimientos internos de una inscripción',
  })
  aplicarReconocimiento(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.progreso.aplicarReconocimientoInterno(tenantId, id, user);
  }

  // Ruta con parámetro al final: las estáticas van antes (regla del repo).
  @Get('progress/:programEnrollmentId')
  @Roles('STUDENT', 'TEACHER', ...STAFF)
  @ApiOperation({ summary: 'Avance del estudiante en el pensum de su programa' })
  avanceDePensum(
    @Param('programEnrollmentId') programEnrollmentId: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.progreso.progresoDeInscripcion(
      tenantId,
      programEnrollmentId,
      user,
    );
  }
}

// Rutas colgadas de /students: un STUDENT solo puede consultar las suyas (se
// verifica en el servicio contra su userId).
@ApiTags('academic-records')
@Controller('students')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class StudentAcademicRecordController {
  constructor(
    private readonly service: AcademicRecordsService,
    private readonly progreso: ProgresoService,
  ) {}

  @Get(':id/academic-record')
  @Roles('STUDENT', 'TEACHER', ...STAFF)
  @ApiOperation({ summary: 'Historial académico del estudiante' })
  historial(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
    @Query('incluirAnulados') incluirAnulados?: string,
  ) {
    return this.service.historialEstudiante(
      tenantId,
      id,
      user,
      incluirAnulados === 'true',
    );
  }

  @Get(':id/double-degree-options')
  @Roles('STUDENT', 'TEACHER', ...STAFF)
  @ApiOperation({ summary: 'Rutas de doble titulación según su historial' })
  dobleTitulacion(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.progreso.opcionesDobleTitulacion(tenantId, id, user);
  }
}

@ApiTags('academic-records')
@Controller('programs')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class ProgramArticulationController {
  constructor(private readonly progreso: ProgresoService) {}

  @Get(':id/articulation-matrix')
  @Roles('TEACHER', ...STAFF)
  @ApiOperation({
    summary: 'Matriz de articulación: qué reconoce cada programa destino',
  })
  matriz(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.progreso.matrizDeArticulacion(tenantId, id);
  }
}
