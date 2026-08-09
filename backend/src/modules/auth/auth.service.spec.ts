import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../common/prisma/prisma.service';

const TENANT_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

describe('AuthService', () => {
  let service: AuthService;

  const prismaMock: any = {
    tenant: { findFirst: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    user: { findFirst: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    student: { create: jest.fn() },
    teacher: { create: jest.fn() },
  };

  const jwtMock = { sign: jest.fn().mockReturnValue('token'), verify: jest.fn() };
  const configMock = { get: jest.fn().mockReturnValue('secreto') };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtMock },
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('resolveTenantId', () => {
    // Las rutas de auth no pasan por TenantMiddleware, así que el identificador
    // puede llegar como id o como subdominio.
    it('acepta tanto el id como el subdominio', async () => {
      prismaMock.tenant.findFirst.mockResolvedValue({ id: TENANT_A });

      await expect(service.resolveTenantId('uniprueba')).resolves.toBe(TENANT_A);
      expect(prismaMock.tenant.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { OR: [{ id: 'uniprueba' }, { subdomain: 'uniprueba' }] },
        }),
      );
    });

    it('normaliza el subdominio a minúsculas', async () => {
      prismaMock.tenant.findFirst.mockResolvedValue({ id: TENANT_A });

      await service.resolveTenantId('UniPrueba');

      expect(prismaMock.tenant.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { OR: [{ id: 'UniPrueba' }, { subdomain: 'uniprueba' }] },
        }),
      );
    });

    it('devuelve null si el tenant no existe', async () => {
      prismaMock.tenant.findFirst.mockResolvedValue(null);

      await expect(service.resolveTenantId('inexistente')).resolves.toBeNull();
    });
  });

  describe('validateUser', () => {
    it('devuelve null si el tenant no se puede resolver', async () => {
      prismaMock.tenant.findFirst.mockResolvedValue(null);

      await expect(service.validateUser('a@b.com', 'x', 'nope')).resolves.toBeNull();
      expect(prismaMock.user.findFirst).not.toHaveBeenCalled();
    });

    it('busca al usuario acotado al tenant resuelto y activo', async () => {
      prismaMock.tenant.findFirst.mockResolvedValue({ id: TENANT_A });
      prismaMock.user.findFirst.mockResolvedValue(null);

      await service.validateUser('a@b.com', 'x', 'uniprueba');

      expect(prismaMock.user.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: 'a@b.com', tenantId: TENANT_A, isActive: true },
        }),
      );
    });

    it('devuelve null si la contraseña no coincide', async () => {
      prismaMock.tenant.findFirst.mockResolvedValue({ id: TENANT_A });
      prismaMock.user.findFirst.mockResolvedValue({
        id: 'u1',
        passwordHash: await bcrypt.hash('correcta', 4),
      });

      await expect(service.validateUser('a@b.com', 'incorrecta', TENANT_A)).resolves.toBeNull();
    });

    it('nunca expone el hash de la contraseña', async () => {
      prismaMock.tenant.findFirst.mockResolvedValue({ id: TENANT_A });
      prismaMock.user.findFirst.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        passwordHash: await bcrypt.hash('correcta', 4),
      });
      prismaMock.user.update.mockResolvedValue({});

      const user = await service.validateUser('a@b.com', 'correcta', TENANT_A);

      expect(user).not.toBeNull();
      expect(user).not.toHaveProperty('passwordHash');
    });
  });

  describe('register', () => {
    const dto = {
      email: 'nuevo@uniprueba.com',
      password: 'Secreta123!',
      firstName: 'Nuevo',
      lastName: 'Usuario',
      role: 'STUDENT',
    } as any;

    it('rechaza si el tenant no existe', async () => {
      prismaMock.tenant.findFirst.mockResolvedValue(null);

      await expect(service.register(dto, 'nope')).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rechaza si el usuario ya existe en el tenant', async () => {
      prismaMock.tenant.findFirst.mockResolvedValue({ id: TENANT_A });
      prismaMock.user.findFirst.mockResolvedValue({ id: 'existente' });

      await expect(service.register(dto, TENANT_A)).rejects.toBeInstanceOf(ConflictException);
    });

    // Los límites del plan se aplican en el servidor: sin esto un tenant podría
    // superar los cupos contratados registrando usuarios.
    it('rechaza al superar el cupo de estudiantes del plan', async () => {
      prismaMock.tenant.findFirst.mockResolvedValue({ id: TENANT_A });
      prismaMock.user.findFirst.mockResolvedValue(null);
      prismaMock.tenant.findUnique.mockResolvedValue({
        id: TENANT_A,
        status: 'ACTIVE',
        maxStudents: 20,
        currentStudents: 20,
        maxTeachers: 5,
        currentTeachers: 0,
      });

      await expect(service.register(dto, TENANT_A)).rejects.toBeInstanceOf(ForbiddenException);
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it('rechaza al superar el cupo de docentes del plan', async () => {
      prismaMock.tenant.findFirst.mockResolvedValue({ id: TENANT_A });
      prismaMock.user.findFirst.mockResolvedValue(null);
      prismaMock.tenant.findUnique.mockResolvedValue({
        id: TENANT_A,
        status: 'ACTIVE',
        maxStudents: 20,
        currentStudents: 0,
        maxTeachers: 2,
        currentTeachers: 2,
      });

      await expect(
        service.register({ ...dto, role: 'TEACHER' }, TENANT_A),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it('rechaza si el tenant está suspendido', async () => {
      prismaMock.tenant.findFirst.mockResolvedValue({ id: TENANT_A });
      prismaMock.user.findFirst.mockResolvedValue(null);
      prismaMock.tenant.findUnique.mockResolvedValue({ id: TENANT_A, status: 'SUSPENDED' });

      await expect(service.register(dto, TENANT_A)).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('crea el usuario, su perfil y actualiza el contador del tenant', async () => {
      prismaMock.tenant.findFirst.mockResolvedValue({ id: TENANT_A });
      prismaMock.user.findFirst.mockResolvedValue(null);
      prismaMock.tenant.findUnique.mockResolvedValue({
        id: TENANT_A,
        status: 'ACTIVE',
        maxStudents: 20,
        currentStudents: 0,
        maxTeachers: 5,
        currentTeachers: 0,
      });
      prismaMock.user.create.mockResolvedValue({
        id: 'u-nuevo',
        email: dto.email,
        role: 'STUDENT',
        tenantId: TENANT_A,
        passwordHash: 'hash',
      });

      const res = await service.register(dto, TENANT_A);

      // La contraseña se almacena hasheada, nunca en claro.
      const creado = prismaMock.user.create.mock.calls[0][0].data;
      expect(creado.passwordHash).not.toBe(dto.password);
      expect(await bcrypt.compare(dto.password, creado.passwordHash)).toBe(true);

      expect(prismaMock.student.create).toHaveBeenCalled();
      expect(prismaMock.tenant.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { currentStudents: { increment: 1 } } }),
      );
      expect(res).toHaveProperty('accessToken');
    });
  });

  describe('refreshToken', () => {
    it('rechaza un refresh token inválido', async () => {
      jwtMock.verify.mockImplementation(() => {
        throw new Error('invalid');
      });

      await expect(service.refreshToken('malo')).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rechaza si el usuario fue desactivado', async () => {
      jwtMock.verify.mockReturnValue({ sub: 'u1' });
      prismaMock.user.findUnique.mockResolvedValue({ id: 'u1', isActive: false });

      await expect(service.refreshToken('token')).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
