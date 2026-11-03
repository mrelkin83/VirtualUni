import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CourseTopicsService } from './course-topics.service';
import { SubjectsService } from '../subjects/subjects.service';
import { PrismaService } from '@/common/prisma/prisma.service';

const TENANT_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const COURSE_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const SUBJECT_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

const ADMIN: any = { id: 'u-admin', userId: 'u-admin', role: 'TENANT_ADMIN' };
const DOCENTE: any = { id: 'u-doc', userId: 'u-doc', role: 'TEACHER' };
const ESTUDIANTE: any = { id: 'u-est', userId: 'u-est', role: 'STUDENT' };

describe('CourseTopicsService', () => {
  let service: CourseTopicsService;

  const prismaMock: any = {
    course: { findFirst: jest.fn() },
    subject: { findFirst: jest.fn() },
    student: { findUnique: jest.fn() },
    enrollment: { findMany: jest.fn() },
    courseTopic: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    topicBlock: { findFirst: jest.fn(), count: jest.fn(), create: jest.fn() },
  };

  // SubjectsService real no hace falta: solo su contrato de permiso
  const subjectsMock = {
    asegurarEditorDeContenido: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prismaMock.courseTopic.count.mockResolvedValue(0);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseTopicsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: SubjectsService, useValue: subjectsMock },
      ],
    }).compile();

    service = module.get<CourseTopicsService>(CourseTopicsService);
  });

  describe('crear', () => {
    // Regresión: `dto.courseId` sólo se validaba con @IsUUID(), nunca contra
    // el tenant — se podía crear un tema referenciando el curso de otro
    // tenant (o uno inexistente).
    it('rechaza un courseId que no pertenece al tenant', async () => {
      prismaMock.course.findFirst.mockResolvedValue(null);

      await expect(
        service.crear(TENANT_A, { courseId: COURSE_ID, title: 'Tema' } as any, ADMIN),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(prismaMock.courseTopic.create).not.toHaveBeenCalled();
    });

    it('crea el tema cuando el curso sí pertenece al tenant', async () => {
      prismaMock.course.findFirst.mockResolvedValue({ id: COURSE_ID, subjectId: null });
      prismaMock.courseTopic.create.mockResolvedValue({ id: 't1' });

      await service.crear(TENANT_A, { courseId: COURSE_ID, title: 'Tema' } as any, ADMIN);

      expect(prismaMock.courseTopic.create).toHaveBeenCalledTimes(1);
    });

    // Fase 4: exclusividad grupo/asignatura
    it('rechaza un tema con courseId Y subjectId a la vez', async () => {
      await expect(
        service.crear(
          TENANT_A,
          { courseId: COURSE_ID, subjectId: SUBJECT_ID, title: 'Tema' } as any,
          ADMIN,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rechaza un tema sin courseId ni subjectId', async () => {
      await expect(
        service.crear(TENANT_A, { title: 'Tema' } as any, ADMIN),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    // Fase 4: el contenido maestro exige editor de la asignatura
    it('exige el permiso de editor al crear contenido maestro', async () => {
      prismaMock.subject.findFirst.mockResolvedValue({ id: SUBJECT_ID });
      subjectsMock.asegurarEditorDeContenido.mockRejectedValue(new ForbiddenException());

      await expect(
        service.crear(TENANT_A, { subjectId: SUBJECT_ID, title: 'Tema' } as any, DOCENTE),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prismaMock.courseTopic.create).not.toHaveBeenCalled();
    });
  });

  describe('contenido maestro', () => {
    it('findByCourse mezcla el temario maestro de la asignatura con el propio', async () => {
      prismaMock.course.findFirst.mockResolvedValue({
        id: COURSE_ID,
        subjectId: SUBJECT_ID,
      });
      prismaMock.courseTopic.findMany.mockResolvedValue([
        { id: 'propio', courseId: COURSE_ID, subjectId: null, blocks: [] },
        { id: 'maestro', courseId: null, subjectId: SUBJECT_ID, blocks: [] },
      ]);

      const temario = await service.findByCourse(TENANT_A, COURSE_ID, ADMIN);

      // El where incluye ambas fuentes
      expect(prismaMock.courseTopic.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [{ courseId: COURSE_ID }, { subjectId: SUBJECT_ID }],
          }),
        }),
      );
      // Maestro primero y con el flag de origen
      expect(temario[0]).toMatchObject({ id: 'maestro', origen: 'asignatura' });
      expect(temario[1]).toMatchObject({ id: 'propio', origen: 'grupo' });
    });

    // Hallazgo del revisor: un STUDENT solo lee el temario de SUS grupos
    it('un estudiante no puede leer el temario de un curso en el que no está matriculado', async () => {
      prismaMock.course.findFirst.mockResolvedValue({ id: COURSE_ID, subjectId: null });
      prismaMock.student.findUnique.mockResolvedValue({ id: 'est-1', tenantId: TENANT_A });
      prismaMock.enrollment.findMany.mockResolvedValue([
        { course: { id: 'otro-curso', subjectId: null } },
      ]);

      await expect(
        service.findByCourse(TENANT_A, COURSE_ID, ESTUDIANTE),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prismaMock.courseTopic.findMany).not.toHaveBeenCalled();
    });

    it('un estudiante no puede leer el temario maestro de una asignatura que no cursa', async () => {
      prismaMock.subject.findFirst.mockResolvedValue({ id: SUBJECT_ID });
      prismaMock.student.findUnique.mockResolvedValue({ id: 'est-1', tenantId: TENANT_A });
      prismaMock.enrollment.findMany.mockResolvedValue([
        { course: { id: 'otro-curso', subjectId: 'otra-asignatura' } },
      ]);

      await expect(
        service.findBySubject(TENANT_A, SUBJECT_ID, ESTUDIANTE),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('un estudiante sí lee el temario de un curso matriculado', async () => {
      prismaMock.course.findFirst.mockResolvedValue({ id: COURSE_ID, subjectId: null });
      prismaMock.student.findUnique.mockResolvedValue({ id: 'est-1', tenantId: TENANT_A });
      prismaMock.enrollment.findMany.mockResolvedValue([
        { course: { id: COURSE_ID, subjectId: null } },
      ]);
      prismaMock.courseTopic.findMany.mockResolvedValue([]);

      await expect(
        service.findByCourse(TENANT_A, COURSE_ID, ESTUDIANTE),
      ).resolves.toEqual([]);
    });

    it('editar un tema maestro exige el permiso de editor', async () => {
      prismaMock.courseTopic.findFirst.mockResolvedValue({
        id: 't1',
        subjectId: SUBJECT_ID,
        courseId: null,
      });
      subjectsMock.asegurarEditorDeContenido.mockRejectedValue(new ForbiddenException());

      await expect(
        service.actualizar(TENANT_A, 't1', { title: 'X' } as any, DOCENTE),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prismaMock.courseTopic.update).not.toHaveBeenCalled();
    });

    it('promover mueve el tema del grupo a la asignatura del grupo', async () => {
      prismaMock.courseTopic.findFirst.mockResolvedValue({
        id: 't1',
        courseId: COURSE_ID,
        subjectId: null,
      });
      prismaMock.course.findFirst.mockResolvedValue({
        id: COURSE_ID,
        subjectId: SUBJECT_ID,
      });
      subjectsMock.asegurarEditorDeContenido.mockResolvedValue(undefined);
      prismaMock.courseTopic.update.mockResolvedValue({ id: 't1' });

      await service.promover(TENANT_A, 't1', ADMIN);

      expect(prismaMock.courseTopic.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 't1' },
          data: expect.objectContaining({ subjectId: SUBJECT_ID, courseId: null }),
        }),
      );
    });

    it('promover falla si el grupo no tiene asignatura de catálogo', async () => {
      prismaMock.courseTopic.findFirst.mockResolvedValue({
        id: 't1',
        courseId: COURSE_ID,
        subjectId: null,
      });
      prismaMock.course.findFirst.mockResolvedValue({ id: COURSE_ID, subjectId: null });

      await expect(service.promover(TENANT_A, 't1', ADMIN)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('copiarDelGrupo', () => {
    it('rechaza copiar entre grupos de asignaturas distintas', async () => {
      prismaMock.course.findFirst
        .mockResolvedValueOnce({ id: COURSE_ID, subjectId: SUBJECT_ID })
        .mockResolvedValueOnce({ id: 'otro', subjectId: 'otra-asignatura' });

      await expect(
        service.copiarDelGrupo(TENANT_A, {
          courseId: COURSE_ID,
          fromCourseId: 'otro',
        } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
