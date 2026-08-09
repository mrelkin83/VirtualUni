import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Headers,
  RawBodyRequest,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Request } from 'express';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  private stripe: Stripe;

  constructor(
    private readonly billingService: BillingService,
    private configService: ConfigService,
  ) {
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (stripeKey) {
      this.stripe = new Stripe(stripeKey, {
        apiVersion: '2023-10-16' as any,
      });
    }
  }

  @Get('plans')
  @ApiOperation({ summary: 'Get available subscription plans' })
  getPlans() {
    return this.billingService.getPlans();
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe checkout session' })
  createCheckout(
    @Body() dto: CreateCheckoutSessionDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.billingService.createCheckoutSession(
      dto.plan,
      dto.tenantId || tenantId,
      dto.successUrl,
      dto.cancelUrl,
    );
  }

  @Get('subscription')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get tenant billing information' })
  getBilling(@CurrentTenant() tenantId: string) {
    return this.billingService.getTenantBilling(tenantId);
  }

  @Post('subscription/cancel')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel subscription' })
  cancelSubscription(
    @CurrentTenant() tenantId: string,
    @Body() dto: CancelSubscriptionDto,
  ) {
    return this.billingService.cancelSubscription(tenantId, dto.immediately);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!this.stripe) {
      return { received: false, error: 'Stripe not configured' };
    }

    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      return { received: false, error: 'Webhook secret not configured' };
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature
      event = this.stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        webhookSecret,
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return { received: false, error: 'Signature verification failed' };
    }

    // Handle the event
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.billingService.handleCheckoutComplete(
            event.data.object as Stripe.Checkout.Session,
          );
          break;

        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          await this.billingService.handleSubscriptionUpdated(
            event.data.object as Stripe.Subscription,
          );
          break;

        case 'invoice.paid':
          await this.billingService.handleInvoicePaid(
            event.data.object as Stripe.Invoice,
          );
          break;

        case 'invoice.payment_failed':
          // Handle failed payment
          console.log('Payment failed:', event.data.object);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      console.error('Error processing webhook:', error);
      return { received: false, error: error.message };
    }
  }
}
