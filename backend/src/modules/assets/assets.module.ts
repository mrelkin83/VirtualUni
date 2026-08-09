import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { PrismaModule } from '@/common/prisma/prisma.module';

/**
 * Modulo de gestion de activos
 * Proporciona funcionalidades completas para el CRUD de activos
 * incluyendo estadisticas, depreciacion y agrupamiento por categoria
 */
@Module({
  imports: [PrismaModule],
  controllers: [AssetsController],
  providers: [AssetsService],
  exports: [AssetsService],
})
export class AssetsModule {}
