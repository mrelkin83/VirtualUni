import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { AcademicRecordsService } from './academic-records.service';
import { PrismaService } from '@/common/prisma/prisma.service';

const TENANT_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const COURSE_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const SUBJECT_ID = 'ssssssss-ssss-4sss-8sss-ssssssssssss';
const STUDENT_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

const ADMIN: any = {
  id: 'u-admin',
  userId: 'u-admin',
  role: 'TENANT_ADMIN',
  email: 'admin@uniprueba.test',
};
const DOCENTE_DEL_GRUPO: any = {
  id: 'u-teacher',
  userId: 'u-teacher',
  role: 'TEACHER',
  email: 'docente@uniprueba.test',
};
const OTRO_DOCENTE: any = {
  id: 'u-otro',
  userId: 'u-otro',
  role: 'TEACHER',
  email: 'otro@uniprueba.test',
};
const ESTUDIANTE: any = {
  id: 'u-student',
  userId: 'u-student',
  role: 'STUDENT',
  email: 'alumno@uniprueba.test',
};

const GRUPO_ABIERTO = {
  id: COURSE_ID,
  code: 'G-CONT1-A',
  name: 'Contabilidad 1',
  groupCode: 'A',
  subjectId: SUBJECT_ID,
  academicPeriodId: 'periodo-1',
  gradesClosedAt: null,
  teacher: { id: 'docente-1', userId: 'u-teacher' },
  subject: {
    id: SUBJECT_ID,
    code: 'CONT1',
    name: 'Contabilidad 1',
    credits: 1,
    hours: null,
  },
  academicPeriod: { id: 'periodo-1', code: '2027-1', status: 'EN_CURSO' },
};

