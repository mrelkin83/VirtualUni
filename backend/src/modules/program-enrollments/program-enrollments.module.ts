import { Module } from '@nestjs/common';
import { ProgramEnrollmentsService } from './program-enrollments.service';
import {
  ProgramEnrollmentsController,
  StudentProgramsController,
} from './program-enrollments.controller';
import { PrismaModule } from '@/common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProgramEnrollmentsController, StudentProgramsController],
  providers: [ProgramEnrollmentsService],
  exports: [ProgramEnrollmentsService],
})
export class ProgramEnrollmentsModule {}
