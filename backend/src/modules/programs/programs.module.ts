import { Module } from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { StudyPlansService } from './study-plans.service';
import { StudyPlanBlocksService } from './study-plan-blocks.service';
import { ProgramsController } from './programs.controller';
import {
  StudyPlansController,
  StudyPlanSubjectsController,
} from './study-plans.controller';
import {
  StudyPlanBlocksController,
  StudyPlanBlocksOfPlanController,
} from './study-plan-blocks.controller';
import { PrismaModule } from '@/common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    ProgramsController,
    StudyPlansController,
    StudyPlanSubjectsController,
    StudyPlanBlocksOfPlanController,
    StudyPlanBlocksController,
  ],
  providers: [ProgramsService, StudyPlansService, StudyPlanBlocksService],
  exports: [ProgramsService, StudyPlansService, StudyPlanBlocksService],
})
export class ProgramsModule {}
