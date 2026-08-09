import { apiClient } from '../client';

/**
 * Temario de un curso.
 *
 * El panel del docente llama "módulo" a lo que la base guarda como
 * `CourseTopic`, y "tema" a cada bloque de contenido dentro de él
 * (`TopicBlock`). La jerarquía coincide; solo cambian los nombres.
 */
const BASE = '/api/v1/course-topics';

export const temarioApi = {
  getByCourse: async (courseId: string) => {
    const response = await apiClient.get(BASE, { params: { courseId } });
    return { data: response.data };
  },
  crearModulo: async (data: { courseId: string; title: string; description?: string; orderIndex?: number }) => {
    const response = await apiClient.post(BASE, data);
    return { data: response.data };
  },
  actualizarModulo: async (id: string, data: { title?: string; description?: string; orderIndex?: number }) => {
    const response = await apiClient.patch(`${BASE}/${id}`, data);
    return { data: response.data };
  },
  eliminarModulo: async (id: string) => {
    const response = await apiClient.delete(`${BASE}/${id}`);
    return { data: response.data };
  },
  crearTema: async (moduloId: string, data: { title: string; content?: string; objectives?: string[]; keyIdeas?: string[] }) => {
    const response = await apiClient.post(`${BASE}/${moduloId}/blocks`, data);
    return { data: response.data };
  },
  actualizarTema: async (temaId: string, data: { title?: string; content?: string; objectives?: string[]; keyIdeas?: string[] }) => {
    const response = await apiClient.patch(`${BASE}/blocks/${temaId}`, data);
    return { data: response.data };
  },
  eliminarTema: async (temaId: string) => {
    const response = await apiClient.delete(`${BASE}/blocks/${temaId}`);
    return { data: response.data };
  },
};
