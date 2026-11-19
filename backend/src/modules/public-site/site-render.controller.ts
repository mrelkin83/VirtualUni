import { Controller, Get, Param, Query, Req, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Eta } from 'eta';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import { SiteMode } from '@prisma/client';
import { ContextoSitio, PublicTenantService } from './public-tenant.service';
import { PublicCatalogService } from './public-catalog.service';

/**
 * Sitio público renderizado en servidor. Capa DELGADA (regla API-first, §2):
 * nada de reglas de negocio aquí; solo pide datos a los servicios y los pinta.
 *
 * Sin prefijo api/v1 (está excluido en main.ts). El tenant se resuelve SOLO
 * por Host dentro de PublicTenantService; un sitio inexistente o despublicado
 * es un 404 genérico que no revela si el tenant existe.
 */
@ApiExcludeController()
@Controller()
export class SiteRenderController {
  private eta = new Eta({
    views: join(__dirname, 'modules/public-site/templates'),
    cache: process.env.NODE_ENV === 'production',
    autoEscape: true,
  });

  constructor(
    private readonly tenants: PublicTenantService,
    private readonly catalogo: PublicCatalogService,
  ) {}

  // ------------------------------------------------------------- utilidades

  private async ctx(req: Request, res: Response): Promise<ContextoSitio | null> {
    const ctx = await this.tenants.contexto(req.headers.host, String(req.query.preview || '') || undefined);
    if (!ctx) {
      this.e404(res, null);
      return null;
    }
    this.cabeceras(res, ctx);
    this.capturarUtm(req, res);
    return ctx;
  }

