import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { GradesService } from './grades.service';
import { PrismaService } from '@/common/prisma/prisma.service';

const TENANT_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const COURSE_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const STUDENT_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

const NOTA = {
  studentId: STUDENT_ID,
  courseId: COURSE_ID,
  gradeType: 'parcial1',
  grade: 80,
};

describe('GradesService', () => {
  let service: GradesService;

  const prismaMock: any = {
    grade: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    course: { findFirst: jest.fn() },
    enrollment: { findFirst: jest.fn() },
    teacher: { findFirst: jest.fn() },
    student: { findFirst: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [GradesService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();
    service = module.get(GradesService);
  });

  // El findFirst que no encuentra nada NO es permiso para escribir: un
  // courseId de otro tenant tiene que responder 404, no colarse.
  it('no registra una nota en un grupo de otro tenant', async () => {
    prismaMock.course.findFirst.mockResolvedValue(null);

    await expect(service.create(NOTA, TENANT_A)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prismaMock.grade.create).not.toHaveBeenCalled();
  });

  it('no registra una nota a un estudiante que no está matriculado en el grupo', async () => {
    prismaMock.course.findFirst.mockResolvedValue({
      id: COURSE_ID,
      gradesClosedAt: null,
    });
    prismaMock.enrollment.findFirst.mockResolvedValue(null);

    await expect(service.create(NOTA, TENANT_A)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prismaMock.grade.create).not.toHaveBeenCalled();
  });

  it('no registra una nota con un docente de otro tenant', async () => {
    prismaMock.course.findFirst.mockResolvedValue({
      id: COURSE_ID,
      gradesClosedAt: null,
    });
    prismaMock.enrollment.findFirst.mockResolvedValue({ id: 'matricula-1' });
    prismaMock.teacher.findFirst.mockResolvedValue(null);

    await expect(
      service.create({ ...NOTA, teacherId: 'docente-ajeno' }, TENANT_A),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prismaMock.grade.create).not.toHaveBeenCalled();
  });

  it('registra la nota cuando el grupo y la matrícula son del tenant', async () => {
    prismaMock.course.findFirst.mockResolvedValue({
      id: COURSE_ID,
      gradesClosedAt: null,
    });
    prismaMock.enrollment.findFirst.mockResolvedValue({ id: 'matricula-1' });

    await service.create(NOTA, TENANT_A);

    expect(prismaMock.grade.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ ...NOTA, tenantId: TENANT_A }),
      }),
    );
  });

  // Cierre de notas: con el acta en el historial no se edita nada
  it('no registra notas en un grupo con notas cerradas', async () => {
    prismaMock.course.findFirst.mockResolvedValue({
      id: COURSE_ID,
      gradesClosedAt: new Date('2026-11-01T00:00:00.000Z'),
    });

    await expect(service.create(NOTA, TENANT_A)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(prismaMock.grade.create).not.toHaveBeenCalled();
  });

  it('no corrige una nota de un grupo con notas cerradas', async () => {
    prismaMock.grade.findFirst.mockResolvedValue({
      id: 'nota-1',
      courseId: COURSE_ID,
    });
    prismaMock.course.findFirst.mockResolvedValue({
      id: COURSE_ID,
      gradesClosedAt: new Date('2026-11-01T00:00:00.000Z'),
    });

    await expect(
      service.update('nota-1', { grade: 90 }, TENANT_A),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prismaMock.grade.update).not.toHaveBeenCalled();
  });

  it('no borra una nota de un grupo con notas cerradas', async () => {
    prismaMock.grade.findFirst.mockResolvedValue({
      id: 'nota-1',
      courseId: COURSE_ID,
    });
    prismaMock.course.findFirst.mockResolvedValue({
      id: COURSE_ID,
      gradesClosedAt: new Date('2026-11-01T00:00:00.000Z'),
    });

    await expect(service.remove('nota-1', TENANT_A)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(prismaMock.grade.delete).not.toHaveBeenCalled();
  });

  it('una nota de otro tenant no se puede corregir', async () => {
    prismaMock.grade.findFirst.mockResolvedValue(null);

    await expect(
      service.update('nota-ajena', { grade: 90 }, TENANT_A),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prismaMock.grade.update).not.toHaveBeenCalled();
  });

  it('corrige la nota cuando el grupo sigue abierto', async () => {
    prismaMock.grade.findFirst.mockResolvedValue({
      id: 'nota-1',
      courseId: COURSE_ID,
    });
    prismaMock.course.findFirst.mockResolvedValue({
      id: COURSE_ID,
      gradesClosedAt: null,
    });

    await service.update('nota-1', { grade: 90 }, TENANT_A);

    expect(prismaMock.grade.update).toHaveBeenCalledWith({
      where: { id: 'nota-1' },
      data: { grade: 90 },
    });
  });
});
