import { apiClient } from '../client';

export const usersApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await apiClient.get('/api/v1/users', { params });
    return { data: response.data };
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/api/v1/users/${id}`);
    return { data: response.data };
  },
  update: async (id: string, data: any) => {
    const response = await apiClient.patch(`/api/v1/users/${id}`, data);
    return { data: response.data };
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/v1/users/${id}`);
    return { data: response.data };
  },
};
