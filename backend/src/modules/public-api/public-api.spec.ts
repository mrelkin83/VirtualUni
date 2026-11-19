import { BadRequestException } from '@nestjs/common';
import { createHmac } from 'crypto';
import { ApiKeysService } from './api-keys.service';
import { WebhooksService } from './webhooks.service';
import { PagosWompiService } from '../admissions/pagos-wompi.service';

/**
 * Fase 7 — integraciones. Complementa el e2e manual: aquí viven las piezas
 * criptográficas y de SSRF que deben sobrevivir refactors.
 */

describe('ApiKeysService', () => {
  const prisma = () => ({
    apiKey: { create: jest.fn(), findUnique: jest.fn(), findFirst: jest.fn(), findMany: jest.fn(), update: jest.fn() },
  });

  it('crear devuelve la llave completa UNA vez y guarda solo el hash', async () => {
    const p = prisma();
    p.apiKey.create.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
      Promise.resolve({ ...data, id: 'k1', lastUsedAt: null, revokedAt: null, createdAt: new Date() }),
    );
    const s = new ApiKeysService(p as never);
    const r = await s.crear('t1', { name: 'CRM', type: 'SECRET' }, 'u1');
    expect(r.llave).toMatch(/^sk_live_/);
    const guardado = p.apiKey.create.mock.calls[0][0].data;
    expect(guardado.keyHash).toHaveLength(64);
    expect(JSON.stringify(guardado)).not.toContain(r.llave);
  });

  it('autenticar: formato inválido o llave revocada → null', async () => {
    const p = prisma();
    const s = new ApiKeysService(p as never);
    expect(await s.autenticar('no-es-una-llave')).toBeNull();
    p.apiKey.findUnique.mockResolvedValue({ id: 'k1', revokedAt: new Date() });
    expect(await s.autenticar('sk_live_' + 'a'.repeat(24))).toBeNull();
  });
});

describe('WebhooksService (firma y SSRF)', () => {
  const mk = () => {
    process.env.PAYMENTS_MASTER_KEY = 'maestra-prueba';
    process.env.JEST_WORKER_ID = process.env.JEST_WORKER_ID || '1'; // sin bucle
    const cripto = new PagosWompiService({} as never, {} as never);
    return new WebhooksService({} as never, cripto);
  };

  it('la firma t=..,v1=.. es verificable por el receptor con el secreto', () => {
    const s = mk();
    const cuerpo = JSON.stringify({ id: 'd1', type: 'lead.created', data: { x: 1 } });
    const t = 1700000000;
    const v1 = s.firmar('whsec_demo', t, cuerpo);
    const esperada = createHmac('sha256', 'whsec_demo').update(`${t}.${cuerpo}`).digest('hex');
    expect(v1).toBe(esperada);
    // otro timestamp u otro cuerpo rompen la firma (anti-replay)
    expect(s.firmar('whsec_demo', t + 1, cuerpo)).not.toBe(v1);
  });

  it('bloquea redes privadas, loopback y metadatos de nube', () => {
    const s = mk() as never as { esIpPrivada: (ip: string) => boolean };
    for (const ip of ['127.0.0.1', '10.1.2.3', '172.16.0.9', '192.168.1.1', '169.254.169.254', '::1', '0.0.0.0']) {
      expect(s.esIpPrivada(ip)).toBe(true);
    }
    for (const ip of ['8.8.8.8', '181.49.10.20', '172.32.0.1']) {
      expect(s.esIpPrivada(ip)).toBe(false);
    }
  });

  it('una URL http (no localhost) se rechaza', async () => {
    const s = mk() as never as { asegurarUrlSegura: (u: string) => Promise<void> };
    process.env.NODE_ENV = 'production';
    await expect(s.asegurarUrlSegura('http://ejemplo.com/hook')).rejects.toThrow(BadRequestException);
    await expect(s.asegurarUrlSegura('http://localhost:5601/hook')).rejects.toThrow(BadRequestException);
    delete (process.env as Record<string, string | undefined>).NODE_ENV;
  });
});
