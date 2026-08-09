import { apiClient } from '../client';

/**
 * Banco de preguntas reutilizables. El editor existía en el panel del docente
 * pero las preguntas solo viven en la base atadas a un examen concreto, así que
 * el banco se perdía al recargar.
 */
export interface PreguntaBanco {
  id?: string;
  pregunta: string;
  tipo?: string;
  opciones?: string[];
  respuestaCorrecta?: number;
  puntos?: number;
  categoria?: string;
}

export const bancoPreguntasApi = {
  getAll: async (categoria?: string) => {
    const response = await apiClient.get('/api/v1/question-bank', {
      params: categoria ? { categoria } : undefined,
    });
    return { data: response.data };
  },
  create: async (data: PreguntaBanco) => {
    const response = await apiClient.post('/api/v1/question-bank', data);
    return { data: response.data };
  },
  update: async (id: string, data: Partial<PreguntaBanco>) => {
    const response = await apiClient.patch(`/api/v1/question-bank/${id}`, data);
    return { data: response.data };
  },
  remove: async (id: string) => {
    const response = await apiClient.delete(`/api/v1/question-bank/${id}`);
    return { data: response.data };
  },
};
