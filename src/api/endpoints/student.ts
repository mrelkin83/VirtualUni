import { apiClient } from '../client';

export const coursesApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await apiClient.get('/api/v1/courses', { params });
    return { data: response.data };
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/api/v1/courses/${id}`);
    return { data: response.data };
  },
  getStats: async (id: string) => {
    const response = await apiClient.get(`/api/v1/courses/${id}/stats`);
    return { data: response.data };
  },
};

export const assignmentsApi = {
  getAll: async (params?: { courseId?: string }) => {
    const response = await apiClient.get('/api/v1/assignments', { params });
    return { data: response.data };
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/api/v1/assignments/${id}`);
    return { data: response.data };
  },
  // Solo las tareas de los cursos en los que está matriculado, con el estado
  // de su propia entrega. `/assignments` a secas devuelve las del tenant
  // entero y sin entrega, así que el panel no podía clasificarlas.
  getMy: async () => {
    const response = await apiClient.get('/api/v1/assignments/my');
    return { data: response.data };
  },
  // El autor lo pone el backend a partir del token. Antes se enviaba
  // `studentId` en el cuerpo, con la cadena literal 'current-user': ninguna
  // entrega llegaba a guardarse, fallaba por clave foranea.
  submit: async (id: string, data: { content?: string; fileUrl?: string }) => {
    const response = await apiClient.post(`/api/v1/assignments/${id}/submit`, data);
    return { data: response.data };
  },
};

export const gradesApi = {
  // Las notas del propio alumno: el backend resuelve su ficha a partir del
  // token. Antes se llamaba a /grades/student/:id con el id de USUARIO, que
  // nunca coincide con el de estudiante, asi que la respuesta venia vacia
  // siempre y el panel de notas aparecia en blanco.
  getMy: async () => {
    const response = await apiClient.get('/api/v1/grades/my');
    return { data: response.data };
  },
  getByStudent: async (studentId: string) => {
    const response = await apiClient.get(`/api/v1/grades/student/${studentId}`);
    return { data: response.data };
  },
  getByCourse: async (courseId: string) => {
    const response = await apiClient.get(`/api/v1/grades/course/${courseId}`);
    return { data: response.data };
  },
  getAverage: async (studentId: string, courseId?: string) => {
    const response = await apiClient.get(`/api/v1/grades/student/${studentId}/average`, {
      params: courseId ? { courseId } : undefined,
    });
    return { data: response.data };
  },
};

export const messagesApi = {
  getInbox: async () => {
    const response = await apiClient.get('/api/v1/messages/inbox');
    return { data: response.data };
  },
  getSent: async () => {
    const response = await apiClient.get('/api/v1/messages/sent');
    return { data: response.data };
  },
  getUnreadCount: async () => {
    const response = await apiClient.get('/api/v1/messages/unread-count');
    return { data: response.data };
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/api/v1/messages/${id}`);
    return { data: response.data };
  },
  create: async (data: any) => {
    const response = await apiClient.post('/api/v1/messages', data);
    return { data: response.data };
  },
  markAsRead: async (id: string) => {
    const response = await apiClient.patch(`/api/v1/messages/${id}/read`);
    return { data: response.data };
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/v1/messages/${id}`);
    return { data: response.data };
  },
};
