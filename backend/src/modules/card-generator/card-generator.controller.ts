import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseUUIDPipe,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { CardGeneratorService } from './card-generator.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';

/**
 * Controlador para generación de carnets en PDF
 * Proporciona endpoints para generar PDFs de carnets
 */
@ApiTags('card-generator')
@Controller('card-generator')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class CardGeneratorController {
  constructor(private readonly cardGeneratorService: CardGeneratorService) {}

  /**
   * Genera PDF de un carnet individual
   */
  @Get('card/:id/pdf')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Generar PDF de carnet',
    description: 'Genera un PDF listo para imprimir de un carnet específico.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del carnet',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'PDF generado exitosamente',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Carnet no encontrado',
  })
  async generateCardPDF(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.cardGeneratorService.generateCardPDF(id, tenantId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=carnet-${id}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    res.status(HttpStatus.OK).send(pdfBuffer);
  }

  /**
   * Genera PDF de una expedición completa
   */
  @Get('issuance/:id/pdf')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Generar PDF de expedición',
    description: 'Genera un PDF con todos los carnets de una expedición.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la expedición',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'PDF generado exitosamente',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Expedición no encontrada',
  })
  async generateIssuancePDF(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.cardGeneratorService.generateIssuancePDF(id, tenantId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=expedicion-${id}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    res.status(HttpStatus.OK).send(pdfBuffer);
  }

  /**
   * Genera vista previa de una plantilla
   */
  @Get('template/:id/preview')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Vista previa de plantilla',
    description: 'Genera una vista previa en PDF de una plantilla con datos de ejemplo.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la plantilla',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Vista previa generada exitosamente',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Plantilla no encontrada',
  })
  async generateTemplatePreview(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.cardGeneratorService.generateTemplatePreview(id, tenantId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=preview-template-${id}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    res.status(HttpStatus.OK).send(pdfBuffer);
  }
}
