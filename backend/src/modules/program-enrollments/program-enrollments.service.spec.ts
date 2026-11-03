import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ProgramEnrollmentsService } from './program-enrollments.service';
import { PrismaService } from '@/common/prisma/prisma.service';

const TENANT_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const STUDENT_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const PROGRAM_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

const USER_ADMIN: any = { id: 'u-admin', role: 'TENANT_ADMIN' };
const USER_STUDENT: any = { id: 'u-student', role: 'STUDENT' };

describe('ProgramEnrollmentsService', () => {
  let service: ProgramEnrollmentsService;

  const prismaMock: any = {
    programEnrollment: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    student: { findFirst: jest.fn() },
    program: { findFirst: jest.fn() },
    studyPlan: { findFirst: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgramEnrollmentsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get(ProgramEnrollmentsService);
  });

  // Todos los *Id del DTO se validan contra el tenant del llamador
  it('create con un studentId de otro tenant responde 404', async () => {
    prismaMock.student.findFirst.mockResolvedValue(null);
    prismaMock.program.findFirst.mockResolvedValue({ id: PROGRAM_ID, durationPeriods: 6 });

    await expect(
      service.create(TENANT_A, { studentId: STUDENT_ID, programId: PROGRAM_ID }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prismaMock.programEnrollment.create).not.toHaveBeenCalled();
  });

  it('create con un studyPlanId de otro programa responde 404', async () => {
    prismaMock.student.findFirst.mockResolvedValue({ id: STUDENT_ID });
    prismaMock.program.findFirst.mockResolvedValue({ id: PROGRAM_ID, durationPeriods: null });
    prismaMock.studyPlan.findFirst.mockResolvedValue(null);

    await expect(
      service.create(TENANT_A, {
        studentId: STUDENT_ID,
        programId: PROGRAM_ID,
        studyPlanId: 'plan-ajeno',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('create sin studyPlanId usa el pensum VIGENTE del programa', async () => {
    prismaMock.student.findFirst.mockResolvedValue({ id: STUDENT_ID });
    prismaMock.program.findFirst.mockResolvedValue({ id: PROGRAM_ID, durationPeriods: null });
    prismaMock.studyPlan.findFirst.mockResolvedValue({ id: 'plan-vigente' });
    prismaMock.programEnrollment.findFirst.mockResolvedValue(null);
    prismaMock.programEnrollment.create.mockResolvedValue({ id: 'insc' });

    await service.create(TENANT_A, { studentId: STUDENT_ID, programId: PROGRAM_ID });

    expect(prismaMock.programEnrollment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ studyPlanId: 'plan-vigente' }),
      }),
    );
  });

  it('create sin pensum VIGENTE y sin studyPlanId responde 400', async () => {
    prismaMock.student.findFirst.mockResolvedValue({ id: STUDENT_ID });
    prismaMock.program.findFirst.mockResolvedValue({ id: PROGRAM_ID, durationPeriods: null });
    prismaMock.studyPlan.findFirst.mockResolvedValue(null);

    await expect(
      service.create(TENANT_A, { studentId: STUDENT_ID, programId: PROGRAM_ID }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('create rechaza inscribir dos veces al mismo programa', async () => {
    prismaMock.student.findFirst.mockResolvedValue({ id: STUDENT_ID });
    prismaMock.program.findFirst.mockResolvedValue({ id: PROGRAM_ID, durationPeriods: null });
    prismaMock.studyPlan.findFirst.mockResolvedValue({ id: 'plan-vigente' });
    prismaMock.programEnrollment.findFirst.mockResolvedValue({ id: 'ya-existe' });

    await expect(
      service.create(TENANT_A, { studentId: STUDENT_ID, programId: PROGRAM_ID }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('update con un id de otro tenant responde 404', async () => {
    prismaMock.programEnrollment.findFirst.mockResolvedValue(null);

    await expect(
      service.update(TENANT_A, 'insc-ajena', { currentLevel: 2 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  // Un STUDENT solo consulta sus propios programas
  it('studentPrograms bloquea a un estudiante que consulta a otro', async () => {
    prismaMock.student.findFirst.mockResolvedValue({
      id: STUDENT_ID,
      userId: 'u-otro',
    });

    await expect(
      service.studentPrograms(TENANT_A, STUDENT_ID, USER_STUDENT),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('studentPrograms permite al staff consultar a cualquier estudiante del tenant', async () => {
    prismaMock.student.findFirst.mockResolvedValue({
      id: STUDENT_ID,
      userId: 'u-otro',
    });
    prismaMock.programEnrollment.findMany.mockResolvedValue([]);

    await service.studentPrograms(TENANT_A, STUDENT_ID, USER_ADMIN);
    expect(prismaMock.programEnrollment.findMany).toHaveBeenCalled();
  });
});
