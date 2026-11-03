import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { SubjectsService } from '../subjects/subjects.service';
import { PrismaService } from '@/common/prisma/prisma.service';

const TENANT_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const USER_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const STUDENT_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const MATERIAL_ID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const CURSO_MATRICULADO = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const CURSO_AJENO = 'ffffffff-ffff-4fff-8fff-ffffffffffff';
const ASIGNATURA_CURSADA = '11111111-1111-4111-8111-111111111111';
const ASIGNATURA_AJENA = '22222222-2222-4222-8222-222222222222';

describe('MaterialsService', () => {
  let service: MaterialsService;

  const prismaMock: any = {
    material: { findFirst: jest.fn() },
    student: { findUnique: jest.fn() },
    enrollment: { findMany: jest.fn() },
    course: { findFirst: jest.fn() },
    subject: { findFirst: jest.fn() },
    materialFolder: { findMany: jest.fn().mockResolvedValue([]) },
  };

  const subjectsMock = { asegurarEditorDeContenido: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    prismaMock.student.findUnique.mockResolvedValue({ id: STUDENT_ID, tenantId: TENANT_A });
    // La matrícula resuelve también la asignatura del grupo (contenido maestro)
    prismaMock.enrollment.findMany.mockResolvedValue([
      { course: { id: CURSO_MATRICULADO, subjectId: ASIGNATURA_CURSADA } },
    ]);
    prismaMock.materialFolder.findMany.mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaterialsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: SubjectsService, useValue: subjectsMock },
      ],
    }).compile();

    service = module.get<MaterialsService>(MaterialsService);
  });

  // Regresión: findOne/registerDownload no filtraban por visibilidad ni
  // matrícula; cualquier STUDENT que obtuviera un id de material podía leer
  // contenido de cursos ajenos o marcado no visible.
  describe('esAccesibleParaEstudiante', () => {
    it('rechaza un material de un curso en el que no está matriculado', async () => {
      prismaMock.material.findFirst.mockResolvedValue({
        visible: true,
        courseId: CURSO_AJENO,
        subjectId: null,
      });

      await expect(
        service.esAccesibleParaEstudiante(TENANT_A, USER_ID, MATERIAL_ID),
      ).resolves.toBe(false);
    });

    it('rechaza un material no visible aunque esté matriculado en el curso', async () => {
      prismaMock.material.findFirst.mockResolvedValue({
        visible: false,
        courseId: CURSO_MATRICULADO,
        subjectId: null,
      });

      await expect(
        service.esAccesibleParaEstudiante(TENANT_A, USER_ID, MATERIAL_ID),
      ).resolves.toBe(false);
    });

    it('permite un material visible de un curso matriculado', async () => {
      prismaMock.material.findFirst.mockResolvedValue({
        visible: true,
        courseId: CURSO_MATRICULADO,
        subjectId: null,
      });

      await expect(
        service.esAccesibleParaEstudiante(TENANT_A, USER_ID, MATERIAL_ID),
      ).resolves.toBe(true);
    });

    it('rechaza un material inexistente', async () => {
      prismaMock.material.findFirst.mockResolvedValue(null);

      await expect(
        service.esAccesibleParaEstudiante(TENANT_A, USER_ID, MATERIAL_ID),
      ).resolves.toBe(false);
    });

    // Fase 4: contenido maestro — solo de asignaturas de grupos matriculados
    it('permite el contenido maestro de una asignatura que cursa', async () => {
      prismaMock.material.findFirst.mockResolvedValue({
        visible: true,
        courseId: null,
        subjectId: ASIGNATURA_CURSADA,
      });

      await expect(
        service.esAccesibleParaEstudiante(TENANT_A, USER_ID, MATERIAL_ID),
      ).resolves.toBe(true);
    });

    it('rechaza el contenido maestro de una asignatura que NO cursa', async () => {
      prismaMock.material.findFirst.mockResolvedValue({
        visible: true,
        courseId: null,
        subjectId: ASIGNATURA_AJENA,
      });

      await expect(
        service.esAccesibleParaEstudiante(TENANT_A, USER_ID, MATERIAL_ID),
      ).resolves.toBe(false);
    });
  });

  describe('findAllFoldersForStudent', () => {
    it('rechaza pedir un courseId en el que no está matriculado', async () => {
      await service.findAllFoldersForStudent(TENANT_A, USER_ID, CURSO_AJENO);

      // No debe haber llegado a consultar materialFolder para un curso ajeno.
      expect(prismaMock.materialFolder.findMany).not.toHaveBeenCalled();
    });

    it('sin courseId, pide generales, de cursos matriculados o de asignaturas cursadas', async () => {
      await service.findAllFoldersForStudent(TENANT_A, USER_ID);

      expect(prismaMock.materialFolder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            tenantId: TENANT_A,
            OR: [
              { courseId: null, subjectId: null },
              { courseId: { in: [CURSO_MATRICULADO] } },
              { subjectId: { in: [ASIGNATURA_CURSADA] } },
            ],
          },
        }),
      );
    });

    it('propaga el rechazo si el usuario no es un estudiante del tenant', async () => {
      prismaMock.student.findUnique.mockResolvedValue(null);

      await expect(
        service.findAllFoldersForStudent(TENANT_A, USER_ID),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });
});
