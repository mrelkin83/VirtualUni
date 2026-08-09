import { Module } from '@nestjs/common';
import { IdCardsService } from './idcards.service';
import { IdCardsController } from './idcards.controller';
import { PrismaModule } from '@/common/prisma/prisma.module';

/**
 * Modulo de Carnetizacion (ID Cards)
 * Proporciona funcionalidades completas para:
 * - CRUD de carnets de identificacion
 * - Generacion automatica de numeros de carnet (CARD-YYYY-XXX)
 * - Generacion y verificacion de codigos QR
 * - Renovacion de carnets
 * - Bloqueo/desbloqueo de carnets
 * - Reporte de carnets perdidos
 * - Estadisticas y exportacion de datos
 */
@Module({
  imports: [PrismaModule],
  controllers: [IdCardsController],
  providers: [IdCardsService],
  exports: [IdCardsService],
})
export class IdCardsModule {}
