import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '@/common/prisma/prisma.service';

const TENANT_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const TENANT_B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const USER_AJENO = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

describe('UsersService', () => {
  let service: UsersService;

  const prismaMock: any = {
    user: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn(),
      update: jest.fn().mockResolvedValue({ id: USER_AJENO }),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  // La clase de bug más repetida del proyecto: `update`/`remove` por `id`
  // mutando sin comprobar antes que el registro sea del tenant del llamador.
  // El `findFirst({ id, tenantId })` previo es lo que lo impide; estas pruebas
  // fallan si alguien lo quita o lo mueve después del `update`.
  describe('update', () => {
    it('no muta un usuario de otro tenant', async () => {
      // El usuario existe, pero pertenece a TENANT_B: el findFirst acotado por
      // el tenant del llamador no lo encuentra.
      prismaMock.user.findFirst.mockResolvedValue(null);

      await expect(
        service.update(USER_AJENO, TENANT_A, { firstName: 'Nuevo' }),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it('comprueba la propiedad antes de mutar, no sólo por id', async () => {
      prismaMock.user.findFirst.mockResolvedValue({ id: USER_AJENO, tenantId: TENANT_A });

      await service.update(USER_AJENO, TENANT_A, { firstName: 'Nuevo' });

      expect(prismaMock.user.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: USER_AJENO, tenantId: TENANT_A } }),
      );
      expect(prismaMock.user.update).toHaveBeenCalled();
    });

    it('nunca devuelve el hash de la contraseña', async () => {
      prismaMock.user.findFirst.mockResolvedValue({ id: USER_AJENO, tenantId: TENANT_A });

      await service.update(USER_AJENO, TENANT_A, { firstName: 'Nuevo' });

      const [[{ select }]] = prismaMock.user.update.mock.calls;
      expect(select.passwordHash).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('no desactiva un usuario de otro tenant', async () => {
      prismaMock.user.findFirst.mockResolvedValue(null);

      await expect(service.remove(USER_AJENO, TENANT_A)).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it('comprueba la propiedad antes de la baja lógica', async () => {
      prismaMock.user.findFirst.mockResolvedValue({ id: USER_AJENO, tenantId: TENANT_A });

      await service.remove(USER_AJENO, TENANT_A);

      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where: { id: USER_AJENO, tenantId: TENANT_A },
      });
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: USER_AJENO },
        data: { isActive: false },
      });
    });
  });

  describe('findOne', () => {
    it('no expone un usuario de otro tenant', async () => {
      prismaMock.user.findFirst.mockResolvedValue(null);

      await expect(service.findOne(USER_AJENO, TENANT_A)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('descarta el hash de la contraseña del resultado', async () => {
      prismaMock.user.findFirst.mockResolvedValue({
        id: USER_AJENO,
        tenantId: TENANT_A,
        email: 'x@example.com',
        passwordHash: '$2b$10$hash-sintetico-de-prueba',
      });

      const result: any = await service.findOne(USER_AJENO, TENANT_A);

      expect(result.passwordHash).toBeUndefined();
      expect(result.email).toBe('x@example.com');
    });
  });

  describe('findAll', () => {
    it('filtra el directorio por el tenant recibido', async () => {
      await service.findAll(TENANT_B);

      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: TENANT_B } }),
      );
    });

    it('no incluye el hash de la contraseña en la selección', async () => {
      await service.findAll(TENANT_A);

      const [[{ select }]] = prismaMock.user.findMany.mock.calls;
      expect(select.passwordHash).toBeUndefined();
    });
  });
});
