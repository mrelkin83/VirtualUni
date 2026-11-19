import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  DollarSign,
  FileText,
  BarChart3,
  Download,
  FileDown
} from 'lucide-react';
import { analyticsApi } from '../../../api/endpoints/analytics';
import {
  StudentEnrollmentChart,
  FinancialTrendsChart,
  CourseDistributionChart
} from '../charts';
import { generateAnalyticsPDF, generateFinancialPDF } from '../../../utils/pdfExport';
import { generateAnalyticsExcel, generateFinancialExcel, generateStudentExcel } from '../../../utils/excelExport';

export function AnalyticsSection() {
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [studentAnalytics, setStudentAnalytics] = useState<any>(null);
  const [courseAnalytics, setCourseAnalytics] = useState<any>(null);
  const [assignmentAnalytics, setAssignmentAnalytics] = useState<any>(null);
  const [financialAnalytics, setFinancialAnalytics] = useState<any>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('6');

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [dashboard, students, courses, assignments, financial, trends] = await Promise.all([
        analyticsApi.getDashboardStats(),
        analyticsApi.getStudentAnalytics(),
        analyticsApi.getCourseAnalytics(),
        analyticsApi.getAssignmentAnalytics(),
        analyticsApi.getFinancialAnalytics(),
        analyticsApi.getMonthlyTrends(parseInt(selectedPeriod)),
      ]);

      setDashboardStats(dashboard);
      setStudentAnalytics(students);
      setCourseAnalytics(courses);
      setAssignmentAnalytics(assignments);
      setFinancialAnalytics(financial);
      setMonthlyTrends(trends);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    try {
      const report = await analyticsApi.getCompleteReport();
      const dataStr = JSON.stringify(report, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

      const exportFileDefaultName = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const downloadPDFReport = async () => {
    try {
      const report = await analyticsApi.getCompleteReport();
      generateAnalyticsPDF(report);
    } catch (error) {
      console.error('Error generating PDF report:', error);
    }
  };

  const downloadFinancialPDF = () => {
    try {
      generateFinancialPDF(financialAnalytics, monthlyTrends);
    } catch (error) {
      console.error('Error generating financial PDF:', error);
    }
  };

  const downloadExcelReport = async () => {
    try {
      const report = await analyticsApi.getCompleteReport();
      generateAnalyticsExcel(report);
    } catch (error) {
      console.error('Error generating Excel report:', error);
    }
  };

  const downloadFinancialExcel = () => {
    try {
      generateFinancialExcel(financialAnalytics, monthlyTrends);
    } catch (error) {
      console.error('Error generating financial Excel:', error);
    }
  };

  const downloadStudentExcel = () => {
    try {
      generateStudentExcel(studentAnalytics);
    } catch (error) {
      console.error('Error generating student Excel:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pn-accent-line"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-pn-ink">Analytics Dashboard</h2>
          <p className="text-pn-ink-2">Vista general de estadísticas y métricas</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-pn-line rounded-lg focus:ring-2 focus:ring-pn-accent"
          >
            <option value="3">Últimos 3 meses</option>
            <option value="6">Últimos 6 meses</option>
            <option value="12">Último año</option>
          </select>
          <button
            onClick={downloadExcelReport}
            className="flex items-center gap-2 px-4 py-2 bg-pn-ok text-pn-surface rounded-lg hover:bg-pn-ok transition-colors"
          >
            <FileDown className="w-4 h-4" />
            Excel
          </button>
          <button
            onClick={downloadPDFReport}
            className="flex items-center gap-2 px-4 py-2 bg-pn-danger text-pn-surface rounded-lg hover:bg-pn-danger transition-colors"
          >
            <FileDown className="w-4 h-4" />
            PDF
          </button>
          <button
            onClick={downloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-pn-accent text-pn-accent-ink rounded-lg hover:bg-pn-accent-hover transition-colors"
          >
            <Download className="w-4 h-4" />
            JSON
          </button>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Estudiantes"
          value={dashboardStats?.students?.total || 0}
          change="+12%"
          trending="up"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Docentes"
          value={dashboardStats?.teachers?.total || 0}
          change="+5%"
          trending="up"
          icon={Users}
          color="green"
        />
        <StatCard
          title="Cursos Activos"
          value={dashboardStats?.courses?.active || 0}
          change="-2%"
          trending="down"
          icon={BookOpen}
          color="purple"
        />
        <StatCard
          title="Tareas Pendientes"
          value={dashboardStats?.assignments?.pending || 0}
          change="+8%"
          trending="up"
          icon={FileText}
          color="orange"
        />
      </div>

      {/* Charts Section */}
      <StudentEnrollmentChart data={monthlyTrends} />

      <FinancialTrendsChart data={monthlyTrends} />

      <CourseDistributionChart
        courseAnalytics={courseAnalytics}
        assignmentAnalytics={assignmentAnalytics}
      />

      {/* Student Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-pn-surface rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-pn-accent-text" />
              <h3 className="text-lg font-semibold">Analíticas de Estudiantes</h3>
            </div>
            <button
              onClick={downloadStudentExcel}
              className="flex items-center gap-1 px-2 py-1 bg-pn-accent text-pn-accent-ink text-xs rounded hover:bg-pn-accent-hover transition-colors"
            >
              <FileDown className="w-3 h-3" />
              Excel
            </button>
          </div>
          <div className="space-y-3">
            <MetricRow
              label="Total de Estudiantes"
              value={studentAnalytics?.totalStudents || 0}
            />
            <MetricRow
              label="Total Inscripciones"
              value={studentAnalytics?.totalEnrollments || 0}
            />
            <MetricRow
              label="Promedio por Estudiante"
              value={studentAnalytics?.averageEnrollmentsPerStudent || 0}
              suffix=" cursos"
            />
          </div>
        </div>

        <div className="bg-pn-surface rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-pn-accent-2-text" />
            <h3 className="text-lg font-semibold">Analíticas de Cursos</h3>
          </div>
          <div className="space-y-3">
            <MetricRow
              label="Total de Cursos"
              value={courseAnalytics?.totalCourses || 0}
            />
            <MetricRow
              label="Total Inscripciones"
              value={courseAnalytics?.totalEnrollments || 0}
            />
            <MetricRow
              label="Promedio por Curso"
              value={courseAnalytics?.averageEnrollmentsPerCourse || 0}
              suffix=" estudiantes"
            />
            <div className="pt-2 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-pn-ok">● Activos: {courseAnalytics?.coursesByStatus?.active || 0}</span>
                <span className="text-pn-muted">● Inactivos: {courseAnalytics?.coursesByStatus?.inactive || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Analytics */}
      <div className="bg-pn-surface rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-pn-warn" />
          <h3 className="text-lg font-semibold">Analíticas de Tareas</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-pn-ink">{assignmentAnalytics?.totalAssignments || 0}</p>
            <p className="text-sm text-pn-ink-2">Total Tareas</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-pn-accent-text">{assignmentAnalytics?.totalSubmissions || 0}</p>
            <p className="text-sm text-pn-ink-2">Entregas</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-pn-ok">{assignmentAnalytics?.gradedSubmissions || 0}</p>
            <p className="text-sm text-pn-ink-2">Calificadas</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-pn-warn">{assignmentAnalytics?.pendingGrading || 0}</p>
            <p className="text-sm text-pn-ink-2">Pendientes</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="flex gap-6">
            <div>
              <span className="text-sm text-pn-ink-2">Tasa de Entrega:</span>
              <span className="ml-2 font-semibold text-pn-accent-text">{assignmentAnalytics?.submissionRate || 0}%</span>
            </div>
            <div>
              <span className="text-sm text-pn-ink-2">Progreso de Calificación:</span>
              <span className="ml-2 font-semibold text-pn-ok">{assignmentAnalytics?.gradingProgress || 0}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Analytics */}
      <div className="bg-pn-surface rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-pn-ok" />
            <h3 className="text-lg font-semibold">Analíticas Financieras</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadFinancialExcel}
              className="flex items-center gap-2 px-3 py-1.5 bg-pn-ok text-pn-surface text-sm rounded-lg hover:bg-pn-ok transition-colors"
            >
              <FileDown className="w-4 h-4" />
              Excel
            </button>
            <button
              onClick={downloadFinancialPDF}
              className="flex items-center gap-2 px-3 py-1.5 bg-pn-ok text-pn-surface text-sm rounded-lg hover:bg-pn-ok transition-colors"
            >
              <FileDown className="w-4 h-4" />
              PDF
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-pn-ink-2">Ingresos</p>
            <p className="text-2xl font-bold text-pn-ok">
              ${financialAnalytics?.income?.toLocaleString() || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-pn-ink-2">Egresos</p>
            <p className="text-2xl font-bold text-pn-danger">
              ${financialAnalytics?.expenses?.toLocaleString() || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-pn-ink-2">Balance</p>
            <p className={`text-2xl font-bold ${(financialAnalytics?.balance || 0) >= 0 ? 'text-pn-ok' : 'text-pn-danger'}`}>
              ${financialAnalytics?.balance?.toLocaleString() || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-pn-ink-2">Total Transacciones</p>
            <p className="text-2xl font-bold text-pn-ink">{financialAnalytics?.totalTransactions || 0}</p>
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-pn-surface rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-pn-accent-text" />
          <h3 className="text-lg font-semibold">Tendencias Mensuales</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-pn-line">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-pn-muted uppercase">Mes</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-pn-muted uppercase">Estudiantes</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-pn-muted uppercase">Inscripciones</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-pn-muted uppercase">Ingresos</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-pn-muted uppercase">Egresos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pn-line">
              {monthlyTrends && Object.entries(monthlyTrends).map(([month, data]: [string, any]) => (
                <tr key={month} className="hover:bg-pn-surface-2">
                  <td className="px-4 py-3 text-sm font-medium text-pn-ink">{month}</td>
                  <td className="px-4 py-3 text-sm text-pn-ink-2">{data.students || 0}</td>
                  <td className="px-4 py-3 text-sm text-pn-ink-2">{data.enrollments || 0}</td>
                  <td className="px-4 py-3 text-sm text-pn-ok">${(data.income || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-pn-danger">${(data.expenses || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Componente de tarjeta de estadística
function StatCard({ title, value, change, trending, icon: Icon, color }: any) {
  const colorClasses = {
    blue: 'bg-pn-accent-soft text-pn-accent-text',
    green: 'bg-pn-ok-soft text-pn-ok',
    purple: 'bg-pn-accent-2-soft text-pn-accent-2-text',
    orange: 'bg-pn-warn-soft text-pn-warn',
  };

  const TrendIcon = trending === 'up' ? TrendingUp : TrendingDown;
  const trendColor = trending === 'up' ? 'text-pn-ok' : 'text-pn-danger';

  return (
    <div className="bg-pn-surface rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
          <TrendIcon className="w-4 h-4" />
          <span>{change}</span>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-pn-ink">{value}</p>
        <p className="text-sm text-pn-ink-2 mt-1">{title}</p>
      </div>
    </div>
  );
}

// Componente de fila de métrica
function MetricRow({ label, value, suffix = '' }: any) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-pn-ink-2">{label}</span>
      <span className="font-semibold text-pn-ink">{value}{suffix}</span>
    </div>
  );
}
