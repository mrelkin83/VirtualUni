import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../common/prisma/prisma.service';

export enum AlertType {
  HIGH_PENDING_ASSIGNMENTS = 'HIGH_PENDING_ASSIGNMENTS',
  LOW_SUBMISSION_RATE = 'LOW_SUBMISSION_RATE',
  NEGATIVE_BALANCE = 'NEGATIVE_BALANCE',
  HIGH_UNGRADED_SUBMISSIONS = 'HIGH_UNGRADED_SUBMISSIONS',
  LOW_COURSE_ENROLLMENT = 'LOW_COURSE_ENROLLMENT',
  SYSTEM_PERFORMANCE = 'SYSTEM_PERFORMANCE',
}

export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

export interface Alert {
  id: string;
  tenantId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  data?: any;
  createdAt: Date;
  read: boolean;
}

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);
  private alerts: Map<string, Alert[]> = new Map();

  // Thresholds
  private readonly THRESHOLDS = {
    HIGH_PENDING_ASSIGNMENTS: 20,
    LOW_SUBMISSION_RATE: 50, // percentage
    HIGH_UNGRADED_PERCENTAGE: 30, // percentage
    LOW_ENROLLMENT_PER_COURSE: 5,
  };

  constructor(private prisma: PrismaService) {}

  /**
   * Run alert checks every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleHourlyAlertCheck() {
    this.logger.log('Running hourly alert checks...');

    try {
      // Get all active tenants
      const tenants = await this.prisma.tenant.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true, name: true },
      });

      for (const tenant of tenants) {
        await this.checkAlertsForTenant(tenant.id);
      }

      this.logger.log(`Alert check completed for ${tenants.length} tenants`);
    } catch (error) {
      this.logger.error('Error during alert check:', error);
    }
  }

  /**
   * Check all alerts for a specific tenant
   */
  async checkAlertsForTenant(tenantId: string): Promise<Alert[]> {
    const newAlerts: Alert[] = [];

    // Check pending assignments
    const pendingAssignmentsAlert = await this.checkPendingAssignments(tenantId);
    if (pendingAssignmentsAlert) newAlerts.push(pendingAssignmentsAlert);

    // Check submission rate
    const submissionRateAlert = await this.checkSubmissionRate(tenantId);
    if (submissionRateAlert) newAlerts.push(submissionRateAlert);

    // Check financial balance
    const balanceAlert = await this.checkFinancialBalance(tenantId);
    if (balanceAlert) newAlerts.push(balanceAlert);

    // Check ungraded submissions
    const ungradedAlert = await this.checkUngradedSubmissions(tenantId);
    if (ungradedAlert) newAlerts.push(ungradedAlert);

    // Check course enrollment
    const enrollmentAlert = await this.checkCourseEnrollment(tenantId);
    if (enrollmentAlert) newAlerts.push(enrollmentAlert);

    // Store alerts
    if (newAlerts.length > 0) {
      const existingAlerts = this.alerts.get(tenantId) || [];
      this.alerts.set(tenantId, [...existingAlerts, ...newAlerts]);
      this.logger.log(`Generated ${newAlerts.length} alerts for tenant ${tenantId}`);
    }

    return newAlerts;
  }

  /**
   * Check for high number of pending assignments
   */
  private async checkPendingAssignments(tenantId: string): Promise<Alert | null> {
    const count = await this.prisma.assignment.count({
      where: {
        course: { tenantId },
        dueDate: { lt: new Date() },
      },
    });

    if (count >= this.THRESHOLDS.HIGH_PENDING_ASSIGNMENTS) {
      return {
        id: this.generateAlertId(),
        tenantId,
        type: AlertType.HIGH_PENDING_ASSIGNMENTS,
        severity: count >= 50 ? AlertSeverity.CRITICAL : AlertSeverity.WARNING,
        title: 'Alto número de tareas vencidas',
        message: `Hay ${count} tareas que han pasado su fecha de entrega.`,
        data: { count },
        createdAt: new Date(),
        read: false,
      };
    }

    return null;
  }

  /**
   * Check for low submission rate
   */
  private async checkSubmissionRate(tenantId: string): Promise<Alert | null> {
    const assignments = await this.prisma.assignment.findMany({
      where: { course: { tenantId } },
      include: { submissions: true },
    });

    if (assignments.length === 0) return null;

    const totalAssignments = assignments.length;
    const totalSubmissions = assignments.reduce(
      (acc, a) => acc + a.submissions.length,
      0,
    );

    const submissionRate = (totalSubmissions / totalAssignments) * 100;

    if (submissionRate < this.THRESHOLDS.LOW_SUBMISSION_RATE) {
      return {
        id: this.generateAlertId(),
        tenantId,
        type: AlertType.LOW_SUBMISSION_RATE,
        severity: submissionRate < 30 ? AlertSeverity.CRITICAL : AlertSeverity.WARNING,
        title: 'Baja tasa de entrega de tareas',
        message: `La tasa de entrega es del ${submissionRate.toFixed(1)}%, por debajo del objetivo del 50%.`,
        data: { submissionRate: submissionRate.toFixed(1), totalAssignments, totalSubmissions },
        createdAt: new Date(),
        read: false,
      };
    }

    return null;
  }

  /**
   * Check for negative financial balance
   */
  private async checkFinancialBalance(tenantId: string): Promise<Alert | null> {
    const transactions = await this.prisma.transaction.findMany({
      where: { tenantId },
    });

    const income = transactions
      .filter(t => t.tipo === 'INGRESO')
      .reduce((acc, t) => acc + t.monto, 0);

    const expenses = transactions
      .filter(t => t.tipo === 'EGRESO')
      .reduce((acc, t) => acc + t.monto, 0);

    const balance = income - expenses;

    if (balance < 0) {
      return {
        id: this.generateAlertId(),
        tenantId,
        type: AlertType.NEGATIVE_BALANCE,
        severity: balance < -10000 ? AlertSeverity.CRITICAL : AlertSeverity.WARNING,
        title: 'Balance financiero negativo',
        message: `El balance actual es de $${balance.toLocaleString()}. Se recomienda revisar las finanzas.`,
        data: { balance, income, expenses },
        createdAt: new Date(),
        read: false,
      };
    }

    return null;
  }

  /**
   * Check for high percentage of ungraded submissions
   */
  private async checkUngradedSubmissions(tenantId: string): Promise<Alert | null> {
    const assignments = await this.prisma.assignment.findMany({
      where: { course: { tenantId } },
      include: { submissions: true },
    });

    const totalSubmissions = assignments.reduce(
      (acc, a) => acc + a.submissions.length,
      0,
    );

    if (totalSubmissions === 0) return null;

    const ungradedSubmissions = assignments.reduce(
      (acc, a) => acc + a.submissions.filter(s => s.grade === null).length,
      0,
    );

    const ungradedPercentage = (ungradedSubmissions / totalSubmissions) * 100;

    if (ungradedPercentage >= this.THRESHOLDS.HIGH_UNGRADED_PERCENTAGE) {
      return {
        id: this.generateAlertId(),
        tenantId,
        type: AlertType.HIGH_UNGRADED_SUBMISSIONS,
        severity: ungradedPercentage >= 50 ? AlertSeverity.CRITICAL : AlertSeverity.WARNING,
        title: 'Muchas tareas sin calificar',
        message: `El ${ungradedPercentage.toFixed(1)}% de las entregas (${ungradedSubmissions} de ${totalSubmissions}) están pendientes de calificación.`,
        data: { ungradedPercentage: ungradedPercentage.toFixed(1), ungradedSubmissions, totalSubmissions },
        createdAt: new Date(),
        read: false,
      };
    }

    return null;
  }

  /**
   * Check for courses with low enrollment
   */
  private async checkCourseEnrollment(tenantId: string): Promise<Alert | null> {
    const courses = await this.prisma.course.findMany({
      where: { tenantId, status: 'active' },
      include: { enrollments: true },
    });

    const lowEnrollmentCourses = courses.filter(
      c => c.enrollments.length < this.THRESHOLDS.LOW_ENROLLMENT_PER_COURSE,
    );

    if (lowEnrollmentCourses.length > 0) {
      return {
        id: this.generateAlertId(),
        tenantId,
        type: AlertType.LOW_COURSE_ENROLLMENT,
        severity: AlertSeverity.INFO,
        title: 'Cursos con baja inscripción',
        message: `${lowEnrollmentCourses.length} curso(s) activo(s) tienen menos de ${this.THRESHOLDS.LOW_ENROLLMENT_PER_COURSE} estudiantes inscritos.`,
        data: {
          count: lowEnrollmentCourses.length,
          courses: lowEnrollmentCourses.map(c => ({ id: c.id, name: c.name, enrollments: c.enrollments.length })),
        },
        createdAt: new Date(),
        read: false,
      };
    }

    return null;
  }

  /**
   * Get all alerts for a tenant
   */
  getAlerts(tenantId: string, onlyUnread: boolean = false): Alert[] {
    const alerts = this.alerts.get(tenantId) || [];

    if (onlyUnread) {
      return alerts.filter(a => !a.read);
    }

    return alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get unread count
   */
  getUnreadCount(tenantId: string): number {
    const alerts = this.alerts.get(tenantId) || [];
    return alerts.filter(a => !a.read).length;
  }

  /**
   * Mark alert as read
   */
  markAsRead(tenantId: string, alertId: string): boolean {
    const alerts = this.alerts.get(tenantId);
    if (!alerts) return false;

    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      alert.read = true;
      return true;
    }

    return false;
  }

  /**
   * Mark all alerts as read
   */
  markAllAsRead(tenantId: string): number {
    const alerts = this.alerts.get(tenantId);
    if (!alerts) return 0;

    let count = 0;
    alerts.forEach(alert => {
      if (!alert.read) {
        alert.read = true;
        count++;
      }
    });

    return count;
  }

  /**
   * Delete an alert
   */
  deleteAlert(tenantId: string, alertId: string): boolean {
    const alerts = this.alerts.get(tenantId);
    if (!alerts) return false;

    const index = alerts.findIndex(a => a.id === alertId);
    if (index !== -1) {
      alerts.splice(index, 1);
      return true;
    }

    return false;
  }

  /**
   * Clear all alerts for a tenant
   */
  clearAlerts(tenantId: string): void {
    this.alerts.delete(tenantId);
  }

  /**
   * Generate unique alert ID
   */
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get alert statistics
   */
  getStats(tenantId: string) {
    const alerts = this.alerts.get(tenantId) || [];

    return {
      total: alerts.length,
      unread: alerts.filter(a => !a.read).length,
      bySeverity: {
        info: alerts.filter(a => a.severity === AlertSeverity.INFO).length,
        warning: alerts.filter(a => a.severity === AlertSeverity.WARNING).length,
        critical: alerts.filter(a => a.severity === AlertSeverity.CRITICAL).length,
      },
      byType: {
        highPendingAssignments: alerts.filter(a => a.type === AlertType.HIGH_PENDING_ASSIGNMENTS).length,
        lowSubmissionRate: alerts.filter(a => a.type === AlertType.LOW_SUBMISSION_RATE).length,
        negativeBalance: alerts.filter(a => a.type === AlertType.NEGATIVE_BALANCE).length,
        highUngradedSubmissions: alerts.filter(a => a.type === AlertType.HIGH_UNGRADED_SUBMISSIONS).length,
        lowCourseEnrollment: alerts.filter(a => a.type === AlertType.LOW_COURSE_ENROLLMENT).length,
      },
    };
  }
}
