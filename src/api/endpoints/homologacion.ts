import { apiClient } from '../client';
import type { AcademicUnit, EducationLevel, SubjectType } from './academico';

/**
 * Historial académico, cierre de notas, homologación, articulación y bloques
 * de competencia.
 *
 * Los tipos espejan los DTOs y las respuestas del backend EXACTAMENTE: el
 * ValidationPipe usa forbidNonWhitelisted, así que un campo de más responde
 * 400. Vive aparte de `academico.ts` para no tocar ese archivo.
 */

// ----- catálogos (mismos valores que los enums de Prisma) -----

export type RecordOrigin =
  | 'CURSADA'
  | 'RECONOCIMIENTO_INTERNO'
  | 'HOMOLOGACION_EQUIVALENCIA'
  | 'RECONOCIMIENTO_EXTERNO'
  | 'VALIDACION_SUFICIENCIA';

export type RecordStatus = 'VIGENTE' | 'ANULADO';

export type HomologationType =
  | 'EQUIVALENCIA_INTERNA'
  | 'EXTERNA'
  | 'VALIDACION_SUFICIENCIA';

export type HomologationStatus =
  | 'SOLICITADA'
  | 'EN_REVISION'
  | 'APROBADA'
  | 'APROBADA_PARCIAL'
  | 'RECHAZADA';

export type EstadoDeAsignatura =
  | 'APROBADA'
  | 'EN_CURSO'
  | 'PENDIENTE'
  | 'BLOQUEADA_POR_PRERREQUISITO';

// ----- cierre de notas e historial -----

export interface PoliticaEfectiva {
  passingGrade: number;
  gradeScaleMax: number;
  hoursPerCredit: number;
  programId?: string;
  programName?: string;
  conflicto?: string;
}

export interface FilaDeCierre {
  studentId: string;
  studentCode: string;
  nombre: string;
  parciales: number;
  promedio100: number | null;
  finalGrade: number | null;
  passed: boolean | null;
  politica: PoliticaEfectiva;
  avisos: string[];
}

export interface PrevisualizacionDeCierre {
  course: {
    id: string;
    code: string;
    name: string;
    groupCode: string | null;
    gradesClosedAt: string | null;
  };
  subject: {
    id: string;
    code: string;
    name: string;
    credits: number | null;
    hours: number | null;
  };
  academicPeriod: { id: string; code: string; status: string } | null;
  escalaDeCaptura: string;
  filas: FilaDeCierre[];
  totales: {
    matriculados: number;
    calculables: number;
    aprobados: number;
    reprobados: number;
  };
}

export interface RegistroDeHistorial {
  id: string;
  subjectId: string;
  courseId: string | null;
  academicPeriodId: string | null;
  origin: RecordOrigin;
  finalGrade: number | null;
  passed: boolean;
  creditsSnapshot: number | null;
  hoursSnapshot: number | null;
  status: RecordStatus;
  approvedAt: string | null;
  notes: string | null;
  createdAt: string;
  subject: { id: string; code: string; name: string; area: string | null };
  course: { id: string; code: string; groupCode: string | null } | null;
  academicPeriod: { id: string; code: string; name: string } | null;
}

export interface HistorialAcademico {
  estudiante: { id: string; studentCode: string; nombre: string };
  registros: RegistroDeHistorial[];
  resumen: {
    total: number;
    aprobadas: number;
    reprobadas: number;
    creditosAprobados: number;
    horasAprobadas: number;
  };
}

// ----- avance del pensum -----

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
  estado: EstadoDeAsignatura;
  finalGrade: number | null;
  origin: RecordOrigin | null;
  reconocida: boolean;
  viaSubjectId: string | null;
  prerrequisitosPendientes: string[];
}

export interface ResumenDeProgreso {
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
  /** El principal según la unidad académica del programa; sobre el DESTINO. */
  porcentajeAvance: number;
}

export interface ProgresoDePensum {
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
  status: string;
  niveles: { level: number; asignaturas: AsignaturaDeProgreso[] }[];
  resumen: ResumenDeProgreso;
}

