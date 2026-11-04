import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { StudyPlanBlocksService } from './study-plan-blocks.service';
import { PrismaService } from '@/common/prisma/prisma.service';
import { advertenciasDePensum } from '@/common/config/politica-academica';

const TENANT_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const PLAN_ID = 'pppppppp-pppp-4ppp-8ppp-pppppppppppp';
const BLOCK_ID = 'bloqueee-bloq-4blo-8blo-bloqueeeeeee';
const STUDENT_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

const ADMIN: any = { id: 'u-admin', userId: 'u-admin', role: 'TENANT_ADMIN' };
const DOCENTE: any = { id: 'u-teacher', userId: 'u-teacher', role: 'TEACHER' };
const ESTUDIANTE: any = { id: 'u-student', userId: 'u-student', role: 'STUDENT' };

const BLOQUE = {
  id: BLOCK_ID,
  tenantId: TENANT_A,
  studyPlanId: PLAN_ID,
  name: 'Módulo Contable-Financiero',
  certifiable: true,
  studyPlan: {
    id: PLAN_ID,
    version: '2027-1',
    program: { id: 'prog-1', name: 'T.L. Auxiliar Contable', hoursPerCredit: 48 },
  },
};

describe('StudyPlanBlocksService', () => {
  let service: StudyPlanBlocksService;

  const prismaMock: any = {
    studyPlan: { findFirst: jest.fn() },
    studyPlanBlock: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    studyPlanSubject: { findMany: jest.fn(), updateMany: jest.fn() },
    studentSubjectRecord: { findMany: jest.fn() },
    certificateRequest: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    certificateTemplate: { findFirst: jest.fn() },
    student: { findFirst: jest.fn() },
    programEnrollment: { findFirst: jest.fn() },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudyPlanBlocksService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get(StudyPlanBlocksService);
    prismaMock.$transaction.mockImplementation((cb: any) => cb(prismaMock));
    prismaMock.certificateRequest.findMany.mockResolvedValue([]);
  });

  // ---- aislamiento por tenant -------------------------------------

  it('un pensum de otro tenant responde 404', async () => {
    prismaMock.studyPlan.findFirst.mockResolvedValue(null);

    await expect(
      service.crear(TENANT_A, PLAN_ID, { name: 'Bloque' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prismaMock.studyPlanBlock.create).not.toHaveBeenCalled();
  });

  it('una plantilla de certificado de otro tenant responde 404', async () => {
    prismaMock.studyPlan.findFirst.mockResolvedValue({
      id: PLAN_ID,
      version: '1',
      status: 'BORRADOR',
      program: { id: 'p', name: 'P', hoursPerCredit: 48, passingGrade: 3 },
    });
    prismaMock.certificateTemplate.findFirst.mockResolvedValue(null);

    await expect(
      service.crear(TENANT_A, PLAN_ID, {
        name: 'Bloque',
        certificateTemplateId: 'plantilla-ajena',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prismaMock.studyPlanBlock.create).not.toHaveBeenCalled();
  });

  it('un bloque de otro tenant no se puede eliminar', async () => {
    prismaMock.studyPlanBlock.findFirst.mockResolvedValue(null);

    await expect(service.eliminar(TENANT_A, BLOCK_ID)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prismaMock.studyPlanBlock.delete).not.toHaveBeenCalled();
  });

  it('no acepta asignaturas que no son del mismo pensum', async () => {
    prismaMock.studyPlanBlock.findFirst.mockResolvedValue(BLOQUE);
    // Solo encuentra una de las dos filas pedidas
    prismaMock.studyPlanSubject.findMany.mockResolvedValue([{ id: 'fila-1' }]);

    await expect(
      service.asignarAsignaturas(TENANT_A, BLOCK_ID, {
        studyPlanSubjectIds: ['fila-1', 'fila-de-otro-pensum'],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prismaMock.studyPlanSubject.updateMany).not.toHaveBeenCalled();
  });

  // ---- elegibilidad -----------------------------------------------

  it('un bloque con todas sus asignaturas aprobadas queda elegible', async () => {
    prismaMock.programEnrollment.findFirst.mockResolvedValue({
      id: 'inscripcion-1',
      studentId: STUDENT_ID,
      studyPlanId: PLAN_ID,
      student: { userId: 'u-student' },
      program: { id: 'prog-1', name: 'T.L. Auxiliar Contable', hoursPerCredit: 48 },
    });
    prismaMock.studyPlanBlock.findMany.mockResolvedValue([
      {
        ...BLOQUE,
        orderIndex: 0,
        description: null,
        competencyStandardCode: null,
        certificateTemplate: null,
      },
    ]);
    prismaMock.studyPlanSubject.findMany.mockResolvedValue([
      {
        id: 'fila-1',
        subjectId: 'cont1',
        blockId: BLOCK_ID,
        level: 3,
        credits: 1,
        hours: null,
        subject: {
          id: 'cont1',
          code: 'CONT1',
          name: 'Contabilidad 1',
          credits: 1,
          hours: null,
        },
      },
      {
        id: 'fila-2',
        subjectId: 'cont2',
        blockId: BLOCK_ID,
        level: 4,
        credits: 1,
        hours: null,
        subject: {
          id: 'cont2',
          code: 'CONT2',
          name: 'Contabilidad 2',
          credits: 1,
          hours: null,
        },
      },
    ]);
    prismaMock.studentSubjectRecord.findMany.mockResolvedValue([
      { subjectId: 'cont1', origin: 'CURSADA', finalGrade: 4 },
      { subjectId: 'cont2', origin: 'RECONOCIMIENTO_INTERNO', finalGrade: 3.8 },
    ]);

    const resultado = await service.bloquesDeEstudiante(
      TENANT_A,
      'inscripcion-1',
      ESTUDIANTE,
    );

    expect(resultado.bloques[0]).toMatchObject({
      aprobadas: 2,
      totales: 2,
      porcentaje: 100,
      elegibleParaCertificado: true,
    });
    // Las horas se derivan de los créditos (1 × 48)
    expect(resultado.bloques[0].asignaturas[0].hours).toBe(48);
  });

  it('un estudiante no puede ver los bloques de otro', async () => {
    prismaMock.programEnrollment.findFirst.mockResolvedValue({
      id: 'inscripcion-1',
      studentId: STUDENT_ID,
      studyPlanId: PLAN_ID,
      student: { userId: 'otro-usuario' },
      program: { id: 'prog-1', name: 'P', hoursPerCredit: 48 },
    });

    await expect(
      service.bloquesDeEstudiante(TENANT_A, 'inscripcion-1', ESTUDIANTE),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  // ---- emisión del certificado ------------------------------------

  it('emitir el certificado exige rol administrativo', async () => {
    await expect(
      service.emitirCertificado(
        TENANT_A,
        BLOCK_ID,
        { studentId: STUDENT_ID },
        DOCENTE,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('no emite si al estudiante le falta alguna asignatura del bloque', async () => {
    prismaMock.studyPlanBlock.findFirst.mockResolvedValue(BLOQUE);
    prismaMock.student.findFirst.mockResolvedValue({
      id: STUDENT_ID,
      userId: 'u-student',
    });
    prismaMock.studyPlanSubject.findMany.mockResolvedValue([
      { id: 'fila-1', subjectId: 'cont1', subject: { name: 'Contabilidad 1' } },
      { id: 'fila-2', subjectId: 'cont2', subject: { name: 'Contabilidad 2' } },
    ]);
    prismaMock.studentSubjectRecord.findMany.mockResolvedValue([
      { subjectId: 'cont1' },
    ]);

    await expect(
      service.emitirCertificado(
        TENANT_A,
        BLOCK_ID,
        { studentId: STUDENT_ID },
        ADMIN,
      ),
    ).rejects.toThrow(/Contabilidad 2/);
    expect(prismaMock.certificateRequest.create).not.toHaveBeenCalled();
  });

  it('emite el certificado del bloque completo', async () => {
    prismaMock.studyPlanBlock.findFirst.mockResolvedValue(BLOQUE);
    prismaMock.student.findFirst.mockResolvedValue({
      id: STUDENT_ID,
      userId: 'u-student',
    });
    prismaMock.studyPlanSubject.findMany.mockResolvedValue([
      { id: 'fila-1', subjectId: 'cont1', subject: { name: 'Contabilidad 1' } },
    ]);
    prismaMock.studentSubjectRecord.findMany.mockResolvedValue([
      { subjectId: 'cont1' },
    ]);
    prismaMock.certificateRequest.findFirst.mockResolvedValue(null);

    await service.emitirCertificado(
      TENANT_A,
      BLOCK_ID,
      { studentId: STUDENT_ID },
      ADMIN,
    );

    expect(prismaMock.certificateRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: TENANT_A,
          studentId: STUDENT_ID,
          tipo: 'BLOQUE',
          estado: 'EN_PROCESO',
          motivo: expect.stringContaining('Módulo Contable-Financiero'),
        }),
      }),
    );
  });

  it('no emite dos veces el mismo certificado', async () => {
    prismaMock.studyPlanBlock.findFirst.mockResolvedValue(BLOQUE);
    prismaMock.student.findFirst.mockResolvedValue({
      id: STUDENT_ID,
      userId: 'u-student',
    });
    prismaMock.studyPlanSubject.findMany.mockResolvedValue([
      { id: 'fila-1', subjectId: 'cont1', subject: { name: 'Contabilidad 1' } },
    ]);
    prismaMock.studentSubjectRecord.findMany.mockResolvedValue([
      { subjectId: 'cont1' },
    ]);
    prismaMock.certificateRequest.findFirst.mockResolvedValue({ id: 'cert-1' });

    await expect(
      service.emitirCertificado(
        TENANT_A,
        BLOCK_ID,
        { studentId: STUDENT_ID },
        ADMIN,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('un bloque no certificable no emite certificado', async () => {
    prismaMock.studyPlanBlock.findFirst.mockResolvedValue({
      ...BLOQUE,
      certifiable: false,
    });

    await expect(
      service.emitirCertificado(
        TENANT_A,
        BLOCK_ID,
        { studentId: STUDENT_ID },
        ADMIN,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('advertenciasDePensum', () => {
  it('avisa cuando un técnico laboral no llega a 600 horas', () => {
    // El caso real: 12 créditos × 48 h = 576 h, por debajo del mínimo
    const advertencias = advertenciasDePensum({
      educationLevel: 'TECNICO_LABORAL',
      horasTotales: 576,
      horasPracticas: 300,
      asignaturasSinDesglose: 0,
    });

    const horas = advertencias.find((a) => a.codigo === 'HORAS_INSUFICIENTES');
    expect(horas?.mensaje).toContain('576');
    expect(horas?.mensaje).toContain('600');
  });

  it('avisa cuando la práctica no llega al 50 %', () => {
    const advertencias = advertenciasDePensum({
      educationLevel: 'TECNICO_LABORAL',
      horasTotales: 700,
      horasPracticas: 100,
      asignaturasSinDesglose: 0,
    });

    expect(advertencias.map((a) => a.codigo)).toContain('PRACTICA_INSUFICIENTE');
    expect(advertencias.map((a) => a.codigo)).not.toContain('HORAS_INSUFICIENTES');
  });

  it('avisa de las asignaturas sin desglose de horas', () => {
    const advertencias = advertenciasDePensum({
      educationLevel: 'TECNICO_LABORAL',
      horasTotales: 700,
      horasPracticas: 100,
      asignaturasSinDesglose: 3,
    });

    expect(advertencias.map((a) => a.codigo)).toContain('HORAS_SIN_DESGLOSE');
  });

  it('un pensum de 160 h cumple en conocimientos académicos', () => {
    expect(
      advertenciasDePensum({
        educationLevel: 'CONOCIMIENTOS_ACADEMICOS',
        horasTotales: 160,
        horasPracticas: 0,
        asignaturasSinDesglose: 0,
      }),
    ).toEqual([]);
  });

  it('los niveles sin regla no generan advertencias', () => {
    expect(
      advertenciasDePensum({
        educationLevel: 'PROFESIONAL_UNIVERSITARIO',
        horasTotales: 10,
        horasPracticas: 0,
        asignaturasSinDesglose: 5,
      }),
    ).toEqual([]);
  });
});
