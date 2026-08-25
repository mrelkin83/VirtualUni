import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BillingService, WompiWebhookPayload } from './billing.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Get available subscription plans' })
  getPlans() {
    return this.billingService.getPlans();
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Wompi checkout URL for a plan' })
  createCheckout(
    @Body() dto: CreateCheckoutSessionDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.billingService.createCheckoutSession(
      dto.plan,
      tenantId,
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

  /**
   * A diferencia de Stripe, Wompi firma sobre valores puntuales del propio
   * JSON (no sobre los bytes crudos del cuerpo), así que no hace falta
   * `rawBody` aquí: el DTO tipado le basta al servicio para recalcular el
   * checksum. Cualquier fallo (checksum inválido, evento no reconocible)
   * debe salir como no-2xx para que Wompi reintente en vez de darlo por
   * entregado — mismo criterio que el resto del API.
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Wompi webhook endpoint' })
  async handleWebhook(@Body() payload: WompiWebhookPayload) {
    if (!payload?.event || !payload?.signature?.checksum) {
      throw new BadRequestException('Malformed webhook payload');
    }

    return this.billingService.handleWebhookEvent(payload);
  }
}
