import { BadRequestException, ConflictException } from '@nestjs/common';
import { AdmissionsService } from './admissions.service';
import { PublicCatalogService } from '../public-site/public-catalog.service';

/**
 * Fase 3 — inscripciones. Protege las reglas que no cubre el e2e manual:
 * cupo por grado LLENO aunque la convocatoria tenga cupo general, enlace
 * mágico vencido/reutilizado, antispam y el escalón de escolaridad.
 */

const prismaMock = () => ({
  application: { count: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
  applicationEvent: { create: jest.fn() },
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
