import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, from, of, switchMap } from 'rxjs';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PublicApiContext } from './public-api.guard';

/**
 * Idempotency-Key obligatoria en los POST de /public/v1 (§13.3): el mismo
 * POST repetido en 24 h devuelve la MISMA respuesta sin ejecutar nada.
 */
@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = ctx.switchToHttp().getRequest<Request & { publicApi?: PublicApiContext }>();
    const res = ctx.switchToHttp().getResponse<Response>();
    if (req.method !== 'POST') return next.handle();

    const tenantId = req.publicApi?.tenantId;
    const llave = (req.headers['idempotency-key'] as string | undefined)?.trim();
    if (!llave || llave.length > 120) {
      throw new BadRequestException({
        error: { code: 'missing_idempotency_key', message: 'Los POST requieren la cabecera Idempotency-Key' },
      });
    }
    if (!tenantId) return next.handle();

    const compuesta = `${req.path}|${llave}`;
    return from(
      this.prisma.apiIdempotencyKey.findUnique({
        where: { tenantId_key: { tenantId, key: compuesta } },
      }),
    ).pipe(
      switchMap((previa) => {
        if (previa && Date.now() - previa.createdAt.getTime() < 24 * 3600_000) {
          res.status(previa.status);
          res.setHeader('Idempotency-Replayed', 'true');
          return of(previa.response);
        }
        return next.handle().pipe(
          switchMap((cuerpo) =>
            from(
              this.prisma.apiIdempotencyKey
                .upsert({
                  where: { tenantId_key: { tenantId, key: compuesta } },
                  update: { status: res.statusCode, response: cuerpo as Prisma.InputJsonValue, createdAt: new Date() },
                  create: { tenantId, key: compuesta, status: res.statusCode, response: cuerpo as Prisma.InputJsonValue },
                })
                .catch(() => undefined),
            ).pipe(switchMap(() => of(cuerpo))),
          ),
        );
      }),
    );
  }
}
