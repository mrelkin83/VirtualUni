import { apiClient } from '../client';

/**
 * Estructura académica: programas, pensum versionado, asignaturas
 * transversales, periodos e inscripciones a programa.
 *
 * Los tipos espejan los DTOs del backend EXACTAMENTE: el ValidationPipe usa
 * forbidNonWhitelisted, así que un campo de más responde 400.
 */

// ----- catálogos (mismos valores que los enums de Prisma) -----

export type EducationLevel =
  | 'TECNICO_PROFESIONAL' | 'TECNOLOGICO' | 'PROFESIONAL_UNIVERSITARIO'
  | 'ESPECIALIZACION' | 'MAESTRIA' | 'DOCTORADO'
  | 'TECNICO_LABORAL' | 'CONOCIMIENTOS_ACADEMICOS'
  | 'PREESCOLAR' | 'BASICA_PRIMARIA' | 'BASICA_SECUNDARIA'
  | 'MEDIA_BACHILLERATO' | 'BACHILLERATO_POR_CICLOS'
  | 'DIPLOMADO' | 'CURSO_LIBRE' | 'TALLER' | 'SEMINARIO' | 'OTRO';

export type PeriodStructure =
  | 'SEMESTRAL' | 'CUATRIMESTRAL' | 'TRIMESTRAL' | 'ANUAL'
  | 'POR_CICLOS' | 'MODULAR' | 'UNICO';

export type AcademicUnit = 'CREDITOS' | 'HORAS' | 'INTENSIDAD_HORARIA_SEMANAL';
export type Modality = 'PRESENCIAL' | 'VIRTUAL' | 'HIBRIDA' | 'DISTANCIA';
export type SubjectType = 'OBLIGATORIA' | 'ELECTIVA' | 'OPTATIVA' | 'PRACTICA' | 'TRABAJO_DE_GRADO';
export type ProgramStatus = 'BORRADOR' | 'ACTIVO' | 'INACTIVO';
export type StudyPlanStatus = 'BORRADOR' | 'VIGENTE' | 'CERRADO';
export type PeriodStatus = 'PLANEADO' | 'EN_CURSO' | 'CERRADO';
export type ProgramEnrollmentStatus = 'ACTIVO' | 'APLAZADO' | 'RETIRADO' | 'GRADUADO' | 'CANCELADO';

// ----- DTOs (calcados del backend) -----

export interface ProgramaCreateDto {
  code: string;
  name: string;
  description?: string;
  educationLevel: EducationLevel;
  modality: Modality;
  periodStructure: PeriodStructure;
  academicUnit: AcademicUnit;
  durationPeriods?: number;
  totalCredits?: number;
  totalHours?: number;
  degreeTitle?: string;
  officialCode?: string;
  approvalAct?: string;
  status?: ProgramStatus;
}
export type ProgramaUpdateDto = Partial<ProgramaCreateDto>;

export interface PensumCreateDto {
  version: string;
  validFrom?: string;
  notes?: string;
}
export type PensumUpdateDto = Partial<PensumCreateDto>;

export interface FilaPensumCreateDto {
  subjectId: string;
  level: number;
  subjectType?: SubjectType;
  credits?: number;
  hours?: number;
  orderIndex?: number;
}
export interface FilaPensumUpdateDto {
  level?: number;
  subjectType?: SubjectType;
  credits?: number;
  hours?: number;
  orderIndex?: number;
}

export interface AsignaturaCreateDto {
  code: string;
  name: string;
  description?: string;
  area?: string;
  credits?: number;
  hours?: number;
  weeklyHours?: number;
}
export type AsignaturaUpdateDto = Partial<AsignaturaCreateDto> & { status?: string };

export interface PeriodoCreateDto {
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  status?: PeriodStatus;
}
export type PeriodoUpdateDto = Partial<PeriodoCreateDto>;

export interface InscripcionCreateDto {
  studentId: string;
  programId: string;
  studyPlanId?: string;
  currentLevel?: number;
  startDate?: string;
}
export interface InscripcionUpdateDto {
  studyPlanId?: string;
  currentLevel?: number;
  status?: ProgramEnrollmentStatus;
  endDate?: string;
}

// ----- respuestas -----

