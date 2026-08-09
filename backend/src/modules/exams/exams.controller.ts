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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExamsService } from './exams.service';
import {
  CreateExamDto,
  UpdateExamDto,
  QueryExamsDto,
  SubmitAttemptDto,
} from './dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

/**
 * Controlador para la gestión de exámenes
 */
@ApiTags('exams')
@Controller('exams')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  /**
   * Crear un examen con sus preguntas
   */
  @Post()
  @Roles('TEACHER', 'TENANT_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un examen' })
  create(
    @Body() createDto: CreateExamDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.examsService.create(tenantId, createDto);
  }

  /**
   * Listar exámenes (comportamiento según rol)
   */
  @Get()
  @ApiOperation({ summary: 'Listar exámenes' })
  findAll(
    @CurrentTenant() tenantId: string,
    @CurrentUser('role') role: string,
    @CurrentUser('userId') userId: string,
    @Query() query: QueryExamsDto,
  ) {
    return this.examsService.findAll(tenantId, role, userId, query);
  }

  /**
   * Intentos del estudiante actual.
   * Ruta estática declarada antes de las rutas ':id'.
   */
  @Get('attempts/my')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Obtener mis intentos de examen' })
  findMyAttempts(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.examsService.findMyAttempts(tenantId, userId);
  }

  /**
   * Enviar y calificar un intento.
   * Ruta estática declarada antes de las rutas ':id'.
   */
  @Post('attempts/:attemptId/submit')
  @Roles('STUDENT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar un intento de examen' })
  submitAttempt(
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
    @Body() submitDto: SubmitAttemptDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.examsService.submitAttempt(
      tenantId,
      userId,
      attemptId,
      submitDto,
    );
  }

  /**
   * Obtener un examen por ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un examen por ID' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.examsService.findOne(id, tenantId, role);
  }

  /**
   * Actualizar un examen
   */
  @Patch(':id')
  @Roles('TEACHER', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Actualizar un examen' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateExamDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.examsService.update(id, tenantId, updateDto);
  }

  /**
   * Eliminar un examen
   */
  @Delete(':id')
  @Roles('TEACHER', 'TENANT_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un examen' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.examsService.remove(id, tenantId);
  }

  /**
   * Publicar un examen (ACTIVO)
   */
  @Post(':id/publish')
  @Roles('TEACHER', 'TENANT_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publicar un examen' })
  publish(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.examsService.publish(id, tenantId);
  }

  /**
   * Finalizar un examen (FINALIZADO)
   */
  @Post(':id/finalize')
  @Roles('TEACHER', 'TENANT_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Finalizar un examen' })
  finalize(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.examsService.finalize(id, tenantId);
  }

  /**
   * Resultados y estadísticas de un examen
   */
  @Get(':id/results')
  @Roles('TEACHER', 'TENANT_ADMIN')
  @ApiOperation({ summary: 'Obtener resultados de un examen' })
  results(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.examsService.results(id, tenantId);
  }

  /**
   * Crear un intento de examen (estudiante)
   */
  @Post(':id/attempts')
  @Roles('STUDENT')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Iniciar un intento de examen' })
  createAttempt(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.examsService.createAttempt(id, tenantId, userId);
  }
}