describe('AcademicRecordsService', () => {
  let service: AcademicRecordsService;

  const prismaMock: any = {
    course: { findFirst: jest.fn(), update: jest.fn() },
    enrollment: { findMany: jest.fn() },
    grade: { findMany: jest.fn() },
    student: { findFirst: jest.fn() },
    programEnrollment: { findMany: jest.fn() },
    studentSubjectRecord: {
      findMany: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AcademicRecordsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get(AcademicRecordsService);

    // Por defecto, la transacción ejecuta el callback con el propio mock.
    prismaMock.$transaction.mockImplementation((cb: any) => cb(prismaMock));
    prismaMock.studentSubjectRecord.updateMany.mockResolvedValue({ count: 0 });
  });

  // ---- aislamiento por tenant -------------------------------------

  it('un grupo de otro tenant responde 404 y no escribe nada', async () => {
    prismaMock.course.findFirst.mockResolvedValue(null);

    await expect(
      service.previsualizarCierre(TENANT_A, COURSE_ID, ADMIN),
    ).rejects.toBeInstanceOf(NotFoundException);

    // La consulta siempre filtra por tenantId además del id
    expect(prismaMock.course.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: COURSE_ID, tenantId: TENANT_A },
      }),
    );
  });

  it('un estudiante de otro tenant no tiene historial consultable', async () => {
    prismaMock.student.findFirst.mockResolvedValue(null);

    await expect(
      service.historialEstudiante(TENANT_A, STUDENT_ID, ADMIN),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('un estudiante no puede ver el historial de otro', async () => {
    prismaMock.student.findFirst.mockResolvedValue({
      id: STUDENT_ID,
      studentCode: 'E-001',
      userId: 'otro-usuario',
      user: { firstName: 'Ana', lastName: 'Ruiz' },
    });

    await expect(
      service.historialEstudiante(TENANT_A, STUDENT_ID, ESTUDIANTE),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  // ---- autorización del cierre ------------------------------------

  it('un docente ajeno al grupo no puede cerrar notas', async () => {
    prismaMock.course.findFirst.mockResolvedValue(GRUPO_ABIERTO);

    await expect(
      service.previsualizarCierre(TENANT_A, COURSE_ID, OTRO_DOCENTE),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('un grupo sin asignatura no se puede cerrar', async () => {
    prismaMock.course.findFirst.mockResolvedValue({
      ...GRUPO_ABIERTO,
      subjectId: null,
      subject: null,
    });

    await expect(
      service.previsualizarCierre(TENANT_A, COURSE_ID, ADMIN),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  // ---- cálculo y política -----------------------------------------

  it('previsualiza la definitiva normalizada y marca aprobado con la nota del programa', async () => {
    prismaMock.course.findFirst.mockResolvedValue(GRUPO_ABIERTO);
    prismaMock.enrollment.findMany.mockResolvedValue([
      {
        studentId: STUDENT_ID,
        student: {
          id: STUDENT_ID,
          studentCode: 'E-001',
          user: { firstName: 'Ana', lastName: 'Ruiz' },
        },
      },
    ]);
    prismaMock.grade.findMany.mockResolvedValue([
      { studentId: STUDENT_ID, gradeType: 'parcial1', grade: 80, weight: null },
      { studentId: STUDENT_ID, gradeType: 'parcial2', grade: 60, weight: null },
    ]);
    prismaMock.programEnrollment.findMany.mockResolvedValue([
      {
        program: {
          id: 'prog-1',
          name: 'T.L. Auxiliar Contable',
          passingGrade: 3.0,
          gradeScaleMax: 5.0,
          hoursPerCredit: 48,
        },
      },
    ]);

    const resultado = await service.previsualizarCierre(
      TENANT_A,
      COURSE_ID,
      DOCENTE_DEL_GRUPO,
    );

    expect(resultado.filas[0]).toMatchObject({
      promedio100: 70,
      finalGrade: 3.5,
      passed: true,
    });
    expect(resultado.totales).toMatchObject({
      matriculados: 1,
      calculables: 1,
      aprobados: 1,
    });
  });

  it('con varios programas usa la nota aprobatoria más exigente y lo reporta', async () => {
    prismaMock.programEnrollment.findMany.mockResolvedValue([
      {
        program: {
          id: 'prog-1',
          name: 'Programa laxo',
          passingGrade: 3.0,
          gradeScaleMax: 5.0,
          hoursPerCredit: 48,
        },
      },
      {
        program: {
          id: 'prog-2',
          name: 'Programa exigente',
          passingGrade: 3.8,
          gradeScaleMax: 5.0,
          hoursPerCredit: 48,
        },
      },
    ]);

    const politica = await service.politicaDelEstudiante(TENANT_A, STUDENT_ID);

    expect(politica.passingGrade).toBe(3.8);
    expect(politica.programName).toBe('Programa exigente');
    expect(politica.conflicto).toContain('Programa exigente');
  });

  it('sin programa aplica la política por defecto', async () => {
    prismaMock.programEnrollment.findMany.mockResolvedValue([]);

    const politica = await service.politicaDelEstudiante(TENANT_A, STUDENT_ID);

    expect(politica).toMatchObject({ passingGrade: 3, gradeScaleMax: 5 });
    expect(politica.programId).toBeUndefined();
  });

  // ---- cierre y reapertura ----------------------------------------

  it('cerrar notas crea el registro del historial y bloquea el grupo', async () => {
    prismaMock.course.findFirst.mockResolvedValue(GRUPO_ABIERTO);
    prismaMock.enrollment.findMany.mockResolvedValue([
      {
        studentId: STUDENT_ID,
        student: {
          id: STUDENT_ID,
          studentCode: 'E-001',
          user: { firstName: 'Ana', lastName: 'Ruiz' },
        },
      },
    ]);
    prismaMock.grade.findMany.mockResolvedValue([
      { studentId: STUDENT_ID, gradeType: 'final', grade: 90, weight: 1 },
    ]);
    prismaMock.programEnrollment.findMany.mockResolvedValue([
      {
        program: {
          id: 'prog-1',
          name: 'T.L. Auxiliar Contable',
          passingGrade: 3.0,
          gradeScaleMax: 5.0,
          hoursPerCredit: 48,
        },
      },
    ]);

    const resultado = await service.cerrarNotas(TENANT_A, COURSE_ID, ADMIN, {});

    expect(resultado.message).toContain('1 registros');
    expect(prismaMock.studentSubjectRecord.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: TENANT_A,
          studentId: STUDENT_ID,
          subjectId: SUBJECT_ID,
          courseId: COURSE_ID,
          origin: 'CURSADA',
          finalGrade: 4.5,
          passed: true,
          // 1 crédito × 48 h/crédito porque la asignatura no trae horas
          hoursSnapshot: 48,
        }),
      }),
    );
    expect(prismaMock.course.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: COURSE_ID },
        data: expect.objectContaining({ gradesClosedById: 'u-admin' }),
      }),
    );
  });

  it('no se puede cerrar dos veces el mismo grupo', async () => {
    prismaMock.course.findFirst.mockResolvedValue({
      ...GRUPO_ABIERTO,
      gradesClosedAt: new Date('2026-11-01T00:00:00.000Z'),
    });

    await expect(
      service.cerrarNotas(TENANT_A, COURSE_ID, ADMIN, {}),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prismaMock.studentSubjectRecord.create).not.toHaveBeenCalled();
  });

  it('sin notas suficientes no se cierra nada', async () => {
    prismaMock.course.findFirst.mockResolvedValue(GRUPO_ABIERTO);
    prismaMock.enrollment.findMany.mockResolvedValue([
      {
        studentId: STUDENT_ID,
        student: {
          id: STUDENT_ID,
          studentCode: 'E-001',
          user: { firstName: 'Ana', lastName: 'Ruiz' },
        },
      },
    ]);
    prismaMock.grade.findMany.mockResolvedValue([]);
    prismaMock.programEnrollment.findMany.mockResolvedValue([]);

    await expect(
      service.cerrarNotas(TENANT_A, COURSE_ID, ADMIN, {}),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prismaMock.course.update).not.toHaveBeenCalled();
  });

  it('reabrir exige rol administrativo', async () => {
    await expect(
      service.reabrirNotas(TENANT_A, COURSE_ID, DOCENTE_DEL_GRUPO, {
        motivo: 'error en un parcial',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('reabrir anula los registros vigentes del grupo y libera la edición', async () => {
    prismaMock.course.findFirst.mockResolvedValue({
      ...GRUPO_ABIERTO,
      gradesClosedAt: new Date('2026-11-01T00:00:00.000Z'),
    });
    prismaMock.studentSubjectRecord.updateMany.mockResolvedValue({ count: 3 });

    const resultado = await service.reabrirNotas(TENANT_A, COURSE_ID, ADMIN, {
      motivo: 'se corrigió el parcial 2',
    });

    expect(resultado.message).toContain('3 registros');
    expect(prismaMock.studentSubjectRecord.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: TENANT_A, courseId: COURSE_ID, status: 'VIGENTE' },
        data: expect.objectContaining({ status: 'ANULADO' }),
      }),
    );
    expect(prismaMock.course.update).toHaveBeenCalledWith({
      where: { id: COURSE_ID },
      data: { gradesClosedAt: null, gradesClosedById: null },
    });
  });

  it('no se reabre un grupo que no está cerrado', async () => {
    prismaMock.course.findFirst.mockResolvedValue(GRUPO_ABIERTO);

    await expect(
      service.reabrirNotas(TENANT_A, COURSE_ID, ADMIN, { motivo: 'por probar' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  // ---- historial ---------------------------------------------------

  it('el historial resume créditos y horas aprobadas', async () => {
    prismaMock.student.findFirst.mockResolvedValue({
      id: STUDENT_ID,
      studentCode: 'E-001',
      userId: 'u-student',
      user: { firstName: 'Ana', lastName: 'Ruiz' },
    });
    prismaMock.studentSubjectRecord.findMany.mockResolvedValue([
      { passed: true, status: 'VIGENTE', creditsSnapshot: 1, hoursSnapshot: 48 },
      { passed: true, status: 'VIGENTE', creditsSnapshot: 2, hoursSnapshot: 96 },
      { passed: false, status: 'VIGENTE', creditsSnapshot: 1, hoursSnapshot: 48 },
    ]);

    const resultado = await service.historialEstudiante(
      TENANT_A,
      STUDENT_ID,
      ESTUDIANTE,
    );

    expect(resultado.resumen).toMatchObject({
      total: 3,
      aprobadas: 2,
      reprobadas: 1,
      creditosAprobados: 3,
      horasAprobadas: 144,
    });
  });
});
