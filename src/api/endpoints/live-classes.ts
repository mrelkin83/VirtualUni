import { apiClient } from '../client';

// Debe coincidir con backend/src/modules/live-classes/dto
export type LiveClassStatus = 'PROGRAMADA' | 'EN_CURSO' | 'FINALIZADA' | 'CANCELADA';

export interface LiveClassCreateDto {
  courseId: string;
  titulo: string;
  descripcion?: string;
  fechaInicio: string; // ISO
  fechaFin?: string;
  enlace?: string;
  plataforma?: string;
  aula?: string;
  estado?: LiveClassStatus;
  grabacionUrl?: string;
  duracionMinutos?: number;
}

export type LiveClassUpdateDto = Partial<LiveClassCreateDto>;

export interface QueryLiveClassesParams {
  courseId?: string;
  estado?: LiveClassStatus;
  soloGrabadas?: string;
}

export const liveClassesApi = {
  getAll: async (params?: QueryLiveClassesParams) => {
    const response = await apiClient.get<any>('/api/v1/live-classes', { params });
    return { data: response.data };
  },
  getMy: async (params?: QueryLiveClassesParams) => {
    const response = await apiClient.get<any>('/api/v1/live-classes/my', { params });
    return { data: response.data };
  },
  getById: async (id: string) => {
    const response = await apiClient.get<any>(`/api/v1/live-classes/${id}`);
    return { data: response.data };
  },
  create: async (data: LiveClassCreateDto) => {
    const response = await apiClient.post<any>('/api/v1/live-classes', data);
    return { data: response.data };
  },
  update: async (id: string, data: LiveClassUpdateDto) => {
    const response = await apiClient.patch<any>(`/api/v1/live-classes/${id}`, data);
    return { data: response.data };
  },
  delete: async (id: string) => {
    const response = await apiClient.delete<any>(`/api/v1/live-classes/${id}`);
    return { data: response.data };
  },
  start: async (id: string) => {
    const response = await apiClient.post<any>(`/api/v1/live-classes/${id}/start`);
    return { data: response.data };
  },
  finish: async (id: string, grabacionUrl?: string) => {
    const response = await apiClient.post<any>(`/api/v1/live-classes/${id}/finish`, {
      grabacionUrl,
    });
    return { data: response.data };
  },
  join: async (id: string) => {
    const response = await apiClient.post<any>(`/api/v1/live-classes/${id}/join`);
    return { data: response.data };
  },
};
