import { apiClient } from '../client';

export interface InventoryItemCreateDto {
  codigo?: string;
  nombre: string;
  categoria: string;
  cantidad: number;
  cantidadMinima: number;
  unidadMedida: string;
  precioUnitario: number;
  ubicacion: string;
  proveedor: string;
  fechaUltimaCompra: string;
  estado?: 'disponible' | 'agotado' | 'bajo' | 'descontinuado';
}

export interface InventoryMovementCreateDto {
  itemId: string;
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  cantidad: number;
  motivo: string;
  responsable: string;
  fecha?: string;
}

export interface AdjustStockDto {
  tipo: 'AGREGAR' | 'REDUCIR' | 'ESTABLECER';
  cantidad: number;
  motivo: string;
  responsable: string;
}

export const inventoryApi = {
  items: {
    getAll: async (params?: any) => {
      const response = await apiClient.get('/api/v1/inventory/items', { params });
      return { data: response.data };
    },
    getById: async (id: string) => {
      const response = await apiClient.get(`/api/v1/inventory/items/${id}`);
      return { data: response.data };
    },
    create: async (data: InventoryItemCreateDto) => {
      const response = await apiClient.post('/api/v1/inventory/items', data);
      return { data: response.data };
    },
    update: async (id: string, data: Partial<InventoryItemCreateDto>) => {
      const response = await apiClient.patch(`/api/v1/inventory/items/${id}`, data);
      return { data: response.data };
    },
    delete: async (id: string) => {
      const response = await apiClient.delete(`/api/v1/inventory/items/${id}`);
      return { data: response.data };
    },
    getHistory: async (id: string) => {
      const response = await apiClient.get(`/api/v1/inventory/items/${id}/history`);
      return { data: response.data };
    },
    adjustStock: async (id: string, data: AdjustStockDto) => {
      const response = await apiClient.post(`/api/v1/inventory/items/${id}/adjust`, data);
      return { data: response.data };
    },
  },

  movements: {
    getAll: async (params?: any) => {
      const response = await apiClient.get('/api/v1/inventory/movements', { params });
      return { data: response.data };
    },
    getById: async (id: string) => {
      const response = await apiClient.get(`/api/v1/inventory/movements/${id}`);
      return { data: response.data };
    },
    create: async (data: InventoryMovementCreateDto) => {
      const response = await apiClient.post('/api/v1/inventory/movements', data);
      return { data: response.data };
    },
  },

  getStats: async () => {
    const response = await apiClient.get('/api/v1/inventory/stats');
    return { data: response.data };
  },

  getLowStock: async () => {
    const response = await apiClient.get('/api/v1/inventory/low-stock');
    return { data: response.data };
  },

  recalculateStates: async () => {
    const response = await apiClient.post('/api/v1/inventory/recalculate-states');
    return { data: response.data };
  },
};
