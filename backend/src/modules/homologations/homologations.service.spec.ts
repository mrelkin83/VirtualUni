import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { HomologationsService } from './homologations.service';
import { PrismaService } from '@/common/prisma/prisma.service';
import { HomologationStatus, HomologationType } from '@prisma/client';

const TENANT_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const STUDENT_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const ENROLLMENT_ID = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const SUBJECT_A = 'ssssssss-ssss-4sss-8sss-ssssssssss01';
const SUBJECT_B = 'ssssssss-ssss-4sss-8sss-ssssssssss02';

const ADMIN: any = {
  id: 'u-admin',
  userId: 'u-admin',
  role: 'TENANT_ADMIN',
  email: 'admin@uniprueba.test',
};
const ESTUDIANTE: any = {
  id: 'u-student',
  userId: 'u-student',
  role: 'STUDENT',
  email: 'alumno@uniprueba.test',
};
const DOCENTE: any = {
  id: 'u-teacher',
  userId: 'u-teacher',
  role: 'TEACHER',
  email: 'docente@uniprueba.test',
};

/** Solicitud externa de 1 ítem sobre un pensum de 10 créditos. */
function solicitudExterna(overrides: any = {}) {
  return {
    id: 'solicitud-1',
    tenantId: TENANT_A,
    studentId: STUDENT_ID,
    type: HomologationType.EXTERNA,
    status: HomologationStatus.EN_REVISION,
    items: [
      {
        id: 'item-1',
        targetSubjectId: SUBJECT_A,
        originName: 'Contabilidad General',
        originHours: 64,
        originGrade: 4.2,
        targetSubject: {
          id: SUBJECT_A,
          code: 'CONT1',
          name: 'Contabilidad 1',
          credits: 1,
          hours: 48,
        },
      },
    ],
    programEnrollment: {
      id: ENROLLMENT_ID,
      studyPlanId: 'plan-destino',
      program: {
        id: 'prog-1',
        name: 'T.L. Asistente Administrativo',
        hoursPerCredit: 48,
        maxRecognitionPct: 50,
        minRecognitionGrade: 3.0,
        gradeScaleMax: 5.0,
      },
    },
    student: { id: STUDENT_ID, userId: 'u-student' },
    ...overrides,
  };
}

/** Pensum destino de 10 filas de 1 crédito. */
const PENSUM_DESTINO = Array.from({ length: 10 }, (_, i) => ({
  subjectId: i === 0 ? SUBJECT_A : `otra-${i}`,
  credits: 1,
  subject: { credits: 1, hours: 48 },
}));