export interface Paginado<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface Programa {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  educationLevel: EducationLevel;
  modality: Modality;
  periodStructure: PeriodStructure;
  academicUnit: AcademicUnit;
  durationPeriods?: number | null;
  totalCredits?: number | null;
  totalHours?: number | null;
  degreeTitle?: string | null;
  officialCode?: string | null;
  approvalAct?: string | null;
  status: ProgramStatus;
  _count?: { studyPlans: number; programEnrollments: number };
  studyPlans?: Pensum[];
}

export interface Pensum {
  id: string;
  programId: string;
  version: string;
  status: StudyPlanStatus;
  validFrom?: string | null;
  notes?: string | null;
  _count?: { subjects: number; programEnrollments: number };
}

export interface Asignatura {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  area?: string | null;
  credits?: number | null;
  hours?: number | null;
  weeklyHours?: number | null;
  status: string;
  _count?: { planEntries: number; courses: number };
}

export interface FilaPensum {
  id: string;
  studyPlanId: string;
  subjectId: string;
  level: number;
  subjectType: SubjectType;
  credits?: number | null;
  hours?: number | null;
  orderIndex: number;
  subject: Asignatura;
  prerequisites?: {
    id: string;
    required: { id: string; level: number; subject: { id: string; code: string; name: string } };
  }[];
}

export interface PensumDetalle {
  studyPlan: {
    id: string;
    version: string;
    status: StudyPlanStatus;
    program: { id: string; name: string; durationPeriods?: number | null };
  };
  niveles: { level: number; subjects: FilaPensum[]; totalCredits: number; totalHours: number }[];
  totalCredits: number;
  totalHours: number;
}

export interface Periodo {
  id: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  status: PeriodStatus;
  _count?: { courses: number };
  advertencias?: string[];
}

export interface Inscripcion {
  id: string;
  studentId: string;
  programId: string;
  studyPlanId: string;
  currentLevel: number;
  status: ProgramEnrollmentStatus;
  startDate: string;
  endDate?: string | null;
  student?: {
    id: string;
    studentCode: string;
    user: { id: string; firstName: string; lastName: string; email: string };
  };
  program?: { id: string; code: string; name: string; educationLevel: EducationLevel };
  studyPlan?: { id: string; version: string; status: StudyPlanStatus };
}

/** Grupo del docente con su asignatura, periodo y programas de origen. */
export interface GrupoDelDocente {
  id: string;
  code: string;
  name: string;
  status: string;
  groupCode?: string | null;
  capacity?: number | null;
  modality?: Modality | null;
  semester?: string | null;
  estudiantes: number;
  subject?: { id: string; code: string; name: string } | null;
  academicPeriod?: {
    id: string;
    code: string;
    name: string;
    status: PeriodStatus;
  } | null;
  programasDeOrigen: {
    id: string;
    code: string;
    name: string;
    estudiantes: number;
  }[];
}

/**
 * Inscripción con el programa COMPLETO. `GET /program-enrollments` devuelve el
 * programa resumido (ver `Inscripcion`), pero `mis-programas` lo incluye
 * entero porque la vista del estudiante muestra modalidad, periodicidad,
 * unidad, duración y título.
 */
export interface InscripcionConPrograma extends Omit<Inscripcion, 'program'> {
  program?: Programa;
}

// ----- avance del pensum (módulo academic-records) -----

export type EstadoAsignatura =
  | 'APROBADA'
  | 'EN_CURSO'
  | 'PENDIENTE'
  | 'BLOQUEADA_POR_PRERREQUISITO';

export type OrigenRegistro =
  | 'CURSADA'
  | 'RECONOCIMIENTO_INTERNO'
  | 'HOMOLOGACION_EQUIVALENCIA'
  | 'RECONOCIMIENTO_EXTERNO'
  | 'VALIDACION_SUFICIENCIA';

export interface AsignaturaDeProgreso {
  studyPlanSubjectId: string;
  subjectId: string;
  code: string;
  name: string;
  level: number;
  subjectType: SubjectType;
  credits: number | null;
  hours: number | null;
  blockId: string | null;
  estado: EstadoAsignatura;
  /** En la escala del programa (gradeScaleMax), no en la de captura. */
  finalGrade: number | null;
  origin: OrigenRegistro | null;
  /** true si no la cursó en este programa (reconocida u homologada). */
  reconocida: boolean;
  viaSubjectId: string | null;
  prerrequisitosPendientes: string[];
}

