import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { StudyPlansService } from './study-plans.service';
import { PrismaService } from '@/common/prisma/prisma.service';

const TENANT_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const PLAN_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const PROGRAM_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

describe('StudyPlansService', () => {
  let service: StudyPlansService;

  const prismaMock: any = {
    studyPlan: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    studyPlanSubject: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    studyPlanPrerequisite: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    program: { findFirst: jest.fn() },
    subject: { findFirst: jest.fn() },
    $transaction: jest.fn(),
  };

  const planEditable = {
    id: PLAN_ID,
    programId: PROGRAM_ID,
    version: 'v1',
    status: 'BORRADOR',
    validFrom: null,
    program: { id: PROGRAM_ID, name: 'Tecnólogo', durationPeriods: 6 },
    _count: { programEnrollments: 0 },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    // El callback de $transaction recibe el propio mock como `tx`
    prismaMock.$transaction.mockImplementation(async (fn: any) => fn(prismaMock));
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudyPlansService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();
    service = module.get(StudyPlansService);
  });

  // Aislamiento multi-tenant
  it('update con un id de otro tenant responde 404', async () => {
    prismaMock.studyPlan.findFirst.mockResolvedValue(null);

    await expect(
      service.update(TENANT_A, PLAN_ID, { notes: 'x' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  // Regla: VIGENTE con estudiantes no se edita en sitio
  it('rechaza con 409 editar un pensum VIGENTE con estudiantes', async () => {
    prismaMock.studyPlan.findFirst.mockResolvedValue({
      ...planEditable,
      status: 'VIGENTE',
      _count: { programEnrollments: 4 },
    });

    await expect(
      service.update(TENANT_A, PLAN_ID, { notes: 'x' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prismaMock.studyPlan.update).not.toHaveBeenCalled();
  });

  // Activar cierra la versión vigente anterior del mismo programa
  it('activate pasa la VIGENTE anterior a CERRADO', async () => {
    prismaMock.studyPlan.findFirst.mockResolvedValue(planEditable);
    prismaMock.studyPlan.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.studyPlan.update.mockResolvedValue({ id: PLAN_ID, status: 'VIGENTE' });

    await service.activate(TENANT_A, PLAN_ID);

    expect(prismaMock.studyPlan.updateMany).toHaveBeenCalledWith({
      where: { programId: PROGRAM_ID, status: 'VIGENTE', id: { not: PLAN_ID } },
      data: { status: 'CERRADO' },
    });
    expect(prismaMock.studyPlan.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: PLAN_ID },
        data: expect.objectContaining({ status: 'VIGENTE' }),
      }),
    );
  });

  // Duplicar copia filas Y prerrequisitos remapeados a las filas nuevas
  it('duplicate copia filas y prerrequisitos a la versión nueva', async () => {
    prismaMock.studyPlan.findFirst
      .mockResolvedValueOnce({ ...planEditable, status: 'VIGENTE' }) // pensum()
      .mockResolvedValueOnce(null); // no existe la versión destino
    prismaMock.studyPlanSubject.findMany.mockResolvedValue([
      {
        id: 'f1', subjectId: 's1', level: 1, subjectType: 'OBLIGATORIA',
        credits: 3, hours: null, orderIndex: 0, prerequisites: [],
      },
      {
        id: 'f2', subjectId: 's2', level: 2, subjectType: 'OBLIGATORIA',
        credits: 4, hours: null, orderIndex: 0,
        prerequisites: [{ id: 'p1', entryId: 'f2', requiredId: 'f1' }],
      },
    ]);
    prismaMock.studyPlan.create.mockResolvedValue({ id: 'NUEVO' });
    prismaMock.studyPlanSubject.create
      .mockResolvedValueOnce({ id: 'n1' })
      .mockResolvedValueOnce({ id: 'n2' });
    prismaMock.studyPlanPrerequisite.createMany.mockResolvedValue({ count: 1 });
    prismaMock.studyPlan.findUnique.mockResolvedValue({ id: 'NUEVO' });

    await service.duplicate(TENANT_A, PLAN_ID, { version: 'v2' });

    expect(prismaMock.studyPlanSubject.create).toHaveBeenCalledTimes(2);
    expect(prismaMock.studyPlanPrerequisite.createMany).toHaveBeenCalledWith({
      data: [{ tenantId: TENANT_A, entryId: 'n2', requiredId: 'n1' }],
    });
  });

  // addSubject valida el subjectId del cliente contra el tenant
  it('addSubject con una asignatura de otro tenant responde 404', async () => {
    prismaMock.studyPlan.findFirst.mockResolvedValue(planEditable);
    prismaMock.subject.findFirst.mockResolvedValue(null);

    await expect(
      service.addSubject(TENANT_A, PLAN_ID, { subjectId: 'ajena', level: 1 } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prismaMock.studyPlanSubject.create).not.toHaveBeenCalled();
  });

  it('addSubject rechaza un nivel mayor que la duración del programa', async () => {
    prismaMock.studyPlan.findFirst.mockResolvedValue(planEditable); // durationPeriods: 6

    await expect(
      service.addSubject(TENANT_A, PLAN_ID, { subjectId: 's1', level: 9 } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  describe('setPrerequisites', () => {
    const fila = (overrides: Partial<any> = {}) => ({
      id: 'A',
      level: 3,
      studyPlanId: PLAN_ID,
      studyPlan: {
        ...planEditable,
        program: { id: PROGRAM_ID, durationPeriods: 6 },
      },
      ...overrides,
    });

    it('rechaza un prerrequisito de nivel igual o superior', async () => {
      prismaMock.studyPlanSubject.findFirst.mockResolvedValue(fila({ level: 1 }));
      prismaMock.studyPlanSubject.findMany.mockResolvedValue([
        { id: 'B', level: 1, subject: { code: 'B' } },
      ]);

      await expect(
        service.setPrerequisites(TENANT_A, 'A', ['B']),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    // El DFS detecta ciclos aunque los niveles legados sean inconsistentes
    it('rechaza un conjunto que formaría un ciclo', async () => {
      prismaMock.studyPlanSubject.findFirst.mockResolvedValue(fila());
      prismaMock.studyPlanSubject.findMany.mockResolvedValue([
        { id: 'B', level: 1, subject: { code: 'B' } },
      ]);
      // Dato legado inconsistente: B ya requiere a A
      prismaMock.studyPlanPrerequisite.findMany.mockResolvedValue([
        { entryId: 'B', requiredId: 'A' },
      ]);

      await expect(
        service.setPrerequisites(TENANT_A, 'A', ['B']),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('reemplaza los prerrequisitos cuando el conjunto es válido', async () => {
      prismaMock.studyPlanSubject.findFirst.mockResolvedValue(fila());
      prismaMock.studyPlanSubject.findMany.mockResolvedValue([
        { id: 'B', level: 1, subject: { code: 'B' } },
      ]);
      prismaMock.studyPlanPrerequisite.findMany.mockResolvedValue([]);
      prismaMock.studyPlanSubject.findUnique.mockResolvedValue({ id: 'A' });

      await service.setPrerequisites(TENANT_A, 'A', ['B']);

      expect(prismaMock.studyPlanPrerequisite.deleteMany).toHaveBeenCalledWith({
        where: { entryId: 'A' },
      });
      expect(prismaMock.studyPlanPrerequisite.createMany).toHaveBeenCalledWith({
        data: [{ tenantId: TENANT_A, entryId: 'A', requiredId: 'B' }],
      });
    });

    it('rechaza prerrequisitos que no son filas del mismo pensum', async () => {
      prismaMock.studyPlanSubject.findFirst.mockResolvedValue(fila());
      // El id pedido no aparece en el pensum (otro pensum u otro tenant)
      prismaMock.studyPlanSubject.findMany.mockResolvedValue([]);

      await expect(
        service.setPrerequisites(TENANT_A, 'A', ['ajeno']),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
