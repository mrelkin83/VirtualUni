import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StudyPlanBlocksService } from './study-plan-blocks.service';
import {
  ActualizarBloqueDto,
  AsignarAsignaturasDto,
  CrearBloqueDto,
  EmitirCertificadoDeBloqueDto,
} from './dto/study-plan-block.dto';
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

@ApiTags('study-plan-blocks')
@Controller('study-plans')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class StudyPlanBlocksOfPlanController {
  constructor(private readonly service: StudyPlanBlocksService) {}

  @Get(':id/blocks')
  @Roles('TEACHER', ...STAFF)
  @ApiOperation({ summary: 'Bloques de competencia del pensum' })
  listar(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.service.listar(tenantId, id);
  }

  @Post(':id/blocks')
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Crear un bloque de competencia en el pensum' })
  crear(
    @Param('id') id: string,
    @Body() dto: CrearBloqueDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.service.crear(tenantId, id, dto);
  }
}

@ApiTags('study-plan-blocks')
@Controller('study-plan-blocks')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class StudyPlanBlocksController {
  constructor(private readonly service: StudyPlanBlocksService) {}

  // Rutas estáticas antes que las de parámetro (regla del repo)
  @Get('enrollment/:programEnrollmentId')
  @Roles('STUDENT', 'TEACHER', ...STAFF)
  @ApiOperation({
    summary: 'Avance por bloques del estudiante y elegibilidad del certificado',
  })
  bloquesDeEstudiante(
    @Param('programEnrollmentId') programEnrollmentId: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.service.bloquesDeEstudiante(tenantId, programEnrollmentId, user);
  }

  @Patch(':id')
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Actualizar un bloque' })
  actualizar(
    @Param('id') id: string,
    @Body() dto: ActualizarBloqueDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.service.actualizar(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Eliminar un bloque' })
  eliminar(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.service.eliminar(tenantId, id);
  }

  @Put(':id/subjects')
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Reemplazar las asignaturas del bloque' })
  asignarAsignaturas(
    @Param('id') id: string,
    @Body() dto: AsignarAsignaturasDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.service.asignarAsignaturas(tenantId, id, dto);
  }

  @Post(':id/certificate')
  @Roles(...STAFF)
  @ApiOperation({
    summary: 'Emitir el certificado intermedio del bloque a un estudiante',
  })
  emitirCertificado(
    @Param('id') id: string,
    @Body() dto: EmitirCertificadoDeBloqueDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.service.emitirCertificado(tenantId, id, dto, user);
  }
}
