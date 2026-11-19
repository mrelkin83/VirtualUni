import { Controller, Get, Param, Query, Req, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import { PublicTenantService, ContextoSitio } from '../public-site/public-tenant.service';
import { SiteRendererService } from '../public-site/site-renderer.service';
import { PublicCatalogService } from '../public-site/public-catalog.service';
import { VerificacionService } from '../public-site/verificacion.service';
import { AdmissionsService } from './admissions.service';
import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * Widgets /embed/* (§13.2) y validación pública /validar (§13.5).
 *
 * Los /embed/* son las MISMAS vistas del sitio con un layout sin encabezado
 * ni pie, pensadas para iframe: solo cargan si el tenant tiene enableEmbed y
 * la CSP frame-ancestors se arma con su lista blanca de dominios — fuera de
 * ella el navegador no pinta el iframe y el servidor muestra un aviso neutro.
 */
@ApiExcludeController()
@Controller()
export class EmbedRenderController {
  constructor(
    private readonly tenants: PublicTenantService,
    private readonly renderer: SiteRendererService,
    private readonly catalogo: PublicCatalogService,
    private readonly verificacion: VerificacionService,
    private readonly admissions: AdmissionsService,
    private readonly prisma: PrismaService,
  ) {}

  // ------------------------------------------------------------- /validar

  @Get('validar')
  async validarForm(@Req() req: Request, @Res() res: Response, @Query('codigo') codigo?: string) {
    return this.validarPagina(req, res, codigo);
  }

  @Get('validar/:codigo')
  async validarCodigo(@Req() req: Request, @Res() res: Response, @Param('codigo') codigo: string) {
    return this.validarPagina(req, res, codigo);
  }

  private async validarPagina(req: Request, res: Response, codigo?: string) {
    const ctx = await this.tenants.contexto(req.headers.host);
    if (!ctx) return this.renderer.e404(res, null);
    this.renderer.cabeceras(res, ctx);
    const resultado = codigo ? await this.verificacion.validar(ctx.tenant.id, codigo.trim()) : null;
    this.renderer.render(res, ctx, 'validar', { resultado, codigo: codigo ?? '', accionBase: '/validar' }, {
      title: `Validación de certificados — ${ctx.tenant.name}`,
      description: 'Verifica la autenticidad de un certificado emitido por la institución.',
      canonical: `${this.renderer.base(req)}/validar`,
      noindex: true,
    });
  }

  // ------------------------------------------------------------- /embed.js

  @Get('embed.js')
  embedJs(@Res() res: Response) {
    const ruta = join(__dirname, 'modules/public-site/assets', 'embed.js');
    if (!existsSync(ruta)) return res.status(404).type('text/plain').send('No encontrado');
    res
      .type('application/javascript')
      .setHeader('Cache-Control', 'public, max-age=3600')
      .setHeader('Access-Control-Allow-Origin', '*'); // el script se pega en webs de terceros
    createReadStream(ruta).pipe(res);
  }

  // ------------------------------------------------------------- /embed/*

  private async ctxEmbed(req: Request, res: Response): Promise<ContextoSitio | null> {
    const ctx = await this.tenants.contexto(req.headers.host);
    if (!ctx) {
      this.renderer.e404(res, null);
      return null;
    }
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: ctx.tenant.id },
      select: { enableEmbed: true },
    });
    const site = await this.prisma.tenantSite.findUnique({
      where: { tenantId: ctx.tenant.id },
      select: { embedAllowedOrigins: true },
    });
    const origenes = site?.embedAllowedOrigins ?? [];
    if (!tenant?.enableEmbed || origenes.length === 0) {
      // Mensaje NEUTRO: el iframe desde un dominio no autorizado tampoco
      // pasaría la CSP, pero el estado "sin configurar" merece una pista.
      res
        .status(403)
        .type('html')
        .send('<p style="font-family:sans-serif;color:#666;padding:2rem;text-align:center">Contenido no disponible.</p>');
      return null;
    }
    // frame-ancestors con la lista blanca del tenant (§13.2): el navegador
    // del visitante se niega a pintar el iframe fuera de esos dominios.
    res.setHeader(
      'Content-Security-Policy',
      `frame-ancestors 'self' ${origenes.join(' ')}; default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'; form-action 'self'`,
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return ctx;
  }

  private renderEmbed(
    res: Response,
    ctx: ContextoSitio,
    plantilla: string,
    datos: Record<string, unknown>,
    titulo: string,
    color?: string,
  ) {
    const brandColor = color && /^#[0-9a-fA-F]{3,8}$/.test(color) ? color : undefined;
    this.renderer.renderConLayout(res, ctx, 'layout-embed', plantilla, datos, {
      title: titulo,
      description: '',
      canonical: '',
      noindex: true,
    }, brandColor);
  }

  @Get('embed/oferta')
  async oferta(@Req() req: Request, @Res() res: Response, @Query() q: Record<string, string>) {
    const ctx = await this.ctxEmbed(req, res);
    if (!ctx) return;
    const filtros = {
      categoria: q.nivel || undefined, modalidad: q.modalidad || undefined,
      area: q.area || undefined, q: (q.q || '').slice(0, 80) || undefined,
    };
    const [programas, categorias, modalidades, areas] = await Promise.all([
      this.catalogo.listar(ctx.tenant.id, filtros),
      this.catalogo.categorias(ctx.tenant.id, ctx.site.levelLabels),
      this.catalogo.modalidades(ctx.tenant.id),
      this.catalogo.areas(ctx.tenant.id),
    ]);
    this.renderEmbed(res, ctx, 'oferta', {
      programas, categorias, modalidades, areas, filtros,
      hayFiltros: true, directorio: [],
    }, `Oferta — ${ctx.tenant.name}`, q.color);
  }

  @Get('embed/programa/:slug')
  async programa(@Req() req: Request, @Res() res: Response, @Param('slug') slug: string, @Query('color') color?: string) {
    const ctx = await this.ctxEmbed(req, res);
    if (!ctx) return;
    const ficha = await this.catalogo.ficha(ctx.tenant.id, slug);
    if (!ficha) return this.renderer.e404(res, ctx);
    this.renderEmbed(res, ctx, 'programa', { ficha }, `${ficha.programa.name} — ${ctx.tenant.name}`, color);
  }

  @Get('embed/inscripcion/:slug')
  async inscripcion(@Req() req: Request, @Res() res: Response, @Param('slug') slug: string, @Query('color') color?: string) {
    const ctx = await this.ctxEmbed(req, res);
    if (!ctx) return;
    let call;
    try {
      call = await this.admissions.fichaConvocatoria(ctx.tenant.id, slug);
    } catch {
      return this.renderer.e404(res, ctx);
    }
    const esColegio = !!(call.targetLevels as unknown[] | null)?.length;
    this.renderEmbed(res, ctx, 'inscripcion', {
      call, esColegio, targetLevels: call.targetLevels ?? [], antispam: this.renderer.antispam(),
    }, `Inscripción — ${call.program.name}`, color);
  }

  @Get('embed/estado')
  async estado(@Req() req: Request, @Res() res: Response, @Query('color') color?: string) {
    const ctx = await this.ctxEmbed(req, res);
    if (!ctx) return;
    const email = this.admissions.emailDeSesion(req, ctx.tenant.id);
    this.renderEmbed(res, ctx, 'aspirante', {
      autenticado: !!email, enviada: '', vencido: false, antispam: this.renderer.antispam(),
    }, `Estado de tu solicitud — ${ctx.tenant.name}`, color);
  }

  @Get('embed/validar')
  async validarEmbed(@Req() req: Request, @Res() res: Response, @Query('codigo') codigo?: string, @Query('color') color?: string) {
    const ctx = await this.ctxEmbed(req, res);
    if (!ctx) return;
    const resultado = codigo ? await this.verificacion.validar(ctx.tenant.id, codigo.trim()) : null;
    this.renderEmbed(res, ctx, 'validar', { resultado, codigo: codigo ?? '', accionBase: '/embed/validar' }, `Validación — ${ctx.tenant.name}`, color);
  }
}
