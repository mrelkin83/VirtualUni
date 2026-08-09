import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class GradesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, tenantId: string) {
    return this.prisma.grade.create({
      data: { ...data, tenantId },
      include: {
        student: { include: { user: true } },
        course: true,
        teacher: { include: { user: true } },
      },
    });
  }

  /**
   * ¿El expediente consultado es el del propio usuario? El token lleva el id
   * de usuario, no el de estudiante, asi que hay que resolverlo contra la BD.
   */
  async esExpedienteDelUsuario(
    userId: string,
    studentId: string,
    tenantId: string,
  ): Promise<boolean> {
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
      select: { userId: true },
    });
    return !!student && student.userId === userId;
  }

  async findByStudent(studentId: string, tenantId: string) {
    return this.prisma.grade.findMany({
      where: { studentId, tenantId },
      include: {
        course: true,
        teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: { gradedAt: 'desc' },
    });
  }

  async findByCourse(courseId: string, tenantId: string) {
    return this.prisma.grade.findMany({
      where: { courseId, tenantId },
      include: {
        student: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: { gradedAt: 'desc' },
    });
  }

  async update(id: string, data: any, tenantId: string) {
    const grade = await this.prisma.grade.findFirst({
      where: { id, tenantId },
    });

    if (!grade) {
      throw new NotFoundException('Grade not found');
    }

    return this.prisma.grade.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, tenantId: string) {
    const grade = await this.prisma.grade.findFirst({
      where: { id, tenantId },
    });

    if (!grade) {
      throw new NotFoundException('Grade not found');
    }

    await this.prisma.grade.delete({ where: { id } });
    return { message: 'Grade deleted successfully' };
  }

  async getStudentAverage(studentId: string, tenantId: string, courseId?: string) {
    const where: any = { studentId, tenantId };
    if (courseId) {
      where.courseId = courseId;
    }

    const grades = await this.prisma.grade.findMany({ where });

    if (grades.length === 0) {
      return { average: 0, count: 0 };
    }

    const sum = grades.reduce((acc, g) => acc + g.grade, 0);
    return {
      average: Math.round((sum / grades.length) * 100) / 100,
      count: grades.length,
    };
  }
}
