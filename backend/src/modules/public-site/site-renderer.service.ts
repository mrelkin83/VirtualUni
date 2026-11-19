import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { Eta } from 'eta';
import { join } from 'path';
import { SiteMode } from '@prisma/client';
import { ContextoSitio } from './public-tenant.service';

/**
 * Versión de los assets estáticos: cambia en cada arranque del proceso, así
 * un despliegue invalida el site.css cacheado (max-age 3600) en los
 * navegadores sin tocar las cabeceras.
 */
export const V_ASSETS = Date.now().toString(36);

/**
 * Render compartido del sitio público para los controladores HTML de otros
 * módulos (admisiones). Mismo layout, mismas cabeceras y el mismo 404
 * genérico que site-render.controller; la lógica de datos sigue viviendo en
 * los servicios (§2).
 */
@Injectable()
export class SiteRendererService {
  private eta = new Eta({
    views: join(__dirname, 'modules/public-site/templates'),
    cache: process.env.NODE_ENV === 'production',
    autoEscape: true,
  });

  base(req: Request): string {
    const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'http';
    return `${proto.split(',')[0]}://${req.headers.host}`;
  }

  fecha(d: Date | string): string {
    return new Date(d).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  /** Honeypot + marca de tiempo (§8): el campo "web" es invisible. */
  antispam(): string {
    return (
      '<div aria-hidden="true" style="position:absolute;left:-9999px" tabindex="-1">' +
      '<label>No llenes este campo<input type="text" name="web" autocomplete="off" /></label></div>' +
      '<input type="hidden" name="_t" value="" />'
    );
  }

  cabeceras(res: Response, ctx: ContextoSitio) {
    const a = (ctx.site.analytics || {}) as Record<string, string>;
    const scripts = ["'self'", "'unsafe-inline'"];
    const connect = ["'self'"];
    if (a.ga4 || a.gtm || a.adsConversion) {
      scripts.push('https://www.googletagmanager.com');
      connect.push('https://www.google-analytics.com', 'https://*.google-analytics.com', 'https://www.googletagmanager.com');
    }
    if (a.metaPixel) {
      scripts.push('https://connect.facebook.net');
      connect.push('https://www.facebook.com');
    }
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        `script-src ${scripts.join(' ')}`,
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: https:",
        "font-src 'self' https://fonts.gstatic.com",
        `connect-src ${connect.join(' ')}`,
        "frame-ancestors 'self'",
        "form-action 'self'",
        "base-uri 'self'",
      ].join('; '),
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  }

  render(
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
      nav: ctx.nav,
      esPreview: ctx.esPreview,
      modoSoloAdmisiones: ctx.site.siteMode === SiteMode.ADMISSIONS_ONLY,
      brand: {
        c1: colorOk(ctx.tenant.primaryColor, '#3B82F6'),
        c2: colorOk(ctx.tenant.secondaryColor, '#8B5CF6'),
      },
      analytics: ctx.esPreview ? null : (ctx.site.analytics as Record<string, string> | null),
      anio: new Date().getFullYear(),
      vAssets: V_ASSETS,
      fecha: (d: Date | string) => this.fecha(d),
      meta: { ...meta, noindex: meta.noindex || ctx.esPreview },
      ...datos,
    };
    const body = this.eta.render(plantilla, comun);
    res
      .status(200)
      .type('html')
      .setHeader('Cache-Control', 'no-store')
      .send(this.eta.render('layout', { ...comun, body }));
  }

  /**
   * Igual que render() pero con un layout a elegir (layout-embed para los
   * widgets) y acento opcional del atributo data-color del fragmento.
   */
  renderConLayout(
    res: Response,
    ctx: ContextoSitio,
    layout: string,
    plantilla: string,
    datos: Record<string, unknown>,
    meta: { title: string; description: string; canonical: string; noindex?: boolean },
    colorAcento?: string,
  ) {
    const colorOk = (c: string, porDefecto: string) => (/^#[0-9a-fA-F]{3,8}$/.test(c) ? c : porDefecto);
    const comun = {
      tenant: ctx.tenant,
      site: ctx.site,
      textos: ctx.textos,
      nav: ctx.nav,
      esPreview: ctx.esPreview,
      modoSoloAdmisiones: ctx.site.siteMode === SiteMode.ADMISSIONS_ONLY,
      brand: {
        c1: colorAcento ?? colorOk(ctx.tenant.primaryColor, '#3B82F6'),
        c2: colorOk(ctx.tenant.secondaryColor, '#8B5CF6'),
      },
      analytics: null,
      anio: new Date().getFullYear(),
      vAssets: V_ASSETS,
      fecha: (d: Date | string) => this.fecha(d),
      meta: { ...meta, noindex: true },
      ...datos,
    };
    const body = this.eta.render(plantilla, comun);
    res.status(200).type('html').setHeader('Cache-Control', 'no-store').send(this.eta.render(layout, { ...comun, body }));
  }

  /** 404 genérico: no distingue "tenant no existe" de "recurso no existe". */
  e404(res: Response, ctx: ContextoSitio | null) {
    if (!ctx) {
      res.status(404).type('text/plain').send('No encontrado');
      return;
    }
    const comun = {
      tenant: ctx.tenant, site: ctx.site, textos: ctx.textos, nav: ctx.nav, esPreview: ctx.esPreview,
      modoSoloAdmisiones: ctx.site.siteMode === SiteMode.ADMISSIONS_ONLY,
      brand: { c1: ctx.tenant.primaryColor, c2: ctx.tenant.secondaryColor },
      analytics: null, anio: new Date().getFullYear(), vAssets: V_ASSETS, fecha: (d: Date | string) => this.fecha(d),
      meta: { title: 'No encontrado', description: '', canonical: '', noindex: true },
    };
    const body = this.eta.render('404', comun);
    res.status(404).type('html').send(this.eta.render('layout', { ...comun, body }));
  }
}
