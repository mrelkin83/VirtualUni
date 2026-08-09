import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
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

  /**
   * Resuelve la ficha de estudiante del usuario del token. El JWT lleva el id
   * de usuario, no el de estudiante, y son distintos.
   */
  async estudianteDelUsuario(
    userId: string,
    tenantId: string,
  ): Promise<string | undefined> {
    const student = await this.prisma.student.findFirst({
      where: { userId, tenantId },
      select: { id: true },
    });
    return student?.id;
  }

  /**
   * @param soloDeEstudiante limita las entregas devueltas a las de ese
   * estudiante. Se usa con el alumnado: la tarea llegaba con las entregas de
   * todo el grupo, con nota, comentarios y correo de cada autor.
   */
  async findOne(id: string, tenantId: string, soloDeEstudiante?: string) {
    const assignment = await this.prisma.assignment.findFirst({
      where: { id, tenantId },
      include: {
        course: true,
        submissions: {
          where: soloDeEstudiante ? { studentId: soloDeEstudiante } : undefined,
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

  /**
   * Entrega o reentrega. Existe una restriccion de unicidad sobre
   * (assignment_id, student_id): al volver a entregar, Prisma lanzaba
   * P2002 sin capturar y el alumno recibia un 500 "Internal server error" sin
   * saber que su primera entrega ya estaba ahi.
   */
  async submitAssignment(
    assignmentId: string,
    studentId: string,
    data: { content?: string; fileUrl?: string },
    tenantId: string,
  ) {
    const previa = await this.prisma.submission.findFirst({
      where: { assignmentId, studentId, tenantId },
    });

    if (previa) {
      // Una entrega ya calificada no se pisa: cambiaria el trabajo sobre el
      // que el docente ya puso nota.
      if (previa.grade !== null) {
        throw new ConflictException(
          'Esta tarea ya fue calificada y no admite una nueva entrega',
        );
      }
      return this.prisma.submission.update({
        where: { id: previa.id },
        data: { ...data, submittedAt: new Date() },
        include: {
          assignment: true,
          student: { include: { user: true } },
        },
      });
    }

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
