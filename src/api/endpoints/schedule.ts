import { apiClient } from '../client';

// Debe coincidir con backend/src/modules/schedule/dto
export interface ScheduleEventCreateDto {
  courseId?: string;
  titulo: string;
  tipo?: string;
  diaSemana: number; // 1 = lunes ... 7 = domingo
  horaInicio: string; // HH:mm
  horaFin: string; // HH:mm
  aula?: string;
  color?: string;
}

export type ScheduleEventUpdateDto = Partial<ScheduleEventCreateDto>;

export const scheduleApi = {
  getMy: async () => {
    const response = await apiClient.get<any>('/api/v1/schedule/my');
    return { data: response.data };
  },
  getAll: async (courseId?: string) => {
    const response = await apiClient.get<any>('/api/v1/schedule', {
      params: courseId ? { courseId } : undefined,
    });
    return { data: response.data };
  },
  getById: async (id: string) => {
    const response = await apiClient.get<any>(`/api/v1/schedule/${id}`);
    return { data: response.data };
  },
  create: async (data: ScheduleEventCreateDto) => {
    const response = await apiClient.post<any>('/api/v1/schedule', data);
    return { data: response.data };
  },
  update: async (id: string, data: ScheduleEventUpdateDto) => {
    const response = await apiClient.patch<any>(`/api/v1/schedule/${id}`, data);
    return { data: response.data };
  },
  delete: async (id: string) => {
    const response = await apiClient.delete<any>(`/api/v1/schedule/${id}`);
    return { data: response.data };
  },
};
