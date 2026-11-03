import { Module } from '@nestjs/common';
import { CourseTopicsService } from './course-topics.service';
import { CourseTopicsController } from './course-topics.controller';
import { PrismaModule } from '@/common/prisma/prisma.module';
import { SubjectsModule } from '../subjects/subjects.module';

@Module({
  // SubjectsModule: permiso de editor del contenido maestro
  imports: [PrismaModule, SubjectsModule],
  controllers: [CourseTopicsController],
  providers: [CourseTopicsService],
  exports: [CourseTopicsService],
})
export class CourseTopicsModule {}
