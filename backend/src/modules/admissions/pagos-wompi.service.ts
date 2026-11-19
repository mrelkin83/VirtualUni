import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from 'crypto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AdmissionsService } from './admissions.service';

/**
 * Wompi POR INSTITUCIÓN (§7): la inscripción se paga a la cuenta Wompi del
 * tenant, no a la de VirtualUni. Separado a propósito del módulo billing
 * (suscripciones de la plataforma).
 *
 * El algoritmo de firma/checksum replica el ya CORREGIDO de
 * billing.service.ts — este módulo tuvo un bug real donde verificarChecksum
 * descartaba el primer segmento de cada ruta de signature.properties y su
 * test pasaba igual (ver .claude/skills/billing-regression-check/SKILL.md):
 * aquí las rutas se recorren completas desde payload.data.
 */

export interface WompiWebhookPayload {
  event: string;
  data: { transaction: { id: string; status: string; reference: string; amount_in_cents: number } };
  signature: { checksum: string; properties: string[]; timestamp?: number };
  timestamp?: number;
}

@Injectable()
export class PagosWompiService {
  private readonly logger = new Logger(PagosWompiService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly admissions: AdmissionsService,
  ) {}

  // ---------------------------------------------- cifrado de llaves (AES-256-GCM)

  private claveMaestra(): Buffer {
    const cruda = process.env.PAYMENTS_MASTER_KEY;
    if (!cruda) {
      throw new ServiceUnavailableException(
        'Pagos en línea no disponibles: falta PAYMENTS_MASTER_KEY en el servidor',
      );
    }
    // Cualquier longitud de secreto → 32 bytes estables.
    return createHash('sha256').update(cruda).digest();
  }

