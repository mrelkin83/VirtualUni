import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EducationLevel, ProgramStatus } from '@prisma/client';
import { ProgramsService } from './programs.service';
import { StudyPlansService } from './study-plans.service';
import { CrearProgramaDto, ActualizarProgramaDto } from './dto/program.dto';
import { PublicacionProgramaDto } from './dto/publicacion.dto';
import { CrearPensumDto } from './dto/study-plan.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';

const STAFF = ['TENANT_ADMIN', 'SUPER_ADMIN'] as const;
const LECTORES = ['TEACHER', ...STAFF] as const;

@ApiTags('programs')
@Controller('programs')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class ProgramsController {
  constructor(
    private readonly programs: ProgramsService,
    private readonly studyPlans: StudyPlansService,
  ) {}

  @Get()
  @Roles(...LECTORES)
  @ApiOperation({ summary: 'Programas del tenant' })
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('educationLevel') educationLevel?: EducationLevel,
    @Query('status') status?: ProgramStatus,
  ) {
    return this.programs.findAll(
      tenantId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      search,
      educationLevel,
      status,
    );
  }

  @Post()
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Crear un programa' })
  create(@Body() dto: CrearProgramaDto, @CurrentTenant() tenantId: string) {
    return this.programs.create(tenantId, dto);
  }

  @Get(':id/study-plans')
  @Roles(...LECTORES)
  @ApiOperation({ summary: 'Versiones del pensum del programa' })
  listStudyPlans(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.studyPlans.listByProgram(tenantId, id);
  }

  @Post(':id/study-plans')
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Crear una versión del pensum' })
  createStudyPlan(
    @Param('id') id: string,
    @Body() dto: CrearPensumDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.studyPlans.createForProgram(tenantId, id, dto);
  }

  @Patch(':id/publicacion')
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Campos públicos del programa en el sitio web' })
  actualizarPublicacion(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: PublicacionProgramaDto,
  ) {
    return this.programs.actualizarPublicacion(tenantId, id, dto);
  }

  @Get(':id')
  @Roles(...LECTORES)
  @ApiOperation({ summary: 'Detalle de un programa con sus pensums' })
  findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.programs.findOne(tenantId, id);
  }

  @Patch(':id')
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Actualizar un programa' })
  update(
    @Param('id') id: string,
    @Body() dto: ActualizarProgramaDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.programs.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Eliminar un programa sin estudiantes' })
  remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.programs.remove(tenantId, id);
  }
}
