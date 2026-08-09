import { Module } from '@nestjs/common';
import { CardGeneratorService } from './card-generator.service';
import { CardGeneratorController } from './card-generator.controller';
import { PdfGenerator } from './generators/pdf.generator';
import { PrismaModule } from '@/common/prisma/prisma.module';

/**
 * Módulo de generación de carnets en PDF
 * Proporciona servicios para generar carnets imprimibles
 */
@Module({
  imports: [PrismaModule],
  controllers: [CardGeneratorController],
  providers: [CardGeneratorService, PdfGenerator],
  exports: [CardGeneratorService, PdfGenerator],
})
export class CardGeneratorModule {}
