import { Injectable } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { Tenant, TenantSite, SiteMode } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CATEGORIA_POR_NIVEL, CategoriaPublica, ETIQUETA_CATEGORIA, TEXTOS_POR_TIPO, TextosUI } from './textos-institucion';

export interface NavSitio {
  /** Categorías públicas con programas (mixtas: técnico + bachillerato + pregrado…). */
  categorias: { slug: string; label: string; count: number }[];
  /** Páginas institucionales publicadas, agrupadas por grupo de menú. */
  paginas: { grupo: string; items: { slug: string; title: string }[] }[];
  /** Banner superior «Matrículas abiertas…», si está activo. */
  anuncio: { text: string; link?: string } | null;
}

export interface ContextoSitio {
  tenant: Pick<Tenant, 'id' | 'name' | 'slug' | 'subdomain' | 'customDomain' | 'logo' | 'primaryColor' | 'secondaryColor'>;
  site: TenantSite;
  textos: TextosUI;
  nav: NavSitio;
  /** true cuando se entra con ?preview= válido aunque el sitio no esté publicado */
  esPreview: boolean;
}

/**
 * Resolución de tenant para las rutas públicas: SOLO por Host (subdominio o
 * customDomain). Aquí se ignoran a propósito X-Tenant-ID y cualquier tenantId
 * del cuerpo: en una superficie sin autenticación serían ids elegidos por el
 * atacante. Si el sitio no existe o no está publicado, el llamador responde
 * un 404 genérico.
 */
@Injectable()
export class PublicTenantService {
  constructor(private readonly prisma: PrismaService) {}

  // Cache mínima por host: la portada se pide muchas veces por segundo bajo
  // pauta y este lookup está en el camino de TODAS las rutas públicas.
  private cache = new Map<string, { exp: number; ctx: ContextoSitio | null }>();
  private static TTL_MS = 30_000;

  private hostname(host: string | undefined): string {
    return (host || '').split(':')[0].toLowerCase();
  }

  /** Subdominio del host, con el mismo criterio del TenantMiddleware (sin IPs). */
  private subdominio(hostname: string): string | null {
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) return null;
    const partes = hostname.split('.');
    if (partes.length >= 3) return partes[0];
    // dev: uniprueba.localhost
    if (hostname.endsWith('.localhost') && partes.length === 2) return partes[0];
    return null;
  }

  async contexto(host: string | undefined, previewToken?: string): Promise<ContextoSitio | null> {
    const hostname = this.hostname(host);
    const llave = `${hostname}|${previewToken ? 'p' : ''}`;
    const hit = this.cache.get(llave);
    if (hit && hit.exp > Date.now()) return hit.ctx;

    const ctx = await this.resolver(hostname, previewToken);
    this.cache.set(llave, { exp: Date.now() + PublicTenantService.TTL_MS, ctx });
    return ctx;
  }

  /** El admin guarda el sitio → la cache por host queda vieja; se purga entera. */
  invalidar() {
    this.cache.clear();
  }

  private async resolver(hostname: string, previewToken?: string): Promise<ContextoSitio | null> {
    if (!hostname) return null;

    const sub = this.subdominio(hostname);
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        deletedAt: null,
        OR: [
          { customDomain: hostname },
          ...(sub && sub !== 'www' && sub !== 'api' ? [{ subdomain: sub }] : []),
        ],
      },
      select: {
        id: true, name: true, slug: true, subdomain: true, customDomain: true,
        logo: true, primaryColor: true, secondaryColor: true, status: true,
      },
    });
    if (!tenant || tenant.status === 'SUSPENDED' || tenant.status === 'CANCELLED') return null;

    const site = await this.prisma.tenantSite.findUnique({ where: { tenantId: tenant.id } });
    if (!site || site.siteMode === SiteMode.OFF) return null;

    const esPreview = !!previewToken && this.verificarPreview(tenant.id, previewToken);
    if (!site.published && !esPreview) return null;

    return {
      tenant,
      site,
      textos: TEXTOS_POR_TIPO[site.institutionType],
      nav: await this.navegacion(tenant.id, site),
      esPreview,
    };
  }

  /**
   * Datos del menú y el banner, resueltos aquí para que viajen en el MISMO
   * contexto cacheado que ya consulta toda ruta pública: categorías de la
   * oferta (una mixta navega técnico/bachillerato/pregrado por separado) y
   * páginas institucionales agrupadas.
   */
  private async navegacion(tenantId: string, site: TenantSite): Promise<NavSitio> {
    const [programas, paginas] = await Promise.all([
      this.prisma.program.findMany({
        where: { tenantId, isPublished: true, status: 'ACTIVO' },
        select: { educationLevel: true },
      }),
      this.prisma.sitePage.findMany({
        where: { tenantId, isPublished: true },
        orderBy: [{ menuGroup: 'asc' }, { order: 'asc' }, { title: 'asc' }],
        select: { slug: true, title: true, menuGroup: true },
      }),
    ]);

    const conteo = new Map<CategoriaPublica, number>();
    for (const p of programas) {
      const c = CATEGORIA_POR_NIVEL[p.educationLevel];
      conteo.set(c, (conteo.get(c) || 0) + 1);
    }
    const overrides = (site.levelLabels || {}) as Record<string, { label?: string; hidden?: boolean }>;
    const categorias = [...conteo.entries()]
      .filter(([slug]) => !overrides[slug]?.hidden)
      .map(([slug, count]) => ({ slug, label: overrides[slug]?.label || ETIQUETA_CATEGORIA[slug], count }));

    const grupos = new Map<string, { slug: string; title: string }[]>();
    for (const p of paginas) {
      if (!grupos.has(p.menuGroup)) grupos.set(p.menuGroup, []);
      (grupos.get(p.menuGroup) as { slug: string; title: string }[]).push({ slug: p.slug, title: p.title });
    }

    const a = (site.announcement || null) as { text?: string; link?: string; active?: boolean } | null;
    return {
      categorias,
      paginas: [...grupos.entries()].map(([grupo, items]) => ({ grupo, items })),
      anuncio: a && a.active && a.text ? { text: a.text, link: a.link } : null,
    };
  }

  // ------------------------------------------------- vista previa firmada

  private secreto(): string {
    return process.env.JWT_SECRET || 'dev-secret';
  }

  /** Token de vista previa: HMAC(tenantId.exp). Vale 1 hora. */
  firmarPreview(tenantId: string): string {
    const exp = Date.now() + 3600_000;
    const firma = createHmac('sha256', this.secreto()).update(`${tenantId}.${exp}`).digest('base64url');
    return `${exp}.${firma}`;
  }

  verificarPreview(tenantId: string, token: string): boolean {
    const [expStr, firma] = token.split('.');
    const exp = Number(expStr);
    if (!exp || !firma || exp < Date.now()) return false;
    const esperada = createHmac('sha256', this.secreto()).update(`${tenantId}.${exp}`).digest('base64url');
    const a = Buffer.from(firma);
    const b = Buffer.from(esperada);
    return a.length === b.length && timingSafeEqual(a, b);
  }
}
