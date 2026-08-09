import { apiClient } from '../client';

export interface MassMessageCreateDto {
  asunto: string;
  contenido: string;
  remitente?: string;
  targetRoles?: string[];
  targetUsers?: string[];
  adjuntos?: string[];
  programado?: string;
}

export const massMessagesApi = {
  getAll: async (params?: any) => {
    const response = await apiClient.get('/api/v1/mass-messages', { params });
    return { data: response.data };
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/api/v1/mass-messages/${id}`);
    return { data: response.data };
  },
  create: async (data: MassMessageCreateDto) => {
    const response = await apiClient.post('/api/v1/mass-messages', data);
    return { data: response.data };
  },
  update: async (id: string, data: Partial<MassMessageCreateDto>) => {
    const response = await apiClient.patch(`/api/v1/mass-messages/${id}`, data);
    return { data: response.data };
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/v1/mass-messages/${id}`);
    return { data: response.data };
  },
  send: async (id: string) => {
    const response = await apiClient.post(`/api/v1/mass-messages/${id}/send`);
    return { data: response.data };
  },
  getStats: async () => {
    const response = await apiClient.get('/api/v1/mass-messages/stats');
    return { data: response.data };
  },
};
