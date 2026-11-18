import type { MaterialType } from '../api/endpoints/materials';

/**
 * MIME que acepta POST /api/v1/uploads (ver TIPOS_PERMITIDOS en
 * backend/src/modules/uploads/uploads.service.ts). Esta lista solo alimenta el
 * `accept` del input, que es una ayuda del navegador y nada más: el rechazo
 * real lo hace el servidor con un 400, así que si el backend amplía su lista
 * hay que ampliarla aquí para que el archivo llegue a ofrecerse.
 */
export const MIMES_PERMITIDOS = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'text/plain',
  'text/csv',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
  'audio/mpeg',
  'audio/wav',
] as const;

/** Valor para el atributo `accept` de un `<input type="file">`. */
export const ACCEPT_MATERIALES = MIMES_PERMITIDOS.join(',');

/**
 * Tipo de material que le corresponde a un archivo por su MIME. El orden de
 * las comprobaciones importa: las presentaciones y las hojas de cálculo son
 * `application/...` igual que un PDF, así que se miran antes del caso general.
 */
export const tipoDeMaterialPorMime = (mime: string): MaterialType => {
  if (mime.startsWith('image/')) return 'IMAGEN';
  if (mime.startsWith('video/')) return 'VIDEO';
  if (mime.startsWith('audio/')) return 'AUDIO';
  if (mime.includes('presentation') || mime.includes('powerpoint')) return 'PRESENTACION';
  if (mime.startsWith('text/') || mime.startsWith('application/')) return 'DOCUMENTO';
  return 'OTRO';
};

/** El selector del panel docente trabaja con las etiquetas en minúscula. */
export const TIPO_UI_POR_API: Record<MaterialType, string> = {
  DOCUMENTO: 'documento',
  VIDEO: 'video',
  ENLACE: 'enlace',
  PRESENTACION: 'presentacion',
  IMAGEN: 'imagen',
  AUDIO: 'audio',
  OTRO: 'otro',
};

export const ETIQUETA_TIPO: Record<MaterialType, string> = {
  DOCUMENTO: 'Documento',
  VIDEO: 'Video',
  ENLACE: 'Enlace',
  PRESENTACION: 'Presentación',
  IMAGEN: 'Imagen',
  AUDIO: 'Audio',
  OTRO: 'Otro',
};

export const COLOR_TIPO: Record<MaterialType, string> = {
  DOCUMENTO: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  VIDEO: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  ENLACE: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  PRESENTACION: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  IMAGEN: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  AUDIO: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  OTRO: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

/**
 * `Material` no tiene `topicId`: no se puede colgar de un tema del temario.
 * La pertenencia se marca en la descripción, que además el estudiante ve tal
 * cual. El precio es que al renombrar un tema sus materiales dejan de
 * agruparse bajo él (siguen en el grupo, visibles en el panel de Materiales).
 */
export const marcaDeTema = (titulo: string) => `Tema: ${titulo}`;

/** Tamaño legible a partir de los kilobytes que guarda el material. */
export const formatearKb = (kb?: number | null): string => {
  if (kb == null) return '—';
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};
