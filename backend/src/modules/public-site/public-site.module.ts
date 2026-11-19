import { Module } from '@nestjs/common';
import { PrismaModule } from '@/common/prisma/prisma.module';
import { PublicTenantService } from './public-tenant.service';
import { PublicCatalogService } from './public-catalog.service';
import { SiteRenderController } from './site-render.controller';
import { SiteAdminController } from './site-admin.controller';
import { SiteAdminService } from './site-admin.service';
import { SiteRendererService } from './site-renderer.service';

/**
 * Sitio web público por institución (§2): controladores HTML sin prefijo
 * api/v1, resolución de tenant SOLO por Host y lógica en servicios que no
 * saben quién los llama (los reutilizan admisiones, el widget y la API
 * pública de fases posteriores).
 */
@Module({
  imports: [PrismaModule],
  controllers: [SiteRenderController, SiteAdminController],
  providers: [PublicTenantService, PublicCatalogService, SiteAdminService, SiteRendererService],
  exports: [PublicTenantService, PublicCatalogService, SiteRendererService],
})
export class PublicSiteModule {}