export interface AsignaturaBreve {
  subjectId: string;
  code: string;
  name: string;
  level?: number;
  credits?: number | null;
  hours?: number | null;
  viaSubjectId?: string | null;
  finalGrade?: number | null;
  origin?: RecordOrigin | null;
}

export interface PrevisualizacionDeReconocimiento {
  programId: string;
  programCode: string;
  programName: string;
  studyPlanId: string;
  studyPlanVersion: string;
  academicUnit: AcademicUnit;
  reconocibles: AsignaturaBreve[];
  faltantes: AsignaturaBreve[];
  resumen: ResumenDeProgreso;
}

// ----- articulación y doble titulación -----

export interface DestinoDeArticulacion {
  programId: string;
  programCode: string;
  programName: string;
  educationLevel: EducationLevel;
  academicUnit: AcademicUnit;
  studyPlanId: string;
  studyPlanVersion: string;
  asignaturasReconocidas: number;
  asignaturasTotales: number;
  creditosReconocidos: number;
  creditosTotales: number;
  horasReconocidas: number;
  horasTotales: number;
  porcentajeCreditos: number;
  porcentajeHoras: number;
  porcentajeAvance: number;
  reconocidas: AsignaturaBreve[];
  faltantes: AsignaturaBreve[];
}

export interface MatrizDeArticulacion {
  origen: {
    programId: string;
    programCode: string;
    programName: string;
    studyPlanId: string;
    studyPlanVersion: string;
    asignaturas: number;
  };
  destinos: DestinoDeArticulacion[];
  nota: string;
}

export interface OpcionDeDobleTitulacion {
  programId: string;
  programCode: string;
  programName: string;
  degreeTitle: string | null;
  educationLevel: EducationLevel;
  academicUnit: AcademicUnit;
  studyPlanId: string;
  studyPlanVersion: string;
  resumen: ResumenDeProgreso;
  reconocidas: AsignaturaBreve[];
  faltantes: AsignaturaBreve[];
}

export interface OpcionesDeDobleTitulacion {
  estudiante: { id: string; studentCode: string; nombre: string };
  opciones: OpcionDeDobleTitulacion[];
  hoursPerCreditPorDefecto: number;
}

// ----- equivalencias y solicitudes -----

export interface Equivalencia {
  id: string;
  sourceSubjectId: string;
  targetSubjectId: string;
  bidirectional: boolean;
  notes: string | null;
  sourceSubject: { id: string; code: string; name: string };
  targetSubject: { id: string; code: string; name: string };
}

export interface EquivalenciaCreateDto {
  sourceSubjectId: string;
  targetSubjectId: string;
  bidirectional?: boolean;
  notes?: string;
}

export interface ItemDeSolicitud {
  id: string;
  targetSubjectId: string;
  originName: string | null;
  originHours: number | null;
  originGrade: number | null;
  decision: string | null;
  decisionNotes: string | null;
  targetSubject: {
    id: string;
    code: string;
    name: string;
    credits: number | null;
    hours: number | null;
  };
}

export interface SolicitudDeHomologacion {
  id: string;
  studentId: string;
  programEnrollmentId: string;
  type: HomologationType;
  status: HomologationStatus;
  originInstitution: string | null;
  supportFiles: string[];
  reviewedById: string | null;
  reviewedAt: string | null;
  decisionNotes: string | null;
  createdAt: string;
  student: {
    id: string;
    studentCode: string;
    user: { firstName: string; lastName: string; email: string };
  };
  programEnrollment: {
    id: string;
    studyPlanId: string;
    program: { id: string; code: string; name: string };
  };
  items: ItemDeSolicitud[];
}

export interface SolicitudCreateDto {
  studentId: string;
  programEnrollmentId: string;
  type: HomologationType;
  originInstitution?: string;
  supportFiles?: string[];
  items: {
    targetSubjectId: string;
    originName?: string;
    originHours?: number;
    originGrade?: number;
  }[];
}

export interface DecisionDeItemDto {
  itemId: string;
  aprobado: boolean;
  justificacion?: string;
  forzar?: boolean;
}

// ----- bloques de competencia -----

