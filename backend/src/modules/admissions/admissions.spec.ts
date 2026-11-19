import { BadRequestException, ConflictException } from '@nestjs/common';
import { createHash } from 'crypto';
import { AdmissionsService } from './admissions.service';
import { PublicCatalogService } from '../public-site/public-catalog.service';
import { PagosWompiService, WompiWebhookPayload } from './pagos-wompi.service';

/**
 * Fase 3 — inscripciones. Protege las reglas que no cubre el e2e manual:
 * cupo por grado LLENO aunque la convocatoria tenga cupo general, enlace
 * mágico vencido/reutilizado, antispam y el escalón de escolaridad.
 */

const prismaMock = () => ({
  application: { count: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
  applicationEvent: { create: jest.fn() },
  outboxEvent: { create: jest.fn() },
  applicationDocument: { count: jest.fn() },
  applicant: { update: jest.fn() },
  user: { findFirst: jest.fn() },
  student: { findFirst: jest.fn() },
  tenant: { findUnique: jest.fn() },
  programEnrollment: { upsert: jest.fn() },
  $transaction: jest.fn(),
});

const mkServicio = (prisma: ReturnType<typeof prismaMock>) =>
  new AdmissionsService(
    prisma as never,
    new PublicCatalogService({} as never),
    { enviar: jest.fn() } as never,
    {} as never,
  );

const CALL_COLEGIO = {
  id: 'call1', tenantId: 't1', status: 'ABIERTA',
  opensAt: new Date(Date.now() - 86400_000), closesAt: new Date(Date.now() + 86400_000),
  rolling: false, capacity: 100, minAge: null, maxAge: null, minEducation: null,
  targetLevels: [
    { level: 6, label: 'Sexto', capacity: 2 },
    { level: 7, label: 'Séptimo', capacity: 30 },
  ],
} as never;

describe('cupo por grado (colegio)', () => {
  let prisma: ReturnType<typeof prismaMock>;
  let servicio: AdmissionsService;

  beforeEach(() => {
    prisma = prismaMock();
    servicio = mkServicio(prisma);
    process.env.JWT_SECRET = 'secreto-prueba';
  });

  const asegurar = (nivel?: number) =>
    (servicio as never as { asegurarCupo: (c: unknown, n?: number) => Promise<void> })
      .asegurarCupo(CALL_COLEGIO, nivel);

  it('rechaza cuando el GRADO está lleno aunque la convocatoria tenga cupo general', async () => {
    prisma.application.count.mockResolvedValue(2); // sexto lleno (capacity 2)
    await expect(asegurar(6)).rejects.toThrow(ConflictException);
    // el conteo fue POR grado, no global
    expect(prisma.application.count.mock.calls[0][0].where.targetLevel).toBe(6);
  });

  it('acepta un grado con cupo', async () => {
    prisma.application.count.mockResolvedValue(1);
    await expect(asegurar(7)).resolves.toBeUndefined();
  });

  it('exige el grado cuando la convocatoria es por grados', async () => {
    await expect(asegurar(undefined)).rejects.toThrow(BadRequestException);
  });

  it('rechaza un grado que la convocatoria no ofrece', async () => {
    await expect(asegurar(11)).rejects.toThrow(BadRequestException);
  });
});

describe('enlace mágico', () => {
  let prisma: ReturnType<typeof prismaMock>;
  let servicio: AdmissionsService;
  const res = { cookie: jest.fn() } as never;

  beforeEach(() => {
    prisma = prismaMock();
    servicio = mkServicio(prisma);
  });

  it('vencido → false sin tocar nada', async () => {
    prisma.application.findFirst.mockResolvedValue(null); // el where ya exige exp > now
    expect(await servicio.canjearEnlace('t1', 'id.secreto', res)).toBe(false);
    expect(prisma.application.update).not.toHaveBeenCalled();
  });

  it('hash que no coincide → false', async () => {
    prisma.application.findFirst.mockResolvedValue({
      id: 'app1', accessTokenHash: 'a'.repeat(64), applicant: { email: 'x@y.co' },
    });
    expect(await servicio.canjearEnlace('t1', 'app1.secreto-equivocado', res)).toBe(false);
  });

  it('malformado → false', async () => {
    expect(await servicio.canjearEnlace('t1', 'sin-punto', res)).toBe(false);
  });
});

describe('admisión (Fase 4)', () => {
  let prisma: ReturnType<typeof prismaMock>;
  let servicio: AdmissionsService;

  const APP = {
    id: 'app1', tenantId: 't1', status: 'EN_REVISION', paidAt: new Date(), targetLevel: null,
    applicantId: 'asp1',
    applicant: { email: 'nueva@test.com', firstName: 'Nueva', lastName: 'Alumna', documentType: 'CC', documentNumber: '123456', birthDate: null, phone: '300' },
    call: { applicationFee: 50000, studyPlanId: 'plan1', program: { id: 'prog1', name: 'Técnico' } },
  };

  beforeEach(() => {
    prisma = prismaMock();
    servicio = mkServicio(prisma);
  });

  it('respeta maxStudents: el cupo del plan lleno bloquea con mensaje claro, nunca en silencio', async () => {
    prisma.application.findFirst.mockResolvedValue(APP);
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.tenant.findUnique.mockResolvedValue({ name: 'Demo', maxStudents: 20, currentStudents: 20 });
    await expect(servicio.admitir('t1', 'app1', undefined, 'admin1')).rejects.toThrow(/20 estudiantes/);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('con fee sin pagar no se admite', async () => {
    prisma.application.findFirst.mockResolvedValue({ ...APP, paidAt: null });
    await expect(servicio.admitir('t1', 'app1', undefined, 'admin1')).rejects.toThrow(/pago/i);
  });

  it('el correo de un usuario con otro rol no se convierte en estudiante', async () => {
    prisma.application.findFirst.mockResolvedValue(APP);
    prisma.user.findFirst.mockResolvedValue({ id: 'u1', role: 'TEACHER' });
    await expect(servicio.admitir('t1', 'app1', undefined, 'admin1')).rejects.toThrow(ConflictException);
  });

  it('confirmar un pago ya confirmado → rechazo (idempotencia)', async () => {
    prisma.application.findFirst.mockResolvedValue({ id: 'a1', tenantId: 't1', status: 'PAGADA', paidAt: new Date() });
    await expect(servicio.confirmarPago('t1', 'a1', undefined, 'admin1')).rejects.toThrow(/ya estaba confirmado/);
  });
});

describe('Wompi por institución (Fase 5)', () => {
  const prismaW = () => ({
    tenant: { findUnique: jest.fn() },
    tenantPaymentConfig: { findUnique: jest.fn() },
    application: { findFirst: jest.fn(), update: jest.fn() },
    applicationDocument: { count: jest.fn() },
    applicationEvent: { create: jest.fn() },
    outboxEvent: { create: jest.fn() },
  });
  let prisma: ReturnType<typeof prismaW>;
  let servicio: PagosWompiService;

  beforeEach(() => {
    prisma = prismaW();
    servicio = new PagosWompiService(prisma as never, {} as never);
    process.env.PAYMENTS_MASTER_KEY = 'clave-maestra-de-prueba';
  });

  it('cifra y descifra las llaves (AES-256-GCM) de ida y vuelta', () => {
    const secreto = 'test_events_abc123';
    const empaquetado = servicio.cifrar(secreto);
    expect(empaquetado).not.toContain(secreto);
    expect(servicio.descifrar(empaquetado)).toBe(secreto);
  });

  // Vector calculado A MANO (exigencia de billing-regression-check): el test
  // no reutiliza la lógica del servicio para derivar el valor esperado.
  const EVENTS_KEY = 'ev_secreto';
  const payloadValido = (): WompiWebhookPayload => {
    const tx = { id: 'tx-1', status: 'APPROVED', reference: 'INSW-app9', amount_in_cents: 5000000 };
    const timestamp = 1700000000;
    const cadena = `${tx.id}${tx.status}${tx.amount_in_cents}${timestamp}${EVENTS_KEY}`;
    return {
      event: 'transaction.updated',
      data: { transaction: tx },
      signature: {
        properties: ['transaction.id', 'transaction.status', 'transaction.amount_in_cents'],
        checksum: createHash('sha256').update(cadena).digest('hex').toUpperCase(),
        timestamp,
      },
    };
  };

  it('acepta el checksum correcto (rutas completas desde payload.data, case-insensitive)', () => {
    expect(servicio.verificarChecksum(payloadValido(), EVENTS_KEY)).toBe(true);
  });

  it('rechaza un checksum alterado y una llave de eventos ajena', () => {
    const p = payloadValido();
    expect(servicio.verificarChecksum(p, 'otra-llave')).toBe(false);
    p.signature.checksum = 'f'.repeat(64);
    expect(servicio.verificarChecksum(p, EVENTS_KEY)).toBe(false);
  });

  it('webhook con firma inválida → excepción (status no-2xx para que Wompi reintente)', async () => {
    prisma.tenant.findUnique.mockResolvedValue({ id: 't1' });
    prisma.tenantPaymentConfig.findUnique.mockResolvedValue({ eventsKeyEnc: servicio.cifrar(EVENTS_KEY) });
    const p = payloadValido();
    p.signature.checksum = 'a'.repeat(64);
    await expect(servicio.procesarWebhook('demo', p)).rejects.toThrow(BadRequestException);
    expect(prisma.application.update).not.toHaveBeenCalled();
  });

  it('idempotencia: el mismo transaction.id repetido no vuelve a marcar nada', async () => {
    prisma.tenant.findUnique.mockResolvedValue({ id: 't1' });
    prisma.tenantPaymentConfig.findUnique.mockResolvedValue({ eventsKeyEnc: servicio.cifrar(EVENTS_KEY) });
    prisma.application.findFirst.mockResolvedValue({
      id: 'app9', paidAt: new Date(), paymentRef: 'tx-1', call: { applicationFee: 50000 },
    });
    const r = await servicio.procesarWebhook('demo', payloadValido());
    expect(r).toMatchObject({ received: true, duplicated: true });
    expect(prisma.application.update).not.toHaveBeenCalled();
  });

  it('un monto distinto al de la convocatoria no marca el pago', async () => {
    prisma.tenant.findUnique.mockResolvedValue({ id: 't1' });
    prisma.tenantPaymentConfig.findUnique.mockResolvedValue({ eventsKeyEnc: servicio.cifrar(EVENTS_KEY) });
    prisma.application.findFirst.mockResolvedValue({
      id: 'app9', paidAt: null, paymentRef: null, call: { applicationFee: 99999 }, // esperado 9 999 900
    });
    const r = await servicio.procesarWebhook('demo', payloadValido());
    expect(r).toMatchObject({ received: true, ignored: true });
    expect(prisma.application.update).not.toHaveBeenCalled();
  });
});

describe('antispam (§8)', () => {
  const servicio = mkServicio(prismaMock());

  it('honeypot lleno → rechazo', () => {
    expect(() => servicio.verificarAntispam({ web: 'spam' })).toThrow(BadRequestException);
  });

  it('formulario llenado en menos de 4 segundos → rechazo', () => {
    expect(() => servicio.verificarAntispam({ _t: String(Date.now() - 1000) })).toThrow(BadRequestException);
  });

  it('tiempo humano → pasa', () => {
    expect(() => servicio.verificarAntispam({ _t: String(Date.now() - 10_000) })).not.toThrow();
  });
});
