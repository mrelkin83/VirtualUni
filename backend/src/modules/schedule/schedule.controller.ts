import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ScheduleService } from './schedule.service';
import { CreateScheduleEventDto, UpdateScheduleEventDto } from './dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

const STAFF = ['TEACHER', 'TENANT_ADMIN', 'SUPER_ADMIN'] as const;

@ApiTags('schedule')
@Controller('schedule')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('my')
  @Roles('STUDENT', 'TEACHER')
  @ApiOperation({
    summary: 'Mi horario',
    description: 'Devuelve el horario del estudiante o del docente autenticado.',
  })
  findMy(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return role === 'TEACHER'
      ? this.scheduleService.findForTeacher(tenantId, userId)
      : this.scheduleService.findForStudent(tenantId, userId);
  }

  @Post()
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Crear un evento de horario' })
  @ApiResponse({ status: 201, description: 'Evento creado' })
  create(@Body() dto: CreateScheduleEventDto, @CurrentTenant() tenantId: string) {
    return this.scheduleService.create(tenantId, dto);
  }

  @Get()
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Listar eventos de horario' })
  findAll(@Query('courseId') courseId: string, @CurrentTenant() tenantId: string) {
    return this.scheduleService.findAll(tenantId, courseId);
  }

  @Get(':id')
  @Roles('STUDENT', ...STAFF)
  @ApiOperation({ summary: 'Obtener un evento' })
  findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.scheduleService.findOne(tenantId, id);
  }

  @Patch(':id')
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Actualizar un evento' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateScheduleEventDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.scheduleService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Eliminar un evento' })
  remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.scheduleService.remove(tenantId, id);
  }
}
