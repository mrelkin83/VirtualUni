import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { ApiKey, ApiKeyType } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

export const SCOPES_PUBLICABLES = ['catalog:read', 'calls:read', 'certificates:verify'] as const;
export const SCOPES_SECRETOS = [
  'applicants:write',
  'applications:read',
  'applications:write',
  'documents:write',
  'webhooks:manage',
] as const;

/**
 * Llaves de la API pública (§13.3). La llave completa (pk_live_…/sk_test_…)
 * se construye al crearla, se devuelve UNA sola vez y aquí queda solo su
 * sha256. La resolución de tenant en /public/v1 es SOLO por la llave.
 */
@Injectable()
export class ApiKeysService {
  constructor(private readonly prisma: PrismaService) {}

  private hash(llave: string): string {
    return createHash('sha256').update(llave).digest('hex');
  }

  async crear(
    tenantId: string,
    dto: { name: string; type: ApiKeyType; testMode?: boolean; scopes?: string[]; allowedOrigins?: string[] },
    createdById: string,
  ) {
    const esPk = dto.type === 'PUBLISHABLE';
    const validos = esPk ? SCOPES_PUBLICABLES : SCOPES_SECRETOS;
    const scopes = (dto.scopes?.length ? dto.scopes : [...validos]).filter((s) =>
      (validos as readonly string[]).includes(s),
    );
    if (!scopes.length) throw new BadRequestException('La llave necesita al menos un scope válido');

    const prefijo = `${esPk ? 'pk' : 'sk'}_${dto.testMode ? 'test' : 'live'}_`;
    const llave = `${prefijo}${randomBytes(24).toString('base64url')}`;

    const fila = await this.prisma.apiKey.create({
      data: {
        tenantId,
        name: dto.name,
        type: dto.type,
        prefix: llave.slice(0, prefijo.length + 6),
        keyHash: this.hash(llave),
        testMode: dto.testMode ?? false,
        scopes,
        allowedOrigins: esPk ? (dto.allowedOrigins ?? []) : [],
        createdById,
      },
    });
    // Única vez que la llave completa sale del servidor.
    return { ...this.publica(fila), llave };
  }

  private publica(k: ApiKey) {
    return {
      id: k.id, name: k.name, type: k.type, prefix: k.prefix, testMode: k.testMode,
      scopes: k.scopes, allowedOrigins: k.allowedOrigins,
      lastUsedAt: k.lastUsedAt, revokedAt: k.revokedAt, createdAt: k.createdAt,
    };
  }

  async listar(tenantId: string) {
    const filas = await this.prisma.apiKey.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    return filas.map((k) => this.publica(k));
  }

  async revocar(tenantId: string, id: string) {
    const k = await this.prisma.apiKey.findFirst({ where: { id, tenantId } });
    if (!k) throw new NotFoundException('Llave no encontrada');
    await this.prisma.apiKey.update({ where: { id: k.id }, data: { revokedAt: new Date() } });
    return this.listar(tenantId);
  }

  /** Rotar = revocar la vieja y emitir una nueva con los mismos atributos. */
  async rotar(tenantId: string, id: string, createdById: string) {
    const k = await this.prisma.apiKey.findFirst({ where: { id, tenantId } });
    if (!k) throw new NotFoundException('Llave no encontrada');
    await this.prisma.apiKey.update({ where: { id: k.id }, data: { revokedAt: new Date() } });
    return this.crear(
      tenantId,
      { name: k.name, type: k.type, testMode: k.testMode, scopes: k.scopes, allowedOrigins: k.allowedOrigins },
      createdById,
    );
  }

  /** Autenticación de /public/v1: la llave ES el tenant. */
  async autenticar(llaveCruda: string): Promise<ApiKey | null> {
    if (!/^(pk|sk)_(test|live)_[A-Za-z0-9_-]{10,}$/.test(llaveCruda)) return null;
    const k = await this.prisma.apiKey.findUnique({ where: { keyHash: this.hash(llaveCruda) } });
    if (!k || k.revokedAt) return null;
    // lastUsedAt con granularidad de minuto para no escribir en cada request.
    if (!k.lastUsedAt || Date.now() - k.lastUsedAt.getTime() > 60_000) {
      this.prisma.apiKey
        .update({ where: { id: k.id }, data: { lastUsedAt: new Date() } })
        .catch(() => undefined);
    }
    return k;
  }
}
