import { Controller, Get, Param, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { PublicTenantService } from '../public-site/public-tenant.service';
import { SiteRendererService } from '../public-site/site-renderer.service';
import { AdmissionsService } from './admissions.service';

/**
 * Páginas HTML del proceso de inscripción: el formulario por pasos y la
 * consulta del aspirante. Capa de presentación pura; los datos y las reglas
 * viven en AdmissionsService (§2).
 */
@ApiExcludeController()
@Controller()
export class AdmissionsRenderController {
  constructor(
    private readonly tenants: PublicTenantService,
    private readonly renderer: SiteRendererService,
    private readonly servicio: AdmissionsService,
  ) {}

  @Get('inscripcion/:slug')
  async formulario(@Req() req: Request, @Res() res: Response, @Param('slug') slug: string) {
    const ctx = await this.tenants.contexto(req.headers.host, String(req.query.preview || '') || undefined);
    if (!ctx) return this.renderer.e404(res, null);
    this.renderer.cabeceras(res, ctx);

    let call;
    try {
      call = await this.servicio.fichaConvocatoria(ctx.tenant.id, slug);
    } catch {
      return this.renderer.e404(res, ctx);
    }

    const esColegio = !!(call.targetLevels as unknown[] | null)?.length;
    this.renderer.render(res, ctx, 'inscripcion', {
      call,
      esColegio,
      targetLevels: call.targetLevels ?? [],
      antispam: this.renderer.antispam(),
    }, {
      title: `${ctx.textos.inscripciones}: ${call.program.name} — ${ctx.tenant.name}`,
      description: `Inscríbete en línea a ${call.program.name}. Toma menos de 10 minutos.`,
      canonical: `${this.renderer.base(req)}/inscripcion/${call.slug}`,
      noindex: true,
    });
  }

  @Get('aspirante')
  async aspirante(@Req() req: Request, @Res() res: Response, @Query() q: Record<string, string>) {
    const ctx = await this.tenants.contexto(req.headers.host);
    if (!ctx) return this.renderer.e404(res, null);
    this.renderer.cabeceras(res, ctx);

    const email = this.servicio.emailDeSesion(req, ctx.tenant.id);
    this.renderer.render(res, ctx, 'aspirante', {
      autenticado: !!email,
      enviada: (q.enviada || '').slice(0, 20),
      vencido: q.vencido === '1',
      antispam: this.renderer.antispam(),
    }, {
      title: `Consulta tu solicitud — ${ctx.tenant.name}`,
      description: 'Consulta el estado de tu solicitud de inscripción.',
      canonical: `${this.renderer.base(req)}/aspirante`,
      noindex: true,
    });
  }

  /** Canje del enlace mágico: de un solo uso; si falla, mensaje genérico. */
  @Get('aspirante/acceso')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async acceso(@Req() req: Request, @Res() res: Response, @Query('token') token?: string) {
    const ctx = await this.tenants.contexto(req.headers.host);
    if (!ctx) return this.renderer.e404(res, null);
    const ok = token ? await this.servicio.canjearEnlace(ctx.tenant.id, token, res) : false;
    return res.redirect(302, ok ? '/aspirante' : '/aspirante?vencido=1');
  }
}
