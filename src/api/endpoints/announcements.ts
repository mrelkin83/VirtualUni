import { apiClient } from '../client';

// Debe coincidir con backend/src/modules/announcements/dto/create-announcement.dto.ts
// (el backend usa ValidationPipe con forbidNonWhitelisted: campos extra => 400)
export interface AnnouncementCreateDto {
  titulo: string;
  contenido: string;
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
  adjuntos?: string[];
  targetRoles?: string[];
  publicar?: boolean;
}

export const announcementsApi = {
  getAll: async (params?: any) => {
    const response = await apiClient.get('/api/v1/announcements', { params });
    return { data: response.data };
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/api/v1/announcements/${id}`);
    return { data: response.data };
  },
  create: async (data: AnnouncementCreateDto) => {
    const response = await apiClient.post('/api/v1/announcements', data);
    return { data: response.data };
  },
  update: async (id: string, data: Partial<AnnouncementCreateDto>) => {
    const response = await apiClient.patch(`/api/v1/announcements/${id}`, data);
    return { data: response.data };
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/v1/announcements/${id}`);
    return { data: response.data };
  },
  publish: async (id: string) => {
    const response = await apiClient.post(`/api/v1/announcements/${id}/publish`);
    return { data: response.data };
  },
  archive: async (id: string) => {
    const response = await apiClient.post(`/api/v1/announcements/${id}/archive`);
    return { data: response.data };
  },
  getStats: async () => {
    const response = await apiClient.get('/api/v1/announcements/stats');
    return { data: response.data };
  },
};
