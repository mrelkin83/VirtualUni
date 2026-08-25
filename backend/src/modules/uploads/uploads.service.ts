import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { unlink } from 'fs/promises';
import { extname, join, resolve, sep } from 'path';

/** Carpetas lógicas permitidas. Evita que el cliente elija rutas arbitrarias. */
export const CARPETAS_PERMITIDAS = ['materiales', 'avatares', 'adjuntos', 'portadas'] as const;
export type CarpetaSubida = (typeof CARPETAS_PERMITIDAS)[number];

/** Tipos MIME aceptados, con la extensión que se les asigna en disco. */
const TIPOS_PERMITIDOS: Record<string, string> = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/zip': '.zip',
  'text/plain': '.txt',
  'text/csv': '.csv',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'audio/mpeg': '.mp3',
  'audio/wav': '.wav',
};

export const TAMANIO_MAXIMO_BYTES = 25 * 1024 * 1024; // 25 MB

export interface ArchivoSubido {
  url: string;
  nombre: string;
  nombreOriginal: string;
  formato: string;
  tamanioKb: number;
  mimeType: string;
}

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  /** Raíz de almacenamiento; configurable para separar entornos. */
  private readonly raiz = resolve(process.env.UPLOADS_DIR || join(process.cwd(), 'uploads'));

  esMimePermitido(mimetype: string): boolean {
    return Object.prototype.hasOwnProperty.call(TIPOS_PERMITIDOS, mimetype);
  }

  get tiposPermitidos(): string[] {
    return Object.keys(TIPOS_PERMITIDOS);
  }

  private carpetaValida(carpeta?: string): CarpetaSubida {
    if (!carpeta) return 'adjuntos';

    if (!CARPETAS_PERMITIDAS.includes(carpeta as CarpetaSubida)) {
      throw new BadRequestException(
        `Carpeta no válida. Use una de: ${CARPETAS_PERMITIDAS.join(', ')}`,
      );
    }

    return carpeta as CarpetaSubida;
  }

  /**
   * Guarda el archivo bajo uploads/<tenantId>/<carpeta>/<uuid><ext>.
   * El nombre en disco siempre se genera aquí: nunca se usa el que envía el
   * cliente, para evitar colisiones y travesía de rutas.
   */
  async guardar(
    tenantId: string,
    archivo: Express.Multer.File,
    carpeta?: string,
  ): Promise<ArchivoSubido> {
    if (!archivo) {
      throw new BadRequestException('No se recibió ningún archivo');
    }

    if (!this.esMimePermitido(archivo.mimetype)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido (${archivo.mimetype}). Permitidos: ${this.tiposPermitidos.join(', ')}`,
      );
    }

    if (archivo.size > TAMANIO_MAXIMO_BYTES) {
      throw new BadRequestException(
        `El archivo supera el máximo de ${TAMANIO_MAXIMO_BYTES / 1024 / 1024} MB`,
      );
    }

    const destino = this.carpetaValida(carpeta);
    const directorio = join(this.raiz, tenantId, destino);

    if (!existsSync(directorio)) {
      mkdirSync(directorio, { recursive: true });
    }

    const extension = TIPOS_PERMITIDOS[archivo.mimetype];
    const nombre = `${randomUUID()}${extension}`;

    const { writeFile } = await import('fs/promises');
    await writeFile(join(directorio, nombre), archivo.buffer);

    this.logger.log(`Archivo almacenado: ${tenantId}/${destino}/${nombre}`);

    return {
      url: `/api/v1/uploads/file/${tenantId}/${destino}/${nombre}`,
      nombre,
      nombreOriginal: archivo.originalname,
      formato: extension.replace('.', ''),
      tamanioKb: Math.max(Math.round(archivo.size / 1024), 1),
      mimeType: archivo.mimetype,
    };
  }

  /**
   * Elimina un archivo previamente subido. La ruta se valida contra el tenant
   * para que nadie pueda borrar ficheros de otro ni escapar del directorio.
   */
  async eliminar(tenantId: string, url: string): Promise<{ message: string }> {
    const prefijoBase = '/api/v1/uploads/file/';
    const prefijo = `${prefijoBase}${tenantId}/`;

    if (!url || !url.startsWith(prefijo)) {
      throw new BadRequestException('La ruta no corresponde a este tenant');
    }

    const relativa = url.slice(prefijoBase.length);
    const absoluta = resolve(this.raiz, relativa);
    const base = resolve(this.raiz, tenantId);

    // Defensa en profundidad frente a travesía de rutas ("..").
    if (absoluta !== base && !absoluta.startsWith(base + sep)) {
      throw new BadRequestException('Ruta de archivo no válida');
    }

    if (!existsSync(absoluta)) {
      throw new NotFoundException('Archivo no encontrado');
    }

    await unlink(absoluta);

    return { message: 'Archivo eliminado correctamente' };
  }

  /**
   * Resuelve la ruta absoluta en disco de un archivo ya subido, para servirlo
   * por streaming. El llamador ya debe haber verificado que `tenantId`
   * coincide con el del usuario autenticado (ver UploadsController.descargar);
   * aquí sólo se valida la forma de la ruta y se descarta cualquier travesía.
   */
  resolverRutaAbsoluta(tenantId: string, carpeta: string, nombre: string): string {
    if (!CARPETAS_PERMITIDAS.includes(carpeta as CarpetaSubida)) {
      throw new BadRequestException('Carpeta no válida');
    }

    if (!nombre || /[\\/]|\.\./.test(nombre)) {
      throw new BadRequestException('Nombre de archivo no válido');
    }

    const base = resolve(this.raiz, tenantId);
    const absoluta = resolve(base, carpeta, nombre);

    if (absoluta !== base && !absoluta.startsWith(base + sep)) {
      throw new BadRequestException('Ruta de archivo no válida');
    }

    if (!existsSync(absoluta)) {
      throw new NotFoundException('Archivo no encontrado');
    }

    return absoluta;
  }

  /** Extensión lógica para mostrar en la UI a partir del MIME. */
  extensionDe(mimetype: string): string {
    return (TIPOS_PERMITIDOS[mimetype] || '').replace('.', '');
  }
}
