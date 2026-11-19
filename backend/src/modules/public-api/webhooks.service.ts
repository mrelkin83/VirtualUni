import { BadRequestException, Injectable, Logger, NotFoundException, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createHmac, randomBytes } from 'crypto';
import { lookup } from 'dns/promises';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PagosWompiService } from '../admissions/pagos-wompi.service';

export const EVENTOS_WEBHOOK = [
  'application.created',
  'application.submitted',
  'application.documents_rejected',
  'payment.confirmed',
  'application.admitted',
  'application.rejected',
  'application.enrolled',
  'lead.created',
] as const;

/** Espera creciente entre reintentos (~24 h en total, §13.4). */
const BACKOFF_MIN = [1, 5, 15, 60, 180, 360, 720, 1440];
const MAX_FALLOS_SEGUIDOS = 10;

/**
 * Webhooks salientes por tenant (§13.4). Un dispatcher de intervalo consume
 * el outbox (§9), crea entregas para los endpoints suscritos y las envía con
 * firma HMAC-SHA256 con marca de tiempo:
 *   VirtualUni-Signature: t=<epoch>,v1=hmac(secret, `${t}.${cuerpo}`)
 * SSRF: URLs hacia IPs privadas, loopback o metadatos de nube se bloquean al
 * registrar Y al enviar (el DNS puede cambiar después de registrada).
 */
