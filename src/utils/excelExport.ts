import * as XLSX from 'xlsx';

interface AnalyticsData {
  dashboard?: any;
  students?: any;
  courses?: any;
  assignments?: any;
  financial?: any;
  generatedAt?: string;
}

/**
 * Generate complete analytics report in Excel format with multiple sheets
 */
export const generateAnalyticsExcel = (data: AnalyticsData) => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Dashboard Overview
  if (data.dashboard) {
    const dashboardData = [
      ['VirtualUni Platform - Reporte de Analytics'],
      ['Generado:', data.generatedAt ? new Date(data.generatedAt).toLocaleString('es-ES') : new Date().toLocaleString('es-ES')],
      [],
      ['Categoría', 'Total', 'Activos', 'Inactivos'],
      ['Estudiantes', data.dashboard.students?.total || 0, data.dashboard.students?.active || 0, '-'],
      ['Docentes', data.dashboard.teachers?.total || 0, data.dashboard.teachers?.active || 0, '-'],
      ['Cursos', data.dashboard.courses?.total || 0, data.dashboard.courses?.active || 0, data.dashboard.courses?.inactive || 0],
      [],
      ['Tareas Pendientes', data.dashboard.assignments?.pending || 0],
      ['Mensajes Totales', data.dashboard.messages?.total || 0],
      ['Mensajes No Leídos', data.dashboard.messages?.unread || 0],
    ];

    const dashboardSheet = XLSX.utils.aoa_to_sheet(dashboardData);

    // Set column widths
    dashboardSheet['!cols'] = [
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 }
    ];

    XLSX.utils.book_append_sheet(workbook, dashboardSheet, 'Dashboard');
  }

  // Sheet 2: Student Analytics
  if (data.students) {
    const studentData = [
      ['Analíticas de Estudiantes'],
      [],
      ['Métrica', 'Valor'],
      ['Total de Estudiantes', data.students.totalStudents || 0],
      ['Total de Inscripciones', data.students.totalEnrollments || 0],
      ['Promedio de Inscripciones por Estudiante', data.students.averageEnrollmentsPerStudent || 0],
      [],
      ['Distribución por Programa'],
    ];

    // Add program distribution if available
    if (data.students.studentsByProgram) {
      studentData.push(['Programa', 'Cantidad']);
      Object.entries(data.students.studentsByProgram).forEach(([program, count]) => {
        studentData.push([program, count as number]);
      });
    }

    const studentSheet = XLSX.utils.aoa_to_sheet(studentData);
    studentSheet['!cols'] = [{ wch: 35 }, { wch: 20 }];

    XLSX.utils.book_append_sheet(workbook, studentSheet, 'Estudiantes');
  }

  // Sheet 3: Course Analytics
  if (data.courses) {
    const courseData = [
      ['Analíticas de Cursos'],
      [],
      ['Métrica', 'Valor'],
      ['Total de Cursos', data.courses.totalCourses || 0],
      ['Total de Inscripciones', data.courses.totalEnrollments || 0],
      ['Total de Tareas', data.courses.totalAssignments || 0],
      ['Promedio de Inscripciones por Curso', data.courses.averageEnrollmentsPerCourse || 0],
      ['Promedio de Tareas por Curso', data.courses.averageAssignmentsPerCourse || 0],
      [],
      ['Distribución por Estado'],
      ['Estado', 'Cantidad'],
      ['Activos', data.courses.coursesByStatus?.active || 0],
      ['Inactivos', data.courses.coursesByStatus?.inactive || 0],
    ];

    const courseSheet = XLSX.utils.aoa_to_sheet(courseData);
    courseSheet['!cols'] = [{ wch: 35 }, { wch: 20 }];

    XLSX.utils.book_append_sheet(workbook, courseSheet, 'Cursos');
  }

  // Sheet 4: Assignment Analytics
  if (data.assignments) {
    const assignmentData = [
      ['Analíticas de Tareas'],
      [],
      ['Métrica', 'Valor'],
      ['Total de Tareas', data.assignments.totalAssignments || 0],
      ['Total de Entregas', data.assignments.totalSubmissions || 0],
      ['Entregas Calificadas', data.assignments.gradedSubmissions || 0],
      ['Pendientes de Calificar', data.assignments.pendingGrading || 0],
      ['Tasa de Entrega (%)', data.assignments.submissionRate || 0],
      ['Progreso de Calificación (%)', data.assignments.gradingProgress || 0],
    ];

    const assignmentSheet = XLSX.utils.aoa_to_sheet(assignmentData);
    assignmentSheet['!cols'] = [{ wch: 35 }, { wch: 20 }];

    XLSX.utils.book_append_sheet(workbook, assignmentSheet, 'Tareas');
  }

  // Sheet 5: Financial Analytics
  if (data.financial) {
    const financialData = [
      ['Analíticas Financieras'],
      [],
      ['Métrica', 'Valor'],
      ['Total de Transacciones', data.financial.totalTransactions || 0],
      ['Ingresos Totales', data.financial.income || 0],
      ['Egresos Totales', data.financial.expenses || 0],
      ['Balance', data.financial.balance || 0],
      ['Promedio por Transacción', data.financial.averageTransactionAmount || 0],
      [],
      ['Desglose por Categoría'],
    ];

    // Add category breakdown if available
    if (data.financial.byCategory) {
      financialData.push(['Categoría', 'Ingresos', 'Egresos', 'Total']);
      Object.entries(data.financial.byCategory).forEach(([category, values]: [string, any]) => {
        financialData.push([
          category,
          values.income || 0,
          values.expenses || 0,
          values.total || 0
        ]);
      });
    }

    const financialSheet = XLSX.utils.aoa_to_sheet(financialData);
    financialSheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];

    XLSX.utils.book_append_sheet(workbook, financialSheet, 'Finanzas');
  }

  // Generate and download the file
  const fileName = `analytics-report-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

/**
 * Generate financial report with monthly trends in Excel
 */
export const generateFinancialExcel = (financialData: any, monthlyTrends: any) => {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Financial Summary
  const summaryData = [
    ['Reporte Financiero - VirtualUni'],
    ['Generado:', new Date().toLocaleString('es-ES')],
    [],
    ['Resumen Financiero'],
    ['Concepto', 'Monto'],
    ['Ingresos Totales', financialData?.income || 0],
    ['Egresos Totales', financialData?.expenses || 0],
    ['Balance', financialData?.balance || 0],
    ['Total de Transacciones', financialData?.totalTransactions || 0],
    ['Promedio por Transacción', financialData?.averageTransactionAmount || 0],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 30 }, { wch: 20 }];

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');

  // Sheet 2: Monthly Trends
  if (monthlyTrends) {
    const trendsData = [
      ['Tendencias Mensuales'],
      [],
      ['Mes', 'Nuevos Estudiantes', 'Inscripciones', 'Ingresos', 'Egresos', 'Balance'],
    ];

    Object.entries(monthlyTrends)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([month, data]: [string, any]) => {
        trendsData.push([
          month,
          data.students || 0,
          data.enrollments || 0,
          data.income || 0,
          data.expenses || 0,
          (data.income || 0) - (data.expenses || 0)
        ]);
      });

    const trendsSheet = XLSX.utils.aoa_to_sheet(trendsData);
    trendsSheet['!cols'] = [
      { wch: 12 },
      { wch: 18 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 }
    ];

    XLSX.utils.book_append_sheet(workbook, trendsSheet, 'Tendencias Mensuales');
  }

  // Sheet 3: Category Breakdown
  if (financialData?.byCategory) {
    const categoryData = [
      ['Desglose por Categoría'],
      [],
      ['Categoría', 'Ingresos', 'Egresos', 'Balance'],
    ];

    Object.entries(financialData.byCategory).forEach(([category, values]: [string, any]) => {
      categoryData.push([
        category,
        values.income || 0,
        values.expenses || 0,
        values.total || 0
      ]);
    });

    const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
    categorySheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];

    XLSX.utils.book_append_sheet(workbook, categorySheet, 'Por Categoría');
  }

  // Generate and download
  const fileName = `financial-report-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