  /**
   * UTM/gclid/fbclid se capturan DESDE LA LLEGADA (§3) en una cookie propia:
   * el aspirante navega varias páginas antes del formulario y la campaña no
   * debe perderse por el camino. First-touch: no se sobrescribe.
   */
  private capturarUtm(req: Request, res: Response) {
    const q = req.query as Record<string, string>;
    const llaves = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];
    if (!llaves.some((k) => q[k])) return;
    if ((req.headers.cookie || '').includes('vu_utm=')) return;
    const datos: Record<string, string> = {};
    for (const k of llaves) if (q[k]) datos[k] = String(q[k]).slice(0, 200);
    datos.landing = req.path;
    res.cookie('vu_utm', JSON.stringify(datos), {
      maxAge: 90 * 24 * 3600 * 1000,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });
  }

  private cabeceras(res: Response, ctx: ContextoSitio) {
    const a = (ctx.site.analytics || {}) as Record<string, string>;
    const scripts = ["'self'", "'unsafe-inline'"];
    const connect = ["'self'"];
    const frames = ["'self'"];
    if (a.ga4 || a.gtm || a.adsConversion) {
      scripts.push('https://www.googletagmanager.com');
      connect.push('https://www.google-analytics.com', 'https://*.google-analytics.com', 'https://www.googletagmanager.com');
    }
    if (a.metaPixel) {
      scripts.push('https://connect.facebook.net');
      connect.push('https://www.facebook.com');
      frames.push('https://www.facebook.com');
    }
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        `script-src ${scripts.join(' ')}`,
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self'",
        `connect-src ${connect.join(' ')}`,
        `frame-src ${frames.join(' ')} https://www.google.com https://maps.google.com https://www.openstreetmap.org`,
        "frame-ancestors 'self'",
        "form-action 'self'",
        "base-uri 'self'",
      ].join('; '),
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  }

  private base(req: Request): string {
    const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'http';
    return `${proto.split(',')[0]}://${req.headers.host}`;
  }

  private fecha(d: Date | string): string {
    return new Date(d).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  private render(
    res: Response,
    ctx: ContextoSitio,
    plantilla: string,
    datos: Record<string, unknown>,
    meta: { title: string; description: string; canonical: string; image?: string | null; jsonld?: string; noindex?: boolean },
  ) {
    const colorOk = (c: string, porDefecto: string) => (/^#[0-9a-fA-F]{3,8}$/.test(c) ? c : porDefecto);
    const comun = {
      tenant: ctx.tenant,
      site: ctx.site,
      textos: ctx.textos,
      esPreview: ctx.esPreview,
      modoSoloAdmisiones: ctx.site.siteMode === SiteMode.ADMISSIONS_ONLY,
      brand: {
        c1: colorOk(ctx.tenant.primaryColor, '#3B82F6'),
        c2: colorOk(ctx.tenant.secondaryColor, '#8B5CF6'),
      },
      analytics: ctx.esPreview ? null : (ctx.site.analytics as Record<string, string> | null),
      anio: new Date().getFullYear(),
      fecha: (d: Date | string) => this.fecha(d),
      meta: { ...meta, noindex: meta.noindex || ctx.esPreview },
      ...datos,
    };
    const body = this.eta.render(plantilla, comun);
    res
      .status(200)
      .type('html')
      .setHeader('Cache-Control', ctx.esPreview ? 'no-store' : 'public, max-age=60')
      .send(this.eta.render('layout', { ...comun, body }));
  }

  /** 404 genérico: no distingue "tenant no existe" de "programa no existe". */
  private e404(res: Response, ctx: ContextoSitio | null) {
    if (!ctx) {
      res.status(404).type('text/plain').send('No encontrado');
      return;
    }
    const comun = {
      tenant: ctx.tenant, site: ctx.site, textos: ctx.textos, esPreview: ctx.esPreview,
      modoSoloAdmisiones: ctx.site.siteMode === SiteMode.ADMISSIONS_ONLY,
      brand: { c1: ctx.tenant.primaryColor, c2: ctx.tenant.secondaryColor },
      analytics: null, anio: new Date().getFullYear(), fecha: (d: Date | string) => this.fecha(d),
      meta: { title: 'No encontrado', description: '', canonical: '', noindex: true },
    };
    const body = this.eta.render('404', comun);
    res.status(404).type('html').send(this.eta.render('layout', { ...comun, body }));
  }

  // ------------------------------------------------------------------ rutas

  @Get()
  async home(@Req() req: Request, @Res() res: Response) {
    const ctx = await this.ctx(req, res);
    if (!ctx) return;
    if (ctx.site.siteMode === SiteMode.ADMISSIONS_ONLY) return res.redirect(302, '/programas');

    const [destacados, convocatorias] = await Promise.all([
      this.catalogo.destacados(ctx.tenant.id, ctx.site.featuredProgramIds),
      this.catalogo.convocatoriasAbiertas(ctx.tenant.id),
    ]);

    const jsonld = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: ctx.tenant.name,
      url: this.base(req),
      ...(ctx.tenant.logo ? { logo: ctx.tenant.logo } : {}),
    });

    this.render(res, ctx, 'home', { destacados, convocatorias }, {
      title: ctx.site.seoTitle || `${ctx.tenant.name} — ${ctx.textos.inscripciones} abiertas`,
      description: ctx.site.seoDescription || ctx.textos.ofertaSubtitulo,
      canonical: this.base(req) + '/',
      jsonld,
    });
  }

  @Get('programas')
  async oferta(@Req() req: Request, @Res() res: Response, @Query() q: Record<string, string>) {
    const ctx = await this.ctx(req, res);
    if (!ctx) return;

    const filtros = {
      categoria: q.nivel || undefined,
      modalidad: q.modalidad || undefined,
      area: q.area || undefined,
      q: (q.q || '').slice(0, 80) || undefined,
    };
    const hayFiltros = !!(filtros.categoria || filtros.modalidad || filtros.area || filtros.q);

    const [programas, categorias, modalidades, areas, directorio] = await Promise.all([
      this.catalogo.listar(ctx.tenant.id, filtros),
      this.catalogo.categorias(ctx.tenant.id, ctx.site.levelLabels),
      this.catalogo.modalidades(ctx.tenant.id),
      this.catalogo.areas(ctx.tenant.id),
      this.catalogo.directorio(ctx.tenant.id),
    ]);

    this.render(res, ctx, 'oferta', { programas, categorias, modalidades, areas, directorio, filtros, hayFiltros }, {
      title: `${ctx.textos.ofertaTitulo} — ${ctx.tenant.name}`,
      description: ctx.textos.ofertaSubtitulo,
      canonical: this.base(req) + '/programas',
    });
  }

  @Get('programas/:slug')
  async programa(@Req() req: Request, @Res() res: Response, @Param('slug') slug: string) {
    const ctx = await this.ctx(req, res);
    if (!ctx) return;

    const ficha = await this.catalogo.ficha(ctx.tenant.id, slug);
    if (!ficha) return this.e404(res, ctx);

    const p = ficha.programa;
    const jsonld = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'EducationalOccupationalProgram',
      name: p.name,
      description: p.shortDescription || undefined,
      educationalProgramMode: ficha.modalidadEtiqueta,
      ...(ficha.otorgaTexto ? { educationalCredentialAwarded: ficha.otorgaTexto } : {}),
      ...(p.totalHours ? { timeToComplete: `PT${p.totalHours}H` } : {}),
      provider: { '@type': 'EducationalOrganization', name: ctx.tenant.name, url: this.base(req) },
      url: `${this.base(req)}/programas/${p.slug}`,
    });

    this.render(res, ctx, 'programa', { ficha }, {
      title: `${p.name} — ${ctx.tenant.name}`,
      description: p.shortDescription || ctx.textos.ofertaSubtitulo,
      canonical: `${this.base(req)}/programas/${p.slug}`,
      image: p.imageUrl,
      jsonld,
    });
  }

  @Get('privacidad')
  async privacidad(@Req() req: Request, @Res() res: Response) {
    const ctx = await this.ctx(req, res);
    if (!ctx) return;
    this.render(res, ctx, 'privacidad', {}, {
      title: `Tratamiento de datos — ${ctx.tenant.name}`,
      description: `Política de tratamiento de datos personales de ${ctx.tenant.name}.`,
      canonical: this.base(req) + '/privacidad',
    });
  }

  @Get('contacto')
  async contacto(@Req() req: Request, @Res() res: Response) {
    const ctx = await this.ctx(req, res);
    if (!ctx) return;
    if (ctx.site.siteMode === SiteMode.ADMISSIONS_ONLY) return res.redirect(302, '/programas');
    this.render(res, ctx, 'contacto', { enviado: req.query.ok === '1', antispam: this.antispam() }, {
      title: `Contacto — ${ctx.tenant.name}`,
      description: `Escríbenos y resuelve tus dudas sobre ${ctx.textos.inscripciones.toLowerCase()}.`,
      canonical: this.base(req) + '/contacto',
    });
  }

  /** Honeypot + marca de tiempo (§8). El campo "web" es invisible: un humano no lo llena. */
  private antispam(): string {
    return (
      '<div aria-hidden="true" style="position:absolute;left:-9999px" tabindex="-1">' +
      '<label>No llenes este campo<input type="text" name="web" autocomplete="off" /></label></div>' +
      '<input type="hidden" name="_t" value="" />'
    );
  }

  @Get('sitemap.xml')
  async sitemap(@Req() req: Request, @Res() res: Response) {
    const ctx = await this.tenants.contexto(req.headers.host);
    if (!ctx) return res.status(404).type('text/plain').send('No encontrado');
    const base = this.base(req);
    const soloAdmisiones = ctx.site.siteMode === SiteMode.ADMISSIONS_ONLY;
    const urls = [
      ...(soloAdmisiones ? [] : [`${base}/`, `${base}/contacto`]),
      `${base}/programas`,
      `${base}/privacidad`,
      ...(await this.catalogo.listar(ctx.tenant.id, {})).map((p) => `${base}/programas/${p.slug}`),
    ];
    res
      .type('application/xml')
      .send(
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
          urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n') +
          `\n</urlset>`,
      );
  }

  @Get('robots.txt')
  async robots(@Req() req: Request, @Res() res: Response) {
    const ctx = await this.tenants.contexto(req.headers.host);
    const base = this.base(req);
    res
      .type('text/plain')
      .send(ctx ? `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n` : `User-agent: *\nDisallow: /\n`);
  }

  // ------------------------------------------------------- assets estáticos

  @Get('public-assets/:archivo')
  assets(@Param('archivo') archivo: string, @Res() res: Response) {
    // Lista blanca: nada de recorrer rutas con ../
    const permitidos: Record<string, string> = {
      'site.css': 'text/css',
      'site.js': 'application/javascript',
      'inscripcion.js': 'application/javascript',
    };
    const tipo = permitidos[archivo];
    const ruta = join(__dirname, 'modules/public-site/assets', archivo);
    if (!tipo || !existsSync(ruta)) return res.status(404).type('text/plain').send('No encontrado');
    res.type(tipo).setHeader('Cache-Control', 'public, max-age=3600');
    createReadStream(ruta).pipe(res);
  }
}
