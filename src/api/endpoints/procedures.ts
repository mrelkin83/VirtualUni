import { apiClient } from '../client';

export interface ProcedureCreateDto {
  tipo: string;
  solicitanteId?: string;
  solicitante?: string;
  descripcion: string;
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
  adjuntos?: string[];
}

export const proceduresApi = {
  getAll: async (params?: any) => {
    const response = await apiClient.get('/api/v1/procedures', { params });
    return { data: response.data };
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/api/v1/procedures/${id}`);
    return { data: response.data };
  },
  // Trámites del propio solicitante: listar todos sigue siendo de la
  // administración, así que sin esta ruta el estudiante enviaba un trámite y
  // no volvía a verlo nunca.
  getMy: async () => {
    const response = await apiClient.get('/api/v1/procedures/my');
    return { data: response.data };
  },
  cancelarPropio: async (id: string) => {
    const response = await apiClient.patch(`/api/v1/procedures/my/${id}/cancel`);
    return { data: response.data };
  },
  create: async (data: ProcedureCreateDto) => {
    const response = await apiClient.post('/api/v1/procedures', data);
    return { data: response.data };
  },
  update: async (id: string, data: Partial<ProcedureCreateDto>) => {
    const response = await apiClient.patch(`/api/v1/procedures/${id}`, data);
    return { data: response.data };
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/v1/procedures/${id}`);
    return { data: response.data };
  },
  assign: async (id: string, asignadoA: string) => {
    const response = await apiClient.post(`/api/v1/procedures/${id}/assign`, { asignadoA });
    return { data: response.data };
  },
  respond: async (id: string, respuesta: string, adjuntos?: string[]) => {
    const response = await apiClient.post(`/api/v1/procedures/${id}/respond`, { respuesta, adjuntos });
    return { data: response.data };
  },
  getStats: async () => {
    const response = await apiClient.get('/api/v1/procedures/stats');
    return { data: response.data };
  },
};
