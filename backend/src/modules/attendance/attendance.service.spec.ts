import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { PrismaService } from '@/common/prisma/prisma.service';
import { AttendanceStatus } from '@prisma/client';

const TENANT_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const COURSE_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const STUDENT_MATRICULADO = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const STUDENT_AJENO = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const USER_ID = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';

describe('AttendanceService', () => {
  let service: AttendanceService;

  const prismaMock: any = {
    course: { findFirst: jest.fn() },
    enrollment: { findMany: jest.fn() },
    attendance: { upsert: jest.fn() },
    $transaction: jest.fn((ops: any[]) => Promise.all(ops)),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prismaMock.course.findFirst.mockResolvedValue({ id: COURSE_ID, tenantId: TENANT_A });

    const module: TestingModule = await Test.createTestingModule({
      providers: [AttendanceService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
  });

  describe('bulkUpsert', () => {
    // Regresión: `registro.studentId` (uno por fila, lo manda el cliente) se
    // usaba tal cual en el upsert sin comprobar que el estudiante estuviera
    // matriculado en el curso (ni siquiera que fuera del mismo tenant).
    it('rechaza un studentId no matriculado en el curso', async () => {
      prismaMock.enrollment.findMany.mockResolvedValue([]); // ninguno matriculado

      await expect(
        service.bulkUpsert(TENANT_A, USER_ID, {
          courseId: COURSE_ID,
          fecha: '2026-08-25',
          registros: [{ studentId: STUDENT_AJENO, estado: AttendanceStatus.PRESENTE }],
        } as any),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(prismaMock.attendance.upsert).not.toHaveBeenCalled();
    });

    it('rechaza el lote completo si alguno de varios estudiantes no está matriculado', async () => {
      prismaMock.enrollment.findMany.mockResolvedValue([{ studentId: STUDENT_MATRICULADO }]);

      await expect(
        service.bulkUpsert(TENANT_A, USER_ID, {
          courseId: COURSE_ID,
          fecha: '2026-08-25',
          registros: [
            { studentId: STUDENT_MATRICULADO, estado: AttendanceStatus.PRESENTE },
            { studentId: STUDENT_AJENO, estado: AttendanceStatus.PRESENTE },
          ],
        } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('registra la asistencia cuando todos los estudiantes están matriculados', async () => {
      prismaMock.enrollment.findMany.mockResolvedValue([{ studentId: STUDENT_MATRICULADO }]);
      prismaMock.attendance.upsert.mockResolvedValue({ id: 'a1' });

      const res = await service.bulkUpsert(TENANT_A, USER_ID, {
        courseId: COURSE_ID,
        fecha: '2026-08-25',
        registros: [{ studentId: STUDENT_MATRICULADO, estado: AttendanceStatus.PRESENTE }],
      } as any);

      expect(res).toEqual({ total: 1, registrados: 1 });
    });

    it('rechaza un curso que no pertenece al tenant', async () => {
      prismaMock.course.findFirst.mockResolvedValue(null);

      await expect(
        service.bulkUpsert(TENANT_A, USER_ID, {
          courseId: COURSE_ID,
          fecha: '2026-08-25',
          registros: [{ studentId: STUDENT_MATRICULADO, estado: AttendanceStatus.PRESENTE }],
        } as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