export interface BloqueDePensum {
  id: string;
  studyPlanId: string;
  name: string;
  description: string | null;
  orderIndex: number;
  certifiable: boolean;
  certificateTemplateId: string | null;
  competencyStandardCode: string | null;
  certificateTemplate?: { id: string; nombre: string; estado?: string } | null;
  asignaturas: {
    studyPlanSubjectId: string;
    subjectId: string;
    code: string;
    name: string;
    level: number;
    credits: number | null;
    hours: number | null;
  }[];
  totalCredits: number;
  totalHours: number;
}

export interface BloqueCreateDto {
  name: string;
  description?: string;
  orderIndex?: number;
  certifiable?: boolean;
  certificateTemplateId?: string;
  competencyStandardCode?: string;
}

export interface BloqueDeEstudiante {
  id: string;
  name: string;
  description: string | null;
  orderIndex: number;
  certifiable: boolean;
  competencyStandardCode: string | null;
  certificateTemplate: { id: string; nombre: string } | null;
  asignaturas: {
    studyPlanSubjectId: string;
    subjectId: string;
    code: string;
    name: string;
    level: number;
    credits: number | null;
    hours: number | null;
    aprobada: boolean;
    finalGrade: number | null;
    origin: RecordOrigin | null;
  }[];
  aprobadas: number;
  totales: number;
  porcentaje: number;
  elegibleParaCertificado: boolean;
  certificado: {
    id: string;
    estado: string;
    motivo: string | null;
    fechaEmision: string | null;
  } | null;
}

export interface BloquesDeEstudiante {
  programEnrollmentId: string;
  studentId: string;
  programId: string;
  programName: string;
  bloques: BloqueDeEstudiante[];
}

// ----- clientes -----
// Las rutas llevan el prefijo /api/v1 explícito y se desenvuelve `.data`,
// igual que en academico.ts.

const RECORDS = '/api/v1/academic-records';
const STUDENTS = '/api/v1/students';
const PROGRAMS = '/api/v1/programs';
const EQUIVALENCES = '/api/v1/subject-equivalences';
const HOMOLOGATIONS = '/api/v1/homologations';
const STUDY_PLANS = '/api/v1/study-plans';
const BLOCKS = '/api/v1/study-plan-blocks';

export const historialApi = {
  /** Historial académico del estudiante. */
  get: async (studentId: string, incluirAnulados = false) =>
    (
      await apiClient.get<HistorialAcademico>(
        `${STUDENTS}/${studentId}/academic-record`,
        { params: incluirAnulados ? { incluirAnulados: 'true' } : undefined },
      )
    ).data,
};

export const cierreDeNotasApi = {
  previsualizar: async (courseId: string) =>
    (
      await apiClient.get<PrevisualizacionDeCierre>(
        `${RECORDS}/courses/${courseId}/grade-closure-preview`,
      )
    ).data,
  cerrar: async (courseId: string, observaciones?: string) =>
    (
      await apiClient.post<{
        message: string;
        cerradoEn: string;
        sinCalcular: { studentId: string; nombre: string; avisos: string[] }[];
      }>(
        `${RECORDS}/courses/${courseId}/close-grades`,
        observaciones ? { observaciones } : {},
      )
    ).data,
  reabrir: async (courseId: string, motivo: string) =>
    (
      await apiClient.post<{
        message: string;
        motivo: string;
        reabiertoPor: string;
      }>(`${RECORDS}/courses/${courseId}/reopen-grades`, { motivo })
    ).data,
};

/**
 * Reconocimiento automático al inscribir. El avance del pensum en sí se lee
 * con `progresoApi.dePrograma` de academico.ts: una sola lectura para todos.
 */
export const reconocimientoApi = {
  previsualizar: async (params: {
    studentId: string;
    programId: string;
    studyPlanId?: string;
  }) =>
    (
      await apiClient.get<PrevisualizacionDeReconocimiento>(
        `${RECORDS}/recognition-preview`,
        { params },
      )
    ).data,
  aplicar: async (programEnrollmentId: string) =>
    (
      await apiClient.post<{ message: string; reconocidas: string[] }>(
        `${RECORDS}/enrollments/${programEnrollmentId}/apply-recognition`,
        {},
      )
    ).data,
};

