import { apiClient } from '../client';

/**
 * Gestión de cursos y consulta de docentes.
 *
 * El panel de administración tenía la lista de cursos escrita a mano y sus
 * botones de crear, editar y eliminar solo tocaban ese arreglo en memoria: se
 * anunciaba "Curso creado exitosamente" y al recargar no quedaba nada.
 */
export interface CursoCreateDto {
  code: string;
  name: string;
  teacherId: string;
  description?: string;
  credits?: number;
  semester?: string;
  color?: string;
}

export const coursesAdminApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await apiClient.get('/api/v1/courses', { params });
    return { data: response.data };
  },
  create: async (data: CursoCreateDto) => {
    const response = await apiClient.post('/api/v1/courses', data);
    return { data: response.data };
  },
  update: async (id: string, data: Partial<CursoCreateDto> & { status?: string }) => {
    const response = await apiClient.patch(`/api/v1/courses/${id}`, data);
    return { data: response.data };
  },
  remove: async (id: string) => {
    const response = await apiClient.delete(`/api/v1/courses/${id}`);
    return { data: response.data };
  },
};

export const teachersApi = {
  /** Para poblar el selector de docente: el formulario pedía el nombre a mano. */
  getAll: async () => {
    const response = await apiClient.get('/api/v1/teachers');
    return { data: response.data };
  },
};
