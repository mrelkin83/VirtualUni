import { apiClient } from '../client';

// Debe coincidir con backend/src/modules/materials/dto (ValidationPipe con forbidNonWhitelisted)
export type MaterialType =
  | 'DOCUMENTO'
  | 'VIDEO'
  | 'ENLACE'
  | 'PRESENTACION'
  | 'IMAGEN'
  | 'AUDIO'
  | 'OTRO';

export interface MaterialCreateDto {
  courseId: string;
  folderId?: string;
  nombre: string;
  descripcion?: string;
  tipo: MaterialType;
  url: string;
  formato?: string;
  tamanioKb?: number;
  visible?: boolean;
}

export type MaterialUpdateDto = Partial<MaterialCreateDto>;

export interface FolderCreateDto {
  courseId?: string;
  nombre: string;
  descripcion?: string;
  color?: string;
}

export type FolderUpdateDto = Partial<FolderCreateDto>;

export interface QueryMaterialsParams {
  courseId?: string;
  folderId?: string;
  tipo?: MaterialType;
  search?: string;
}

export const materialsApi = {
  getAll: async (params?: QueryMaterialsParams) => {
    const response = await apiClient.get<any>('/api/v1/materials', { params });
    return { data: response.data };
  },
  getMy: async (params?: QueryMaterialsParams) => {
    const response = await apiClient.get<any>('/api/v1/materials/my', { params });
    return { data: response.data };
  },
  getById: async (id: string) => {
    const response = await apiClient.get<any>(`/api/v1/materials/${id}`);
    return { data: response.data };
  },
  getStats: async (courseId?: string) => {
    const response = await apiClient.get<any>('/api/v1/materials/stats', {
      params: courseId ? { courseId } : undefined,
    });
    return { data: response.data };
  },
  create: async (data: MaterialCreateDto) => {
    const response = await apiClient.post<any>('/api/v1/materials', data);
    return { data: response.data };
  },
  update: async (id: string, data: MaterialUpdateDto) => {
    const response = await apiClient.patch<any>(`/api/v1/materials/${id}`, data);
    return { data: response.data };
  },
  delete: async (id: string) => {
    const response = await apiClient.delete<any>(`/api/v1/materials/${id}`);
    return { data: response.data };
  },
  download: async (id: string) => {
    const response = await apiClient.post<any>(`/api/v1/materials/${id}/download`);
    return { data: response.data };
  },
  // Carpetas
  getFolders: async (courseId?: string) => {
    const response = await apiClient.get<any>('/api/v1/materials/folders', {
      params: courseId ? { courseId } : undefined,
    });
    return { data: response.data };
  },
  createFolder: async (data: FolderCreateDto) => {
    const response = await apiClient.post<any>('/api/v1/materials/folders', data);
    return { data: response.data };
  },
  updateFolder: async (id: string, data: FolderUpdateDto) => {
    const response = await apiClient.patch<any>(`/api/v1/materials/folders/${id}`, data);
    return { data: response.data };
  },
  deleteFolder: async (id: string) => {
    const response = await apiClient.delete<any>(`/api/v1/materials/folders/${id}`);
    return { data: response.data };
  },
};
