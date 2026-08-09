import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async create(createCourseDto: CreateCourseDto, tenantId: string) {
    // Check tenant limits
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (tenant.currentCourses >= tenant.maxCourses) {
      throw new BadRequestException(
        `Course limit reached. Current plan allows ${tenant.maxCourses} courses.`,
      );
    }

    // Check if course code already exists for this tenant
    const existingCourse = await this.prisma.course.findFirst({
      where: {
        code: createCourseDto.code,
        tenantId,
      },
    });

    if (existingCourse) {
      throw new ConflictException('Course code already exists');
    }

    // Verify teacher exists and belongs to this tenant
    const teacher = await this.prisma.teacher.findFirst({
      where: {
        id: createCourseDto.teacherId,
        tenantId,
      },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found or does not belong to this tenant');
    }

    // Create course in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const course = await tx.course.create({
        data: {
          ...createCourseDto,
          tenantId,
        },
        include: {
          teacher: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      // Update tenant course count
      await tx.tenant.update({
        where: { id: tenantId },
        data: { currentCourses: { increment: 1 } },
      });

      return course;
    });

    return result;
  }

  async findAll(tenantId: string, page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { teacher: { user: { firstName: { contains: search, mode: 'insensitive' } } } },
        { teacher: { user: { lastName: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          teacher: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          },
          _count: {
            select: {
              enrollments: true,
              assignments: true,
              topics: true,
            },
          },
        },
      }),
      this.prisma.course.count({ where }),
    ]);

    return {
      data: courses,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, tenantId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id, tenantId },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        enrollments: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
        assignments: {
          orderBy: { dueDate: 'asc' },
        },
        topics: {
          orderBy: { orderIndex: 'asc' },
          include: {
            blocks: {
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
            assignments: true,
            topics: true,
            grades: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto, tenantId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id, tenantId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // If changing teacher, verify new teacher exists
    if (updateCourseDto.teacherId && updateCourseDto.teacherId !== course.teacherId) {
      const teacher = await this.prisma.teacher.findFirst({
        where: {
          id: updateCourseDto.teacherId,
          tenantId,
        },
      });

      if (!teacher) {
        throw new NotFoundException('Teacher not found or does not belong to this tenant');
      }
    }

    const updated = await this.prisma.course.update({
      where: { id },
      data: updateCourseDto,
      include: {
        teacher: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return updated;
  }

  async remove(id: string, tenantId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id, tenantId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Delete in transaction
    await this.prisma.$transaction(async (tx) => {
      // Delete course (cascade will handle enrollments, assignments, etc.)
      await tx.course.delete({
        where: { id },
      });

      // Decrement tenant course count
      await tx.tenant.update({
        where: { id: tenantId },
        data: { currentCourses: { decrement: 1 } },
      });
    });

    return { message: 'Course deleted successfully' };
  }

  async enrollStudent(courseId: string, studentId: string, tenantId: string) {
    // Verify course exists
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, tenantId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Verify student exists and belongs to this tenant
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
    });

    if (!student) {
      throw new NotFoundException('Student not found or does not belong to this tenant');
    }

    // Check if already enrolled
    const existingEnrollment = await this.prisma.enrollment.findFirst({
      where: {
        studentId,
        courseId,
      },
    });

    if (existingEnrollment) {
      throw new ConflictException('Student is already enrolled in this course');
    }

    // Create enrollment
    const enrollment = await this.prisma.enrollment.create({
      data: {
        studentId,
        courseId,
        tenantId,
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return enrollment;
  }

  async unenrollStudent(courseId: string, studentId: string, tenantId: string) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        studentId,
        courseId,
        tenantId,
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    await this.prisma.enrollment.delete({
      where: { id: enrollment.id },
    });

    return { message: 'Student unenrolled successfully' };
  }

  async getCourseStats(courseId: string, tenantId: string) {
    const course = await this.findOne(courseId, tenantId);

    // Get assignment statistics
    const totalAssignments = course.assignments.length;
    const activeAssignments = course.assignments.filter(
      (a) => new Date(a.dueDate) > new Date(),
    ).length;

    // Get average grade for the course
    const grades = await this.prisma.grade.findMany({
      where: { courseId, tenantId },
    });

    const averageGrade =
      grades.length > 0
        ? grades.reduce((sum, g) => sum + g.grade, 0) / grades.length
        : 0;

    // Get submission statistics
    const [totalSubmissions, pendingSubmissions] = await Promise.all([
      this.prisma.submission.count({
        where: {
          tenantId,
          assignment: {
            courseId,
          },
        },
      }),
      this.prisma.submission.count({
        where: {
          tenantId,
          grade: null,
          assignment: {
            courseId,
          },
        },
      }),
    ]);

    return {
      course,
      stats: {
        enrolledStudents: course._count.enrollments,
        totalAssignments,
        activeAssignments,
        totalTopics: course._count.topics,
        totalSubmissions,
        pendingSubmissions,
        averageGrade: Math.round(averageGrade * 100) / 100,
      },
    };
  }
}
