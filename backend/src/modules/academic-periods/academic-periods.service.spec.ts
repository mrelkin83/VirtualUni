import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AcademicPeriodsService } from './academic-periods.service';
import { PrismaService } from '@/common/prisma/prisma.service';

const TENANT_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const PERIOD_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

describe('AcademicPeriodsService', () => {
  let service: AcademicPeriodsService;

  const prismaMock: any = {
    academicPeriod: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AcademicPeriodsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get(AcademicPeriodsService);
  });

  it('create rechaza startDate posterior o igual a endDate', async () => {
    await expect(
      service.create(TENANT_A, {
        code: '2027-1',
        name: 'Periodo',
        startDate: '2027-06-15',
        endDate: '2027-01-15',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prismaMock.academicPeriod.create).not.toHaveBeenCalled();
  });

  // El solapamiento ADVIERTE pero no bloquea (cohortes legítimas se traslapan)
  it('create advierte el solapamiento sin bloquear', async () => {
    prismaMock.academicPeriod.findFirst.mockResolvedValue(null); // code único
    prismaMock.academicPeriod.findMany.mockResolvedValue([{ code: '2027-A' }]);
    prismaMock.academicPeriod.create.mockResolvedValue({ id: PERIOD_ID, code: '2027-1' });

    const resultado = await service.create(TENANT_A, {
      code: '2027-1',
      name: 'Periodo',
      startDate: '2027-01-15',
      endDate: '2027-06-15',
    });

    expect(prismaMock.academicPeriod.create).toHaveBeenCalled();
    expect(resultado.advertencias).toEqual([
      'El rango de fechas se solapa con el periodo 2027-A',
    ]);
  });

  // Aislamiento multi-tenant
  it('update con un id de otro tenant responde 404', async () => {
    prismaMock.academicPeriod.findFirst.mockResolvedValue(null);

    await expect(
      service.update(TENANT_A, PERIOD_ID, { name: 'X' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prismaMock.academicPeriod.update).not.toHaveBeenCalled();
  });
});
