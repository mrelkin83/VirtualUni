import { apiClient } from '../client';

// Debe coincidir con backend/src/modules/community/dto
export interface PostCreateDto {
  contenido: string;
  imagenUrl?: string;
  categoria?: string;
}

export type PostUpdateDto = Partial<PostCreateDto>;

export const communityApi = {
  getPosts: async (params?: { categoria?: string; search?: string }) => {
    const response = await apiClient.get<any>('/api/v1/community/posts', { params });
    return { data: response.data };
  },
  getPostById: async (id: string) => {
    const response = await apiClient.get<any>(`/api/v1/community/posts/${id}`);
    return { data: response.data };
  },
  createPost: async (data: PostCreateDto) => {
    const response = await apiClient.post<any>('/api/v1/community/posts', data);
    return { data: response.data };
  },
  updatePost: async (id: string, data: PostUpdateDto) => {
    const response = await apiClient.patch<any>(`/api/v1/community/posts/${id}`, data);
    return { data: response.data };
  },
  deletePost: async (id: string) => {
    const response = await apiClient.delete<any>(`/api/v1/community/posts/${id}`);
    return { data: response.data };
  },
  toggleLike: async (id: string) => {
    const response = await apiClient.post<any>(`/api/v1/community/posts/${id}/like`);
    return { data: response.data };
  },
  addComment: async (id: string, contenido: string) => {
    const response = await apiClient.post<any>(
      `/api/v1/community/posts/${id}/comments`,
      { contenido }
    );
    return { data: response.data };
  },
  deleteComment: async (id: string) => {
    const response = await apiClient.delete<any>(`/api/v1/community/comments/${id}`);
    return { data: response.data };
  },
};
