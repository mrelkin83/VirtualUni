import { Module } from '@nestjs/common';
import { PrismaModule } from '@/common/prisma/prisma.module';
import { PublicSiteModule } from '../public-site/public-site.module';
import { AdmissionsService } from './admissions.service';
import { MailService } from './mail.service';
import { ArchivosAdmisionService } from './archivos.service';
import { AspiranteController, ContactoController } from './aspirante.controller';
import { AdmissionsRenderController } from './admissions-render.controller';
import { AdmissionsAdminController } from './admissions-admin.controller';

/**
 * Inscripciones en línea (§6). Regla API-first: toda la lógica vive en
 * AdmissionsService; el formulario HTML, los endpoints públicos JSON, la
 * bandeja del admin y (en fases posteriores) el widget y la API pública son
 * capas delgadas sobre el mismo servicio.
 */
@Module({
  imports: [PrismaModule, PublicSiteModule],
  controllers: [AspiranteController, ContactoController, AdmissionsRenderController, AdmissionsAdminController],
  providers: [AdmissionsService, MailService, ArchivosAdmisionService],
  exports: [AdmissionsService],
})
export class AdmissionsModule {}
