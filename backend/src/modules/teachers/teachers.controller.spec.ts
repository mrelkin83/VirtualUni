import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';
import { CurrentUserData } from '@/common/decorators/current-user.decorator';
import { PrismaService } from '@/common/prisma/prisma.service';

const TENANT_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const TEACHER_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const OTHER_TEACHER_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

function user(overrides: Partial<CurrentUserData>): CurrentUserData {
  return {
    id: 'u1',
    userId: 'u1',
    tenantId: TENANT_A,
    email: 'x@example.com',
    firstName: 'X',
    lastName: 'Y',
    role: 'STUDENT',
    ...overrides,
  };
}

describe('TeachersController', () => {
  let controller: TeachersController;

  const serviceMock: any = {
    findOne: jest.fn().mockResolvedValue({ id: TEACHER_ID }),
    getTeacherStats: jest.fn().mockResolvedValue({}),
    esFichaDelUsuario: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeachersController],
      // PrismaService: no se usa directamente en estas pruebas (los guards
      // de @UseGuards no se ejecutan al llamar los métodos del controlador
      // así, sin pasar por HTTP), pero Nest igual instancia TenantGuard al
      // compilar el módulo y este la necesita para construirse.
      providers: [
        { provide: TeachersService, useValue: serviceMock },
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    controller = module.get<TeachersController>(TeachersController);
  });

  // Regresión: GET /teachers/:id y /:id/stats no llevaban ningún chequeo,
  // así que cualquier autenticado (incluido un STUDENT) podía pedir el
  // perfil completo de cualquier docente sólo con su id.
  describe('findOne', () => {
    it('rechaza a un STUDENT', async () => {
      await expect(
        controller.findOne(TEACHER_ID, TENANT_A, user({ role: 'STUDENT' })),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(serviceMock.findOne).not.toHaveBeenCalled();
    });

    it('rechaza a un TEACHER pidiendo la ficha de otro', async () => {
      serviceMock.esFichaDelUsuario.mockResolvedValue(false);

      await expect(
        controller.findOne(OTHER_TEACHER_ID, TENANT_A, user({ role: 'TEACHER', userId: 'u1' })),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('permite a un TEACHER ver su propia ficha', async () => {
      serviceMock.esFichaDelUsuario.mockResolvedValue(true);

      await controller.findOne(TEACHER_ID, TENANT_A, user({ role: 'TEACHER', userId: 'u1' }));

      expect(serviceMock.findOne).toHaveBeenCalledWith(TEACHER_ID, TENANT_A);
    });

    it('permite a TENANT_ADMIN ver cualquier ficha', async () => {
      await controller.findOne(TEACHER_ID, TENANT_A, user({ role: 'TENANT_ADMIN' }));

      expect(serviceMock.findOne).toHaveBeenCalledWith(TEACHER_ID, TENANT_A);
    });
  });

  describe('getStats', () => {
    it('rechaza a un STUDENT', async () => {
      await expect(
        controller.getStats(TEACHER_ID, TENANT_A, user({ role: 'STUDENT' })),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });
});
