import { Module } from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { StudyPlansService } from './study-plans.service';
import { ProgramsController } from './programs.controller';
import {
  StudyPlansController,
  StudyPlanSubjectsController,
} from './study-plans.controller';
import { PrismaModule } from '@/common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    ProgramsController,
    StudyPlansController,
    StudyPlanSubjectsController,
  ],
  providers: [ProgramsService, StudyPlansService],
  exports: [ProgramsService, StudyPlansService],
})
export class ProgramsModule {}