export interface NivelDeProgreso {
  level: number;
  asignaturas: AsignaturaDeProgreso[];
}

/**
 * Avance del pensum. Lo calcula el módulo academic-records a partir del
 * historial académico (incluye homologaciones y reconocimientos), así que la
 * UI NO recalcula nada: los porcentajes vienen con un decimal (41.7, no
 * 0.417) y el denominador siempre es el pensum destino.
 */
export interface ProgresoDePrograma {
  programEnrollmentId: string;
  studentId: string;
  studentCode: string;
  programId: string;
  programCode: string;
  programName: string;
  studyPlanId: string;
  studyPlanVersion: string;
  academicUnit: AcademicUnit;
  currentLevel: number;
  status: ProgramEnrollmentStatus;
  niveles: NivelDeProgreso[];
  resumen: {
    asignaturasTotales: number;
    asignaturasAprobadas: number;
    asignaturasReconocidas: number;
    asignaturasEnCurso: number;
    asignaturasPendientes: number;
    asignaturasBloqueadas: number;
    creditosTotales: number;
    creditosAprobados: number;
    horasTotales: number;
    horasAprobadas: number;
    porcentajeCreditos: number;
    porcentajeHoras: number;
    /** porcentajeCreditos si la unidad es CREDITOS; porcentajeHoras si no. */
    porcentajeAvance: number;
  };
}

export const progresoApi = {
  /** Avance del pensum de una inscripción. Un STUDENT solo puede pedir la suya. */
  dePrograma: async (programEnrollmentId: string) =>
    (
      await apiClient.get<ProgresoDePrograma>(
        `/api/v1/academic-records/progress/${programEnrollmentId}`,
      )
    ).data,
};

export interface UsoAsignatura {
  programas: {
    id: string;
    code: string;
    name: string;
    pensums: { id: string; version: string; status: StudyPlanStatus; level: number }[];
  }[];
  totalProgramas: number;
  totalGrupos: number;
}

// ----- clientes -----

const PROGRAMS = '/api/v1/programs';
const STUDY_PLANS = '/api/v1/study-plans';
const ROWS = '/api/v1/study-plan-subjects';
const SUBJECTS = '/api/v1/subjects';
const PERIODS = '/api/v1/academic-periods';
const ENROLLMENTS = '/api/v1/program-enrollments';

export const programasApi = {
  getAll: async (params?: {
    page?: number; limit?: number; search?: string;
    educationLevel?: EducationLevel; status?: ProgramStatus;
  }) => (await apiClient.get<Paginado<Programa>>(PROGRAMS, { params })).data,
  getOne: async (id: string) => (await apiClient.get<Programa>(`${PROGRAMS}/${id}`)).data,
  create: async (data: ProgramaCreateDto) => (await apiClient.post<Programa>(PROGRAMS, data)).data,
  update: async (id: string, data: ProgramaUpdateDto) =>
    (await apiClient.patch<Programa>(`${PROGRAMS}/${id}`, data)).data,
  remove: async (id: string) => (await apiClient.delete(`${PROGRAMS}/${id}`)).data,
  pensums: async (id: string) => (await apiClient.get<Pensum[]>(`${PROGRAMS}/${id}/study-plans`)).data,
  crearPensum: async (id: string, data: PensumCreateDto) =>
    (await apiClient.post<Pensum>(`${PROGRAMS}/${id}/study-plans`, data)).data,
};

