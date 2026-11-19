import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { ApiKey } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ApiKeysService } from './api-keys.service';

export const SCOPES_KEY = 'public_api_scopes';
/** Scopes requeridos por el endpoint de /public/v1. */
export const Scopes = (...scopes: string[]) => SetMetadata(SCOPES_KEY, scopes);

export interface PublicApiContext {
  tenantId: string;
  apiKey: ApiKey;
  testMode: boolean;
}

/**
 * Guard de /public/v1 (§13.3):
 *  - el tenant sale SOLO de la llave (Host, X-Tenant-ID y el cuerpo se ignoran)
 *  - una llave SECRETA con cabecera Origin de navegador se RECHAZA
 *  - una PUBLICABLE solo lee, exige Origin en su lista y recibe CORS
 *  - límites de uso por llave con cabeceras RateLimit-*
 */
@Injectable()
export class PublicApiGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
    private readonly llaves: ApiKeysService,
  ) {}

  // Ventana fija en memoria por llave (suficiente para un solo proceso).
  private ventanas = new Map<string, { inicio: number; usados: number }>();
  private static LIMITE: Record<string, number> = { PUBLISHABLE: 120, SECRET: 300 };

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>();
    const res = ctx.switchToHttp().getResponse<Response>();

    const cruda =
      (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : undefined) ||
      (req.headers['x-api-key'] as string | undefined);
    if (!cruda) throw new UnauthorizedException({ error: { code: 'missing_api_key', message: 'Falta la llave de API' } });

    const k = await this.llaves.autenticar(cruda.trim());
    if (!k) throw new UnauthorizedException({ error: { code: 'invalid_api_key', message: 'Llave inválida o revocada' } });

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: k.tenantId },
      select: { id: true, enablePublicApi: true, status: true },
    });
    if (!tenant || !tenant.enablePublicApi) {
      throw new ForbiddenException({ error: { code: 'api_disabled', message: 'La API pública no está habilitada para la institución' } });
    }

    const origin = req.headers.origin as string | undefined;

    if (k.type === 'SECRET') {
      // Una sk_ pegada en una página quedaría expuesta: cualquier petición de
      // navegador (trae Origin) se rechaza para que el error se note YA.
      if (origin) {
        throw new UnauthorizedException({
          error: { code: 'secret_key_in_browser', message: 'Las llaves secretas no se usan desde el navegador' },
        });
      }
    } else {
      // Publicable: solo lectura, y solo desde sus orígenes.
      if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
        throw new ForbiddenException({ error: { code: 'read_only_key', message: 'Esta llave es de solo lectura' } });
      }
      if (origin) {
        if (!k.allowedOrigins.includes(origin)) {
          throw new ForbiddenException({ error: { code: 'origin_not_allowed', message: 'Origen no autorizado para esta llave' } });
        }
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
      }
    }

    // Scopes del endpoint
    const requeridos = this.reflector.getAllAndOverride<string[]>(SCOPES_KEY, [ctx.getHandler(), ctx.getClass()]) ?? [];
    const faltan = requeridos.filter((s) => !k.scopes.includes(s));
    if (faltan.length) {
      throw new ForbiddenException({ error: { code: 'missing_scope', message: `La llave no tiene el scope ${faltan[0]}` } });
    }

    // Rate limit por llave
    const limite = PublicApiGuard.LIMITE[k.type];
    const ahora = Date.now();
    const v = this.ventanas.get(k.id);
    const ventana = !v || ahora - v.inicio >= 60_000 ? { inicio: ahora, usados: 0 } : v;
    ventana.usados++;
    this.ventanas.set(k.id, ventana);
    const restante = Math.max(0, limite - ventana.usados);
    res.setHeader('RateLimit-Limit', String(limite));
    res.setHeader('RateLimit-Remaining', String(restante));
    res.setHeader('RateLimit-Reset', String(Math.ceil((ventana.inicio + 60_000 - ahora) / 1000)));
    if (ventana.usados > limite) {
      res.setHeader('Retry-After', String(Math.ceil((ventana.inicio + 60_000 - ahora) / 1000)));
      throw new HttpException({ error: { code: 'rate_limited', message: 'Límite de uso excedido' } }, 429);
    }

    (req as Request & { publicApi: PublicApiContext }).publicApi = {
      tenantId: k.tenantId,
      apiKey: k,
      testMode: k.testMode,
    };
    return true;
  }
}
