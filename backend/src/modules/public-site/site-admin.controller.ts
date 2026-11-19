import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';
import { SiteAdminService } from './site-admin.service';
import { ActualizarSitioDto } from './dto/site-admin.dto';

/**
 * Configuración del sitio público, SOLO para la administración del tenant.
 * (La parte pública no pasa por aquí: va por Host en site-render.controller.)
 */
@ApiTags('tenants')
@Controller('admin/sitio-web')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class SiteAdminController {
  constructor(private readonly servicio: SiteAdminService) {}

  @Get()
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Configuración del sitio web público del tenant' })
  obtener(@CurrentTenant() tenantId: string) {
    return this.servicio.obtener(tenantId);
  }

  @Put()
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Guardar la configuración del sitio web público' })
  actualizar(@CurrentTenant() tenantId: string, @Body() dto: ActualizarSitioDto) {
    return this.servicio.actualizar(tenantId, dto);
  }
}
