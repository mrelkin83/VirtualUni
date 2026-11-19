import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';
import { CurrentUser, CurrentUserData } from '@/common/decorators/current-user.decorator';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ApiKeysService, SCOPES_PUBLICABLES, SCOPES_SECRETOS } from './api-keys.service';
import { WebhooksService, EVENTOS_WEBHOOK } from './webhooks.service';
import { CrearLlaveDto, CrearWebhookDto, OrigenesEmbedDto } from './dto/public-api.dto';

/**
 * Panel "Integraciones" del admin (§13.6): llaves de API, webhooks salientes
 * y lista blanca de dominios del widget. Crear/rotar/revocar: solo
 * TENANT_ADMIN. Las banderas enableEmbed/enablePublicApi del tenant son del
 * plan (§13.7) y las administra la plataforma, no este panel.
 */
@ApiTags('integraciones')
@Controller('integraciones')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class IntegracionesAdminController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly llaves: ApiKeysService,
    private readonly webhooks: WebhooksService,
  ) {}

  @Get()
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Resumen del panel: flags del plan, slug, scopes y eventos disponibles' })
  async resumen(@CurrentTenant() tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { slug: true, subdomain: true, customDomain: true, enableEmbed: true, enablePublicApi: true },
    });
    const site = await this.prisma.tenantSite.findUnique({
      where: { tenantId },
      select: { embedAllowedOrigins: true, siteMode: true },
    });
    return {
      tenant,
      embedAllowedOrigins: site?.embedAllowedOrigins ?? [],
      siteMode: site?.siteMode ?? 'FULL',
      scopes: { publishable: SCOPES_PUBLICABLES, secret: SCOPES_SECRETOS },
      eventos: EVENTOS_WEBHOOK,
    };
  }

  // ------------------------------------------------------------- llaves API

  @Get('llaves')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  listarLlaves(@CurrentTenant() tenantId: string) {
    return this.llaves.listar(tenantId);
  }

  @Post('llaves')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Crear llave (la completa se muestra UNA sola vez)' })
  crearLlave(@CurrentTenant() tenantId: string, @Body() dto: CrearLlaveDto, @CurrentUser() user: CurrentUserData) {
    return this.llaves.crear(tenantId, dto, user.userId);
  }

  @Post('llaves/:id/rotar')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  rotarLlave(@CurrentTenant() tenantId: string, @Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.llaves.rotar(tenantId, id, user.userId);
  }

  @Delete('llaves/:id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  revocarLlave(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.llaves.revocar(tenantId, id);
  }

  // --------------------------------------------------------------- webhooks

  @Get('webhooks')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  listarWebhooks(@CurrentTenant() tenantId: string) {
    return this.webhooks.listar(tenantId);
  }

  @Post('webhooks')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Crear webhook (el secreto HMAC se muestra UNA sola vez)' })
  crearWebhook(@CurrentTenant() tenantId: string, @Body() dto: CrearWebhookDto) {
    return this.webhooks.crear(tenantId, dto);
  }

  @Patch('webhooks/:id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  actualizarWebhook(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: Partial<CrearWebhookDto>) {
    return this.webhooks.actualizar(tenantId, id, dto);
  }

  @Delete('webhooks/:id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  eliminarWebhook(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.webhooks.eliminar(tenantId, id);
  }

  @Get('webhooks/:id/entregas')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  entregas(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.webhooks.entregas(tenantId, id);
  }

  @Post('webhooks/:id/prueba')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  prueba(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.webhooks.enviarPrueba(tenantId, id);
  }

  @Post('entregas/:deliveryId/reenviar')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  reenviar(@CurrentTenant() tenantId: string, @Param('deliveryId') deliveryId: string) {
    return this.webhooks.reenviar(tenantId, deliveryId);
  }

  // --------------------------------------------- lista blanca del widget

  @Patch('embed-origins')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Dominios autorizados a incrustar los widgets /embed/*' })
  async embedOrigins(@CurrentTenant() tenantId: string, @Body() dto: OrigenesEmbedDto) {
    await this.prisma.tenantSite.upsert({
      where: { tenantId },
      update: { embedAllowedOrigins: dto.origins },
      create: {
        tenantId,
        embedAllowedOrigins: dto.origins,
        heroSlides: [],
        sections: { order: ['featured', 'calls', 'benefits', 'stats', 'cta'], hidden: [] },
        featuredProgramIds: [],
      },
    });
    return this.resumen(tenantId);
  }
}
