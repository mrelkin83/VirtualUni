import { apiClient } from '../client';

/**
 * Plantillas del compositor de certificados.
 *
 * La sección existía con el compositor completo, pero sin backend: crear,
 * editar, duplicar y eliminar solo tocaban un arreglo en memoria y al recargar
 * volvían las dos de ejemplo.
 */
export interface PlantillaCertificado {
  id?: string;
  nombre: string;
  descripcion?: string;
  estado?: 'borrador' | 'publicado';
  componentes?: unknown[];
  configuracion?: Record<string, unknown>;
}

const BASE = '/api/v1/certificate-templates';

export const plantillasCertificadoApi = {
  getAll: async () => {
    const response = await apiClient.get(BASE);
    return { data: response.data };
  },
  create: async (data: PlantillaCertificado) => {
    const response = await apiClient.post(BASE, data);
    return { data: response.data };
  },
  update: async (id: string, data: Partial<PlantillaCertificado>) => {
    const response = await apiClient.patch(`${BASE}/${id}`, data);
    return { data: response.data };
  },
  duplicate: async (id: string) => {
    const response = await apiClient.post(`${BASE}/${id}/duplicate`);
    return { data: response.data };
  },
  remove: async (id: string) => {
    const response = await apiClient.delete(`${BASE}/${id}`);
    return { data: response.data };
  },
};
