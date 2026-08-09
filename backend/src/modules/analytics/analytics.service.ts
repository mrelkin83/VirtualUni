import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CacheService } from '../../common/cache/cache.service';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  /**
   * Dashboard general - Estadísticas principales
   */
  async getDashboardStats(tenantId: string) {
    const cacheKey = `analytics:dashboard:${tenantId}`;

    return this.cacheService.getOrSet(cacheKey, async () => {
      return this.computeDashboardStats(tenantId);
    }, this.CACHE_TTL);
  }

  private async computeDashboardStats(tenantId: string) {
    const [
      totalStudents,
      totalTeachers,
      totalCourses,
      activeCourses,
      pendingAssignments,
      totalMessages,
      unreadMessages,
    ] = await Promise.all([
      this.prisma.student.count({ where: { tenantId } }),
      this.prisma.teacher.count({ where: { tenantId } }),
      this.prisma.course.count({ where: { tenantId } }),
      this.prisma.course.count({
        where: { tenantId, status: 'active' }
      }),
      this.prisma.assignment.count({
        where: {
          course: { tenantId }
        }
      }),
      this.prisma.message.count({ where: { tenantId } }),
      // Unread messages count
      Promise.resolve(0),
    ]);

    return {
      students: {
        total: totalStudents,
        active: totalStudents,
      },
      teachers: {
        total: totalTeachers,
        active: totalTeachers,
      },
      courses: {
        total: totalCourses,
        active: activeCourses,
        inactive: totalCourses - activeCourses,
      },
      assignments: {
        pending: pendingAssignments,
      },
      messages: {
        total: totalMessages,
        unread: unreadMessages,
      },
    };
  }

  /**
   * Estadísticas de estudiantes
   */
  async getStudentAnalytics(tenantId: string) {
    const cacheKey = `analytics:students:${tenantId}`;

    return this.cacheService.getOrSet(cacheKey, async () => {
      return this.computeStudentAnalytics(tenantId);
    }, this.CACHE_TTL);
  }

  private async computeStudentAnalytics(tenantId: string) {
    const students = await this.prisma.student.findMany({
      where: { tenantId },
      include: {
        enrollments: {
          include: {
            course: true,
          },
        },
      },
    });

    const enrollmentCount = students.reduce(
      (acc, student) => acc + student.enrollments.length,
      0
    );

    return {
      totalStudents: students.length,
      totalEnrollments: enrollmentCount,
      averageEnrollmentsPerStudent: students.length > 0
        ? (enrollmentCount / students.length).toFixed(2)
        : 0,
      studentsByProgram: this.groupByField(students, 'program'),
    };
  }

  /**
   * Estadísticas de cursos
   */
  async getCourseAnalytics(tenantId: string) {
    const cacheKey = `analytics:courses:${tenantId}`;

    return this.cacheService.getOrSet(cacheKey, async () => {
      return this.computeCourseAnalytics(tenantId);
    }, this.CACHE_TTL);
  }

  private async computeCourseAnalytics(tenantId: string) {
    const courses = await this.prisma.course.findMany({
      where: { tenantId },
      include: {
        enrollments: true,
        assignments: true,
      },
    });

    const totalEnrollments = courses.reduce(
      (acc, course) => acc + course.enrollments.length,
      0
    );

    const totalAssignments = courses.reduce(
      (acc, course) => acc + course.assignments.length,
      0
    );

    return {
      totalCourses: courses.length,
      totalEnrollments,
      totalAssignments,
      averageEnrollmentsPerCourse: courses.length > 0
        ? (totalEnrollments / courses.length).toFixed(2)
        : 0,
      averageAssignmentsPerCourse: courses.length > 0
        ? (totalAssignments / courses.length).toFixed(2)
        : 0,
      coursesByStatus: {
        active: courses.filter(c => c.status === 'active').length,
        inactive: courses.filter(c => c.status !== 'active').length,
      },
    };
  }

  /**
   * Estadísticas de tareas y calificaciones
   */
  async getAssignmentAnalytics(tenantId: string) {
    const assignments = await this.prisma.assignment.findMany({
      where: {
        course: { tenantId },
      },
      include: {
        submissions: true,
      },
    });

    const totalSubmissions = assignments.reduce(
      (acc, assignment) => acc + assignment.submissions.length,
      0
    );

    const gradedSubmissions = assignments.reduce(
      (acc, assignment) =>
        acc + assignment.submissions.filter(s => s.grade !== null).length,
      0
    );

    return {
      totalAssignments: assignments.length,
      totalSubmissions,
      gradedSubmissions,
      pendingGrading: totalSubmissions - gradedSubmissions,
      submissionRate: assignments.length > 0
        ? ((totalSubmissions / assignments.length) * 100).toFixed(2)
        : 0,
      gradingProgress: totalSubmissions > 0
        ? ((gradedSubmissions / totalSubmissions) * 100).toFixed(2)
        : 0,
    };
  }

  /**
   * Estadísticas financieras
   */
  async getFinancialAnalytics(tenantId: string, startDate?: Date, endDate?: Date) {
    const whereClause: any = { tenantId };

    if (startDate && endDate) {
      whereClause.fecha = {
        gte: startDate,
        lte: endDate,
      };
    }

    const transactions = await this.prisma.transaction.findMany({
      where: whereClause,
    });

    const income = transactions
      .filter(t => t.tipo === 'INGRESO')
      .reduce((acc, t) => acc + t.monto, 0);

    const expenses = transactions
      .filter(t => t.tipo === 'EGRESO')
      .reduce((acc, t) => acc + t.monto, 0);

    const byCategory = transactions.reduce((acc, t) => {
      if (!acc[t.categoria]) {
        acc[t.categoria] = { income: 0, expenses: 0, total: 0 };
      }
      if (t.tipo === 'INGRESO') {
        acc[t.categoria].income += t.monto;
      } else {
        acc[t.categoria].expenses += t.monto;
      }
      acc[t.categoria].total = acc[t.categoria].income - acc[t.categoria].expenses;
      return acc;
    }, {});

    return {
      totalTransactions: transactions.length,
      income,
      expenses,
      balance: income - expenses,
      byCategory,
      averageTransactionAmount: transactions.length > 0
        ? (transactions.reduce((acc, t) => acc + t.monto, 0) / transactions.length).toFixed(2)
        : 0,
    };
  }

  /**
   * Tendencias mensuales
   */
  async getMonthlyTrends(tenantId: string, months: number = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const [students, enrollments, transactions] = await Promise.all([
      this.prisma.student.findMany({
        where: {
          tenantId,
          createdAt: { gte: startDate },
        },
        select: { createdAt: true },
      }),
      this.prisma.enrollment.findMany({
        where: {
          course: { tenantId },
          enrolledAt: { gte: startDate },
        },
        select: { enrolledAt: true },
      }),
      this.prisma.transaction.findMany({
        where: {
          tenantId,
          fecha: { gte: startDate },
        },
        select: { fecha: true, monto: true, tipo: true },
      }),
    ]);

    const monthlyData = {};

    // Process students
    students.forEach(s => {
      const month = s.createdAt.toISOString().substring(0, 7);
      if (!monthlyData[month]) monthlyData[month] = { students: 0, enrollments: 0, income: 0, expenses: 0 };
      monthlyData[month].students++;
    });

    // Process enrollments
    enrollments.forEach(e => {
      const month = e.enrolledAt.toISOString().substring(0, 7);
      if (!monthlyData[month]) monthlyData[month] = { students: 0, enrollments: 0, income: 0, expenses: 0 };
      monthlyData[month].enrollments++;
    });

    // Process transactions
    transactions.forEach(t => {
      const month = t.fecha.toISOString().substring(0, 7);
      if (!monthlyData[month]) monthlyData[month] = { students: 0, enrollments: 0, income: 0, expenses: 0 };
      if (t.tipo === 'INGRESO') {
        monthlyData[month].income += t.monto;
      } else {
        monthlyData[month].expenses += t.monto;
      }
    });

    return monthlyData;
  }

  /**
   * Reporte completo
   */
  async getCompleteReport(tenantId: string) {
    const [dashboard, students, courses, assignments, financial] = await Promise.all([
      this.getDashboardStats(tenantId),
      this.getStudentAnalytics(tenantId),
      this.getCourseAnalytics(tenantId),
      this.getAssignmentAnalytics(tenantId),
      this.getFinancialAnalytics(tenantId),
    ]);

    return {
      dashboard,
      students,
      courses,
      assignments,
      financial,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Helper: Agrupar por campo
   */
  private groupByField(items: any[], field: string): Record<string, number> {
    return items.reduce((acc, item) => {
      const key = item[field] || 'N/A';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Invalidate all analytics cache for a tenant
   */
  async invalidateCache(tenantId: string): Promise<void> {
    await this.cacheService.deletePattern(`analytics:*:${tenantId}`);
    this.logger.log(`Analytics cache invalidated for tenant: ${tenantId}`);
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    return this.cacheService.getStats();
  }
}