/**
 * Generate student report with enrollments in Excel
 */
export const generateStudentExcel = (studentAnalytics: any) => {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Student Summary
  const summaryData = [
    ['Reporte de Estudiantes - VirtualUni'],
    ['Generado:', new Date().toLocaleString('es-ES')],
    [],
    ['Resumen'],
    ['Métrica', 'Valor'],
    ['Total de Estudiantes', studentAnalytics?.totalStudents || 0],
    ['Total de Inscripciones', studentAnalytics?.totalEnrollments || 0],
    ['Promedio de Inscripciones por Estudiante', studentAnalytics?.averageEnrollmentsPerStudent || 0],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 35 }, { wch: 20 }];

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');

  // Sheet 2: Program Distribution
  if (studentAnalytics?.studentsByProgram) {
    const programData = [
      ['Distribución por Programa'],
      [],
      ['Programa', 'Cantidad de Estudiantes', 'Porcentaje'],
    ];

    const total = studentAnalytics.totalStudents || 0;
    Object.entries(studentAnalytics.studentsByProgram).forEach(([program, count]: [string, any]) => {
      const percentage = total > 0 ? ((count / total) * 100).toFixed(2) : 0;
      programData.push([program, count, `${percentage}%`]);
    });

    const programSheet = XLSX.utils.aoa_to_sheet(programData);
    programSheet['!cols'] = [{ wch: 30 }, { wch: 25 }, { wch: 15 }];

    XLSX.utils.book_append_sheet(workbook, programSheet, 'Por Programa');
  }

  // Generate and download
  const fileName = `student-report-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