export const pensumApi = {
  update: async (id: string, data: PensumUpdateDto) =>
    (await apiClient.patch<Pensum>(`${STUDY_PLANS}/${id}`, data)).data,
  activate: async (id: string) =>
    (await apiClient.post<Pensum>(`${STUDY_PLANS}/${id}/activate`)).data,
  duplicate: async (id: string, version: string) =>
    (await apiClient.post<Pensum>(`${STUDY_PLANS}/${id}/duplicate`, { version })).data,
  detalle: async (id: string) =>
    (await apiClient.get<PensumDetalle>(`${STUDY_PLANS}/${id}/subjects`)).data,
  agregarFila: async (id: string, data: FilaPensumCreateDto) =>
    (await apiClient.post<FilaPensum>(`${STUDY_PLANS}/${id}/subjects`, data)).data,
  actualizarFila: async (filaId: string, data: FilaPensumUpdateDto) =>
    (await apiClient.patch<FilaPensum>(`${ROWS}/${filaId}`, data)).data,
  retirarFila: async (filaId: string) => (await apiClient.delete(`${ROWS}/${filaId}`)).data,
  fijarPrerrequisitos: async (filaId: string, requiredIds: string[]) =>
    (await apiClient.put<FilaPensum>(`${ROWS}/${filaId}/prerequisites`, { requiredIds })).data,
};

export const asignaturasApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; area?: string }) =>
    (await apiClient.get<Paginado<Asignatura>>(SUBJECTS, { params })).data,
  getOne: async (id: string) => (await apiClient.get<Asignatura>(`${SUBJECTS}/${id}`)).data,
  usage: async (id: string) => (await apiClient.get<UsoAsignatura>(`${SUBJECTS}/${id}/usage`)).data,
  create: async (data: AsignaturaCreateDto) =>
    (await apiClient.post<Asignatura>(SUBJECTS, data)).data,
  update: async (id: string, data: AsignaturaUpdateDto) =>
    (await apiClient.patch<Asignatura>(`${SUBJECTS}/${id}`, data)).data,
  remove: async (id: string) => (await apiClient.delete(`${SUBJECTS}/${id}`)).data,
};

export const periodosApi = {
  getAll: async (params?: { page?: number; limit?: number; status?: PeriodStatus }) =>
    (await apiClient.get<Paginado<Periodo>>(PERIODS, { params })).data,
  current: async () => (await apiClient.get<Periodo | null>(`${PERIODS}/current`)).data,
  create: async (data: PeriodoCreateDto) => (await apiClient.post<Periodo>(PERIODS, data)).data,
  update: async (id: string, data: PeriodoUpdateDto) =>
    (await apiClient.patch<Periodo>(`${PERIODS}/${id}`, data)).data,
};

export interface EstudianteResumen {
  id: string;
  studentCode: string;
  program?: string | null;
  semester?: string | null;
  user: { id: string; firstName: string; lastName: string; email: string };
}

export const estudiantesApi = {
  /** Lista de fichas de estudiante (Student.id, no User.id) para inscribir. */
  getAll: async (params?: { page?: number; limit?: number; search?: string }) =>
    (await apiClient.get<Paginado<EstudianteResumen>>('/api/v1/students', { params })).data,
};

export const gruposDocenteApi = {
  /** Grupos del docente autenticado (resuelve su ficha desde el token). */
  mios: async () =>
    (await apiClient.get<GrupoDelDocente[]>('/api/v1/courses/mis-grupos')).data,
};

export const inscripcionesApi = {
  getAll: async (params?: {
    page?: number; limit?: number; programId?: string;
    studentId?: string; status?: ProgramEnrollmentStatus;
  }) => (await apiClient.get<Paginado<Inscripcion>>(ENROLLMENTS, { params })).data,

  /** Programas del estudiante autenticado (resuelve su ficha desde el token). */
  misProgramas: async () =>
    (await apiClient.get<InscripcionConPrograma[]>(`${ENROLLMENTS}/mis-programas`)).data,

  /**
   * Pensum de una inscripción propia, agrupado por nivel. Incluye
   * `currentLevel` para marcar en qué nivel va el estudiante.
   */
  miPensum: async (inscripcionId: string) =>
    (
      await apiClient.get<PensumDetalle & { currentLevel: number }>(
        `${ENROLLMENTS}/${inscripcionId}/pensum`,
      )
    ).data,
  create: async (data: InscripcionCreateDto) =>
    (await apiClient.post<Inscripcion>(ENROLLMENTS, data)).data,
  update: async (id: string, data: InscripcionUpdateDto) =>
    (await apiClient.patch<Inscripcion>(`${ENROLLMENTS}/${id}`, data)).data,
  deEstudiante: async (studentId: string) =>
    (await apiClient.get<Inscripcion[]>(`/api/v1/students/${studentId}/programs`)).data,
};
