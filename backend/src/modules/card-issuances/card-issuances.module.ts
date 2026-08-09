import { Module } from '@nestjs/common';
import { CardIssuancesService } from './card-issuances.service';
import { CardIssuancesController } from './card-issuances.controller';
import { PrismaModule } from '@/common/prisma/prisma.module';

/**
 * Módulo de expediciones de carnets
 * Gestiona el proceso de expedición masiva y control
 */
@Module({
  imports: [PrismaModule],
  controllers: [CardIssuancesController],
  providers: [CardIssuancesService],
  exports: [CardIssuancesService],
})
export class CardIssuancesModule {}
