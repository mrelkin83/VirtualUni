import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { PrismaService } from '@/common/prisma/prisma.service';

const TENANT_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const SUBJECT_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

describe('SubjectsService', () => {
  let service: SubjectsService;

  const prismaMock: any = {
    subject: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    studyPlanSubject: { count: jest.fn(), findMany: jest.fn() },
    course: { count: jest.fn() },
    // remove() también cuenta el contenido maestro antes de borrar (fase 4)
    courseTopic: { count: jest.fn().mockResolvedValue(0) },
    material: { count: jest.fn().mockResolvedValue(0) },
    questionBank: { count: jest.fn().mockResolvedValue(0) },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubjectsService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();
    service = module.get(SubjectsService);
  });

  // Aislamiento multi-tenant: un id de otro tenant se comporta como inexistente
  it('update con un id de otro tenant responde 404', async () => {
    prismaMock.subject.findFirst.mockResolvedValue(null);

    await expect(
      service.update(TENANT_A, SUBJECT_ID, { name: 'X' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prismaMock.subject.update).not.toHaveBeenCalled();
  });

  it('remove con un id de otro tenant responde 404', async () => {
    prismaMock.subject.findFirst.mockResolvedValue(null);

    await expect(service.remove(TENANT_A, SUBJECT_ID)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prismaMock.subject.delete).not.toHaveBeenCalled();
  });

  // Regla de negocio: una asignatura usada en un pensum o grupo no se borra
  it('remove bloquea con 409 una asignatura usada en pensums o grupos', async () => {
    prismaMock.subject.findFirst.mockResolvedValue({ id: SUBJECT_ID });
    prismaMock.studyPlanSubject.count.mockResolvedValue(2);
    prismaMock.course.count.mockResolvedValue(3);

    await expect(service.remove(TENANT_A, SUBJECT_ID)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(prismaMock.subject.delete).not.toHaveBeenCalled();
  });

  it('remove elimina una asignatura sin uso', async () => {
    prismaMock.subject.findFirst.mockResolvedValue({ id: SUBJECT_ID });
    prismaMock.studyPlanSubject.count.mockResolvedValue(0);
    prismaMock.course.count.mockResolvedValue(0);
    prismaMock.subject.delete.mockResolvedValue({});

    await service.remove(TENANT_A, SUBJECT_ID);
    expect(prismaMock.subject.delete).toHaveBeenCalledWith({ where: { id: SUBJECT_ID } });
  });

  it('create rechaza un código duplicado en el tenant', async () => {
    prismaMock.subject.findFirst.mockResolvedValue({ id: 'otra' });

    await expect(
      service.create(TENANT_A, { code: 'MAT-BAS', name: 'Matemáticas' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prismaMock.subject.create).not.toHaveBeenCalled();
  });
});
