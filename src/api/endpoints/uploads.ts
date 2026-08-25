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

  /**
   * Abre un material en una pestaña nueva, sea un archivo propio o un enlace
   * externo (los materiales de tipo "enlace" también pasan por aquí).
   *
   * `/api/v1/uploads/file/...` exige sesión (JwtAuthGuard + TenantGuard, ver
   * backend/src/modules/uploads/uploads.controller.ts): un `window.open`
   * directo a esa URL no manda el token (vive en localStorage, no en una
   * cookie) y el navegador recibe un 401 en vez del archivo. Para esos se
   * pide con el cliente autenticado y se abre el blob resultante; un enlace
   * externo se abre tal cual, sin mandarle nuestro token.
   */
  abrir: async (url?: string | null): Promise<void> => {
    if (!url) return;

    if (!url.includes('/api/v1/uploads/file/')) {
      window.open(url, '_blank', 'noopener');
      return;
    }

    const ruta = /^https?:\/\//i.test(url) ? url.replace(API_CONFIG.baseURL, '') : url;
    const response = await apiClient.get<Blob>(ruta, { responseType: 'blob' });
    const objectUrl = window.URL.createObjectURL(response.data as unknown as Blob);
    window.open(objectUrl, '_blank', 'noopener');
    setTimeout(() => window.URL.revokeObjectURL(objectUrl), 60_000);
  },
};
