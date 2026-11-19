import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';
import { SiteAdminService } from './site-admin.service';
import { ActualizarSitioDto, GuardarPaginaDto } from './dto/site-admin.dto';

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

  @Get('paginas')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Páginas institucionales del sitio' })
  paginas(@CurrentTenant() tenantId: string) {
    return this.servicio.listarPaginas(tenantId);
  }

  @Post('paginas')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Crear una página institucional' })
  crearPagina(@CurrentTenant() tenantId: string, @Body() dto: GuardarPaginaDto) {
    return this.servicio.crearPagina(tenantId, dto);
  }

  @Put('paginas/:id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Actualizar una página institucional' })
  actualizarPagina(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: GuardarPaginaDto) {
    return this.servicio.actualizarPagina(tenantId, id, dto);
  }

  @Delete('paginas/:id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Eliminar una página institucional' })
  eliminarPagina(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.servicio.eliminarPagina(tenantId, id);
  }
}
