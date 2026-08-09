import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { TenantGuard } from './tenant.guard';
import { PrismaService } from '../prisma/prisma.service';

const TENANT_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const TENANT_B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

/** Construye un ExecutionContext con la request indicada. */
function contextoCon(request: any): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('TenantGuard', () => {
  let guard: TenantGuard;

  const prismaMock = {
    tenant: { findUnique: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [TenantGuard, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    guard = module.get<TenantGuard>(TenantGuard);
  });

  const tenantActivo = { id: TENANT_B, status: 'ACTIVE' };

  it('rechaza si no se puede determinar el tenant', async () => {
    const ctx = contextoCon({ headers: {} });

    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('permite al usuario operar sobre su propio tenant', async () => {
    prismaMock.tenant.findUnique.mockResolvedValue({ id: TENANT_A, status: 'ACTIVE' });

    const ctx = contextoCon({
      headers: { 'x-tenant-id': TENANT_A },
      tenantId: TENANT_A,
      user: { tenantId: TENANT_A, role: 'STUDENT' },
    });

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  // Regresión del fallo de aislamiento multi-tenant: con un JWT válido de otro
  // tenant, cambiar X-Tenant-ID daba acceso a datos ajenos.
  it('rechaza cuando el tenant pedido no es el del usuario autenticado', async () => {
    prismaMock.tenant.findUnique.mockResolvedValue(tenantActivo);

    const ctx = contextoCon({
      headers: { 'x-tenant-id': TENANT_B },
      tenantId: TENANT_B,
      user: { tenantId: TENANT_A, role: 'STUDENT' },
    });

    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rechaza el salto de tenant también para un administrador de tenant', async () => {
    prismaMock.tenant.findUnique.mockResolvedValue(tenantActivo);

    const ctx = contextoCon({
      headers: { 'x-tenant-id': TENANT_B },
      tenantId: TENANT_B,
      user: { tenantId: TENANT_A, role: 'TENANT_ADMIN' },
    });

    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('permite a SUPER_ADMIN operar sobre cualquier tenant', async () => {
    prismaMock.tenant.findUnique.mockResolvedValue(tenantActivo);

    const ctx = contextoCon({
      headers: { 'x-tenant-id': TENANT_B },
      tenantId: TENANT_B,
      user: { tenantId: TENANT_A, role: 'SUPER_ADMIN' },
    });

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('usa el tenant del JWT cuando no llega cabecera', async () => {
    prismaMock.tenant.findUnique.mockResolvedValue({ id: TENANT_A, status: 'ACTIVE' });

    const request: any = {
      headers: {},
      user: { tenantId: TENANT_A, role: 'TEACHER' },
    };

    await expect(guard.canActivate(contextoCon(request))).resolves.toBe(true);
    expect(request.tenantId).toBe(TENANT_A);
  });

  it('rechaza si el tenant no existe', async () => {
    prismaMock.tenant.findUnique.mockResolvedValue(null);

    const ctx = contextoCon({
      headers: { 'x-tenant-id': TENANT_A },
      tenantId: TENANT_A,
      user: { tenantId: TENANT_A, role: 'STUDENT' },
    });

    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it.each(['SUSPENDED', 'CANCELLED'])('rechaza si el tenant está %s', async (status) => {
    prismaMock.tenant.findUnique.mockResolvedValue({ id: TENANT_A, status });

    const ctx = contextoCon({
      headers: { 'x-tenant-id': TENANT_A },
      tenantId: TENANT_A,
      user: { tenantId: TENANT_A, role: 'STUDENT' },
    });

    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
