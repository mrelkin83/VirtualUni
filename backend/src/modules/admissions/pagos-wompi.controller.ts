import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiExcludeController, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';
import { IsBoolean, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';
import { PublicTenantService } from '../public-site/public-tenant.service';
import { AdmissionsService } from './admissions.service';
import { PagosWompiService, WompiWebhookPayload } from './pagos-wompi.service';

export class GuardarWompiDto {
  @IsOptional() @Matches(/^pub_(test|prod)_[A-Za-z0-9_-]{4,80}$/) publicKey?: string;
  /** Write-only: se cifran al guardar y jamás vuelven al frontend. */
  @IsOptional() @IsString() @MaxLength(120) integrityKey?: string;
  @IsOptional() @IsString() @MaxLength(120) eventsKey?: string;
  @IsOptional() @IsBoolean() testMode?: boolean;
  @IsOptional() @IsBoolean() active?: boolean;
}

/** Configuración de Wompi del tenant (solo administración). */
@ApiTags('admissions')
@Controller('admissions/pagos-wompi')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class PagosWompiAdminController {
  constructor(private readonly servicio: PagosWompiService) {}

  @Get()
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Estado de la pasarela del tenant (las llaves nunca se devuelven)' })
  estado(@CurrentTenant() tenantId: string) {
    return this.servicio.estado(tenantId);
  }

  @Put()
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Guardar llaves de Wompi (cifradas) y activar/desactivar' })
  guardar(@CurrentTenant() tenantId: string, @Body() dto: GuardarWompiDto) {
    return this.servicio.guardar(tenantId, dto);
  }
}

/** Checkout del aspirante: requiere su sesión por cookie. */
@ApiExcludeController()
@Controller('aspirante/api')
@UseGuards(ThrottlerGuard)
export class PagosWompiAspiranteController {
  constructor(
    private readonly tenants: PublicTenantService,
    private readonly admissions: AdmissionsService,
    private readonly servicio: PagosWompiService,
  ) {}

  @Get('borrador/:code/wompi')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async checkout(@Req() req: Request, @Param('code') code: string) {
    const ctx = await this.tenants.contexto(req.headers.host);
    if (!ctx) throw new NotFoundException('No encontrado');
    const email = this.admissions.emailDeSesion(req, ctx.tenant.id);
    if (!email) throw new UnauthorizedException('Sesión vencida');
    const base = `${((req.headers['x-forwarded-proto'] as string) || req.protocol).split(',')[0]}://${req.headers.host}`;
    return this.servicio.checkout(ctx.tenant.id, email, code, `${base}/aspirante`);
  }
}

/**
 * Webhook de Wompi POR TENANT: el tenant sale del slug de la ruta y la firma
 * se verifica con el secreto de eventos de ESE tenant (§7). Un checksum
 * inválido responde no-2xx para que Wompi reintente.
 */
@ApiExcludeController()
@Controller('public/payments/wompi')
@UseGuards(ThrottlerGuard)
export class PagosWompiWebhookController {
  constructor(private readonly servicio: PagosWompiService) {}

  @Post(':tenantSlug')
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  webhook(@Param('tenantSlug') tenantSlug: string, @Body() payload: WompiWebhookPayload) {
    return this.servicio.procesarWebhook(tenantSlug, payload);
  }
}
