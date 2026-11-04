import { Module } from '@nestjs/common';
import { AcademicRecordsService } from './academic-records.service';
import { ProgresoService } from './progreso.service';
import {
  AcademicRecordsController,
  ProgramArticulationController,
  StudentAcademicRecordController,
} from './academic-records.controller';
import { PrismaModule } from '@/common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    AcademicRecordsController,
    StudentAcademicRecordController,
    ProgramArticulationController,
  ],
  providers: [AcademicRecordsService, ProgresoService],
  // ProgresoService lo consumen homologations (validar % reconocido) y los
  // bloques certificables (elegibilidad).
  exports: [AcademicRecordsService, ProgresoService],
})
export class AcademicRecordsModule {}
