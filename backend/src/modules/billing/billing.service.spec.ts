import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { createHash } from 'crypto';
import { BillingService, WompiWebhookPayload } from './billing.service';
import { PrismaService } from '@/common/prisma/prisma.service';
import { Plan, SubscriptionStatus } from '@prisma/client';

const TENANT_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

const ENV: Record<string, string> = {
  WOMPI_PUBLIC_KEY: 'pub_test_123',
  WOMPI_INTEGRITY_SECRET: 'test_integrity_abc',
  WOMPI_EVENTS_SECRET: 'test_events_xyz',
};

describe('BillingService (Wompi)', () => {
  let service: BillingService;

  const prismaMock: any = {
    tenant: { findUnique: jest.fn(), update: jest.fn() },
    subscription: { create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
    invoice: { create: jest.fn() },
  };

  const configMock: any = { get: jest.fn((key: string) => ENV[key]) };

  beforeEach(async () => {
    jest.clearAllMocks();
    configMock.get.mockImplementation((key: string) => ENV[key]);
    prismaMock.tenant.findUnique.mockResolvedValue({ id: TENANT_A, name: 'Universidad de Prueba' });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
  });

  describe('createCheckoutSession', () => {
    it('rechaza si Wompi no está configurado', async () => {
      configMock.get.mockReturnValue(undefined);

      await expect(
        service.createCheckoutSession(Plan.BASIC, TENANT_A, 'https://ok', 'https://cancel'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rechaza el plan FREE', async () => {
      await expect(
        service.createCheckoutSession(Plan.FREE, TENANT_A, 'https://ok', 'https://cancel'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('genera una URL de checkout con una firma de integridad verificable', async () => {
      const { url, reference } = await service.createCheckoutSession(
        Plan.BASIC,
        TENANT_A,
        'https://ok',
        'https://cancel',
      );

      const parsed = new URL(url);
      expect(parsed.origin + parsed.pathname).toBe('https://checkout.wompi.co/p/');
      expect(parsed.searchParams.get('reference')).toBe(reference);
      expect(parsed.searchParams.get('currency')).toBe('COP');

      const amountInCents = parsed.searchParams.get('amount-in-cents');
      const esperado = createHash('sha256')
        .update(`${reference}${amountInCents}COP${ENV.WOMPI_INTEGRITY_SECRET}`)
        .digest('hex');

      expect(parsed.searchParams.get('signature:integrity')).toBe(esperado);
    });
  });

  describe('handleWebhookEvent', () => {
    // Construye un payload de Wompi con checksum válido, replicando el
    // algoritmo documentado: concatenar signature.properties en orden +
    // timestamp + secreto de eventos, SHA-256.
    function payloadValido(reference: string, status = 'APPROVED'): WompiWebhookPayload {
      const timestamp = 1700000000;
      const transaction = {
        id: 'wompi-tx-1',
        amount_in_cents: 12_000_000,
        reference,
        currency: 'COP',
        status,
      };
      const properties = ['transaction.id', 'transaction.status', 'transaction.amount_in_cents'];
      const valores = [transaction.id, transaction.status, String(transaction.amount_in_cents)];
      const checksum = createHash('sha256')
        .update(`${valores.join('')}${timestamp}${ENV.WOMPI_EVENTS_SECRET}`)
        .digest('hex');

      return {
        event: 'transaction.updated',
        data: { transaction },
        signature: { properties, checksum, timestamp },
      };
    }

    it('rechaza un checksum inválido', async () => {
      const payload = payloadValido('sub__x__BASIC__1');
      payload.signature.checksum = 'checksum-falso';

      await expect(service.handleWebhookEvent(payload)).rejects.toBeInstanceOf(BadRequestException);
      expect(prismaMock.subscription.create).not.toHaveBeenCalled();
    });

    it('activa la suscripción y crea la factura cuando la transacción está aprobada', async () => {
      const reference = `sub__${TENANT_A}__BASIC__abc123`;
      const payload = payloadValido(reference, 'APPROVED');

      await service.handleWebhookEvent(payload);

      expect(prismaMock.subscription.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: TENANT_A,
            externalReference: reference,
            plan: Plan.BASIC,
            status: SubscriptionStatus.ACTIVE,
          }),
        }),
      );
      expect(prismaMock.invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: TENANT_A,
            wompiTransactionId: 'wompi-tx-1',
            amountCents: 12_000_000,
          }),
        }),
      );
      expect(prismaMock.tenant.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { plan: Plan.BASIC, status: 'ACTIVE' } }),
      );
    });

    it('no activa nada si la transacción no fue aprobada', async () => {
      const reference = `sub__${TENANT_A}__BASIC__abc123`;
      const payload = payloadValido(reference, 'DECLINED');

      await service.handleWebhookEvent(payload);

      expect(prismaMock.subscription.create).not.toHaveBeenCalled();
    });

    it('ignora una referencia que no reconoce en vez de fallar', async () => {
      const payload = payloadValido('algo-que-no-es-nuestra-referencia');

      await expect(service.handleWebhookEvent(payload)).resolves.toEqual(
        expect.objectContaining({ ignored: true }),
      );
      expect(prismaMock.subscription.create).not.toHaveBeenCalled();
    });
  });

  describe('cancelSubscription', () => {
    it('lanza 404 si no hay suscripción activa', async () => {
      prismaMock.subscription.findFirst.mockResolvedValue(null);

      await expect(service.cancelSubscription(TENANT_A)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('cancelación no inmediata sólo marca cancelAtPeriodEnd, sin suspender el tenant', async () => {
      prismaMock.subscription.findFirst.mockResolvedValue({ id: 'sub-1', tenantId: TENANT_A });

      await service.cancelSubscription(TENANT_A, false);

      expect(prismaMock.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { cancelAtPeriodEnd: true } }),
      );
      expect(prismaMock.tenant.update).not.toHaveBeenCalled();
    });

    it('cancelación inmediata suspende el tenant', async () => {
      prismaMock.subscription.findFirst.mockResolvedValue({ id: 'sub-1', tenantId: TENANT_A });

      await service.cancelSubscription(TENANT_A, true);

      expect(prismaMock.tenant.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'SUSPENDED' } }),
      );
    });
  });
});
