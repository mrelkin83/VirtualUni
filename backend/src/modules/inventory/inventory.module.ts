import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { PrismaModule } from '@/common/prisma/prisma.module';

/**
 * Modulo de gestion de inventario
 * Proporciona funcionalidades completas para el CRUD de items de inventario,
 * registro de movimientos (entradas/salidas/ajustes), estadisticas
 * y control automatico de stock
 */
@Module({
  imports: [PrismaModule],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
