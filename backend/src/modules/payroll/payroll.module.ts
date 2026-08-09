import { Module } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { PayrollController } from './payroll.controller';
import { PrismaModule } from '@/common/prisma/prisma.module';

/**
 * Modulo de gestion de nomina
 * Proporciona funcionalidades completas para:
 * - CRUD de empleados de nomina
 * - CRUD de registros de nomina
 * - Procesamiento masivo de nomina por periodo
 * - Estadisticas y reportes
 * - Exportacion de datos para PDF
 */
@Module({
  imports: [PrismaModule],
  controllers: [PayrollController],
  providers: [PayrollService],
  exports: [PayrollService],
})
export class PayrollModule {}
