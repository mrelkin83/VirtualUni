import { Injectable } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { Tenant, TenantSite, SiteMode } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TEXTOS_POR_TIPO, TextosUI } from './textos-institucion';

export interface ContextoSitio {
  tenant: Pick<Tenant, 'id' | 'name' | 'slug' | 'subdomain' | 'customDomain' | 'logo' | 'primaryColor' | 'secondaryColor'>;
  site: TenantSite;
  textos: TextosUI;
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
      esPreview,
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
