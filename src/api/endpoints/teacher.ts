import { apiClient } from '../client';

export const teacherCoursesApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await apiClient.get('/api/v1/courses', { params });
    return { data: response.data };
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/api/v1/courses/${id}`);
    return { data: response.data };
  },
  update: async (id: string, data: any) => {
    const response = await apiClient.patch(`/api/v1/courses/${id}`, data);
    return { data: response.data };
  },
  getStats: async (id: string) => {
    const response = await apiClient.get(`/api/v1/courses/${id}/stats`);
    return { data: response.data };
  },
};

export const teacherStudentsApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await apiClient.get('/api/v1/students', { params });
    return { data: response.data };
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/api/v1/students/${id}`);
    return { data: response.data };
  },
  getStats: async (id: string) => {
    const response = await apiClient.get(`/api/v1/students/${id}/stats`);
    return { data: response.data };
  },
};

export const teacherAssignmentsApi = {
  getAll: async (params?: { courseId?: string }) => {
    const response = await apiClient.get('/api/v1/assignments', { params });
    return { data: response.data };
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/api/v1/assignments/${id}`);
    return { data: response.data };
  },
  create: async (data: any) => {
    const response = await apiClient.post('/api/v1/assignments', data);
    return { data: response.data };
  },
  update: async (id: string, data: any) => {
    const response = await apiClient.patch(`/api/v1/assignments/${id}`, data);
    return { data: response.data };
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/v1/assignments/${id}`);
    return { data: response.data };
  },
  grade: async (submissionId: string, data: { grade: number; feedback?: string }) => {
    const response = await apiClient.post(`/api/v1/assignments/submissions/${submissionId}/grade`, data);
    return { data: response.data };
  },
};

export const teacherGradesApi = {
  getByCourse: async (courseId: string) => {
    const response = await apiClient.get(`/api/v1/grades/course/${courseId}`);
    return { data: response.data };
  },
  getByStudent: async (studentId: string) => {
    const response = await apiClient.get(`/api/v1/grades/student/${studentId}`);
    return { data: response.data };
  },
  create: async (data: any) => {
    const response = await apiClient.post('/api/v1/grades', data);
    return { data: response.data };
  },
  update: async (id: string, data: any) => {
    const response = await apiClient.patch(`/api/v1/grades/${id}`, data);
    return { data: response.data };
  },
};

export const teacherMessagesApi = {
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
