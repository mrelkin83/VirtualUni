import { Module } from '@nestjs/common';
import { QuestionBankService } from './question-bank.service';
import { QuestionBankController } from './question-bank.controller';
import { PrismaModule } from '@/common/prisma/prisma.module';
import { SubjectsModule } from '../subjects/subjects.module';

@Module({
  // SubjectsModule: permiso de editor del contenido maestro
  imports: [PrismaModule, SubjectsModule],
  controllers: [QuestionBankController],
  providers: [QuestionBankService],
})
export class QuestionBankModule {}
