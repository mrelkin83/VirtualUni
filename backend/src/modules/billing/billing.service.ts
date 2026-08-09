import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/common/prisma/prisma.service';
import { Plan, SubscriptionStatus, InvoiceStatus } from '@prisma/client';
import Stripe from 'stripe';

@Injectable()
export class BillingService {
  private stripe: Stripe;

  // Price IDs should be configured in Stripe Dashboard
  private readonly PLAN_PRICES = {
    [Plan.FREE]: null, // Free plan has no price
    [Plan.BASIC]: process.env.STRIPE_BASIC_PRICE_ID || 'price_basic',
    [Plan.PROFESSIONAL]: process.env.STRIPE_PRO_PRICE_ID || 'price_professional',
    [Plan.ENTERPRISE]: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
  };

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (stripeKey) {
      this.stripe = new Stripe(stripeKey, {
        apiVersion: '2023-10-16' as any,
      });
    }
  }

  /**
   * Create Stripe checkout session for subscription
   */
  async createCheckoutSession(
    plan: Plan,
    tenantId: string,
    successUrl: string,
    cancelUrl: string,
  ) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    if (plan === Plan.FREE) {
      throw new BadRequestException('Cannot create checkout session for free plan');
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const priceId = this.PLAN_PRICES[plan];

    if (!priceId) {
      throw new BadRequestException(`Price ID not configured for plan: ${plan}`);
    }

    // Use the tenant admin's email for the checkout session (tenant.name is not an email)
    const adminUser = await this.prisma.user.findFirst({
      where: { tenantId, role: 'TENANT_ADMIN' },
      select: { email: true },
    });

    // Create Stripe checkout session
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: tenantId,
      ...(adminUser?.email ? { customer_email: adminUser.email } : {}),
      metadata: {
        tenantId,
        plan,
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  /**
   * Handle successful checkout (called by webhook)
   */
  async handleCheckoutComplete(session: Stripe.Checkout.Session) {
    const tenantId = session.client_reference_id || session.metadata?.tenantId;
    const plan = session.metadata?.plan as Plan;

    if (!tenantId || !plan) {
      throw new BadRequestException('Missing tenant or plan information');
    }

    const subscriptionId = session.subscription as string;

    // Get subscription details from Stripe
    const stripeSubscription = await this.stripe.subscriptions.retrieve(subscriptionId);

    // Create subscription record
    await this.prisma.subscription.create({
      data: {
        tenantId,
        stripeSubscriptionId: subscriptionId,
        plan,
        status: this.mapStripeStatus(stripeSubscription.status),
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      },
    });

    // Update tenant
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        plan,
        status: 'ACTIVE',
      },
    });

    return { success: true };
  }

  /**
   * Handle subscription update
   */
  async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const existing = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!existing) {
      return;
    }

    await this.prisma.subscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: this.mapStripeStatus(subscription.status),
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });

    // Update tenant status if subscription is cancelled
    if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
      await this.prisma.tenant.update({
        where: { id: existing.tenantId },
        data: { status: 'SUSPENDED' },
      });
    }
  }

  /**
   * Handle invoice payment
   */
  async handleInvoicePaid(invoice: Stripe.Invoice) {
    const subscriptionId = invoice.subscription as string;

    if (!subscriptionId) {
      return;
    }

    const subscription = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscriptionId },
    });

    if (!subscription) {
      return;
    }

    // Create invoice record
    await this.prisma.invoice.create({
      data: {
        tenantId: subscription.tenantId,
        stripeInvoiceId: invoice.id,
        amountCents: invoice.amount_paid,
        currency: invoice.currency.toUpperCase(),
        status: InvoiceStatus.PAID,
        pdfUrl: invoice.invoice_pdf || undefined,
      },
    });
  }

  /**
   * Get tenant billing information
   */
  async getTenantBilling(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const currentSubscription = tenant.subscriptions[0];

    return {
      tenant: {
        id: tenant.id,
        name: tenant.name,
        plan: tenant.plan,
        status: tenant.status,
      },
      subscription: currentSubscription || null,
      invoices: tenant.invoices,
      usage: {
        students: {
          current: tenant.currentStudents,
          limit: tenant.maxStudents,
        },
        teachers: {
          current: tenant.currentTeachers,
          limit: tenant.maxTeachers,
        },
        courses: {
          current: tenant.currentCourses,
          limit: tenant.maxCourses,
        },
        storage: {
          current: tenant.currentStorageGB,
          limit: tenant.storageGB,
        },
      },
    };
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(tenantId: string, immediately = false) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const subscription = await this.prisma.subscription.findFirst({
      where: {
        tenantId,
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new NotFoundException('Active subscription not found');
    }

    if (immediately) {
      // Cancel immediately
      await this.stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    } else {
      // Cancel at period end
      await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    }

    return {
      message: immediately
        ? 'Subscription cancelled immediately'
        : 'Subscription will be cancelled at the end of the billing period',
    };
  }

  /**
   * Get available plans with pricing
   */
  async getPlans() {
    return [
      {
        name: Plan.FREE,
        displayName: 'Free',
        price: 0,
        currency: 'USD',
        interval: 'month',
        features: {
          students: 20,
          teachers: 2,
          courses: 5,
          storage: 1,
          messaging: true,
          videoConf: false,
          payments: false,
          certificates: false,
        },
      },
      {
        name: Plan.BASIC,
        displayName: 'Basic',
        price: 29,
        currency: 'USD',
        interval: 'month',
        features: {
          students: 100,
          teachers: 10,
          courses: 20,
          storage: 10,
          messaging: true,
          videoConf: true,
          payments: false,
          certificates: true,
        },
      },
      {
        name: Plan.PROFESSIONAL,
        displayName: 'Professional',
        price: 99,
        currency: 'USD',
        interval: 'month',
        features: {
          students: 500,
          teachers: 50,
          courses: 100,
          storage: 50,
          messaging: true,
          videoConf: true,
          payments: true,
          certificates: true,
        },
      },
      {
        name: Plan.ENTERPRISE,
        displayName: 'Enterprise',
        price: 299,
        currency: 'USD',
        interval: 'month',
        features: {
          students: 999999,
          teachers: 999999,
          courses: 999999,
          storage: 500,
          messaging: true,
          videoConf: true,
          payments: true,
          certificates: true,
        },
      },
    ];
  }

  /**
   * Map Stripe subscription status to our enum
   */
  private mapStripeStatus(stripeStatus: Stripe.Subscription.Status): SubscriptionStatus {
    switch (stripeStatus) {
      case 'active':
        return SubscriptionStatus.ACTIVE;
      case 'past_due':
        return SubscriptionStatus.PAST_DUE;
      case 'canceled':
      case 'unpaid':
        return SubscriptionStatus.CANCELLED;
      case 'trialing':
        return SubscriptionStatus.TRIALING;
      default:
        return SubscriptionStatus.ACTIVE;
    }
  }
}
