import { Module } from '@nestjs/common';
import { CourseTopicsService } from './course-topics.service';
import { CourseTopicsController } from './course-topics.controller';
import { PrismaModule } from '@/common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CourseTopicsController],
  providers: [CourseTopicsService],
  exports: [CourseTopicsService],
})
export class CourseTopicsModule {}
