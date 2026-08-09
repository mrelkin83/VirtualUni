import { Module } from '@nestjs/common';
import { MassMessagesService } from './mass-messages.service';
import { MassMessagesController } from './mass-messages.controller';
import { PrismaModule } from '@/common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MassMessagesController],
  providers: [MassMessagesService],
  exports: [MassMessagesService],
})
export class MassMessagesModule {}
