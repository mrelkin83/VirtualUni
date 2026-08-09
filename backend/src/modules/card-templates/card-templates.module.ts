import { Module } from '@nestjs/common';
import { CardTemplatesService } from './card-templates.service';
import { CardTemplatesController } from './card-templates.controller';
import { PrismaModule } from '@/common/prisma/prisma.module';

/**
 * Módulo de plantillas de carnets
 * Gestiona el CRUD y operaciones de plantillas personalizables
 */
@Module({
  imports: [PrismaModule],
  controllers: [CardTemplatesController],
  providers: [CardTemplatesService],
  exports: [CardTemplatesService],
})
export class CardTemplatesModule {}