export const articulacionApi = {
  /** Matriz de articulación del programa origen contra los demás ACTIVO. */
  matriz: async (programId: string) =>
    (
      await apiClient.get<MatrizDeArticulacion>(
        `${PROGRAMS}/${programId}/articulation-matrix`,
      )
    ).data,
  /** Rutas de doble titulación desde el historial real del estudiante. */
  dobleTitulacion: async (studentId: string) =>
    (
      await apiClient.get<OpcionesDeDobleTitulacion>(
        `${STUDENTS}/${studentId}/double-degree-options`,
      )
    ).data,
};

export const equivalenciasApi = {
  getAll: async () => (await apiClient.get<Equivalencia[]>(EQUIVALENCES)).data,
  create: async (dto: EquivalenciaCreateDto) =>
    (await apiClient.post<Equivalencia>(EQUIVALENCES, dto)).data,
  update: async (id: string, dto: { bidirectional?: boolean; notes?: string }) =>
    (await apiClient.patch<Equivalencia>(`${EQUIVALENCES}/${id}`, dto)).data,
  remove: async (id: string) =>
    (await apiClient.delete<{ message: string }>(`${EQUIVALENCES}/${id}`)).data,
};

export const homologacionesApi = {
  getAll: async (filtros: { status?: HomologationStatus; studentId?: string } = {}) =>
    (
      await apiClient.get<SolicitudDeHomologacion[]>(HOMOLOGATIONS, {
        params: filtros,
      })
    ).data,
  get: async (id: string) =>
    (await apiClient.get<SolicitudDeHomologacion>(`${HOMOLOGATIONS}/${id}`)).data,
  create: async (dto: SolicitudCreateDto) =>
    (await apiClient.post<SolicitudDeHomologacion>(HOMOLOGATIONS, dto)).data,
  cambiarEstado: async (
    id: string,
    dto: { status: HomologationStatus; decisionNotes?: string },
  ) =>
    (
      await apiClient.patch<SolicitudDeHomologacion>(
        `${HOMOLOGATIONS}/${id}/status`,
        dto,
      )
    ).data,
  resolver: async (
    id: string,
    dto: { decisiones: DecisionDeItemDto[]; decisionNotes?: string },
  ) =>
    (
      await apiClient.post<{
        message: string;
        resultados: {
          itemId: string;
          targetSubjectId: string;
          decision: string;
          motivo?: string;
        }[];
        creditosExternosReconocidos: number;
        topeCreditosExternos: number;
      }>(`${HOMOLOGATIONS}/${id}/resolve`, dto)
    ).data,
};

export const bloquesApi = {
  getByPensum: async (studyPlanId: string) =>
    (await apiClient.get<BloqueDePensum[]>(`${STUDY_PLANS}/${studyPlanId}/blocks`))
      .data,
  create: async (studyPlanId: string, dto: BloqueCreateDto) =>
    (
      await apiClient.post<BloqueDePensum>(
        `${STUDY_PLANS}/${studyPlanId}/blocks`,
        dto,
      )
    ).data,
  update: async (id: string, dto: Partial<BloqueCreateDto>) =>
    (await apiClient.patch<BloqueDePensum>(`${BLOCKS}/${id}`, dto)).data,
  remove: async (id: string) =>
    (await apiClient.delete<{ message: string }>(`${BLOCKS}/${id}`)).data,
  setAsignaturas: async (id: string, studyPlanSubjectIds: string[]) =>
    (
      await apiClient.put<{ message: string }>(`${BLOCKS}/${id}/subjects`, {
        studyPlanSubjectIds,
      })
    ).data,
  /** Avance por bloques del estudiante, con elegibilidad del certificado. */
  deEstudiante: async (programEnrollmentId: string) =>
    (
      await apiClient.get<BloquesDeEstudiante>(
        `${BLOCKS}/enrollment/${programEnrollmentId}`,
      )
    ).data,
  emitirCertificado: async (
    id: string,
    studentId: string,
    observaciones?: string,
  ) =>
    (
      await apiClient.post<{ id: string; estado: string; motivo: string }>(
        `${BLOCKS}/${id}/certificate`,
        { studentId, ...(observaciones ? { observaciones } : {}) },
      )
    ).data,
};
