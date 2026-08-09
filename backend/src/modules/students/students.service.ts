import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async create(createStudentDto: CreateStudentDto, tenantId: string) {
    // Check tenant limits
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (tenant.currentStudents >= tenant.maxStudents) {
      throw new BadRequestException(
        `Student limit reached. Current plan allows ${tenant.maxStudents} students.`,
      );
    }

    // Check if email already exists for this tenant
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: createStudentDto.email,
        tenantId,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Generate student code
    const studentCode = `STU${Date.now()}`;

    // Hash password
    const passwordHash = await bcrypt.hash(createStudentDto.password, 10);

    // Create user and student in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: createStudentDto.email,
          passwordHash,
          firstName: createStudentDto.firstName,
          lastName: createStudentDto.lastName,
          role: 'STUDENT',
          tenantId,
        },
      });

      // Create student profile
      const student = await tx.student.create({
        data: {
          userId: user.id,
          tenantId,
          studentCode,
          program: createStudentDto.program,
          semester: createStudentDto.semester,
          enrollmentDate: new Date(),
          tipoIdentificacion: createStudentDto.tipoIdentificacion,
          numeroIdentificacion: createStudentDto.numeroIdentificacion,
          sexo: createStudentDto.sexo,
          telefono: createStudentDto.telefono,
          celular: createStudentDto.celular,
          fechaNacimiento: createStudentDto.fechaNacimiento
            ? new Date(createStudentDto.fechaNacimiento)
            : null,
          lugarNacimiento: createStudentDto.lugarNacimiento,
          direccion: createStudentDto.direccion,
          lugarResidencia: createStudentDto.lugarResidencia,
          barrio: createStudentDto.barrio,
          zona: createStudentDto.zona,
          estrato: createStudentDto.estrato,
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

      // Update tenant student count
      await tx.tenant.update({
        where: { id: tenantId },
        data: { currentStudents: { increment: 1 } },
      });

      return student;
    });

    return result;
  }

  async findAll(tenantId: string, page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (search) {
      where.OR = [
        { studentCode: { contains: search, mode: 'insensitive' } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
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
              enrollments: true,
              submissions: true,
              grades: true,
            },
          },
        },
      }),
      this.prisma.student.count({ where }),
    ]);

    return {
      data: students,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, tenantId: string) {
    const student = await this.prisma.student.findFirst({
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
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                code: true,
                name: true,
                semester: true,
                credits: true,
                color: true,
              },
            },
          },
        },
        grades: {
          include: {
            course: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
            submissions: true,
            grades: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  async update(id: string, updateStudentDto: UpdateStudentDto, tenantId: string) {
    const student = await this.prisma.student.findFirst({
      where: { id, tenantId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Separate user fields from student fields
    const { firstName, lastName, email, password, ...studentData } = updateStudentDto;

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
          where: { id: student.userId },
          data: userUpdateData,
        });
      }

      // Update student profile
      const updatedStudent = await tx.student.update({
        where: { id },
        data: {
          ...studentData,
          fechaNacimiento: studentData.fechaNacimiento
            ? new Date(studentData.fechaNacimiento)
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

      return updatedStudent;
    });

    return result;
  }

  async remove(id: string, tenantId: string) {
    const student = await this.prisma.student.findFirst({
      where: { id, tenantId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Delete in transaction
    await this.prisma.$transaction(async (tx) => {
      // Delete student (cascade will handle user)
      await tx.student.delete({
        where: { id },
      });

      // Decrement tenant student count
      await tx.tenant.update({
        where: { id: tenantId },
        data: { currentStudents: { decrement: 1 } },
      });
    });

    return { message: 'Student deleted successfully' };
  }

  async getStudentStats(id: string, tenantId: string) {
    const student = await this.findOne(id, tenantId);

    // Calculate average grade
    const grades = await this.prisma.grade.findMany({
      where: { studentId: id, tenantId },
    });

    const averageGrade =
      grades.length > 0
        ? grades.reduce((sum, g) => sum + g.grade, 0) / grades.length
        : 0;

    // Get submission stats
    const [totalSubmissions, pendingSubmissions] = await Promise.all([
      this.prisma.submission.count({
        where: { studentId: id, tenantId },
      }),
      this.prisma.submission.count({
        where: { studentId: id, tenantId, grade: null },
      }),
    ]);

    return {
      student,
      stats: {
        enrolledCourses: student._count.enrollments,
        totalSubmissions,
        pendingSubmissions,
        gradedSubmissions: totalSubmissions - pendingSubmissions,
        averageGrade: Math.round(averageGrade * 100) / 100,
        totalGrades: grades.length,
      },
    };
  }
}
