import { apiClient } from '../client';

export interface AssetCreateDto {
  codigo?: string;
  nombre: string;
  categoria: 'tecnologia' | 'mobiliario' | 'equipamiento' | 'vehiculo' | 'otro';
  descripcion: string;
  valorCompra: number;
  valorActual?: number;
  fechaCompra: string;
  estado: 'excelente' | 'bueno' | 'regular' | 'malo' | 'danado';
  ubicacion: string;
  responsable: string;
  imagenUrl?: string;
  numeroSerie?: string;
  proveedor?: string;
}

export type AssetUpdateDto = Partial<AssetCreateDto>;

export interface AssetQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoria?: string;
  estado?: string;
  ubicacion?: string;
  responsable?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const assetsApi = {
  getAll: async (params?: AssetQueryParams) => {
    const response = await apiClient.get('/api/v1/assets', { params });
    return { data: response.data };
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/api/v1/assets/${id}`);
    return { data: response.data };
  },

  create: async (data: AssetCreateDto) => {
    const response = await apiClient.post('/api/v1/assets', data);
    return { data: response.data };
  },

  update: async (id: string, data: AssetUpdateDto) => {
    const response = await apiClient.patch(`/api/v1/assets/${id}`, data);
    return { data: response.data };
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/v1/assets/${id}`);
    return { data: response.data };
  },

  getStats: async () => {
    const response = await apiClient.get('/api/v1/assets/stats');
    return { data: response.data };
  },

  getByCategory: async () => {
    const response = await apiClient.get('/api/v1/assets/by-category');
    return { data: response.data };
  },

  getNeedsAttention: async () => {
    const response = await apiClient.get('/api/v1/assets/needs-attention');
    return { data: response.data };
  },

  recalculateDepreciation: async () => {
    const response = await apiClient.post('/api/v1/assets/recalculate-depreciation');
    return { data: response.data };
  },
};
