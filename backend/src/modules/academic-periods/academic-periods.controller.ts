import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PeriodStatus } from '@prisma/client';
import { AcademicPeriodsService } from './academic-periods.service';
import { CrearPeriodoDto, ActualizarPeriodoDto } from './dto/academic-period.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';

const STAFF = ['TENANT_ADMIN', 'SUPER_ADMIN'] as const;
const LECTORES = ['TEACHER', ...STAFF] as const;

@ApiTags('academic-periods')
@Controller('academic-periods')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class AcademicPeriodsController {
  constructor(private readonly service: AcademicPeriodsService) {}

  @Get()
  @Roles(...LECTORES)
  @ApiOperation({ summary: 'Periodos académicos del tenant' })
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: PeriodStatus,
  ) {
    return this.service.findAll(
      tenantId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      status,
    );
  }

  // Ruta estática antes de cualquier :id
  @Get('current')
  @Roles(...LECTORES)
  @ApiOperation({ summary: 'Periodo en curso' })
  current(@CurrentTenant() tenantId: string) {
    return this.service.current(tenantId);
  }

  @Post()
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Crear un periodo académico' })
  create(@Body() dto: CrearPeriodoDto, @CurrentTenant() tenantId: string) {
    return this.service.create(tenantId, dto);
  }

  @Patch(':id')
  @Roles(...STAFF)
  @ApiOperation({ summary: 'Actualizar un periodo académico' })
  update(
    @Param('id') id: string,
    @Body() dto: ActualizarPeriodoDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.service.update(tenantId, id, dto);
  }
}
