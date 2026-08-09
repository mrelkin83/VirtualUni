import { apiClient } from '../client';

export interface IDCardCreateDto {
  usuarioId: string;
  nombre: string;
  identificacion: string;
  tipoUsuario: 'estudiante' | 'docente' | 'administrativo';
  numeroCarnet?: string;
  fechaEmision: string;
  fechaVencimiento: string;
  estado: 'activo' | 'vencido' | 'bloqueado' | 'perdido';
  fotoUrl: string;
}

export interface GenerateQRDto {
  data?: Record<string, any>;
}

export interface RenewCardDto {
  meses: number;
}

export interface BlockCardDto {
  motivo: string;
}

export const idCardsApi = {
  getAll: async (params?: any) => {
    const response = await apiClient.get('/api/v1/idcards', { params });
    return { data: response.data };
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/api/v1/idcards/${id}`);
    return { data: response.data };
  },

  getByUser: async (usuarioId: string) => {
    const response = await apiClient.get(`/api/v1/idcards/user/${usuarioId}`);
    return { data: response.data };
  },

  getByNumber: async (numeroCarnet: string) => {
    const response = await apiClient.get(`/api/v1/idcards/number/${numeroCarnet}`);
    return { data: response.data };
  },

  create: async (data: IDCardCreateDto) => {
    const response = await apiClient.post('/api/v1/idcards', data);
    return { data: response.data };
  },

  update: async (id: string, data: Partial<IDCardCreateDto>) => {
    const response = await apiClient.patch(`/api/v1/idcards/${id}`, data);
    return { data: response.data };
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/v1/idcards/${id}`);
    return { data: response.data };
  },

  renew: async (id: string, data: RenewCardDto) => {
    const response = await apiClient.post(`/api/v1/idcards/${id}/renew`, data);
    return { data: response.data };
  },

  block: async (id: string, data: BlockCardDto) => {
    const response = await apiClient.post(`/api/v1/idcards/${id}/block`, data);
    return { data: response.data };
  },

  unblock: async (id: string) => {
    const response = await apiClient.post(`/api/v1/idcards/${id}/unblock`);
    return { data: response.data };
  },

  reportLost: async (id: string) => {
    const response = await apiClient.post(`/api/v1/idcards/${id}/report-lost`);
    return { data: response.data };
  },

  generateQR: async (id: string, data?: GenerateQRDto) => {
    const response = await apiClient.post(`/api/v1/idcards/${id}/generate-qr`, data);
    return { data: response.data };
  },

  verify: async (qrCode: string) => {
    const response = await apiClient.post('/api/v1/idcards/verify', { qrCode });
    return { data: response.data };
  },

  exportForPrint: async (id: string) => {
    const response = await apiClient.get(`/api/v1/idcards/${id}/export`);
    return { data: response.data };
  },

  getStats: async () => {
    const response = await apiClient.get('/api/v1/idcards/stats');
    return { data: response.data };
  },
};
