import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ProceduresService } from './procedures.service';
import { PrismaService } from '@/common/prisma/prisma.service';
import { ProcedureStatus } from '@prisma/client';

const TENANT_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const PROCEDURE_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const USUARIO_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

describe('ProceduresService', () => {
  let service: ProceduresService;

  const prismaMock: any = {
    procedure: { findUnique: jest.fn(), update: jest.fn() },
    user: { findFirst: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prismaMock.procedure.findUnique.mockResolvedValue({
      id: PROCEDURE_ID,
      tenantId: TENANT_A,
      estado: ProcedureStatus.PENDIENTE,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [ProceduresService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    service = module.get<ProceduresService>(ProceduresService);
  });

  describe('assign', () => {
    // Regresión: `assignDto.usuarioId` se escribía en asignadoA sin
    // comprobar que existiera ni que fuera del mismo tenant.
    it('rechaza un usuarioId que no existe en el tenant', async () => {
      prismaMock.user.findFirst.mockResolvedValue(null);

      await expect(
        service.assign(PROCEDURE_ID, TENANT_A, { usuarioId: USUARIO_ID } as any),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(prismaMock.procedure.update).not.toHaveBeenCalled();
    });

    it('asigna cuando el usuario sí existe en el tenant', async () => {
      prismaMock.user.findFirst.mockResolvedValue({ id: USUARIO_ID });
      prismaMock.procedure.update.mockResolvedValue({ id: PROCEDURE_ID });

      await service.assign(PROCEDURE_ID, TENANT_A, { usuarioId: USUARIO_ID } as any);

      expect(prismaMock.procedure.update).toHaveBeenCalledTimes(1);
    });
  });
});
