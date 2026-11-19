import { Module } from '@nestjs/common';
import { PrismaModule } from '@/common/prisma/prisma.module';
import { PublicSiteModule } from '../public-site/public-site.module';
import { AdmissionsModule } from '../admissions/admissions.module';
import { ApiKeysService } from './api-keys.service';
import { PublicApiGuard } from './public-api.guard';
import { IdempotencyInterceptor } from './idempotency.interceptor';
import { PublicApiController } from './public-api.controller';
import { WebhooksService } from './webhooks.service';
import { IntegracionesAdminController } from './integraciones-admin.controller';

/**
 * Integraciones con webs propias (§13): API pública /public/v1 con llaves
 * por tenant, webhooks salientes firmados con HMAC y panel de administración.
 * Separada por completo de la API interna api/v1 del campus.
 */
@Module({
  imports: [PrismaModule, PublicSiteModule, AdmissionsModule],
  controllers: [PublicApiController, IntegracionesAdminController],
  providers: [ApiKeysService, PublicApiGuard, IdempotencyInterceptor, WebhooksService],
  exports: [ApiKeysService],
})
export class PublicApiModule {}
