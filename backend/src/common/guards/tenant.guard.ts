import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const user = request.user;

    // Get tenant ID from request (set by middleware) or header.
    // Para un usuario autenticado el tenant del JWT es la fuente de verdad: la
    // cabecera X-Tenant-ID la controla el cliente y no puede ampliar su alcance.
    let tenantId = request.tenantId || request.headers['x-tenant-id'];

    if (!tenantId && user?.tenantId) {
      tenantId = user.tenantId;
    }

    if (!tenantId) {
      throw new BadRequestException(
        'Tenant ID is required. Please provide X-Tenant-ID header or use a valid subdomain.',
      );
    }

    // Aislamiento multi-tenant: un usuario sólo puede operar sobre su propio
    // tenant. SUPER_ADMIN es el único rol que puede actuar sobre cualquiera.
    if (user && user.role !== 'SUPER_ADMIN' && user.tenantId !== tenantId) {
      throw new ForbiddenException('Access denied for the requested tenant');
    }

    // Verify tenant exists and is active
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new UnauthorizedException('Tenant not found');
    }

    if (tenant.status === 'SUSPENDED' || tenant.status === 'CANCELLED') {
      throw new UnauthorizedException(
        `Tenant account is ${tenant.status.toLowerCase()}`,
      );
    }

    // Attach tenant to request
    request.tenantId = tenantId;
    request.tenant = tenant;

    return true;
  }
}
