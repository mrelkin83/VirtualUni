import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) {}

  async create(createTeacherDto: CreateTeacherDto, tenantId: string) {
    // Check tenant limits
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (tenant.currentTeachers >= tenant.maxTeachers) {
      throw new BadRequestException(
        `Teacher limit reached. Current plan allows ${tenant.maxTeachers} teachers.`,
      );
    }

    // Check if email already exists for this tenant
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: createTeacherDto.email,
        tenantId,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Generate employee code
    const employeeCode = `TCH${Date.now()}`;

    // Hash password
    const passwordHash = await bcrypt.hash(createTeacherDto.password, 10);

    // Create user and teacher in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: createTeacherDto.email,
          passwordHash,
          firstName: createTeacherDto.firstName,
          lastName: createTeacherDto.lastName,
          role: 'TEACHER',
          tenantId,
        },
      });

      // Create teacher profile
      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          tenantId,
          employeeCode,
          department: createTeacherDto.department,
          specialization: createTeacherDto.specialization,
          hireDate: createTeacherDto.hireDate
            ? new Date(createTeacherDto.hireDate)
            : new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              isActive: true,
              createdAt: true,
            },
          },
        },
      });

      // Update tenant teacher count
      await tx.tenant.update({
        where: { id: tenantId },
        data: { currentTeachers: { increment: 1 } },
      });

      return teacher;
    });

    return result;
  }

  async findAll(tenantId: string, page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (search) {
      where.OR = [
        { employeeCode: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [teachers, total] = await Promise.all([
      this.prisma.teacher.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              isActive: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              courses: true,
              grades: true,
            },
          },
        },
      }),
      this.prisma.teacher.count({ where }),
    ]);

    return {
      data: teachers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, tenantId: string) {
    const teacher = await this.prisma.teacher.findFirst({
      where: { id, tenantId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            isActive: true,
            lastLoginAt: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        courses: {
          include: {
            _count: {
              select: {
                enrollments: true,
                assignments: true,
              },
            },
          },
        },
        _count: {
          select: {
            courses: true,
            grades: true,
          },
        },
      },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    return teacher;
  }

  async update(id: string, updateTeacherDto: UpdateTeacherDto, tenantId: string) {
    const teacher = await this.prisma.teacher.findFirst({
      where: { id, tenantId },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Separate user fields from teacher fields
    const { firstName, lastName, email, password, ...teacherData } = updateTeacherDto;

    // Update in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Update user if fields provided
      if (firstName || lastName || email || password) {
        const userUpdateData: any = {};
        if (firstName) userUpdateData.firstName = firstName;
        if (lastName) userUpdateData.lastName = lastName;
        if (email) userUpdateData.email = email;
        if (password) {
          userUpdateData.passwordHash = await bcrypt.hash(password, 10);
        }

        await tx.user.update({
          where: { id: teacher.userId },
          data: userUpdateData,
        });
      }

      // Update teacher profile
      const updatedTeacher = await tx.teacher.update({
        where: { id },
        data: {
          ...teacherData,
          hireDate: teacherData.hireDate
            ? new Date(teacherData.hireDate)
            : undefined,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      return updatedTeacher;
    });

    return result;
  }

  async remove(id: string, tenantId: string) {
    const teacher = await this.prisma.teacher.findFirst({
      where: { id, tenantId },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Check if teacher has courses
    const coursesCount = await this.prisma.course.count({
      where: { teacherId: id, tenantId },
    });

    if (coursesCount > 0) {
      throw new BadRequestException(
        'Cannot delete teacher with assigned courses. Please reassign courses first.',
      );
    }

    // Delete in transaction
    await this.prisma.$transaction(async (tx) => {
      // Delete teacher (cascade will handle user)
      await tx.teacher.delete({
        where: { id },
      });

      // Decrement tenant teacher count
      await tx.tenant.update({
        where: { id: tenantId },
        data: { currentTeachers: { decrement: 1 } },
      });
    });

    return { message: 'Teacher deleted successfully' };
  }

  async getTeacherStats(id: string, tenantId: string) {
    const teacher = await this.findOne(id, tenantId);

    // Get total students across all courses
    const totalStudents = await this.prisma.enrollment.count({
      where: {
        tenantId,
        course: {
          teacherId: id,
        },
      },
    });

    // Get total assignments
    const totalAssignments = await this.prisma.assignment.count({
      where: {
        tenantId,
        course: {
          teacherId: id,
        },
      },
    });

    // Get grading statistics
    const [totalGradesGiven, pendingGrades] = await Promise.all([
      this.prisma.grade.count({
        where: { teacherId: id, tenantId },
      }),
      this.prisma.submission.count({
        where: {
          tenantId,
          grade: null,
          assignment: {
            course: {
              teacherId: id,
            },
          },
        },
      }),
    ]);

    return {
      teacher,
      stats: {
        totalCourses: teacher._count.courses,
        totalStudents,
        totalAssignments,
        totalGradesGiven,
        pendingGrades,
      },
    };
  }
}
