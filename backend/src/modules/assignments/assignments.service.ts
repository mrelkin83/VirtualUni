import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class AssignmentsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, tenantId: string) {
    return this.prisma.assignment.create({
      data: { ...data, tenantId },
      include: { course: true },
    });
  }

  async findAll(tenantId: string, courseId?: string) {
    return this.prisma.assignment.findMany({
      where: { tenantId, courseId },
      include: {
        course: true,
        _count: { select: { submissions: true } },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const assignment = await this.prisma.assignment.findFirst({
      where: { id, tenantId },
      include: {
        course: true,
        submissions: {
          include: {
            student: {
              include: { user: { select: { firstName: true, lastName: true, email: true } } },
            },
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    return assignment;
  }

  async update(id: string, data: any, tenantId: string) {
    const assignment = await this.prisma.assignment.findFirst({
      where: { id, tenantId },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    return this.prisma.assignment.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, tenantId: string) {
    const assignment = await this.prisma.assignment.findFirst({
      where: { id, tenantId },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    await this.prisma.assignment.delete({ where: { id } });
    return { message: 'Assignment deleted successfully' };
  }

  async submitAssignment(assignmentId: string, studentId: string, data: any, tenantId: string) {
    return this.prisma.submission.create({
      data: {
        assignmentId,
        studentId,
        tenantId,
        ...data,
      },
      include: {
        assignment: true,
        student: { include: { user: true } },
      },
    });
  }

  async gradeSubmission(submissionId: string, grade: number, feedback: string, tenantId: string) {
    const submission = await this.prisma.submission.findFirst({
      where: { id: submissionId, tenantId },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    return this.prisma.submission.update({
      where: { id: submissionId },
      data: { grade, feedback, gradedAt: new Date() },
    });
  }
}
