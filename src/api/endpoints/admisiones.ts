import { apiClient } from '../client';

// Debe calcar backend/src/modules/admissions (bandeja del admin).

export interface SolicitudFila {
  id: string;
  code: string;
  status: string;
  targetLevel?: number | null;
  submittedAt?: string | null;
  createdAt: string;
  applicant: {
    firstName: string; lastName: string; documentType: string; documentNumber: string;
    email: string; phone: string; utm?: Record<string, string> | null;
  };
  call?: { name: string; slug: string; program: { name: string } } | null;
  _count?: { documents: number };
}

export interface SolicitudDetalle extends SolicitudFila {
  applicant: SolicitudFila['applicant'] & {
    birthDate?: string | null; city?: string | null; previousEducation?: string | null;
    guardian?: { nombre?: string; documento?: string; parentesco?: string; telefono?: string } | null;
    consentAt: string; consentVersion: string;
  };
  documents: {
    id: string; originalName: string; mimeType: string; sizeKb: number;
    status: string; reviewNote?: string | null;
    requiredDoc?: { name: string } | null;
  }[];
  events: { id: string; type: string; createdAt: string; data?: Record<string, unknown> | null }[];
}

const BASE = '/api/v1/admissions';

export const admisionesApi = {
  convocatorias: async () =>
    (await apiClient.get<{ id: string; name: string; slug: string; status: string; program: { name: string } }[]>(`${BASE}/calls`)).data,
  solicitudes: async (filtros: Record<string, string | undefined>) =>
    (await apiClient.get<SolicitudFila[]>(`${BASE}/applications`, { params: filtros })).data,
  detalle: async (id: string) =>
    (await apiClient.get<SolicitudDetalle>(`${BASE}/applications/${id}`)).data,
  revisarDocumento: async (docId: string, data: { status: 'APROBADO' | 'RECHAZADO'; reviewNote?: string }) =>
    (await apiClient.patch<SolicitudDetalle>(`${BASE}/documents/${docId}`, data)).data,
  pedirCorreccion: async (id: string, nota: string) =>
    (await apiClient.post<SolicitudDetalle>(`${BASE}/applications/${id}/pedir-correccion`, { nota })).data,
  /** URL del visor del documento (lleva el token por el apiClient al abrir en blob). */
  rutaArchivo: (docId: string) => `${BASE}/documents/${docId}/archivo`,

  // ----- pago manual y decisión (Fase 4)
  confirmarPago: async (id: string, ref?: string) =>
    (await apiClient.post<SolicitudDetalle>(`${BASE}/applications/${id}/confirmar-pago`, { ref })).data,
  rechazarPago: async (id: string, nota: string) =>
    (await apiClient.post<SolicitudDetalle>(`${BASE}/applications/${id}/rechazar-pago`, { nota })).data,
  admitir: async (id: string, nota?: string) =>
    (await apiClient.post<SolicitudDetalle>(`${BASE}/applications/${id}/admitir`, { nota })).data,
  noAdmitir: async (id: string, nota: string) =>
    (await apiClient.post<SolicitudDetalle>(`${BASE}/applications/${id}/no-admitir`, { nota })).data,
  desistir: async (id: string) =>
    (await apiClient.post<SolicitudDetalle>(`${BASE}/applications/${id}/desistir`, {})).data,
  matricular: async (id: string) =>
    (await apiClient.post<SolicitudDetalle>(`${BASE}/applications/${id}/matricular`, {})).data,

  // ----- embudo y convocatorias (Fase 4)
  embudo: async (callId?: string) =>
    (await apiClient.get<{
      totales: { interesados: number; enviadas: number; pagadas: number; admitidas: number; matriculadas: number };
      fuentes: { fuente: string; total: number; enviadas: number; admitidas: number; matriculadas: number }[];
    }>(`${BASE}/funnel`, { params: callId ? { callId } : undefined })).data,
  callsDetallado: async () =>
    (await apiClient.get<ConvocatoriaDetallada[]>(`${BASE}/calls/detallado`)).data,
  crearCall: async (data: Record<string, unknown>) =>
    (await apiClient.post<ConvocatoriaDetallada>(`${BASE}/calls`, data)).data,
  actualizarCall: async (id: string, data: Record<string, unknown>) =>
    (await apiClient.patch<ConvocatoriaDetallada>(`${BASE}/calls/${id}`, data)).data,
};

export interface ConvocatoriaDetallada {
  id: string; name: string; slug: string; status: string;
  opensAt: string; closesAt?: string | null; rolling: boolean; startsAt?: string | null;
  capacity?: number | null; applicationFee: number; schedule?: string | null;
  minAge?: number | null; maxAge?: number | null; minEducation?: string | null;
  targetLevels?: { level: number; label: string; capacity?: number }[] | null;
  program: { id: string; name: string };
  academicPeriod: { id: string; code: string };
  studyPlan: { id: string; version: string };
  requiredDocuments: { id: string; name: string; required: boolean }[];
  _count: { applications: number };
  cupoUsado: number;
  abierta: boolean;
}
