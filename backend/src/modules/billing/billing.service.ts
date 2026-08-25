import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { PrismaService } from '@/common/prisma/prisma.service';
import { Plan, SubscriptionStatus, InvoiceStatus } from '@prisma/client';

/**
 * Duración de un periodo pagado. Wompi no tiene un objeto de "suscripción"
 * recurrente como Stripe: cada checkout paga un mes y hay que volver a pagar
 * para renovar. Automatizar el cobro periódico (con una fuente de pago
 * tokenizada y reintentos) es una mejora aparte, no parte de este cambio de
 * pasarela — ver docs/DECISIONES_PENDIENTES.md.
 */
const DIAS_POR_PERIODO = 30;

/** Separador que no puede aparecer ni en un uuid (hex + guiones) ni en un Plan (mayúsculas). */
const SEPARADOR_REFERENCIA = '__';

export interface WompiWebhookPayload {
  event: string;
  data: {
    transaction: {
      id: string;
      amount_in_cents: number;
      reference: string;
      currency: string;
      status: string;
    };
  };
  signature: {
    properties: string[];
    checksum: string;
    timestamp?: number;
  };
  timestamp?: number;
}

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  // Montos mensuales en COP. Son un placeholder de negocio (no tengo el
  // precio real) — ajustar aquí cuando se defina.
  private readonly PLAN_PRICES_COP: Record<Plan, number | null> = {
    [Plan.FREE]: null,
    [Plan.BASIC]: 120_000,
    [Plan.PROFESSIONAL]: 400_000,
    [Plan.ENTERPRISE]: 1_200_000,
  };

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  private get publicKey(): string | undefined {
    return this.configService.get<string>('WOMPI_PUBLIC_KEY');
  }

  private get integritySecret(): string | undefined {
    return this.configService.get<string>('WOMPI_INTEGRITY_SECRET');
  }

  private get eventsSecret(): string | undefined {
    return this.configService.get<string>('WOMPI_EVENTS_SECRET');
  }

  private codificarReferencia(tenantId: string, plan: Plan): string {
    return ['sub', tenantId, plan, Date.now().toString(36)].join(SEPARADOR_REFERENCIA);
  }

  private decodificarReferencia(reference: string): { tenantId: string; plan: Plan } | null {
    const partes = reference.split(SEPARADOR_REFERENCIA);
    if (partes.length !== 4 || partes[0] !== 'sub') return null;

    const [, tenantId, plan] = partes;
    if (!Object.values(Plan).includes(plan as Plan)) return null;

    return { tenantId, plan: plan as Plan };
  }

  /**
   * Crea la URL de checkout de Wompi. A diferencia de Stripe no hay una
   * "sesión" que crear vía API: el checkout es un formulario/redirect con la
   * firma de integridad calculada aquí para que el monto no se pueda alterar
   * desde el navegador.
   */
  async createCheckoutSession(plan: Plan, tenantId: string, successUrl: string, cancelUrl: string) {
    if (!this.publicKey || !this.integritySecret) {
      throw new BadRequestException('Wompi is not configured');
    }

    if (plan === Plan.FREE) {
      throw new BadRequestException('Cannot create checkout session for free plan');
    }

    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const montoCop = this.PLAN_PRICES_COP[plan];
    if (!montoCop) {
      throw new BadRequestException(`Price not configured for plan: ${plan}`);
    }

    const reference = this.codificarReferencia(tenantId, plan);
    const amountInCents = montoCop * 100;
    const currency = 'COP';

    const integrity = createHash('sha256')
      .update(`${reference}${amountInCents}${currency}${this.integritySecret}`)
      .digest('hex');

    const params = new URLSearchParams({
      'public-key': this.publicKey,
      currency,
      'amount-in-cents': String(amountInCents),
      reference,
      'redirect-url': successUrl,
      'signature:integrity': integrity,
    });

    // cancelUrl no tiene equivalente en el checkout de Wompi (no hay una URL
    // de "cancelar" separada de la de retorno); se conserva en la firma del
    // método por paridad con la ruta del controlador, sin usarse aquí.
    void cancelUrl;

    return {
      url: `https://checkout.wompi.co/p/?${params.toString()}`,
      reference,
    };
  }

  /**
   * Verifica el checksum de un webhook de Wompi.
   * Algoritmo documentado por Wompi: concatenar los valores de
   * signature.properties en el orden dado, agregar el timestamp del evento
   * y el secreto de eventos, y hashear con SHA-256.
   */
  private verificarChecksum(payload: WompiWebhookPayload): boolean {
    if (!this.eventsSecret) return false;

    const timestamp = payload.signature.timestamp ?? payload.timestamp;
    if (timestamp === undefined) return false;

    const valores = payload.signature.properties.map((ruta) => {
      // "transaction.id" localiza payload.data.transaction.id: hay que
      // recorrer las DOS partes desde payload.data, no descartar la primera.
      let actual: any = payload.data;
      for (const parte of ruta.split('.')) {
        actual = actual?.[parte];
      }
      return String(actual ?? '');
    });

    const cadena = `${valores.join('')}${timestamp}${this.eventsSecret}`;
    const checksum = createHash('sha256').update(cadena).digest('hex');

    return checksum.toUpperCase() === payload.signature.checksum.toUpperCase();
  }

  /**
   * Procesa un evento de webhook ya recibido. El controlador es responsable
   * de exponer un status no-2xx si esto lanza (checksum inválido, etc.) para
   * que Wompi reintente en vez de darlo por entregado.
   */
  async handleWebhookEvent(payload: WompiWebhookPayload) {
    if (!this.verificarChecksum(payload)) {
      throw new BadRequestException('Invalid webhook checksum');
    }

    if (payload.event !== 'transaction.updated') {
      return { received: true, ignored: true };
    }

    const { transaction } = payload.data;

    if (transaction.status !== 'APPROVED') {
      this.logger.log(`Transaction ${transaction.id} status ${transaction.status}, no action taken`);
      return { received: true };
    }

    const decodificado = this.decodificarReferencia(transaction.reference);
    if (!decodificado) {
      this.logger.warn(`Approved transaction ${transaction.id} with unrecognized reference ${transaction.reference}`);
      return { received: true, ignored: true };
    }

    const { tenantId, plan } = decodificado;

    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      this.logger.warn(`Approved transaction ${transaction.id} references unknown tenant ${tenantId}`);
      return { received: true, ignored: true };
    }

    const ahora = new Date();
    const finPeriodo = new Date(ahora.getTime() + DIAS_POR_PERIODO * 24 * 60 * 60 * 1000);

    await this.prisma.subscription.create({
      data: {
        tenantId,
        externalReference: transaction.reference,
        plan,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: ahora,
        currentPeriodEnd: finPeriodo,
      },
    });

    await this.prisma.invoice.create({
      data: {
        tenantId,
        wompiTransactionId: transaction.id,
        amountCents: transaction.amount_in_cents,
        currency: transaction.currency,
        status: InvoiceStatus.PAID,
      },
    });

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { plan, status: 'ACTIVE' },
    });

    return { received: true };
  }

  /** Información de facturación del tenant (sin llamadas a Wompi). */
  async getTenantBilling(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        subscriptions: { orderBy: { createdAt: 'desc' }, take: 1 },
        invoices: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const currentSubscription = tenant.subscriptions[0];

    return {
      tenant: { id: tenant.id, name: tenant.name, plan: tenant.plan, status: tenant.status },
      subscription: currentSubscription || null,
      invoices: tenant.invoices,
      usage: {
        students: { current: tenant.currentStudents, limit: tenant.maxStudents },
        teachers: { current: tenant.currentTeachers, limit: tenant.maxTeachers },
        courses: { current: tenant.currentCourses, limit: tenant.maxCourses },
        storage: { current: tenant.currentStorageGB, limit: tenant.storageGB },
      },
    };
  }

  /**
   * Wompi no tiene nada que cancelar en su lado (no existe una suscripción
   * recurrente): esto sólo marca el estado local. Si no es inmediato, el
   * plan sigue activo hasta el fin del periodo ya pagado y simplemente no se
   * renueva.
   */
  async cancelSubscription(tenantId: string, immediately = false) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { tenantId, status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] } },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      throw new NotFoundException('Active subscription not found');
    }

    if (immediately) {
      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: SubscriptionStatus.CANCELLED },
      });
      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: { status: 'SUSPENDED' },
      });
    } else {
      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: { cancelAtPeriodEnd: true },
      });
    }

    return {
      message: immediately
        ? 'Subscription cancelled immediately'
        : 'Subscription will be cancelled at the end of the billing period',
    };
  }

  /** Planes disponibles, precio real en COP (lo que de verdad se cobra por Wompi). */
  async getPlans() {
    return [
      {
        name: Plan.FREE,
        displayName: 'Free',
        price: 0,
        currency: 'COP',
        interval: 'month',
        features: {
          students: 20, teachers: 2, courses: 5, storage: 1,
          messaging: true, videoConf: false, payments: false, certificates: false,
        },
      },
      {
        name: Plan.BASIC,
        displayName: 'Basic',
        price: this.PLAN_PRICES_COP[Plan.BASIC],
        currency: 'COP',
        interval: 'month',
        features: {
          students: 100, teachers: 10, courses: 20, storage: 10,
          messaging: true, videoConf: true, payments: false, certificates: true,
        },
      },
      {
        name: Plan.PROFESSIONAL,
        displayName: 'Professional',
        price: this.PLAN_PRICES_COP[Plan.PROFESSIONAL],
        currency: 'COP',
        interval: 'month',
        features: {
          students: 500, teachers: 50, courses: 100, storage: 50,
          messaging: true, videoConf: true, payments: true, certificates: true,
        },
      },
      {
        name: Plan.ENTERPRISE,
        displayName: 'Enterprise',
        price: this.PLAN_PRICES_COP[Plan.ENTERPRISE],
        currency: 'COP',
        interval: 'month',
        features: {
          students: 999999, teachers: 999999, courses: 999999, storage: 500,
          messaging: true, videoConf: true, payments: true, certificates: true,
        },
      },
    ];
  }
}