  cifrar(textoPlano: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.claveMaestra(), iv);
    const cifrado = Buffer.concat([cipher.update(textoPlano, 'utf8'), cipher.final()]);
    return `${iv.toString('base64url')}.${cipher.getAuthTag().toString('base64url')}.${cifrado.toString('base64url')}`;
  }

  descifrar(empaquetado: string): string {
    const [iv, tag, datos] = empaquetado.split('.');
    const decipher = createDecipheriv('aes-256-gcm', this.claveMaestra(), Buffer.from(iv, 'base64url'));
    decipher.setAuthTag(Buffer.from(tag, 'base64url'));
    return Buffer.concat([decipher.update(Buffer.from(datos, 'base64url')), decipher.final()]).toString('utf8');
  }

  // ------------------------------------------------------- configuración admin

  /** Nunca devuelve llaves: solo si están configuradas. */
  async estado(tenantId: string) {
    const cfg = await this.prisma.tenantPaymentConfig.findUnique({ where: { tenantId } });
    return {
      publicKey: cfg?.publicKey ?? null,
      integrityConfigurada: !!cfg?.integrityKeyEnc,
      eventsConfigurada: !!cfg?.eventsKeyEnc,
      testMode: cfg?.testMode ?? true,
      active: cfg?.active ?? false,
      urlWebhook: `/public/payments/wompi/`, // + slug del tenant (lo arma la UI)
    };
  }

  async guardar(tenantId: string, dto: {
    publicKey?: string; integrityKey?: string; eventsKey?: string;
    testMode?: boolean; active?: boolean;
  }) {
    if (dto.active) {
      const cfg = await this.prisma.tenantPaymentConfig.findUnique({ where: { tenantId } });
      const tendraIntegrity = dto.integrityKey || cfg?.integrityKeyEnc;
      const tendraEvents = dto.eventsKey || cfg?.eventsKeyEnc;
      const tendraPublic = dto.publicKey || cfg?.publicKey;
      if (!tendraPublic || !tendraIntegrity || !tendraEvents) {
        throw new BadRequestException('Para activar Wompi se necesitan la llave pública, la de integridad y la de eventos');
      }
    }
    await this.prisma.tenantPaymentConfig.upsert({
      where: { tenantId },
      update: {
        publicKey: dto.publicKey,
        integrityKeyEnc: dto.integrityKey ? this.cifrar(dto.integrityKey) : undefined,
        eventsKeyEnc: dto.eventsKey ? this.cifrar(dto.eventsKey) : undefined,
        testMode: dto.testMode,
        active: dto.active,
      },
      create: {
        tenantId,
        publicKey: dto.publicKey ?? null,
        integrityKeyEnc: dto.integrityKey ? this.cifrar(dto.integrityKey) : null,
        eventsKeyEnc: dto.eventsKey ? this.cifrar(dto.eventsKey) : null,
        testMode: dto.testMode ?? true,
        active: dto.active ?? false,
      },
    });
    return this.estado(tenantId);
  }

  async activaPara(tenantId: string): Promise<boolean> {
    const cfg = await this.prisma.tenantPaymentConfig.findUnique({
      where: { tenantId },
      select: { active: true, publicKey: true, integrityKeyEnc: true, eventsKeyEnc: true },
    });
    return !!(cfg?.active && cfg.publicKey && cfg.integrityKeyEnc && cfg.eventsKeyEnc);
  }

  // ----------------------------------------------------------------- checkout

  /**
   * Parámetros del checkout de Wompi para la solicitud del aspirante (con
   * sesión). Referencia = INSW-<applicationId>: única y no adivinable.
   */
  async checkout(tenantId: string, email: string, code: string, redirectUrl: string) {
    const cfg = await this.prisma.tenantPaymentConfig.findUnique({ where: { tenantId } });
    if (!cfg?.active || !cfg.publicKey || !cfg.integrityKeyEnc) {
      throw new BadRequestException('La institución no tiene pagos en línea activos');
    }
    const solicitudes = await this.admissions.misSolicitudes(tenantId, email);
    const sol = solicitudes.find((s) => s.code === code);
    if (!sol) throw new NotFoundException('Solicitud no encontrada');
    if (sol.status !== 'PAGO_PENDIENTE') throw new BadRequestException('La solicitud no tiene un pago pendiente');
    if (!sol.applicationFee) throw new BadRequestException('Esta convocatoria no cobra inscripción');

    const app = await this.prisma.application.findFirst({
      where: { tenantId, code },
      select: { id: true },
    });
    if (!app) throw new NotFoundException('Solicitud no encontrada');

    const reference = `INSW-${app.id}`;
    const amountInCents = sol.applicationFee * 100;
    const currency = 'COP';
    // Misma derivación que billing.createCheckoutSession (algoritmo verificado).
    const integrity = createHash('sha256')
      .update(`${reference}${amountInCents}${currency}${this.descifrar(cfg.integrityKeyEnc)}`)
      .digest('hex');

    const params = new URLSearchParams({
      'public-key': cfg.publicKey,
      currency,
      'amount-in-cents': String(amountInCents),
      reference,
      'redirect-url': redirectUrl,
      'signature:integrity': integrity,
    });
    return { url: `https://checkout.wompi.co/p/?${params.toString()}` };
  }

  // ------------------------------------------------------------------ webhook

  /**
   * Checksum del evento: concatenar los valores de signature.properties
   * (rutas COMPLETAS desde payload.data) + timestamp + llave de eventos del
   * TENANT, sha256, comparación case-insensitive y en tiempo constante.
   */
  verificarChecksum(payload: WompiWebhookPayload, eventsKey: string): boolean {
    const timestamp = payload.signature?.timestamp ?? payload.timestamp;
    if (timestamp === undefined || !payload.signature?.properties || !payload.signature.checksum) return false;

    const valores = payload.signature.properties.map((ruta) => {
      let actual: unknown = payload.data;
      for (const parte of ruta.split('.')) {
        actual = (actual as Record<string, unknown> | undefined)?.[parte];
      }
      return String(actual ?? '');
    });
    const esperado = createHash('sha256')
      .update(`${valores.join('')}${timestamp}${eventsKey}`)
      .digest('hex')
      .toLowerCase();
    const recibido = String(payload.signature.checksum).toLowerCase();
    const a = Buffer.from(esperado);
    const b = Buffer.from(recibido);
    return a.length === b.length && timingSafeEqual(a, b);
  }

  /**
   * POST /public/payments/wompi/:tenantSlug — el tenant sale del SLUG de la
   * ruta y el secreto de eventos es el de ESE tenant. Idempotente por
   * transaction.id. Un checksum inválido lanza (status no-2xx → Wompi
   * reintenta).
   */
  async procesarWebhook(tenantSlug: string, payload: WompiWebhookPayload) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      select: { id: true },
    });
    if (!tenant) throw new NotFoundException('No encontrado');
    const cfg = await this.prisma.tenantPaymentConfig.findUnique({ where: { tenantId: tenant.id } });
    if (!cfg?.eventsKeyEnc) throw new NotFoundException('No encontrado');

    if (!this.verificarChecksum(payload, this.descifrar(cfg.eventsKeyEnc))) {
      throw new BadRequestException('Checksum inválido');
    }

    if (payload.event !== 'transaction.updated') return { received: true, ignored: true };
    const tx = payload.data.transaction;
    if (tx.status !== 'APPROVED') {
      this.logger.log(`Wompi tx ${tx.id} en ${tx.status}: sin acción`);
      return { received: true };
    }

    const appId = /^INSW-(.+)$/.exec(tx.reference)?.[1];
    if (!appId) return { received: true, ignored: true };

    const app = await this.prisma.application.findFirst({
      where: { id: appId, tenantId: tenant.id },
      include: { call: { select: { applicationFee: true } } },
    });
    if (!app) return { received: true, ignored: true };

    // Idempotencia: el mismo evento repetido no duplica nada.
    if (app.paidAt && app.paymentRef === tx.id) return { received: true, duplicated: true };
    if (app.paidAt) return { received: true, ignored: true };

    // El monto aprobado debe ser el de la convocatoria: un pago parcial no marca.
    const esperado = (app.call?.applicationFee ?? 0) * 100;
    if (esperado > 0 && tx.amount_in_cents !== esperado) {
      this.logger.warn(`Wompi tx ${tx.id}: monto ${tx.amount_in_cents} != esperado ${esperado}`);
      return { received: true, ignored: true };
    }

    await this.prisma.application.update({
      where: { id: app.id },
      data: { paidAt: new Date(), paymentMethod: 'WOMPI', paymentRef: tx.id },
    });
    await this.prisma.applicationEvent.create({
      data: {
        tenantId: tenant.id,
        applicationId: app.id,
        type: 'payment_confirmed',
        data: { via: 'wompi', transactionId: tx.id },
      },
    });
    try {
      await this.prisma.outboxEvent.create({
        data: {
          tenantId: tenant.id,
          type: 'payment.confirmed',
          payload: { applicationId: app.id, via: 'wompi', transactionId: tx.id },
        },
      });
    } catch {
      /* el outbox jamás tumba un pago */
    }
    // Tras pagar: a revisión si los docs están completos; PAGADA si no.
    const pendientes = await this.prisma.applicationDocument.count({
      where: { applicationId: app.id, requiredDocId: { not: null }, status: { not: 'APROBADO' } },
    });
    await this.prisma.application.update({
      where: { id: app.id },
      data: { status: pendientes === 0 ? 'EN_REVISION' : 'PAGADA' },
    });
    return { received: true };
  }
}
