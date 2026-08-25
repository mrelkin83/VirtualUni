import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { PrismaService } from '@/common/prisma/prisma.service';
import { PayrollStatus } from '@prisma/client';

const TENANT_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const RECORD_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

describe('PayrollService', () => {
  let service: PayrollService;

  const prismaMock: any = {
    payrollRecord: {
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [PayrollService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    service = module.get<PayrollService>(PayrollService);
  });

  describe('updateRecord', () => {
    // Regresión: antes la condición era
    // `estado === PAGADO && updateDto.estado !== PAGADO`, así que reenviar
    // `estado: 'PAGADO'` (el mismo valor actual) junto con montos
    // modificados dejaba pasar la actualización sobre un registro ya pagado.
    it('rechaza cualquier cambio sobre un registro ya pagado, incluso si el DTO repite estado PAGADO', async () => {
      prismaMock.payrollRecord.findFirst.mockResolvedValue({
        id: RECORD_ID,
        tenantId: TENANT_A,
        estado: PayrollStatus.PAGADO,
        salarioBase: 1000,
        bonificaciones: 0,
        deducciones: 0,
      });

      await expect(
        service.updateRecord(RECORD_ID, TENANT_A, {
          estado: PayrollStatus.PAGADO,
          salarioBase: 999999,
        } as any),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(prismaMock.payrollRecord.update).not.toHaveBeenCalled();
    });

    it('rechaza el cambio aunque el DTO no toque el estado', async () => {
      prismaMock.payrollRecord.findFirst.mockResolvedValue({
        id: RECORD_ID,
        tenantId: TENANT_A,
        estado: PayrollStatus.PAGADO,
        salarioBase: 1000,
        bonificaciones: 0,
        deducciones: 0,
      });

      await expect(
        service.updateRecord(RECORD_ID, TENANT_A, { salarioBase: 1 } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('permite modificar un registro que no está pagado', async () => {
      prismaMock.payrollRecord.findFirst.mockResolvedValue({
        id: RECORD_ID,
        tenantId: TENANT_A,
        estado: PayrollStatus.BORRADOR,
        salarioBase: 1000,
        bonificaciones: 0,
        deducciones: 0,
      });
      prismaMock.payrollRecord.update.mockResolvedValue({ id: RECORD_ID });

      await service.updateRecord(RECORD_ID, TENANT_A, { salarioBase: 1200 } as any);

      expect(prismaMock.payrollRecord.update).toHaveBeenCalledTimes(1);
    });
  });
});
