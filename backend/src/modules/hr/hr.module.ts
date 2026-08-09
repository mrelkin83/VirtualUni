import { Module } from '@nestjs/common';
import { HrService } from './hr.service';
import { HrController } from './hr.controller';
import { PrismaModule } from '@/common/prisma/prisma.module';

/**
 * Modulo de Recursos Humanos (HR)
 * Proporciona funcionalidades completas para:
 * - CRUD de empleados
 * - CRUD de solicitudes de vacaciones
 * - Aprobacion/rechazo de vacaciones
 * - Estadisticas de empleados
 * - Calculo de dias de vacaciones
 */
@Module({
  imports: [PrismaModule],
  controllers: [HrController],
  providers: [HrService],
  exports: [HrService],
})
export class HrModule {}
