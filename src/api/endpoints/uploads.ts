import { apiClient } from '../client';
import { API_CONFIG } from '../../config/api.config';

// Debe coincidir con backend/src/modules/uploads
export type CarpetaSubida = 'materiales' | 'avatares' | 'adjuntos' | 'portadas';

export interface ArchivoSubido {
  url: string;
  nombre: string;
  nombreOriginal: string;
  formato: string;
  tamanioKb: number;
  mimeType: string;
}

export const TAMANIO_MAXIMO_MB = 25;

export const uploadsApi = {
  /**
   * Sube un archivo y devuelve su URL. No se fija Content-Type a mano: el
   * navegador debe generarlo con el boundary del multipart.
   */
  subir: async (file: File, carpeta: CarpetaSubida = 'adjuntos') => {
    const form = new FormData();
    form.append('file', file);
    form.append('carpeta', carpeta);

    const response = await apiClient.post<ArchivoSubido>('/api/v1/uploads', form);
    return { data: response.data };
  },

  eliminar: async (url: string) => {
    const response = await apiClient.delete<{ message: string }>('/api/v1/uploads', {
      params: { url },
    });
    return { data: response.data };
  },

  /** Convierte la URL relativa devuelta por el API en una absoluta usable en el navegador. */
  urlAbsoluta: (url?: string | null): string => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    return `${API_CONFIG.baseURL}${url.startsWith('/') ? '' : '/'}${url}`;
  },
};
