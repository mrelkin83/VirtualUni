import type {
  AcademicUnit,
  EducationLevel,
  Modality,
  PeriodStructure,
  PeriodStatus,
  ProgramEnrollmentStatus,
  ProgramStatus,
  StudyPlanStatus,
  SubjectType,
} from '../../../../api/endpoints/academico';

/**
 * Mapa enum → texto visible. Las pantallas nunca escriben estas etiquetas a
 * mano: todas salen de aquí para que el catálogo sea consistente.
 */

export const NIVELES: Record<EducationLevel, string> = {
  TECNICO_PROFESIONAL: 'Técnico profesional',
  TECNOLOGICO: 'Tecnólogo',
  PROFESIONAL_UNIVERSITARIO: 'Profesional universitario',
  ESPECIALIZACION: 'Especialización',
  MAESTRIA: 'Maestría',
  DOCTORADO: 'Doctorado',
  TECNICO_LABORAL: 'Técnico laboral (ETDH)',
  CONOCIMIENTOS_ACADEMICOS: 'Conocimientos académicos (ETDH)',
  PREESCOLAR: 'Preescolar',
  BASICA_PRIMARIA: 'Básica primaria',
  BASICA_SECUNDARIA: 'Básica secundaria',
  MEDIA_BACHILLERATO: 'Media / Bachillerato',
  BACHILLERATO_POR_CICLOS: 'Bachillerato por ciclos',
  DIPLOMADO: 'Diplomado',
  CURSO_LIBRE: 'Curso libre',
  TALLER: 'Taller',
  SEMINARIO: 'Seminario',
  OTRO: 'Otro',
};

export const PERIODICIDADES: Record<PeriodStructure, string> = {
  SEMESTRAL: 'Semestral',
  CUATRIMESTRAL: 'Cuatrimestral',
  TRIMESTRAL: 'Trimestral',
  ANUAL: 'Anual',
  POR_CICLOS: 'Por ciclos',
  MODULAR: 'Modular',
  UNICO: 'Etapa única',
};

export const UNIDADES: Record<AcademicUnit, string> = {
  CREDITOS: 'Créditos',
  HORAS: 'Horas',
  INTENSIDAD_HORARIA_SEMANAL: 'Intensidad horaria semanal',
};

export const MODALIDADES: Record<Modality, string> = {
  PRESENCIAL: 'Presencial',
  VIRTUAL: 'Virtual',
  HIBRIDA: 'Híbrida',
  DISTANCIA: 'A distancia',
};

export const TIPOS_ASIGNATURA: Record<SubjectType, string> = {
  OBLIGATORIA: 'Obligatoria',
  ELECTIVA: 'Electiva',
  OPTATIVA: 'Optativa',
  PRACTICA: 'Práctica',
  TRABAJO_DE_GRADO: 'Trabajo de grado',
};

export const ESTADOS_PROGRAMA: Record<ProgramStatus, string> = {
  BORRADOR: 'Borrador',
  ACTIVO: 'Activo',
  INACTIVO: 'Inactivo',
};

export const ESTADOS_PENSUM: Record<StudyPlanStatus, string> = {
  BORRADOR: 'Borrador',
  VIGENTE: 'Vigente',
  CERRADO: 'Cerrado',
};

export const ESTADOS_PERIODO: Record<PeriodStatus, string> = {
  PLANEADO: 'Planeado',
  EN_CURSO: 'En curso',
  CERRADO: 'Cerrado',
};

export const ESTADOS_INSCRIPCION: Record<ProgramEnrollmentStatus, string> = {
  ACTIVO: 'Activo',
  APLAZADO: 'Aplazado',
  RETIRADO: 'Retirado',
  GRADUADO: 'Graduado',
  CANCELADO: 'Cancelado',
};

