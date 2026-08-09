import { apiClient } from '../client';

export interface CardIssuance {
  id: string;
  tenantId: string;
  templateId?: string;
  lote: string;
  tipoExpedicion: 'NUEVA_EMISION' | 'RENOVACION' | 'REEMPLAZO' | 'MASIVA';
  cantidad: number;
  cantidadExitosa: number;
  cantidadFallida: number;
  expedidoPor: string;
  expedidoPorNombre: string;
  motivo?: string;
  observaciones?: string;
  estado: 'PROCESANDO' | 'COMPLETADO' | 'COMPLETADO_CON_ERRORES' | 'FALLIDO' | 'CANCELADO';
  pdfUrl?: string;
  archivoZipUrl?: string;
  carnetsGenerados: string[];
  errores?: any;
  fechaExpedicion: string;
  fechaCompletado?: string;
  createdAt: string;
  updatedAt: string;
  template?: {
    id: string;
    nombre: string;
  };
  carnets?: any[];
  _count?: {
    carnets: number;
  };
}

export interface UserDataDto {
  usuarioId: string;
  nombre: string;
  identificacion: string;
  tipoUsuario: string;
  fotoUrl: string;
}

export interface CreateCardIssuanceDto {
  templateId?: string;
  tipoExpedicion: 'NUEVA_EMISION' | 'RENOVACION' | 'REEMPLAZO' | 'MASIVA';
  usuarios: UserDataDto[];
  motivo?: string;
  observaciones?: string;
}

export interface QueryCardIssuancesDto {
  page?: number;
  limit?: number;
  search?: string;
  tipoExpedicion?: string;
  estado?: string;
  expedidoPor?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const cardIssuancesApi = {
  async getAll(params?: QueryCardIssuancesDto) {
    const response = await apiClient.get('/api/v1/card-issuances', { params });
    return { data: response.data };
  },

  async getById(id: string) {
    const response = await apiClient.get(`/api/v1/card-issuances/${id}`);
    return { data: response.data };
  },

  async getStats() {
    const response = await apiClient.get('/api/v1/card-issuances/stats');
    return { data: response.data };
  },

  async create(data: CreateCardIssuanceDto) {
    const response = await apiClient.post('/api/v1/card-issuances', data);
    return { data: response.data };
  },

  async cancel(id: string) {
    const response = await apiClient.post(`/api/v1/card-issuances/${id}/cancel`);
    return { data: response.data };
  },

  async downloadPDF(id: string) {
    const response = await apiClient.get(`/api/v1/card-generator/issuance/${id}/pdf`, {
      responseType: 'blob',
    });
    return { data: response.data };
  },
};
