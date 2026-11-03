import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SubjectsService } from './subjects.service';
import {
  CrearAsignaturaDto,
  ActualizarAsignaturaDto,
  EditoresDto,
} from './dto/subject.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';

const STAFF = ['TENANT_ADMIN', 'SUPER_ADMIN'] as const;
// El profesorado consulta el catálogo (para armar grupos y ver pensums);
// solo la administración lo modifica.
const LECTORES = ['TEACHER', ...STAFF] as const;

@ApiTags('subjects')
@Controller('subjects')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class SubjectsController {
  constructor(private readonly service: SubjectsService) {}

  @Get()
  @Roles(...LECTORES)
  @ApiOperation({ summary: 'Catálogo de asignaturas del tenant' })
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('area') area?: string,
  ) {
    return this.service.findAll(
      tenantId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      search,
      area,
    );
  }

  @Post()
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Crear una asignatura' })
  create(@Body() dto: CrearAsignaturaDto, @CurrentTenant() tenantId: string) {
    return this.service.create(tenantId, dto);
  }

  @Get(':id/usage')
  @Roles(...LECTORES)
  @ApiOperation({ summary: 'En qué programas, pensums y grupos se usa' })
  usage(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.service.usage(tenantId, id);
  }

  @Get(':id/editors')
  @Roles(...LECTORES)
  @ApiOperation({ summary: 'Docentes editores del contenido maestro' })
  editores(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.service.listarEditores(tenantId, id);
  }

  @Put(':id/editors')
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Reemplazar los docentes editores (solo administración)' })
  fijarEditores(
    @Param('id') id: string,
    @Body() dto: EditoresDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.service.fijarEditores(tenantId, id, dto.teacherIds);
  }

  @Get(':id')
  @Roles(...LECTORES)
  @ApiOperation({ summary: 'Detalle de una asignatura' })
  findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.service.findOne(tenantId, id);
  }

  @Patch(':id')
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Actualizar una asignatura' })
  update(
    @Param('id') id: string,
    @Body() dto: ActualizarAsignaturaDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Eliminar una asignatura sin uso' })
  remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.service.remove(tenantId, id);
  }
}
