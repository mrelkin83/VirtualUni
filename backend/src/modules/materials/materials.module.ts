import { Module } from '@nestjs/common';
import { MaterialsController } from './materials.controller';
import { MaterialsService } from './materials.service';
import { PrismaModule } from '@/common/prisma/prisma.module';
import { SubjectsModule } from '../subjects/subjects.module';

@Module({
  // SubjectsModule: permiso de editor del contenido maestro
  imports: [PrismaModule, SubjectsModule],
  controllers: [MaterialsController],
  providers: [MaterialsService],
  exports: [MaterialsService],
})
export class MaterialsModule {}
