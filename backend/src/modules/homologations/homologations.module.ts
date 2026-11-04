import { Module } from '@nestjs/common';
import { HomologationsService } from './homologations.service';
import {
  HomologationsController,
  SubjectEquivalencesController,
} from './homologations.controller';
import { PrismaModule } from '@/common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SubjectEquivalencesController, HomologationsController],
  providers: [HomologationsService],
  exports: [HomologationsService],
})
export class HomologationsModule {}
