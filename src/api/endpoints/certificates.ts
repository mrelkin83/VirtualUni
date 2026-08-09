import { apiClient } from '../client';

// Debe coincidir con backend/src/modules/certificates/dto
export type CertificateStatus = 'PENDIENTE' | 'EN_PROCESO' | 'EMITIDO' | 'RECHAZADO';

export interface CertificateRequestCreateDto {
  tipo: string;
  motivo?: string;
  costo?: number;
}

export interface CertificateRequestUpdateDto {
  estado?: CertificateStatus;
  archivoUrl?: string;
  observaciones?: string;
}

export const certificatesApi = {
  getMy: async () => {
    const response = await apiClient.get<any>('/api/v1/certificates/my');
    return { data: response.data };
  },
  getAll: async (params?: {
    estado?: CertificateStatus;
    studentId?: string;
    tipo?: string;
  }) => {
    const response = await apiClient.get<any>('/api/v1/certificates', { params });
    return { data: response.data };
  },
  getById: async (id: string) => {
    const response = await apiClient.get<any>(`/api/v1/certificates/${id}`);
    return { data: response.data };
  },
  create: async (data: CertificateRequestCreateDto) => {
    const response = await apiClient.post<any>('/api/v1/certificates', data);
    return { data: response.data };
  },
  update: async (id: string, data: CertificateRequestUpdateDto) => {
    const response = await apiClient.patch<any>(`/api/v1/certificates/${id}`, data);
    return { data: response.data };
  },
  delete: async (id: string) => {
    const response = await apiClient.delete<any>(`/api/v1/certificates/${id}`);
    return { data: response.data };
  },
  getStats: async () => {
    const response = await apiClient.get<any>('/api/v1/certificates/stats');
    return { data: response.data };
  },
};