describe('HomologationsService', () => {
  let service: HomologationsService;

  const prismaMock: any = {
    subject: { findMany: jest.fn() },
    subjectEquivalence: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    student: { findFirst: jest.fn() },
    programEnrollment: { findFirst: jest.fn() },
    studyPlanSubject: { findMany: jest.fn() },
    studentSubjectRecord: { findMany: jest.fn(), create: jest.fn() },
    homologationRequest: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    homologationItem: { update: jest.fn() },
    notification: { create: jest.fn() },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomologationsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get(HomologationsService);
    prismaMock.$transaction.mockImplementation((cb: any) => cb(prismaMock));
    prismaMock.studentSubjectRecord.findMany.mockResolvedValue([]);
    prismaMock.studyPlanSubject.findMany.mockResolvedValue(PENSUM_DESTINO);
  });

  // ---- equivalencias ----------------------------------------------

  it('no permite que una asignatura sea equivalente a sí misma', async () => {
    await expect(
      service.crearEquivalencia(TENANT_A, {
        sourceSubjectId: SUBJECT_A,
        targetSubjectId: SUBJECT_A,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prismaMock.subjectEquivalence.create).not.toHaveBeenCalled();
  });

  it('una asignatura de otro tenant no se puede equiparar', async () => {
    // Solo aparece una de las dos: la otra es de otro tenant
    prismaMock.subject.findMany.mockResolvedValue([{ id: SUBJECT_A }]);

    await expect(
      service.crearEquivalencia(TENANT_A, {
        sourceSubjectId: SUBJECT_A,
        targetSubjectId: SUBJECT_B,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prismaMock.subject.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: TENANT_A, id: { in: [SUBJECT_A, SUBJECT_B] } },
      }),
    );
    expect(prismaMock.subjectEquivalence.create).not.toHaveBeenCalled();
  });

  it('no duplica una equivalencia existente', async () => {
    prismaMock.subject.findMany.mockResolvedValue([
      { id: SUBJECT_A },
      { id: SUBJECT_B },
    ]);
    prismaMock.subjectEquivalence.findFirst.mockResolvedValue({ id: 'equiv-1' });

    await expect(
      service.crearEquivalencia(TENANT_A, {
        sourceSubjectId: SUBJECT_A,
        targetSubjectId: SUBJECT_B,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('eliminar una equivalencia de otro tenant responde 404', async () => {
    prismaMock.subjectEquivalence.findFirst.mockResolvedValue(null);

    await expect(
      service.eliminarEquivalencia(TENANT_A, 'equiv-ajena'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prismaMock.subjectEquivalence.delete).not.toHaveBeenCalled();
  });

  // ---- creación de solicitudes ------------------------------------

  it('un estudiante no puede pedir homologación para otro', async () => {
    prismaMock.student.findFirst.mockResolvedValue({
      id: STUDENT_ID,
      userId: 'otro-usuario',
    });

    await expect(
      service.crearSolicitud(
        TENANT_A,
        {
          studentId: STUDENT_ID,
          programEnrollmentId: ENROLLMENT_ID,
          type: HomologationType.EXTERNA,
          items: [{ targetSubjectId: SUBJECT_A }],
        },
        ESTUDIANTE,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('la inscripción tiene que ser del tenant y del mismo estudiante', async () => {
    prismaMock.student.findFirst.mockResolvedValue({
      id: STUDENT_ID,
      userId: 'u-student',
    });
    prismaMock.programEnrollment.findFirst.mockResolvedValue(null);

    await expect(
      service.crearSolicitud(
        TENANT_A,
        {
          studentId: STUDENT_ID,
          programEnrollmentId: ENROLLMENT_ID,
          type: HomologationType.EXTERNA,
          items: [{ targetSubjectId: SUBJECT_A }],
        },
        ADMIN,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prismaMock.programEnrollment.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: ENROLLMENT_ID,
          tenantId: TENANT_A,
          studentId: STUDENT_ID,
        },
      }),
    );
  });

  it('rechaza ítems que no están en el pensum destino', async () => {
    prismaMock.student.findFirst.mockResolvedValue({
      id: STUDENT_ID,
      userId: 'u-student',
    });
    prismaMock.programEnrollment.findFirst.mockResolvedValue({
      id: ENROLLMENT_ID,
      studyPlanId: 'plan-destino',
    });
    prismaMock.studyPlanSubject.findMany.mockResolvedValue([]);

    await expect(
      service.crearSolicitud(
        TENANT_A,
        {
          studentId: STUDENT_ID,
          programEnrollmentId: ENROLLMENT_ID,
          type: HomologationType.EXTERNA,
          items: [{ targetSubjectId: SUBJECT_A }],
        },
        ADMIN,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prismaMock.homologationRequest.create).not.toHaveBeenCalled();
  });

  // ---- resolución --------------------------------------------------

  it('resolver exige rol administrativo', async () => {
    await expect(
      service.resolverSolicitud(
        TENANT_A,
        'solicitud-1',
        { decisiones: [{ itemId: 'item-1', aprobado: true }] },
        DOCENTE,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('una solicitud de otro tenant responde 404', async () => {
    prismaMock.homologationRequest.findFirst.mockResolvedValue(null);

    await expect(
      service.resolverSolicitud(
        TENANT_A,
        'solicitud-ajena',
        { decisiones: [{ itemId: 'item-1', aprobado: true }] },
        ADMIN,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('aprobar un ítem válido escribe el historial y notifica al estudiante', async () => {
    prismaMock.homologationRequest.findFirst.mockResolvedValue(solicitudExterna());

    const resultado = await service.resolverSolicitud(
      TENANT_A,
      'solicitud-1',
      { decisiones: [{ itemId: 'item-1', aprobado: true }] },
      ADMIN,
    );

    expect(resultado.resultados).toEqual([
      {
        itemId: 'item-1',
        targetSubjectId: SUBJECT_A,
        decision: 'APROBADO',
        motivo: undefined,
      },
    ]);
    expect(prismaMock.studentSubjectRecord.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: TENANT_A,
          studentId: STUDENT_ID,
          subjectId: SUBJECT_A,
          origin: 'RECONOCIMIENTO_EXTERNO',
          finalGrade: 4.2,
          passed: true,
          sourceRequestId: 'solicitud-1',
        }),
      }),
    );
    expect(prismaMock.homologationRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: HomologationStatus.APROBADA }),
      }),
    );
    expect(prismaMock.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 'u-student', tipo: 'SUCCESS' }),
      }),
    );
  });

  it('bloquea la aprobación si la nota de origen no alcanza el mínimo', async () => {
    prismaMock.homologationRequest.findFirst.mockResolvedValue(
      solicitudExterna({
        items: [
          {
            ...solicitudExterna().items[0],
            originGrade: 2.5,
          },
        ],
      }),
    );

    await expect(
      service.resolverSolicitud(
        TENANT_A,
        'solicitud-1',
        { decisiones: [{ itemId: 'item-1', aprobado: true }] },
        ADMIN,
      ),
    ).rejects.toThrow(/menor que la mínima/);
    expect(prismaMock.studentSubjectRecord.create).not.toHaveBeenCalled();
  });

  it('bloquea si las horas de origen son menos que las de la asignatura destino', async () => {
    prismaMock.homologationRequest.findFirst.mockResolvedValue(
      solicitudExterna({
        items: [{ ...solicitudExterna().items[0], originHours: 20 }],
      }),
    );

    await expect(
      service.resolverSolicitud(
        TENANT_A,
        'solicitud-1',
        { decisiones: [{ itemId: 'item-1', aprobado: true }] },
        ADMIN,
      ),
    ).rejects.toThrow(/horas de origen/);
  });

  it('bloquea cuando se supera el maxRecognitionPct del pensum destino', async () => {
    // Pensum de 10 créditos, tope 50 % = 5 créditos; ya hay 5 externos
    prismaMock.studentSubjectRecord.findMany.mockResolvedValue(
      Array.from({ length: 5 }, (_, i) => ({
        subjectId: `otra-${i + 1}`,
        creditsSnapshot: 1,
      })),
    );
    prismaMock.homologationRequest.findFirst.mockResolvedValue(solicitudExterna());

    await expect(
      service.resolverSolicitud(
        TENANT_A,
        'solicitud-1',
        { decisiones: [{ itemId: 'item-1', aprobado: true }] },
        ADMIN,
      ),
    ).rejects.toThrow(/máximo reconocible/);
  });

  it('forzar sin justificación no pasa', async () => {
    prismaMock.homologationRequest.findFirst.mockResolvedValue(
      solicitudExterna({
        items: [{ ...solicitudExterna().items[0], originGrade: 2.0 }],
      }),
    );

    await expect(
      service.resolverSolicitud(
        TENANT_A,
        'solicitud-1',
        { decisiones: [{ itemId: 'item-1', aprobado: true, forzar: true }] },
        ADMIN,
      ),
    ).rejects.toThrow(/exige una justificación/);
  });

  it('forzar con justificación aprueba y deja la auditoría en el registro', async () => {
    prismaMock.homologationRequest.findFirst.mockResolvedValue(
      solicitudExterna({
        items: [{ ...solicitudExterna().items[0], originGrade: 2.0 }],
      }),
    );

    const resultado = await service.resolverSolicitud(
      TENANT_A,
      'solicitud-1',
      {
        decisiones: [
          {
            itemId: 'item-1',
            aprobado: true,
            forzar: true,
            justificacion: 'Acta de homologación 2026-14 del consejo académico',
          },
        ],
      },
      ADMIN,
    );

    expect(resultado.resultados[0].motivo).toBe('forzado con justificación');
    expect(prismaMock.studentSubjectRecord.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          notes: expect.stringContaining('Acta de homologación 2026-14'),
        }),
      }),
    );
  });

  it('una decisión que apunta a otro ítem no se acepta', async () => {
    prismaMock.homologationRequest.findFirst.mockResolvedValue(solicitudExterna());

    await expect(
      service.resolverSolicitud(
        TENANT_A,
        'solicitud-1',
        { decisiones: [{ itemId: 'item-de-otra-solicitud', aprobado: true }] },
        ADMIN,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('una solicitud ya resuelta no se vuelve a resolver', async () => {
    prismaMock.homologationRequest.findFirst.mockResolvedValue(
      solicitudExterna({ status: HomologationStatus.APROBADA }),
    );

    await expect(
      service.resolverSolicitud(
        TENANT_A,
        'solicitud-1',
        { decisiones: [{ itemId: 'item-1', aprobado: true }] },
        ADMIN,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rechazar todos los ítems deja la solicitud RECHAZADA y avisa', async () => {
    prismaMock.homologationRequest.findFirst.mockResolvedValue(solicitudExterna());

    await service.resolverSolicitud(
      TENANT_A,
      'solicitud-1',
      { decisiones: [{ itemId: 'item-1', aprobado: false }] },
      ADMIN,
    );

    expect(prismaMock.homologationRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: HomologationStatus.RECHAZADA }),
      }),
    );
    expect(prismaMock.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tipo: 'ERROR' }),
      }),
    );
    expect(prismaMock.studentSubjectRecord.create).not.toHaveBeenCalled();
  });

  it('la equivalencia interna no aplica las validaciones de la externa', async () => {
    prismaMock.homologationRequest.findFirst.mockResolvedValue(
      solicitudExterna({
        type: HomologationType.EQUIVALENCIA_INTERNA,
        items: [
          {
            ...solicitudExterna().items[0],
            originGrade: null,
            originHours: null,
          },
        ],
      }),
    );

    const resultado = await service.resolverSolicitud(
      TENANT_A,
      'solicitud-1',
      { decisiones: [{ itemId: 'item-1', aprobado: true }] },
      ADMIN,
    );

    expect(resultado.resultados[0].decision).toBe('APROBADO');
    expect(prismaMock.studentSubjectRecord.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          origin: 'HOMOLOGACION_EQUIVALENCIA',
          finalGrade: null,
        }),
      }),
    );
  });

  // ---- listados ----------------------------------------------------

  it('un estudiante solo ve sus propias solicitudes aunque pida otro studentId', async () => {
    prismaMock.student.findFirst.mockResolvedValue({ id: STUDENT_ID });
    prismaMock.homologationRequest.findMany.mockResolvedValue([]);

    await service.listarSolicitudes(TENANT_A, ESTUDIANTE, {
      studentId: 'otro-estudiante',
    });

    expect(prismaMock.homologationRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: TENANT_A, studentId: STUDENT_ID },
      }),
    );
  });
});
