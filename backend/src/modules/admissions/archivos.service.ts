import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { createReadStream, existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { join, resolve } from 'path';
import { randomBytes } from 'crypto';
import type { ReadStream } from 'fs';

/**
 * Documentos del aspirante: almacenamiento PRIVADO en disco, fuera de
 * cualquier ruta estática. La descarga pasa siempre por un controlador que
 * valida tenant (admin) o sesión de aspirante. El tipo se verifica por la
 * FIRMA del archivo, no por la extensión ni por lo que diga el navegador (§8).
 */
@Injectable()
export class ArchivosAdmisionService {
  private readonly raiz = resolve(process.env.UPLOADS_DIR || join(process.cwd(), 'uploads'));

  private static EXT: Record<string, string> = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/png': 'png',
  };

  /** Primeros bytes que debe tener cada MIME aceptado. */
  private firmaValida(mime: string, buffer: Buffer): boolean {
    const hex = buffer.subarray(0, 8).toString('hex').toUpperCase();
    switch (mime) {
      case 'application/pdf':
        return buffer.subarray(0, 5).toString('latin1') === '%PDF-';
      case 'image/jpeg':
        return hex.startsWith('FFD8FF');
      case 'image/png':
        return hex.startsWith('89504E47');
      default:
        return false;
    }
  }

  guardarValido(
    tenantId: string,
    applicationId: string,
    archivo: { buffer: Buffer; mimetype: string; originalname: string; size: number },
    regla: { acceptTypes: string[]; maxSizeMb: number },
  ): Promise<{ fileKey: string; sizeKb: number }> {
    const tipos = regla.acceptTypes.length
      ? regla.acceptTypes.filter((t) => ArchivosAdmisionService.EXT[t])
      : Object.keys(ArchivosAdmisionService.EXT);

    if (!tipos.includes(archivo.mimetype)) {
      throw new BadRequestException(`Tipo de archivo no permitido. Acepta: ${tipos.join(', ')}`);
    }
    if (archivo.size > regla.maxSizeMb * 1024 * 1024) {
      throw new BadRequestException(`El archivo supera el máximo de ${regla.maxSizeMb} MB`);
    }
    if (!this.firmaValida(archivo.mimetype, archivo.buffer)) {
      // El MIME declarado no coincide con el contenido real: archivo disfrazado.
      throw new BadRequestException('El contenido del archivo no coincide con su tipo');
    }

    return this.escribir(tenantId, applicationId, archivo);
  }

  private async escribir(
    tenantId: string,
    applicationId: string,
    archivo: { buffer: Buffer; mimetype: string },
  ) {
    const nombre = `${randomBytes(16).toString('hex')}.${ArchivosAdmisionService.EXT[archivo.mimetype]}`;
    const dir = join(this.raiz, tenantId, 'admisiones', applicationId);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    await writeFile(join(dir, nombre), archivo.buffer);
    return {
      fileKey: `${tenantId}/admisiones/${applicationId}/${nombre}`,
      sizeKb: Math.max(1, Math.round(archivo.buffer.length / 1024)),
    };
  }

  /** Stream para descarga autenticada. El fileKey viene de la BD, nunca del cliente. */
  stream(fileKey: string): { stream: ReadStream; mime: string } {
    if (!/^[\w-]+\/admisiones\/[\w-]+\/[\w-]+\.(pdf|jpg|png)$/.test(fileKey)) {
      throw new NotFoundException('Documento no encontrado');
    }
    const ruta = resolve(join(this.raiz, fileKey));
    if (!ruta.startsWith(this.raiz) || !existsSync(ruta)) {
      throw new NotFoundException('Documento no encontrado');
    }
    const ext = fileKey.split('.').pop() as string;
    const mime = ext === 'pdf' ? 'application/pdf' : ext === 'png' ? 'image/png' : 'image/jpeg';
    return { stream: createReadStream(ruta), mime };
  }
}
