import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    let tenantId: string | null = null;

    // Strategy 1: Check X-Tenant-ID header (highest priority).
    // El valor puede ser el id del tenant o su subdominio: se resuelve contra la
    // BD en lugar de confiar en la cadena recibida.
    const headerTenant = req.headers['x-tenant-id'] as string | undefined;

    if (headerTenant) {
      const tenant = await this.prisma.tenant.findFirst({
        where: {
          OR: [{ id: headerTenant }, { subdomain: headerTenant.toLowerCase() }],
        },
        select: { id: true },
      });

      if (tenant) {
        tenantId = tenant.id;
      }
    }

    // Strategy 2: Check subdomain
    if (!tenantId) {
      const host = req.headers.host || req.hostname;
      const subdomain = this.extractSubdomain(host);

      if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
        // Find tenant by subdomain
        const tenant = await this.prisma.tenant.findUnique({
          where: { subdomain },
          select: { id: true, status: true },
        });

        if (tenant) {
          tenantId = tenant.id;
        }
      }
    }

    // Strategy 3: Check custom domain
    if (!tenantId) {
      const host = req.headers.host || req.hostname;
      const customDomain = host.split(':')[0]; // Remove port if present

      const tenant = await this.prisma.tenant.findUnique({
        where: { customDomain },
        select: { id: true, status: true },
      });

      if (tenant) {
        tenantId = tenant.id;
      }
    }

    // Attach tenant ID to request
    if (tenantId) {
      (req as any).tenantId = tenantId;
    }

    next();
  }

  private extractSubdomain(host: string): string | null {
    // Remove port if present
    const hostname = host.split(':')[0];

    // Split by dots
    const parts = hostname.split('.');

    // If we have at least 3 parts (subdomain.domain.tld), return first part
    if (parts.length >= 3) {
      return parts[0];
    }

    // If localhost with subdomain pattern
    if (hostname.includes('localhost') && parts.length > 1) {
      return parts[0];
    }

    return null;
  }
}