@Injectable()
export class WebhooksService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WebhooksService.name);
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cripto: PagosWompiService, // reutiliza cifrar/descifrar AES-GCM
  ) {}

  onModuleInit() {
    // En tests no se arranca el bucle.
    if (process.env.NODE_ENV !== 'test' && !process.env.JEST_WORKER_ID) {
      this.timer = setInterval(() => this.tick().catch((e) => this.logger.error(e.message)), 15_000);
    }
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  // ------------------------------------------------------------ SSRF guard

  private esIpPrivada(ip: string): boolean {
    if (ip.includes(':')) {
      const v6 = ip.toLowerCase();
      return v6 === '::1' || v6.startsWith('fe80') || v6.startsWith('fc') || v6.startsWith('fd') || v6.startsWith('::ffff:127.');
    }
    const [a, b] = ip.split('.').map(Number);
    return (
      a === 127 || a === 10 || a === 0 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 169 && b === 254) // link-local + metadatos de nube
    );
  }

  private async asegurarUrlSegura(url: string) {
    const u = new URL(url);
    const esDev = process.env.NODE_ENV !== 'production';
    if (u.protocol !== 'https:' && !(esDev && u.hostname === 'localhost')) {
      throw new BadRequestException('La URL del webhook debe ser HTTPS');
    }
    if (u.hostname === 'localhost' && !esDev) {
      throw new BadRequestException('URL no permitida');
    }
    if (u.hostname !== 'localhost') {
      try {
        const { address } = await lookup(u.hostname);
        if (this.esIpPrivada(address)) throw new BadRequestException('URL no permitida (red privada)');
      } catch (e) {
        if (e instanceof BadRequestException) throw e;
        throw new BadRequestException('No se pudo resolver el dominio del webhook');
      }
    }
  }

  // ------------------------------------------------------------------ CRUD

  async listar(tenantId: string) {
    const filas = await this.prisma.webhookEndpoint.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, url: true, events: true, active: true, failureCount: true, createdAt: true },
    });
    return filas;
  }

  async crear(tenantId: string, dto: { url: string; events: string[]; active?: boolean }) {
    await this.asegurarUrlSegura(dto.url);
    const events = dto.events.filter((e) => (EVENTOS_WEBHOOK as readonly string[]).includes(e));
    if (!events.length) throw new BadRequestException('Elige al menos un evento válido');
    const secreto = `whsec_${randomBytes(24).toString('base64url')}`;
    const fila = await this.prisma.webhookEndpoint.create({
      data: { tenantId, url: dto.url, events, active: dto.active ?? true, secretEnc: this.cripto.cifrar(secreto) },
    });
    // El secreto se muestra UNA vez, para que el receptor verifique la firma.
    return { id: fila.id, url: fila.url, events: fila.events, active: fila.active, secreto };
  }

  async actualizar(tenantId: string, id: string, dto: { url?: string; events?: string[]; active?: boolean }) {
    const ep = await this.prisma.webhookEndpoint.findFirst({ where: { id, tenantId } });
    if (!ep) throw new NotFoundException('Webhook no encontrado');
    if (dto.url) await this.asegurarUrlSegura(dto.url);
    await this.prisma.webhookEndpoint.update({
      where: { id: ep.id },
      data: {
        url: dto.url,
        events: dto.events?.filter((e) => (EVENTOS_WEBHOOK as readonly string[]).includes(e)),
        active: dto.active,
        ...(dto.active ? { failureCount: 0 } : {}),
      },
    });
    return this.listar(tenantId);
  }

  async eliminar(tenantId: string, id: string) {
    const ep = await this.prisma.webhookEndpoint.findFirst({ where: { id, tenantId }, select: { id: true } });
    if (!ep) throw new NotFoundException('Webhook no encontrado');
    await this.prisma.webhookEndpoint.delete({ where: { id: ep.id } });
    return this.listar(tenantId);
  }

  async entregas(tenantId: string, endpointId: string) {
    const ep = await this.prisma.webhookEndpoint.findFirst({ where: { id: endpointId, tenantId }, select: { id: true } });
    if (!ep) throw new NotFoundException('Webhook no encontrado');
    return this.prisma.webhookDelivery.findMany({
      where: { endpointId: ep.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  /** Botón "Enviar evento de prueba" (§13.6). */
  async enviarPrueba(tenantId: string, endpointId: string) {
    const ep = await this.prisma.webhookEndpoint.findFirst({ where: { id: endpointId, tenantId } });
    if (!ep) throw new NotFoundException('Webhook no encontrado');
    const entrega = await this.prisma.webhookDelivery.create({
      data: {
        tenantId,
        endpointId: ep.id,
        eventType: 'test.ping',
        payload: { message: 'Evento de prueba de VirtualUni', at: new Date().toISOString() },
        nextAttemptAt: new Date(),
      },
    });
    await this.entregar(entrega.id);
    return this.entregas(tenantId, endpointId);
  }

  /** Reenvío manual de una entrega (§13.6). */
  async reenviar(tenantId: string, deliveryId: string) {
    const d = await this.prisma.webhookDelivery.findFirst({ where: { id: deliveryId, tenantId }, select: { id: true, endpointId: true } });
    if (!d) throw new NotFoundException('Entrega no encontrada');
    await this.prisma.webhookDelivery.update({
      where: { id: d.id },
      data: { nextAttemptAt: new Date(), deliveredAt: null },
    });
    await this.entregar(d.id);
    return this.entregas(tenantId, d.endpointId);
  }

  // ------------------------------------------------------------ dispatcher

  /** Firma como la verificará el receptor: rechaza repeticiones viejas por t. */
  firmar(secreto: string, timestampSeg: number, cuerpo: string): string {
    return createHmac('sha256', secreto).update(`${timestampSeg}.${cuerpo}`).digest('hex');
  }

  async tick() {
    // 1) outbox → entregas para los endpoints suscritos del tenant
    const pendientes = await this.prisma.outboxEvent.findMany({
      where: { deliveredAt: null },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });
    for (const ev of pendientes) {
      const endpoints = await this.prisma.webhookEndpoint.findMany({
        where: { tenantId: ev.tenantId, active: true, events: { has: ev.type } },
        select: { id: true },
      });
      if (endpoints.length) {
        await this.prisma.webhookDelivery.createMany({
          data: endpoints.map((ep) => ({
            tenantId: ev.tenantId,
            endpointId: ep.id,
            eventType: ev.type,
            payload: ev.payload as Prisma.InputJsonValue,
            nextAttemptAt: new Date(),
          })),
        });
      }
      await this.prisma.outboxEvent.update({ where: { id: ev.id }, data: { deliveredAt: new Date() } });
    }

    // 2) entregas vencidas
    const listas = await this.prisma.webhookDelivery.findMany({
      where: { deliveredAt: null, nextAttemptAt: { lte: new Date() }, attempt: { lt: BACKOFF_MIN.length } },
      orderBy: { nextAttemptAt: 'asc' },
      take: 20,
      select: { id: true },
    });
    for (const d of listas) await this.entregar(d.id);
  }

  private async entregar(deliveryId: string) {
    const d = await this.prisma.webhookDelivery.findUnique({
      where: { id: deliveryId },
      include: { endpoint: true },
    });
    if (!d || d.deliveredAt) return;

    const cuerpo = JSON.stringify({ id: d.id, type: d.eventType, createdAt: d.createdAt, data: d.payload });
    const t = Math.floor(Date.now() / 1000);
    let ok = false;
    let codigo: number | null = null;
    let error: string | null = null;

    try {
      await this.asegurarUrlSegura(d.endpoint.url);
      const secreto = this.cripto.descifrar(d.endpoint.secretEnc);
      const res = await fetch(d.endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'VirtualUni-Signature': `t=${t},v1=${this.firmar(secreto, t, cuerpo)}`,
          'User-Agent': 'VirtualUni-Webhooks/1.0',
        },
        body: cuerpo,
        signal: AbortSignal.timeout(10_000),
      });
      codigo = res.status;
      ok = res.status >= 200 && res.status < 300;
      if (!ok) error = `HTTP ${res.status}`;
    } catch (e) {
      error = (e as Error).message.slice(0, 300);
    }

    if (ok) {
      await this.prisma.webhookDelivery.update({
        where: { id: d.id },
        data: { deliveredAt: new Date(), responseCode: codigo, attempt: d.attempt + 1, lastError: null },
      });
      if (d.endpoint.failureCount > 0) {
        await this.prisma.webhookEndpoint.update({ where: { id: d.endpointId }, data: { failureCount: 0 } });
      }
      return;
    }

    const intento = d.attempt + 1;
    const agotado = intento >= BACKOFF_MIN.length;
    await this.prisma.webhookDelivery.update({
      where: { id: d.id },
      data: {
        attempt: intento,
        responseCode: codigo,
        lastError: error,
        nextAttemptAt: agotado ? null : new Date(Date.now() + BACKOFF_MIN[intento] * 60_000),
      },
    });
    const fallos = d.endpoint.failureCount + 1;
    const desactivar = fallos >= MAX_FALLOS_SEGUIDOS;
    await this.prisma.webhookEndpoint.update({
      where: { id: d.endpointId },
      data: { failureCount: fallos, ...(desactivar ? { active: false } : {}) },
    });
    if (desactivar) {
      this.logger.warn(`Webhook ${d.endpoint.url} desactivado tras ${fallos} fallos seguidos (tenant ${d.tenantId})`);
    }
  }
}
