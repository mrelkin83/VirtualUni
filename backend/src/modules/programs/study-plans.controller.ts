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
import { StudyPlansService } from './study-plans.service';
import {
  ActualizarPensumDto,
  DuplicarPensumDto,
  CrearFilaPensumDto,
  ActualizarFilaPensumDto,
  PrerrequisitosDto,
} from './dto/study-plan.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';

const STAFF = ['TENANT_ADMIN', 'SUPER_ADMIN'] as const;
const LECTORES = ['TEACHER', ...STAFF] as const;

@ApiTags('study-plans')
@Controller('study-plans')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class StudyPlansController {
  constructor(private readonly service: StudyPlansService) {}

  @Get(':id/subjects')
  @Roles(...LECTORES)
  @ApiOperation({ summary: 'Filas del pensum agrupadas por nivel' })
  subjects(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.service.subjectsGrouped(tenantId, id);
  }

  @Post(':id/subjects')
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Agregar una asignatura al pensum' })
  addSubject(
    @Param('id') id: string,
    @Body() dto: CrearFilaPensumDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.service.addSubject(tenantId, id, dto);
  }

  @Post(':id/activate')
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Activar esta versión (la vigente anterior se cierra)' })
  activate(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.service.activate(tenantId, id);
  }

  @Post(':id/duplicate')
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Duplicar como nueva versión (copia filas y prerrequisitos)' })
  duplicate(
    @Param('id') id: string,
    @Body() dto: DuplicarPensumDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.service.duplicate(tenantId, id, dto);
  }

  @Patch(':id')
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Actualizar datos del pensum' })
  update(
    @Param('id') id: string,
    @Body() dto: ActualizarPensumDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.service.update(tenantId, id, dto);
  }
}

@ApiTags('study-plans')
@Controller('study-plan-subjects')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class StudyPlanSubjectsController {
  constructor(private readonly service: StudyPlansService) {}

  @Patch(':id')
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Actualizar una fila del pensum' })
  update(
    @Param('id') id: string,
    @Body() dto: ActualizarFilaPensumDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.service.updateRow(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Retirar una asignatura del pensum' })
  remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.service.deleteRow(tenantId, id);
  }

  @Put(':id/prerequisites')
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Reemplazar los prerrequisitos de la fila' })
  setPrerequisites(
    @Param('id') id: string,
    @Body() dto: PrerrequisitosDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.service.setPrerequisites(tenantId, id, dto.requiredIds);
  }
}
