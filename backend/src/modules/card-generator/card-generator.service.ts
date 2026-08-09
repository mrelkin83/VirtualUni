import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { PdfGenerator, CardData, TemplateConfig } from './generators/pdf.generator';

/**
 * Servicio para generación de carnets en PDF
 * Coordina la generación usando plantillas y datos de carnets
 */
@Injectable()
export class CardGeneratorService {
  private readonly logger = new Logger(CardGeneratorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfGenerator: PdfGenerator,
  ) {}

  /**
   * Genera un PDF para un carnet específico
   * @param cardId - ID del carnet
   * @param tenantId - ID del tenant
   * @returns Buffer del PDF generado
   */
  async generateCardPDF(cardId: string, tenantId: string): Promise<Buffer> {
    this.logger.log(`Generating PDF for card ${cardId}`);

    // Obtener carnet con su plantilla
    const card = await this.prisma.iDCard.findFirst({
      where: { id: cardId, tenantId },
      include: { template: true },
    });

    if (!card) {
      throw new NotFoundException(`Carnet con ID ${cardId} no encontrado`);
    }

    // Preparar datos del carnet
    const cardData: CardData = {
      numeroCarnet: card.numeroCarnet,
      nombre: card.nombre,
      identificacion: card.identificacion,
      tipoUsuario: card.tipoUsuario,
      fechaEmision: card.fechaEmision,
      fechaVencimiento: card.fechaVencimiento,
      fotoUrl: card.fotoUrl,
      qrCode: card.qrCode || undefined,
    };

    // Obtener plantilla o usar predeterminada
    let template: TemplateConfig;

    if (card.template) {
      template = this.mapTemplateConfig(card.template);
    } else {
      // Buscar plantilla predeterminada
      const defaultTemplate = await this.prisma.cardTemplate.findFirst({
        where: {
          tenantId,
          tiposUsuario: { has: card.tipoUsuario },
          esPredeterminada: true,
          esActiva: true,
        },
      });

      if (!defaultTemplate) {
        throw new NotFoundException(
          `No hay plantilla predeterminada para el tipo ${card.tipoUsuario}`,
        );
      }

      template = this.mapTemplateConfig(defaultTemplate);
    }

    // Generar PDF
    const pdfBuffer = await this.pdfGenerator.generateSingleCard(cardData, template);

    this.logger.log(`PDF generated successfully for card ${cardId}`);
    return pdfBuffer;
  }

  /**
   * Genera PDFs para una expedición completa
   * @param issuanceId - ID de la expedición
   * @param tenantId - ID del tenant
   * @returns Buffer del PDF con todos los carnets
   */
  async generateIssuancePDF(issuanceId: string, tenantId: string): Promise<Buffer> {
    this.logger.log(`Generating PDF for issuance ${issuanceId}`);

    // Obtener expedición con carnets y plantilla
    const issuance = await this.prisma.cardIssuance.findFirst({
      where: { id: issuanceId, tenantId },
      include: {
        template: true,
        carnets: true,
      },
    });

    if (!issuance) {
      throw new NotFoundException(`Expedición con ID ${issuanceId} no encontrada`);
    }

    if (!issuance.template) {
      throw new NotFoundException('Expedición sin plantilla asociada');
    }

    // Preparar datos de todos los carnets
    const cardsData: CardData[] = issuance.carnets.map((card) => ({
      numeroCarnet: card.numeroCarnet,
      nombre: card.nombre,
      identificacion: card.identificacion,
      tipoUsuario: card.tipoUsuario,
      fechaEmision: card.fechaEmision,
      fechaVencimiento: card.fechaVencimiento,
      fotoUrl: card.fotoUrl,
      qrCode: card.qrCode || undefined,
    }));

    const template = this.mapTemplateConfig(issuance.template);

    // Generar PDF masivo
    const pdfBuffer = await this.pdfGenerator.generateMultipleCards(cardsData, template);

    this.logger.log(
      `PDF generated successfully for issuance ${issuanceId} with ${cardsData.length} cards`,
    );

    return pdfBuffer;
  }

  /**
   * Genera una vista previa de una plantilla
   * @param templateId - ID de la plantilla
   * @param tenantId - ID del tenant
   * @returns Buffer del PDF de vista previa
   */
  async generateTemplatePreview(templateId: string, tenantId: string): Promise<Buffer> {
    this.logger.log(`Generating preview for template ${templateId}`);

    const template = await this.prisma.cardTemplate.findFirst({
      where: { id: templateId, tenantId },
    });

    if (!template) {
      throw new NotFoundException(`Plantilla con ID ${templateId} no encontrada`);
    }

    // Crear datos de ejemplo para la vista previa
    const sampleData: CardData = {
      numeroCarnet: 'CARD-2024-0001',
      nombre: 'Juan Pérez García',
      identificacion: '1234567890',
      tipoUsuario: template.tiposUsuario[0] || 'ESTUDIANTE',
      fechaEmision: new Date(),
      fechaVencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      fotoUrl: 'https://via.placeholder.com/150',
      qrCode: 'preview-qr-code',
    };

    const templateConfig = this.mapTemplateConfig(template);

    const pdfBuffer = await this.pdfGenerator.generateSingleCard(sampleData, templateConfig);

    this.logger.log(`Preview generated successfully for template ${templateId}`);
    return pdfBuffer;
  }

  /**
   * Mapea un registro de plantilla a la configuración del generador
   * @param template - Plantilla de la BD
   * @returns Configuración para el generador
   */
  private mapTemplateConfig(template: any): TemplateConfig {
    return {
      nombre: template.nombre,
      layoutConfig: template.layoutConfig,
      campos: template.campos,
      ancho: template.ancho,
      alto: template.alto,
      orientacion: template.orientacion,
      colorPrimario: template.colorPrimario,
      colorSecundario: template.colorSecundario,
      colorTexto: template.colorTexto,
      fuentePrincipal: template.fuentePrincipal,
      fuenteSecundaria: template.fuenteSecundaria,
      logoUrl: template.logoUrl,
      fondoFrontalUrl: template.fondoFrontalUrl,
      fondoPosteriorUrl: template.fondoPosteriorUrl,
      incluirQR: template.incluirQR,
      incluirCodigoBarras: template.incluirCodigoBarras,
      doblesCara: template.doblesCara,
    };
  }
}
