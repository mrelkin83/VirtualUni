import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { PrismaService } from '@/common/prisma/prisma.service';

const TENANT_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const PROGRAM_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

describe('ProgramsService', () => {
  let service: ProgramsService;

  const prismaMock: any = {
    program: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    programEnrollment: { count: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProgramsService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();
    service = module.get(ProgramsService);
  });

  // Aislamiento multi-tenant
  it('update con un id de otro tenant responde 404', async () => {
    prismaMock.program.findFirst.mockResolvedValue(null);

    await expect(
      service.update(TENANT_A, PROGRAM_ID, { name: 'X' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prismaMock.program.update).not.toHaveBeenCalled();
  });

  it('remove con un id de otro tenant responde 404', async () => {
    prismaMock.program.findFirst.mockResolvedValue(null);

    await expect(service.remove(TENANT_A, PROGRAM_ID)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prismaMock.program.delete).not.toHaveBeenCalled();
  });

  // Un programa con inscritos no se borra: se sugiere INACTIVO
  it('remove bloquea con 409 un programa con estudiantes inscritos', async () => {
    prismaMock.program.findFirst.mockResolvedValue({ id: PROGRAM_ID });
    prismaMock.programEnrollment.count.mockResolvedValue(5);

    await expect(service.remove(TENANT_A, PROGRAM_ID)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(prismaMock.program.delete).not.toHaveBeenCalled();
  });

  it('remove elimina un programa sin inscritos', async () => {
    prismaMock.program.findFirst.mockResolvedValue({ id: PROGRAM_ID });
    prismaMock.programEnrollment.count.mockResolvedValue(0);
    prismaMock.program.delete.mockResolvedValue({});

    await service.remove(TENANT_A, PROGRAM_ID);
    expect(prismaMock.program.delete).toHaveBeenCalledWith({ where: { id: PROGRAM_ID } });
  });

  it('create rechaza un código duplicado en el tenant', async () => {
    prismaMock.program.findFirst.mockResolvedValue({ id: 'otro' });

    await expect(
      service.create(TENANT_A, {
        code: 'TEC-SOFT',
        name: 'Tecnólogo',
        educationLevel: 'TECNOLOGICO',
        modality: 'VIRTUAL',
        periodStructure: 'SEMESTRAL',
        academicUnit: 'CREDITOS',
      } as any),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prismaMock.program.create).not.toHaveBeenCalled();
  });
});
