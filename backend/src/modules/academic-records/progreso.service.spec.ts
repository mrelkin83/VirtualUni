import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProgresoService } from './progreso.service';
import { PrismaService } from '@/common/prisma/prisma.service';
import { AcademicUnit } from '@prisma/client';

const TENANT_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const STUDENT_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

const ADMIN: any = { id: 'u-admin', userId: 'u-admin', role: 'TENANT_ADMIN' };
const ESTUDIANTE: any = { id: 'u-student', userId: 'u-student', role: 'STUDENT' };

/**
 * Caso real de la institución (§0 de la instrucción): el egresado del Técnico
 * Laboral en Auxiliar Contable y Financiero trae 12 módulos aprobados, de los
 * cuales cada programa destino reconoce 8, 9, 6 y 5.
 */
const MODULOS_CONTABLE = [
  'adm1',
  'adm2',
  'cont1',
  'cont2',
  'economia',
  'matfin',
  'analisis',
  'costos',
  'leglaboral',
  'ingles1',
  'legcomercial',
  'proyectos',
];

const COMPARTIDAS_POR_DESTINO: Record<string, string[]> = {
  // T.L. Administración de Empresas: 8
  administracion: [
    'adm1',
    'adm2',
    'economia',
    'costos',
    'leglaboral',
    'legcomercial',
    'ingles1',
    'proyectos',
  ],
  // T.L. Asistente Administrativo: las 8 anteriores + Contabilidad 1 = 9
  asistente: [
    'adm1',
    'adm2',
    'economia',
    'costos',
    'leglaboral',
    'legcomercial',
    'ingles1',
    'proyectos',
    'cont1',
  ],
  // T.L. Mercadeo y Comercio Internacional: 6
  mercadeo: ['adm1', 'economia', 'costos', 'legcomercial', 'ingles1', 'proyectos'],
  // T.L. Gestión del Talento Humano: 5
  talento: ['adm1', 'leglaboral', 'legcomercial', 'ingles1', 'proyectos'],
};

/** Pensum de 12 filas: las compartidas más rellenos propios del destino. */
function pensumDestino(destino: string) {
  const compartidas = COMPARTIDAS_POR_DESTINO[destino];
  const propias = Array.from(
    { length: 12 - compartidas.length },
    (_, i) => `${destino}-propia-${i + 1}`,
  );
  return [...compartidas, ...propias].map((subjectId, i) => ({
    id: `${destino}-fila-${i + 1}`,
    subjectId,
    level: i + 1,
    subjectType: 'OBLIGATORIA',
    credits: 1,
    hours: null,
    orderIndex: 0,
    blockId: null,
    subject: {
      id: subjectId,
      code: subjectId.toUpperCase(),
      name: subjectId,
      credits: 1,
      hours: null,
    },
  }));
}

/** Pensum de una sola fila: Contabilidad 1. */
function pensumDeCont1() {
  return {
    id: 'fila-1',
    subjectId: 'cont1',
    level: 1,
    subjectType: 'OBLIGATORIA',
    credits: 1,
    hours: null,
    orderIndex: 0,
    blockId: null,
    subject: {
      id: 'cont1',
      code: 'CONT1',
      name: 'Contabilidad 1',
      credits: 1,
      hours: null,
    },
  };
}