/** Color del chip del nivel, por familia educativa. */
export function colorDeNivel(nivel: EducationLevel): string {
  const superior: EducationLevel[] = [
    'TECNICO_PROFESIONAL', 'TECNOLOGICO', 'PROFESIONAL_UNIVERSITARIO',
    'ESPECIALIZACION', 'MAESTRIA', 'DOCTORADO',
  ];
  const etdh: EducationLevel[] = ['TECNICO_LABORAL', 'CONOCIMIENTOS_ACADEMICOS'];
  const colegio: EducationLevel[] = [
    'PREESCOLAR', 'BASICA_PRIMARIA', 'BASICA_SECUNDARIA',
    'MEDIA_BACHILLERATO', 'BACHILLERATO_POR_CICLOS',
  ];
  const continua: EducationLevel[] = ['DIPLOMADO', 'CURSO_LIBRE', 'TALLER', 'SEMINARIO'];

  if (superior.includes(nivel)) return 'bg-pn-accent-soft text-pn-accent-text';
  if (etdh.includes(nivel)) return 'bg-pn-warn-soft text-pn-warn';
  if (colegio.includes(nivel)) return 'bg-pn-ok-soft text-pn-ok';
  if (continua.includes(nivel)) return 'bg-pn-accent-2-soft text-pn-accent-2-text';
  return 'bg-pn-surface-3 text-pn-ink-2';
}

export function colorDeEstadoPrograma(estado: ProgramStatus): string {
  if (estado === 'ACTIVO') return 'bg-pn-ok-soft text-pn-ok';
  if (estado === 'BORRADOR') return 'bg-pn-warn-soft text-pn-warn';
  return 'bg-pn-surface-3 text-pn-ink-2';
}

export function colorDeEstadoPensum(estado: StudyPlanStatus): string {
  if (estado === 'VIGENTE') return 'bg-pn-ok-soft text-pn-ok';
  if (estado === 'BORRADOR') return 'bg-pn-warn-soft text-pn-warn';
  return 'bg-pn-surface-3 text-pn-ink-2';
}

/**
 * Valores sensatos al elegir el nivel en el formulario de programa, y la
 * etiqueta con que se nombra cada nivel del pensum (Semestre 1, Grado 1…).
 */
export function defaultsPorNivel(nivel: EducationLevel): {
  periodStructure: PeriodStructure;
  academicUnit: AcademicUnit;
  etiquetaNivel: string;
} {
  switch (nivel) {
    case 'TECNICO_PROFESIONAL':
    case 'TECNOLOGICO':
    case 'PROFESIONAL_UNIVERSITARIO':
    case 'ESPECIALIZACION':
    case 'MAESTRIA':
    case 'DOCTORADO':
      return { periodStructure: 'SEMESTRAL', academicUnit: 'CREDITOS', etiquetaNivel: 'Semestre' };
    case 'TECNICO_LABORAL':
    case 'CONOCIMIENTOS_ACADEMICOS':
      return { periodStructure: 'MODULAR', academicUnit: 'HORAS', etiquetaNivel: 'Módulo' };
    case 'PREESCOLAR':
    case 'BASICA_PRIMARIA':
    case 'BASICA_SECUNDARIA':
    case 'MEDIA_BACHILLERATO':
      return {
        periodStructure: 'ANUAL',
        academicUnit: 'INTENSIDAD_HORARIA_SEMANAL',
        etiquetaNivel: 'Grado',
      };
    case 'BACHILLERATO_POR_CICLOS':
      return {
        periodStructure: 'POR_CICLOS',
        academicUnit: 'INTENSIDAD_HORARIA_SEMANAL',
        etiquetaNivel: 'Ciclo',
      };
    case 'DIPLOMADO':
    case 'CURSO_LIBRE':
    case 'TALLER':
    case 'SEMINARIO':
      return { periodStructure: 'UNICO', academicUnit: 'HORAS', etiquetaNivel: 'Nivel' };
    default:
      return { periodStructure: 'SEMESTRAL', academicUnit: 'CREDITOS', etiquetaNivel: 'Periodo' };
  }
}

/** Etiqueta del nivel según la periodicidad del programa ya guardado. */
export function etiquetaNivelDePrograma(periodStructure: PeriodStructure): string {
  switch (periodStructure) {
    case 'SEMESTRAL': return 'Semestre';
    case 'CUATRIMESTRAL': return 'Cuatrimestre';
    case 'TRIMESTRAL': return 'Trimestre';
    case 'ANUAL': return 'Grado';
    case 'POR_CICLOS': return 'Ciclo';
    case 'MODULAR': return 'Módulo';
    case 'UNICO': return 'Nivel';
    default: return 'Periodo';
  }
}
