import { apiClient } from '../client';

// Debe coincidir con backend/src/modules/exams/dto (ValidationPipe con forbidNonWhitelisted)
export interface ExamQuestionDto {
  pregunta: string;
  opciones: string[];
  respuestaCorrecta: number;
  puntaje?: number;
  orderIndex?: number;
}

export interface ExamCreateDto {
  courseId: string;
  titulo: string;
  instrucciones?: string;
  fecha: string; // ISO
  duracion: number; // minutos
  notaMinima?: number;
  intentosPermitidos?: number;
  mostrarResultados?: boolean;
  mezclarPreguntas?: boolean;
  preguntas?: ExamQuestionDto[];
}

export type ExamUpdateDto = Partial<Omit<ExamCreateDto, 'courseId'>>;

export const examsApi = {
  getAll: async (params?: { courseId?: string; estado?: string }) => {
    const response = await apiClient.get<any>('/api/v1/exams', { params });
    return { data: response.data };
  },
  getById: async (id: string) => {
    const response = await apiClient.get<any>(`/api/v1/exams/${id}`);
    return { data: response.data };
  },
  create: async (data: ExamCreateDto) => {
    const response = await apiClient.post<any>('/api/v1/exams', data);
    return { data: response.data };
  },
  update: async (id: string, data: ExamUpdateDto) => {
    const response = await apiClient.patch<any>(`/api/v1/exams/${id}`, data);
    return { data: response.data };
  },
  delete: async (id: string) => {
    const response = await apiClient.delete<any>(`/api/v1/exams/${id}`);
    return { data: response.data };
  },
  publish: async (id: string) => {
    const response = await apiClient.post<any>(`/api/v1/exams/${id}/publish`);
    return { data: response.data };
  },
  finalize: async (id: string) => {
    const response = await apiClient.post<any>(`/api/v1/exams/${id}/finalize`);
    return { data: response.data };
  },
  getResults: async (id: string) => {
    const response = await apiClient.get<any>(`/api/v1/exams/${id}/results`);
    return { data: response.data };
  },
  // Estudiante
  startAttempt: async (examId: string) => {
    const response = await apiClient.post<any>(`/api/v1/exams/${examId}/attempts`);
    return { data: response.data };
  },
  submitAttempt: async (attemptId: string, respuestas: Record<string, number>) => {
    const response = await apiClient.post<any>(`/api/v1/exams/attempts/${attemptId}/submit`, { respuestas });
    return { data: response.data };
  },
  getMyAttempts: async () => {
    const response = await apiClient.get<any>('/api/v1/exams/attempts/my');
    return { data: response.data };
  },
};
