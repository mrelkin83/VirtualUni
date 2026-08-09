import { apiClient } from '../client';

// Debe coincidir con backend/src/modules/forums/dto
export interface TopicCreateDto {
  courseId?: string;
  titulo: string;
  contenido: string;
  categoria?: string;
}

export interface TopicUpdateDto extends Partial<TopicCreateDto> {
  fijado?: boolean;
  cerrado?: boolean;
}

export interface QueryTopicsParams {
  courseId?: string;
  categoria?: string;
  search?: string;
}

export const forumsApi = {
  getTopics: async (params?: QueryTopicsParams) => {
    const response = await apiClient.get<any>('/api/v1/forums/topics', { params });
    return { data: response.data };
  },
  getTopicById: async (id: string) => {
    const response = await apiClient.get<any>(`/api/v1/forums/topics/${id}`);
    return { data: response.data };
  },
  createTopic: async (data: TopicCreateDto) => {
    const response = await apiClient.post<any>('/api/v1/forums/topics', data);
    return { data: response.data };
  },
  updateTopic: async (id: string, data: TopicUpdateDto) => {
    const response = await apiClient.patch<any>(`/api/v1/forums/topics/${id}`, data);
    return { data: response.data };
  },
  deleteTopic: async (id: string) => {
    const response = await apiClient.delete<any>(`/api/v1/forums/topics/${id}`);
    return { data: response.data };
  },
  createReply: async (topicId: string, contenido: string) => {
    const response = await apiClient.post<any>(
      `/api/v1/forums/topics/${topicId}/replies`,
      { contenido }
    );
    return { data: response.data };
  },
  updateReply: async (
    id: string,
    data: { contenido?: string; esSolucion?: boolean }
  ) => {
    const response = await apiClient.patch<any>(`/api/v1/forums/replies/${id}`, data);
    return { data: response.data };
  },
  likeReply: async (id: string) => {
    const response = await apiClient.post<any>(`/api/v1/forums/replies/${id}/like`);
    return { data: response.data };
  },
  deleteReply: async (id: string) => {
    const response = await apiClient.delete<any>(`/api/v1/forums/replies/${id}`);
    return { data: response.data };
  },
  getStats: async () => {
    const response = await apiClient.get<any>('/api/v1/forums/stats');
    return { data: response.data };
  },
};
