import { Module } from '@nestjs/common';
import { ProgramEnrollmentsService } from './program-enrollments.service';
import {
  ProgramEnrollmentsController,
  StudentProgramsController,
} from './program-enrollments.controller';
import { PrismaModule } from '@/common/prisma/prisma.module';
import { ProgramsModule } from '../programs/programs.module';

@Module({
  // ProgramsModule: reutiliza StudyPlansService para armar el pensum
  imports: [PrismaModule, ProgramsModule],
  controllers: [ProgramEnrollmentsController, StudentProgramsController],
  providers: [ProgramEnrollmentsService],
  exports: [ProgramEnrollmentsService],
})
export class ProgramEnrollmentsModule {}