describe('ProgresoService', () => {
  let service: ProgresoService;

  const prismaMock: any = {
    studentSubjectRecord: { findMany: jest.fn(), create: jest.fn() },
    subjectEquivalence: { findMany: jest.fn() },
    enrollment: { findMany: jest.fn() },
    studyPlanSubject: { findMany: jest.fn() },
    studyPlanPrerequisite: { findMany: jest.fn() },
    programEnrollment: { findFirst: jest.fn(), findMany: jest.fn() },
    program: { findFirst: jest.fn(), findMany: jest.fn() },
    studyPlan: { findFirst: jest.fn() },
    student: { findFirst: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProgresoService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();
    service = module.get(ProgresoService);

    // Historial: las 12 asignaturas del técnico contable, aprobadas
    prismaMock.studentSubjectRecord.findMany.mockResolvedValue(
      MODULOS_CONTABLE.map((subjectId, i) => ({
        id: `rec-${i}`,
        subjectId,
        finalGrade: 4,
        origin: 'CURSADA',
        creditsSnapshot: 1,
        hoursSnapshot: 48,
      })),
    );
    prismaMock.subjectEquivalence.findMany.mockResolvedValue([]);
    prismaMock.enrollment.findMany.mockResolvedValue([]);
    prismaMock.studyPlanPrerequisite.findMany.mockResolvedValue([]);
  });

  // ---- caso real: 8 / 9 / 6 / 5 ------------------------------------

  it.each([
    ['administracion', 8],
    ['asistente', 9],
    ['mercadeo', 6],
    ['talento', 5],
  ])(
    'reconoce %s → %i asignaturas del egresado contable',
    async (destino, esperadas) => {
      prismaMock.studyPlanSubject.findMany.mockResolvedValue(
        pensumDestino(destino as string),
      );

      const progreso = await service.computarProgreso(
        TENANT_A,
        STUDENT_ID,
        `plan-${destino}`,
        48,
        AcademicUnit.CREDITOS,
      );

      expect(progreso.resumen.asignaturasAprobadas).toBe(esperadas);
      expect(progreso.resumen.asignaturasPendientes).toBe(
        12 - (esperadas as number),
      );
    },
  );

  it('el porcentaje se calcula sobre el pensum DESTINO, no sobre el de origen', async () => {
    // Destino con 20 créditos en total: 9 reconocidos son el 45 %, no el 75 %
    const filas = pensumDestino('asistente');
    const extra = Array.from({ length: 8 }, (_, i) => ({
      id: `extra-${i}`,
      subjectId: `extra-${i}`,
      level: 13 + i,
      subjectType: 'OBLIGATORIA',
      credits: 1,
      hours: null,
      orderIndex: 0,
      blockId: null,
      subject: {
        id: `extra-${i}`,
        code: `EXTRA${i}`,
        name: `extra ${i}`,
        credits: 1,
        hours: null,
      },
    }));
    prismaMock.studyPlanSubject.findMany.mockResolvedValue([...filas, ...extra]);

    const progreso = await service.computarProgreso(
      TENANT_A,
      STUDENT_ID,
      'plan-asistente-largo',
      48,
      AcademicUnit.CREDITOS,
    );

    expect(progreso.resumen.creditosTotales).toBe(20);
    expect(progreso.resumen.creditosAprobados).toBe(9);
    expect(progreso.resumen.porcentajeAvance).toBe(45);
  });

  it('las horas se derivan de los créditos cuando la asignatura no las trae', async () => {
    prismaMock.studyPlanSubject.findMany.mockResolvedValue(pensumDestino('talento'));

    const progreso = await service.computarProgreso(
      TENANT_A,
      STUDENT_ID,
      'plan-talento',
      48,
      AcademicUnit.HORAS,
    );

    expect(progreso.resumen.horasTotales).toBe(12 * 48);
    expect(progreso.resumen.horasAprobadas).toBe(5 * 48);
    expect(progreso.resumen.porcentajeAvance).toBe(41.7);
  });

  // ---- equivalencias y prerrequisitos ------------------------------

  it('una equivalencia declarada aprueba una asignatura con otro código', async () => {
    prismaMock.studyPlanSubject.findMany.mockResolvedValue([
      {
        id: 'fila-1',
        subjectId: 'contabilidad-basica',
        level: 1,
        subjectType: 'OBLIGATORIA',
        credits: 2,
        hours: null,
        orderIndex: 0,
        blockId: null,
        subject: {
          id: 'contabilidad-basica',
          code: 'CB',
          name: 'Contabilidad Básica',
          credits: 2,
          hours: null,
        },
      },
    ]);
    prismaMock.subjectEquivalence.findMany.mockResolvedValue([
      {
        sourceSubjectId: 'cont1',
        targetSubjectId: 'contabilidad-basica',
        bidirectional: false,
      },
    ]);

    const progreso = await service.computarProgreso(
      TENANT_A,
      STUDENT_ID,
      'plan-x',
      48,
      AcademicUnit.CREDITOS,
    );

    const fila = progreso.niveles[0].asignaturas[0];
    expect(fila.estado).toBe('APROBADA');
    expect(fila.viaSubjectId).toBe('cont1');
    expect(fila.reconocida).toBe(true);
  });

  it('marca reconocida la asignatura que también tiene un reconocimiento interno', async () => {
    // Cursó Contabilidad 1 y después otro programa se la reconoció: quedan dos
    // registros VIGENTES de la misma Subject. Se conserva el cursado, pero la
    // fila debe salir como reconocida.
    prismaMock.studentSubjectRecord.findMany.mockResolvedValue([
      {
        id: 'rec-cursada',
        subjectId: 'cont1',
        finalGrade: 4.2,
        origin: 'CURSADA',
        creditsSnapshot: 1,
        hoursSnapshot: 48,
      },
      {
        id: 'rec-reconocida',
        subjectId: 'cont1',
        finalGrade: 4.2,
        origin: 'RECONOCIMIENTO_INTERNO',
        creditsSnapshot: 1,
        hoursSnapshot: 48,
      },
    ]);
    prismaMock.studyPlanSubject.findMany.mockResolvedValue([pensumDeCont1()]);

    const progreso = await service.computarProgreso(
      TENANT_A,
      STUDENT_ID,
      'plan-x',
      48,
      AcademicUnit.CREDITOS,
    );

    const fila = progreso.niveles[0].asignaturas[0];
    expect(fila.estado).toBe('APROBADA');
    // El registro conservado sigue siendo el cursado, con su nota
    expect(fila.origin).toBe('CURSADA');
    expect(fila.finalGrade).toBe(4.2);
    expect(fila.viaSubjectId).toBeNull();
    expect(fila.reconocida).toBe(true);
  });

  it('no marca reconocida la asignatura cursada sin ningún reconocimiento', async () => {
    prismaMock.studentSubjectRecord.findMany.mockResolvedValue([
      {
        id: 'rec-cursada',
        subjectId: 'cont1',
        finalGrade: 4.2,
        origin: 'CURSADA',
        creditsSnapshot: 1,
        hoursSnapshot: 48,
      },
    ]);
    prismaMock.studyPlanSubject.findMany.mockResolvedValue([pensumDeCont1()]);

    const progreso = await service.computarProgreso(
      TENANT_A,
      STUDENT_ID,
      'plan-x',
      48,
      AcademicUnit.CREDITOS,
    );

    expect(progreso.niveles[0].asignaturas[0].reconocida).toBe(false);
  });

  it('marca BLOQUEADA_POR_PRERREQUISITO cuando falta el requisito', async () => {
    prismaMock.studentSubjectRecord.findMany.mockResolvedValue([]);
    prismaMock.studyPlanSubject.findMany.mockResolvedValue([
      {
        id: 'fila-1',
        subjectId: 'calculo-1',
        level: 1,
        subjectType: 'OBLIGATORIA',
        credits: 3,
        hours: null,
        orderIndex: 0,
        blockId: null,
        subject: {
          id: 'calculo-1',
          code: 'CAL1',
          name: 'Cálculo I',
          credits: 3,
          hours: null,
        },
      },
      {
        id: 'fila-2',
        subjectId: 'calculo-2',
        level: 2,
        subjectType: 'OBLIGATORIA',
        credits: 3,
        hours: null,
        orderIndex: 0,
        blockId: null,
        subject: {
          id: 'calculo-2',
          code: 'CAL2',
          name: 'Cálculo II',
          credits: 3,
          hours: null,
        },
      },
    ]);
    prismaMock.studyPlanPrerequisite.findMany.mockResolvedValue([
      {
        entryId: 'fila-2',
        required: {
          id: 'fila-1',
          subjectId: 'calculo-1',
          subject: { name: 'Cálculo I' },
        },
      },
    ]);

    const progreso = await service.computarProgreso(
      TENANT_A,
      STUDENT_ID,
      'plan-ing',
      48,
      AcademicUnit.CREDITOS,
    );

    const calculo2 = progreso.niveles
      .flatMap((n) => n.asignaturas)
      .find((a) => a.subjectId === 'calculo-2');
    expect(calculo2?.estado).toBe('BLOQUEADA_POR_PRERREQUISITO');
    expect(calculo2?.prerrequisitosPendientes).toEqual(['Cálculo I']);
  });

  it('marca EN_CURSO la asignatura de un grupo con matrícula activa', async () => {
    prismaMock.studentSubjectRecord.findMany.mockResolvedValue([]);
    prismaMock.enrollment.findMany.mockResolvedValue([
      { course: { subjectId: 'adm1' } },
    ]);
    prismaMock.studyPlanSubject.findMany.mockResolvedValue([
      {
        id: 'fila-1',
        subjectId: 'adm1',
        level: 1,
        subjectType: 'OBLIGATORIA',
        credits: 1,
        hours: null,
        orderIndex: 0,
        blockId: null,
        subject: {
          id: 'adm1',
          code: 'ADM1',
          name: 'Administración 1',
          credits: 1,
          hours: null,
        },
      },
    ]);

    const progreso = await service.computarProgreso(
      TENANT_A,
      STUDENT_ID,
      'plan-x',
      48,
      AcademicUnit.CREDITOS,
    );

    expect(progreso.niveles[0].asignaturas[0].estado).toBe('EN_CURSO');
  });

  // ---- aislamiento por tenant y autorización -----------------------

  it('una inscripción de otro tenant responde 404', async () => {
    prismaMock.programEnrollment.findFirst.mockResolvedValue(null);

    await expect(
      service.progresoDeInscripcion(TENANT_A, 'inscripcion-x', ADMIN),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prismaMock.programEnrollment.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'inscripcion-x', tenantId: TENANT_A },
      }),
    );
  });

  it('un estudiante no puede ver el avance de otro', async () => {
    prismaMock.programEnrollment.findFirst.mockResolvedValue({
      id: 'inscripcion-1',
      studentId: STUDENT_ID,
      studyPlanId: 'plan-1',
      currentLevel: 1,
      status: 'ACTIVO',
      student: { id: STUDENT_ID, userId: 'otro-usuario', studentCode: 'E-001' },
      program: {
        id: 'prog-1',
        code: 'P1',
        name: 'Programa',
        academicUnit: 'CREDITOS',
        educationLevel: 'TECNICO_LABORAL',
        hoursPerCredit: 48,
        totalCredits: 12,
        totalHours: null,
      },
      studyPlan: { id: 'plan-1', version: '2027-1', status: 'VIGENTE' },
    });

    await expect(
      service.progresoDeInscripcion(TENANT_A, 'inscripcion-1', ESTUDIANTE),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('previsualizar reconocimiento valida el estudiante contra el tenant', async () => {
    prismaMock.student.findFirst.mockResolvedValue(null);
    prismaMock.program.findFirst.mockResolvedValue({
      id: 'prog-1',
      code: 'P1',
      name: 'Programa',
      academicUnit: 'CREDITOS',
      hoursPerCredit: 48,
    });

    await expect(
      service.previsualizarReconocimiento(TENANT_A, STUDENT_ID, 'prog-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('aplicar reconocimiento exige rol administrativo', async () => {
    await expect(
      service.aplicarReconocimientoInterno(TENANT_A, 'inscripcion-1', ESTUDIANTE),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prismaMock.studentSubjectRecord.create).not.toHaveBeenCalled();
  });

  // ---- reconocimiento interno --------------------------------------

  it('el reconocimiento interno copia la nota original y apunta al registro', async () => {
    prismaMock.programEnrollment.findFirst.mockResolvedValue({
      id: 'inscripcion-1',
      studentId: STUDENT_ID,
      studyPlanId: 'plan-admin',
      program: { id: 'prog-2', name: 'T.L. Administración', hoursPerCredit: 48 },
    });
    prismaMock.studyPlanSubject.findMany.mockResolvedValue([
      {
        id: 'fila-1',
        subjectId: 'adm1',
        credits: 1,
        hours: null,
        subject: { id: 'adm1', credits: 1, hours: null },
      },
    ]);
    prismaMock.studentSubjectRecord.findMany.mockImplementation((args: any) =>
      args?.where?.origin === 'RECONOCIMIENTO_INTERNO'
        ? Promise.resolve([])
        : Promise.resolve(
            MODULOS_CONTABLE.map((subjectId, i) => ({
              id: `rec-${i}`,
              subjectId,
              finalGrade: 4,
              origin: 'CURSADA',
              creditsSnapshot: 1,
              hoursSnapshot: 48,
            })),
          ),
    );

    const resultado = await service.aplicarReconocimientoInterno(
      TENANT_A,
      'inscripcion-1',
      ADMIN,
    );

    expect(resultado.reconocidas).toEqual(['adm1']);
    expect(prismaMock.studentSubjectRecord.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: TENANT_A,
          origin: 'RECONOCIMIENTO_INTERNO',
          finalGrade: 4,
          passed: true,
          sourceRecordId: 'rec-0',
        }),
      }),
    );
  });

  it('no duplica un reconocimiento ya creado', async () => {
    prismaMock.programEnrollment.findFirst.mockResolvedValue({
      id: 'inscripcion-1',
      studentId: STUDENT_ID,
      studyPlanId: 'plan-admin',
      program: { id: 'prog-2', name: 'T.L. Administración', hoursPerCredit: 48 },
    });
    prismaMock.studyPlanSubject.findMany.mockResolvedValue([
      {
        id: 'fila-1',
        subjectId: 'adm1',
        credits: 1,
        hours: null,
        subject: { id: 'adm1', credits: 1, hours: null },
      },
    ]);
    // El historial ya trae el reconocimiento de adm1 sobre rec-0
    prismaMock.studentSubjectRecord.findMany.mockImplementation((args: any) =>
      args?.where?.origin === 'RECONOCIMIENTO_INTERNO'
        ? Promise.resolve([{ subjectId: 'adm1', sourceRecordId: 'rec-0' }])
        : Promise.resolve(
            MODULOS_CONTABLE.map((subjectId, i) => ({
              id: `rec-${i}`,
              subjectId,
              finalGrade: 4,
              origin: 'CURSADA',
              creditsSnapshot: 1,
              hoursSnapshot: 48,
            })),
          ),
    );

    const resultado = await service.aplicarReconocimientoInterno(
      TENANT_A,
      'inscripcion-1',
      ADMIN,
    );

    expect(resultado.reconocidas).toEqual([]);
    expect(prismaMock.studentSubjectRecord.create).not.toHaveBeenCalled();
  });
});
