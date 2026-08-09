import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CertificateTemplatesService } from './certificate-templates.service';
import { CrearPlantillaDto, ActualizarPlantillaDto } from './dto/plantilla.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';

@ApiTags('certificate-templates')
@Controller('certificate-templates')
// Diseñar los certificados que emite la institución es competencia de la
// administración: no lo abre a docentes ni a alumnado.
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('TENANT_ADMIN', 'SUPER_ADMIN')
@ApiBearerAuth()
export class CertificateTemplatesController {
  constructor(private readonly service: CertificateTemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar plantillas de certificado' })
  findAll(@CurrentTenant() tenantId: string) {
    return this.service.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de una plantilla' })
  findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.service.findOne(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una plantilla' })
  create(@Body() dto: CrearPlantillaDto, @CurrentTenant() tenantId: string) {
    return this.service.create(tenantId, dto);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicar una plantilla' })
  duplicate(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.service.duplicate(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una plantilla' })
  update(
    @Param('id') id: string,
    @Body() dto: ActualizarPlantillaDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una plantilla' })
  remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.service.remove(tenantId, id);
  }
}
