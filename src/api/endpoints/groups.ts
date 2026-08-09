import { apiClient } from '../client';

// Debe coincidir con backend/src/modules/groups/dto
export interface GroupCreateDto {
  courseId: string;
  nombre: string;
  descripcion?: string;
  capacidadMaxima?: number;
  horario?: string;
  aula?: string;
  color?: string;
}

export type GroupUpdateDto = Partial<GroupCreateDto>;

export const groupsApi = {
  getAll: async (courseId?: string) => {
    const response = await apiClient.get<any>('/api/v1/groups', {
      params: courseId ? { courseId } : undefined,
    });
    return { data: response.data };
  },
  getById: async (id: string) => {
    const response = await apiClient.get<any>(`/api/v1/groups/${id}`);
    return { data: response.data };
  },
  create: async (data: GroupCreateDto) => {
    const response = await apiClient.post<any>('/api/v1/groups', data);
    return { data: response.data };
  },
  update: async (id: string, data: GroupUpdateDto) => {
    const response = await apiClient.patch<any>(`/api/v1/groups/${id}`, data);
    return { data: response.data };
  },
  delete: async (id: string) => {
    const response = await apiClient.delete<any>(`/api/v1/groups/${id}`);
    return { data: response.data };
  },
  addMembers: async (id: string, studentIds: string[]) => {
    const response = await apiClient.post<any>(`/api/v1/groups/${id}/members`, {
      studentIds,
    });
    return { data: response.data };
  },
  removeMember: async (id: string, studentId: string) => {
    const response = await apiClient.delete<any>(
      `/api/v1/groups/${id}/members/${studentId}`
    );
    return { data: response.data };
  },
};
