import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CurrentUserData } from '@/common/decorators/current-user.decorator';
import { PrismaService } from '@/common/prisma/prisma.service';

const TENANT_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const PROPIO_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const OTRO_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

function user(overrides: Partial<CurrentUserData>): CurrentUserData {
  return {
    id: PROPIO_ID,
    userId: PROPIO_ID,
    tenantId: TENANT_A,
    email: 'x@example.com',
    firstName: 'X',
    lastName: 'Y',
    role: 'STUDENT',
    ...overrides,
  };
}

describe('UsersController', () => {
  let controller: UsersController;

  const serviceMock: any = {
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({ id: PROPIO_ID }),
    update: jest.fn().mockResolvedValue({ id: PROPIO_ID }),
    remove: jest.fn().mockResolvedValue({ id: OTRO_ID }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      // PrismaService: igual que en teachers.controller.spec.ts, los guards de
      // @UseGuards no corren al invocar los métodos directamente, pero Nest
      // instancia TenantGuard al compilar el módulo y éste la necesita para
      // construirse.
      providers: [
        { provide: UsersService, useValue: serviceMock },
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  // Regresión: el controlador recibía `@Body() updateData: any` sin RolesGuard,
  // así que un STUDENT podía enviarse `{"role":"SUPER_ADMIN"}` y quedaba
  // ascendido con acceso a todos los tenants. Ver el comentario de
  // dto/update-user.dto.ts.
  describe('update', () => {
    it('impide que un STUDENT se ascienda a SUPER_ADMIN', async () => {
      expect(() =>
        controller.update(PROPIO_ID, { role: 'SUPER_ADMIN' }, user({ role: 'STUDENT' })),
      ).toThrow(ForbiddenException);
      expect(serviceMock.update).not.toHaveBeenCalled();
    });

    it('impide que un STUDENT cambie su propio rol a cualquier valor', async () => {
      expect(() =>
        controller.update(PROPIO_ID, { role: 'TEACHER' }, user({ role: 'STUDENT' })),
      ).toThrow(ForbiddenException);
      expect(serviceMock.update).not.toHaveBeenCalled();
    });

    it('impide que un STUDENT reactive o desactive una cuenta', async () => {
      expect(() =>
        controller.update(PROPIO_ID, { isActive: false }, user({ role: 'STUDENT' })),
      ).toThrow(ForbiddenException);
      expect(serviceMock.update).not.toHaveBeenCalled();
    });

    it('impide que un STUDENT edite el perfil de otra persona', async () => {
      expect(() =>
        controller.update(OTRO_ID, { firstName: 'Nuevo' }, user({ role: 'STUDENT' })),
      ).toThrow(ForbiddenException);
      expect(serviceMock.update).not.toHaveBeenCalled();
    });

    it('permite a un STUDENT editar sus propios datos no privilegiados', async () => {
      await controller.update(PROPIO_ID, { firstName: 'Nuevo' }, user({ role: 'STUDENT' }));

      expect(serviceMock.update).toHaveBeenCalledWith(PROPIO_ID, TENANT_A, {
        firstName: 'Nuevo',
      });
    });

    // Un TENANT_ADMIN sí administra a los demás, pero SUPER_ADMIN es el rol que
    // atraviesa el aislamiento entre clientes: concederlo no es atribución suya.
    it('impide que un TENANT_ADMIN conceda SUPER_ADMIN', async () => {
      expect(() =>
        controller.update(OTRO_ID, { role: 'SUPER_ADMIN' }, user({ role: 'TENANT_ADMIN' })),
      ).toThrow(ForbiddenException);
      expect(serviceMock.update).not.toHaveBeenCalled();
    });

    it('permite a un TENANT_ADMIN conceder roles que no cruzan tenants', async () => {
      await controller.update(OTRO_ID, { role: 'TEACHER' }, user({ role: 'TENANT_ADMIN' }));

      expect(serviceMock.update).toHaveBeenCalledWith(OTRO_ID, TENANT_A, {
        role: 'TEACHER',
      });
    });

    it('permite a un SUPER_ADMIN conceder SUPER_ADMIN', async () => {
      await controller.update(OTRO_ID, { role: 'SUPER_ADMIN' }, user({ role: 'SUPER_ADMIN' }));

      expect(serviceMock.update).toHaveBeenCalledWith(OTRO_ID, TENANT_A, {
        role: 'SUPER_ADMIN',
      });
    });

    // El tenant que llega al servicio sale siempre del JWT, nunca del cuerpo ni
    // de la cabecera X-Tenant-ID: es lo que impide alcanzar un id de otro tenant.
    it('acota la actualización al tenant del JWT del llamador', async () => {
      await controller.update(OTRO_ID, { firstName: 'N' }, user({ role: 'TENANT_ADMIN' }));

      expect(serviceMock.update).toHaveBeenCalledWith(OTRO_ID, TENANT_A, expect.anything());
    });
  });

  // Regresión: sin chequeo, cualquier autenticado podía leer el perfil completo
  // de cualquier usuario del tenant sólo con su id.
  describe('findOne', () => {
    it('impide que un STUDENT consulte el perfil de otra persona', async () => {
      expect(() =>
        controller.findOne(OTRO_ID, user({ role: 'STUDENT' })),
      ).toThrow(ForbiddenException);
      expect(serviceMock.findOne).not.toHaveBeenCalled();
    });

    it('permite a un STUDENT consultar su propio perfil', async () => {
      await controller.findOne(PROPIO_ID, user({ role: 'STUDENT' }));

      expect(serviceMock.findOne).toHaveBeenCalledWith(PROPIO_ID, TENANT_A);
    });

    it('permite a la administración consultar cualquier perfil del tenant', async () => {
      await controller.findOne(OTRO_ID, user({ role: 'TENANT_ADMIN' }));

      expect(serviceMock.findOne).toHaveBeenCalledWith(OTRO_ID, TENANT_A);
    });
  });

  describe('findAll', () => {
    it('acota el directorio al tenant del JWT del llamador', async () => {
      await controller.findAll(user({ role: 'TENANT_ADMIN' }));

      expect(serviceMock.findAll).toHaveBeenCalledWith(TENANT_A);
    });
  });

  describe('remove', () => {
    it('impide que un administrador desactive su propia cuenta', async () => {
      expect(() =>
        controller.remove(PROPIO_ID, user({ role: 'TENANT_ADMIN' })),
      ).toThrow(ForbiddenException);
      expect(serviceMock.remove).not.toHaveBeenCalled();
    });

    it('acota la baja al tenant del JWT del llamador', async () => {
      await controller.remove(OTRO_ID, user({ role: 'TENANT_ADMIN' }));

      expect(serviceMock.remove).toHaveBeenCalledWith(OTRO_ID, TENANT_A);
    });
  });
});
