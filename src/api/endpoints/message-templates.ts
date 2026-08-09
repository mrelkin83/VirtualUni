import { apiClient } from '../client';

export interface PlantillaMensaje {
  id?: string;
  nombre: string;
  contenido: string;
  categoria?: string;
}

export const plantillasMensajeApi = {
  getAll: async () => {
    const response = await apiClient.get('/api/v1/message-templates');
    return { data: response.data };
  },
  create: async (data: PlantillaMensaje) => {
    const response = await apiClient.post('/api/v1/message-templates', data);
    return { data: response.data };
  },
  update: async (id: string, data: Partial<PlantillaMensaje>) => {
    const response = await apiClient.patch(`/api/v1/message-templates/${id}`, data);
    return { data: response.data };
  },
  remove: async (id: string) => {
    const response = await apiClient.delete(`/api/v1/message-templates/${id}`);
    return { data: response.data };
  },
};
