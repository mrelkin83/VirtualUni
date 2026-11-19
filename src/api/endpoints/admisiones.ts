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
};
