import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AnalyticsData {
  dashboard?: any;
  students?: any;
  courses?: any;
  assignments?: any;
  financial?: any;
  generatedAt?: string;
}

export const generateAnalyticsPDF = (data: AnalyticsData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Header
  doc.setFontSize(22);
  doc.setTextColor(37, 99, 235); // Blue color
  doc.text('VirtualUni Platform', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 10;
  doc.setFontSize(16);
  doc.setTextColor(75, 85, 99); // Gray color
  doc.text('Reporte de Analytics', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 8;
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  const dateStr = data.generatedAt
    ? new Date(data.generatedAt).toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : new Date().toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
  doc.text(`Generado: ${dateStr}`, pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 15;

  // Dashboard Stats
  if (data.dashboard) {
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text('Estadísticas Generales', 14, yPosition);
    yPosition += 8;

    autoTable(doc, {
      startY: yPosition,
      head: [['Categoría', 'Total', 'Activos']],
      body: [
        ['Estudiantes', data.dashboard.students?.total || 0, data.dashboard.students?.active || 0],
        ['Docentes', data.dashboard.teachers?.total || 0, data.dashboard.teachers?.active || 0],
        ['Cursos', data.dashboard.courses?.total || 0, data.dashboard.courses?.active || 0],
      ],
      headStyles: { fillColor: [37, 99, 235], textColor: 255 },
      styles: { fontSize: 10 },
      margin: { left: 14, right: 14 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Student Analytics
  if (data.students && yPosition < pageHeight - 40) {
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text('Analíticas de Estudiantes', 14, yPosition);
    yPosition += 8;

    autoTable(doc, {
      startY: yPosition,
      head: [['Métrica', 'Valor']],
      body: [
        ['Total de Estudiantes', data.students.totalStudents || 0],
        ['Total de Inscripciones', data.students.totalEnrollments || 0],
        ['Promedio por Estudiante', data.students.averageEnrollmentsPerStudent || 0],
      ],
      headStyles: { fillColor: [37, 99, 235], textColor: 255 },
      styles: { fontSize: 10 },
      margin: { left: 14, right: 14 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Course Analytics
  if (data.courses && yPosition < pageHeight - 40) {
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text('Analíticas de Cursos', 14, yPosition);
    yPosition += 8;

    autoTable(doc, {
      startY: yPosition,
      head: [['Métrica', 'Valor']],
      body: [
        ['Total de Cursos', data.courses.totalCourses || 0],
        ['Total de Inscripciones', data.courses.totalEnrollments || 0],
        ['Promedio por Curso', data.courses.averageEnrollmentsPerCourse || 0],
        ['Cursos Activos', data.courses.coursesByStatus?.active || 0],
        ['Cursos Inactivos', data.courses.coursesByStatus?.inactive || 0],
      ],
      headStyles: { fillColor: [139, 92, 246], textColor: 255 },
      styles: { fontSize: 10 },
      margin: { left: 14, right: 14 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Check if we need a new page
  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = 20;
  }

  // Assignment Analytics
  if (data.assignments) {
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text('Analíticas de Tareas', 14, yPosition);
    yPosition += 8;

    autoTable(doc, {
      startY: yPosition,
      head: [['Métrica', 'Valor']],
      body: [
        ['Total de Tareas', data.assignments.totalAssignments || 0],
        ['Total de Entregas', data.assignments.totalSubmissions || 0],
        ['Entregas Calificadas', data.assignments.gradedSubmissions || 0],
        ['Pendientes de Calificar', data.assignments.pendingGrading || 0],
        ['Tasa de Entrega', `${data.assignments.submissionRate || 0}%`],
        ['Progreso de Calificación', `${data.assignments.gradingProgress || 0}%`],
      ],
      headStyles: { fillColor: [245, 158, 11], textColor: 255 },
      styles: { fontSize: 10 },
      margin: { left: 14, right: 14 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Check if we need a new page
  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = 20;
  }

  // Financial Analytics
  if (data.financial) {
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text('Analíticas Financieras', 14, yPosition);
    yPosition += 8;

    const balance = data.financial.balance || 0;
    const balanceColor = balance >= 0 ? [16, 185, 129] : [239, 68, 68];

    autoTable(doc, {
      startY: yPosition,
      head: [['Métrica', 'Valor']],
      body: [
        ['Total de Transacciones', data.financial.totalTransactions || 0],
        ['Ingresos Totales', `$${(data.financial.income || 0).toLocaleString()}`],
        ['Egresos Totales', `$${(data.financial.expenses || 0).toLocaleString()}`],
        ['Balance', `$${balance.toLocaleString()}`],
        ['Promedio por Transacción', `$${data.financial.averageTransactionAmount || 0}`],
      ],
      headStyles: { fillColor: [16, 185, 129], textColor: 255 },
      styles: { fontSize: 10 },
      margin: { left: 14, right: 14 },
      didParseCell: (data) => {
        if (data.row.index === 3 && data.column.index === 1) {
          data.cell.styles.textColor = balanceColor as any;
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      'VirtualUni Platform - Reporte Confidencial',
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    );
  }

  // Save the PDF
  const fileName = `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

export const generateFinancialPDF = (financialData: any, monthlyTrends: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Header
  doc.setFontSize(22);
  doc.setTextColor(16, 185, 129);
  doc.text('Reporte Financiero', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 10;
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(
    `Generado: ${new Date().toLocaleString('es-ES')}`,
    pageWidth / 2,
    yPosition,
    { align: 'center' }
  );

  yPosition += 15;

  // Summary
  doc.setFontSize(14);
  doc.setTextColor(31, 41, 55);
  doc.text('Resumen Financiero', 14, yPosition);
  yPosition += 8;

  const balance = financialData.balance || 0;
  autoTable(doc, {
    startY: yPosition,
    head: [['Concepto', 'Monto']],
    body: [
      ['Ingresos Totales', `$${(financialData.income || 0).toLocaleString()}`],
      ['Egresos Totales', `$${(financialData.expenses || 0).toLocaleString()}`],
      ['Balance', `$${balance.toLocaleString()}`],
    ],
    headStyles: { fillColor: [16, 185, 129], textColor: 255 },
    styles: { fontSize: 11 },
    margin: { left: 14, right: 14 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Monthly Trends
  if (monthlyTrends) {
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text('Tendencias Mensuales', 14, yPosition);
    yPosition += 8;

    const trendsData = Object.entries(monthlyTrends).map(([month, data]: [string, any]) => [
      month,
      `$${(data.income || 0).toLocaleString()}`,
      `$${(data.expenses || 0).toLocaleString()}`,
      `$${((data.income || 0) - (data.expenses || 0)).toLocaleString()}`,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Mes', 'Ingresos', 'Egresos', 'Balance']],
      body: trendsData,
      headStyles: { fillColor: [16, 185, 129], textColor: 255 },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });
  }

  // Save
  const fileName = `financial-report-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
