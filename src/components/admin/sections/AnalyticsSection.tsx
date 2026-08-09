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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Vista general de estadísticas y métricas</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="3">Últimos 3 meses</option>
            <option value="6">Últimos 6 meses</option>
            <option value="12">Último año</option>
          </select>
          <button
            onClick={downloadExcelReport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FileDown className="w-4 h-4" />
            Excel
          </button>
          <button
            onClick={downloadPDFReport}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FileDown className="w-4 h-4" />
            PDF
          </button>
          <button
            onClick={downloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Analíticas de Estudiantes</h3>
            </div>
            <button
              onClick={downloadStudentExcel}
              className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
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

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-purple-600" />
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
                <span className="text-green-600">● Activos: {courseAnalytics?.coursesByStatus?.active || 0}</span>
                <span className="text-gray-400">● Inactivos: {courseAnalytics?.coursesByStatus?.inactive || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Analytics */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-semibold">Analíticas de Tareas</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{assignmentAnalytics?.totalAssignments || 0}</p>
            <p className="text-sm text-gray-600">Total Tareas</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{assignmentAnalytics?.totalSubmissions || 0}</p>
            <p className="text-sm text-gray-600">Entregas</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{assignmentAnalytics?.gradedSubmissions || 0}</p>
            <p className="text-sm text-gray-600">Calificadas</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600">{assignmentAnalytics?.pendingGrading || 0}</p>
            <p className="text-sm text-gray-600">Pendientes</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="flex gap-6">
            <div>
              <span className="text-sm text-gray-600">Tasa de Entrega:</span>
              <span className="ml-2 font-semibold text-blue-600">{assignmentAnalytics?.submissionRate || 0}%</span>
            </div>
            <div>
              <span className="text-sm text-gray-600">Progreso de Calificación:</span>
              <span className="ml-2 font-semibold text-green-600">{assignmentAnalytics?.gradingProgress || 0}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Analytics */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold">Analíticas Financieras</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadFinancialExcel}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <FileDown className="w-4 h-4" />
              Excel
            </button>
            <button
              onClick={downloadFinancialPDF}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              <FileDown className="w-4 h-4" />
              PDF
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-600">Ingresos</p>
            <p className="text-2xl font-bold text-green-600">
              ${financialAnalytics?.income?.toLocaleString() || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Egresos</p>
            <p className="text-2xl font-bold text-red-600">
              ${financialAnalytics?.expenses?.toLocaleString() || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Balance</p>
            <p className={`text-2xl font-bold ${(financialAnalytics?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${financialAnalytics?.balance?.toLocaleString() || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Transacciones</p>
            <p className="text-2xl font-bold text-gray-900">{financialAnalytics?.totalTransactions || 0}</p>
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Tendencias Mensuales</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mes</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiantes</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inscripciones</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ingresos</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Egresos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {monthlyTrends && Object.entries(monthlyTrends).map(([month, data]: [string, any]) => (
                <tr key={month} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{month}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{data.students || 0}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{data.enrollments || 0}</td>
                  <td className="px-4 py-3 text-sm text-green-600">${(data.income || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-red-600">${(data.expenses || 0).toLocaleString()}</td>
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
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  const TrendIcon = trending === 'up' ? TrendingUp : TrendingDown;
  const trendColor = trending === 'up' ? 'text-green-600' : 'text-red-600';

  return (
    <div className="bg-white rounded-lg shadow p-6">
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
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600 mt-1">{title}</p>
      </div>
    </div>
  );
}

// Componente de fila de métrica
function MetricRow({ label, value, suffix = '' }: any) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">{value}{suffix}</span>
    </div>
  );
}
