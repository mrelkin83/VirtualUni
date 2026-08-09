import jsPDF from 'jspdf';

interface CertificateData {
  studentName: string;
  courseName: string;
  completionDate: string;
  courseHours?: string;
  grade?: string;
  professorName?: string;
}

export const generateCourseCertificate = (data: CertificateData): void => {
  // Crear nuevo documento PDF en orientación horizontal (landscape)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Fondo con borde decorativo
  doc.setDrawColor(41, 128, 185); // Azul
  doc.setLineWidth(2);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  doc.setLineWidth(0.5);
  doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

  // Logo / Título de la Universidad
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(41, 128, 185);
  doc.text('VirtualUni', pageWidth / 2, 35, { align: 'center' });

  // Subtítulo
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Universidad Virtual', pageWidth / 2, 45, { align: 'center' });

  // Línea decorativa
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(60, 50, pageWidth - 60, 50);

  // "CERTIFICADO DE FINALIZACIÓN"
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);
  doc.text('CERTIFICADO DE FINALIZACIÓN', pageWidth / 2, 65, { align: 'center' });

  // Texto de certificación
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('Este documento certifica que', pageWidth / 2, 80, { align: 'center' });

  // Nombre del estudiante
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(data.studentName, pageWidth / 2, 95, { align: 'center' });

  // Línea bajo el nombre
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.3);
  const nameWidth = doc.getTextWidth(data.studentName);
  doc.line(
    (pageWidth - nameWidth) / 2 - 10,
    97,
    (pageWidth + nameWidth) / 2 + 10,
    97
  );

  // Texto de completación
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('ha completado satisfactoriamente el curso', pageWidth / 2, 110, { align: 'center' });

  // Nombre del curso
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(41, 128, 185);
  doc.text(data.courseName, pageWidth / 2, 125, { align: 'center' });

  // Información adicional
  let yPosition = 140;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);

  if (data.courseHours) {
    doc.text(`Duración: ${data.courseHours}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 7;
  }

  if (data.grade) {
    doc.text(`Calificación: ${data.grade}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 7;
  }

  // Fecha de emisión
  doc.setFontSize(11);
  doc.setFont('helvetica', 'italic');
  doc.text(`Fecha de finalización: ${data.completionDate}`, pageWidth / 2, yPosition + 5, { align: 'center' });

  // Firma y sello (zona de firma)
  const signatureY = pageHeight - 45;

  // Firma del profesor/director
  if (data.professorName) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    // Línea de firma
    doc.setDrawColor(100, 100, 100);
    doc.line(50, signatureY, 120, signatureY);
    doc.text(data.professorName, 85, signatureY + 7, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Instructor del Curso', 85, signatureY + 12, { align: 'center' });
  }

  // Sello digital (simulado)
  doc.setDrawColor(41, 128, 185);
  doc.setLineWidth(1.5);
  doc.circle(pageWidth - 85, signatureY - 5, 15, 'S');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(41, 128, 185);
  doc.text('SELLO', pageWidth - 85, signatureY - 8, { align: 'center' });
  doc.text('OFICIAL', pageWidth - 85, signatureY - 2, { align: 'center' });
  doc.text('VirtualUni', pageWidth - 85, signatureY + 4, { align: 'center' });

  // Línea de firma para el sello
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.3);
  doc.line(pageWidth - 120, signatureY, pageWidth - 50, signatureY);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Director Académico', pageWidth - 85, signatureY + 12, { align: 'center' });

  // Código de verificación (al final del documento)
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  const verificationCode = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  doc.text(`Código de verificación: ${verificationCode}`, pageWidth / 2, pageHeight - 15, { align: 'center' });

  // Guardar el PDF
  const fileName = `Certificado_${data.courseName.replace(/\s+/g, '_')}_${data.studentName.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
};

// Función auxiliar para generar certificado desde un curso
export const generateCertificateFromCourse = (
  studentName: string,
  courseName: string,
  professorName: string,
  completionPercentage: number,
  grade?: number
) => {
  const today = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  generateCourseCertificate({
    studentName,
    courseName,
    completionDate: today,
    professorName,
    grade: grade ? `${grade.toFixed(1)}/10` : undefined,
    courseHours: '40 horas'
  });

  return {
    certificadoGenerado: true,
    fecha: today,
    nombreArchivo: `Certificado_${courseName.replace(/\s+/g, '_')}_${studentName.replace(/\s+/g, '_')}.pdf`
  };
};
