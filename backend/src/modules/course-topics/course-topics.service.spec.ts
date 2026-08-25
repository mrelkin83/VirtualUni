import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CourseTopicsService } from './course-topics.service';
import { PrismaService } from '@/common/prisma/prisma.service';

const TENANT_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const COURSE_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

describe('CourseTopicsService', () => {
  let service: CourseTopicsService;

  const prismaMock: any = {
    course: { findFirst: jest.fn() },
    courseTopic: { count: jest.fn().mockResolvedValue(0), create: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseTopicsService, { provide: PrismaService, useValue: prismaMock }],
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
        service.crear(TENANT_A, { courseId: COURSE_ID, title: 'Tema' } as any),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(prismaMock.courseTopic.create).not.toHaveBeenCalled();
    });

    it('crea el tema cuando el curso sí pertenece al tenant', async () => {
      prismaMock.course.findFirst.mockResolvedValue({ id: COURSE_ID });
      prismaMock.courseTopic.create.mockResolvedValue({ id: 't1' });

      await service.crear(TENANT_A, { courseId: COURSE_ID, title: 'Tema' } as any);

      expect(prismaMock.courseTopic.create).toHaveBeenCalledTimes(1);
    });
  });
});
