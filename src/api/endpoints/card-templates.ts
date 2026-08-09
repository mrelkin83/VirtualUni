import { apiClient } from '../client';

export interface CardTemplate {
  id: string;
  tenantId: string;
  nombre: string;
  descripcion?: string;
  tiposUsuario: string[];
  layoutConfig: any;
  campos: any;
  ancho: number;
  alto: number;
  orientacion: string;
  colorPrimario: string;
  colorSecundario: string;
  colorTexto: string;
  fuentePrincipal: string;
  fuenteSecundaria: string;
  logoUrl?: string;
  fondoFrontalUrl?: string;
  fondoPosteriorUrl?: string;
  esActiva: boolean;
  esPredeterminada: boolean;
  incluirQR: boolean;
  incluirCodigoBarras: boolean;
  doblesCara: boolean;
  version: number;
  creadoPor?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    carnets: number;
    expediciones: number;
  };
}

export interface CreateCardTemplateDto {
  nombre: string;
  descripcion?: string;
  tiposUsuario: string[];
  layoutConfig: any;
  campos: any;
  ancho?: number;
  alto?: number;
  orientacion?: string;
  colorPrimario?: string;
  colorSecundario?: string;
  colorTexto?: string;
  fuentePrincipal?: string;
  fuenteSecundaria?: string;
  logoUrl?: string;
  fondoFrontalUrl?: string;
  fondoPosteriorUrl?: string;
  esActiva?: boolean;
  esPredeterminada?: boolean;
  incluirQR?: boolean;
  incluirCodigoBarras?: boolean;
  doblesCara?: boolean;
}

export interface QueryCardTemplatesDto {
  page?: number;
  limit?: number;
  search?: string;
  tipoUsuario?: string;
  esActiva?: boolean;
  esPredeterminada?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const cardTemplatesApi = {
  async getAll(params?: QueryCardTemplatesDto) {
    const response = await apiClient.get('/api/v1/card-templates', { params });
    return { data: response.data };
  },

  async getById(id: string) {
    const response = await apiClient.get(`/api/v1/card-templates/${id}`);
    return { data: response.data };
  },

  async getStats() {
    const response = await apiClient.get('/api/v1/card-templates/stats');
    return { data: response.data };
  },

  async getDefaultForType(tipoUsuario: string) {
    const response = await apiClient.get(`/api/v1/card-templates/default/${tipoUsuario}`);
    return { data: response.data };
  },

  async create(data: CreateCardTemplateDto) {
    const response = await apiClient.post('/api/v1/card-templates', data);
    return { data: response.data };
  },

  async update(id: string, data: Partial<CreateCardTemplateDto>) {
    const response = await apiClient.patch(`/api/v1/card-templates/${id}`, data);
    return { data: response.data };
  },

  async delete(id: string) {
    const response = await apiClient.delete(`/api/v1/card-templates/${id}`);
    return { data: response.data };
  },

  async duplicate(id: string) {
    const response = await apiClient.post(`/api/v1/card-templates/${id}/duplicate`);
    return { data: response.data };
  },

  async setAsDefault(id: string) {
    const response = await apiClient.post(`/api/v1/card-templates/${id}/set-default`);
    return { data: response.data };
  },

  async generatePreview(id: string) {
    const response = await apiClient.get(`/api/v1/card-generator/template/${id}/preview`, {
      responseType: 'blob',
    });
    return { data: response.data };
  },
};
