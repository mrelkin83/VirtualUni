import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { mkdtempSync, existsSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { UploadsService } from './uploads.service';

const TENANT_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const TENANT_B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

function archivo(overrides: Partial<Express.Multer.File> = {}): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: 'apuntes.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    size: 2048,
    buffer: Buffer.from('contenido de prueba'),
    stream: null as any,
    destination: '',
    filename: '',
    path: '',
    ...overrides,
  } as Express.Multer.File;
}

describe('UploadsService', () => {
  let service: UploadsService;
  let raiz: string;

  beforeEach(async () => {
    raiz = mkdtempSync(join(tmpdir(), 'virtualuni-uploads-'));
    process.env.UPLOADS_DIR = raiz;

    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadsService],
    }).compile();

    service = module.get<UploadsService>(UploadsService);
  });

  afterEach(() => {
    delete process.env.UPLOADS_DIR;
  });

  describe('guardar', () => {
    it('almacena el archivo bajo el tenant y devuelve su URL', async () => {
      const res = await service.guardar(TENANT_A, archivo(), 'materiales');

      expect(res.url).toMatch(
        new RegExp(`^/api/v1/uploads/file/${TENANT_A}/materiales/[0-9a-f-]+\\.pdf$`),
      );
      expect(res.formato).toBe('pdf');
      expect(res.nombreOriginal).toBe('apuntes.pdf');
      expect(existsSync(join(raiz, res.url.replace('/api/v1/uploads/file/', '')))).toBe(true);
    });

    it('escribe el contenido recibido', async () => {
      const res = await service.guardar(TENANT_A, archivo(), 'adjuntos');

      const contenido = readFileSync(
        join(raiz, res.url.replace('/api/v1/uploads/file/', '')),
        'utf8',
      );
      expect(contenido).toBe('contenido de prueba');
    });

    // El nombre lo genera el servidor: un originalname malicioso no debe influir
    // ni en la ruta ni en la extensión final.
    it('ignora el nombre enviado por el cliente', async () => {
      const res = await service.guardar(
        TENANT_A,
        archivo({ originalname: '../../../etc/passwd.pdf' } as any),
        'materiales',
      );

      expect(res.nombre).not.toContain('..');
      expect(res.nombre).not.toContain('passwd');
      expect(res.url.startsWith(`/api/v1/uploads/file/${TENANT_A}/materiales/`)).toBe(true);
    });

    it('rechaza tipos MIME no permitidos', async () => {
      await expect(
        service.guardar(TENANT_A, archivo({ mimetype: 'application/x-msdownload' } as any)),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rechaza archivos que superan el tamaño máximo', async () => {
      await expect(
        service.guardar(TENANT_A, archivo({ size: 26 * 1024 * 1024 } as any)),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rechaza una carpeta no permitida', async () => {
      await expect(
        service.guardar(TENANT_A, archivo(), '../../secretos'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('usa "adjuntos" cuando no se indica carpeta', async () => {
      const res = await service.guardar(TENANT_A, archivo());

      expect(res.url).toContain(`/api/v1/uploads/file/${TENANT_A}/adjuntos/`);
    });

    it('separa los archivos de tenants distintos', async () => {
      const a = await service.guardar(TENANT_A, archivo(), 'materiales');
      const b = await service.guardar(TENANT_B, archivo(), 'materiales');

      expect(a.url).toContain(TENANT_A);
      expect(b.url).toContain(TENANT_B);
      expect(a.url).not.toBe(b.url);
    });
  });

  describe('eliminar', () => {
    it('elimina un archivo propio', async () => {
      const res = await service.guardar(TENANT_A, archivo(), 'materiales');

      await expect(service.eliminar(TENANT_A, res.url)).resolves.toEqual({
        message: 'Archivo eliminado correctamente',
      });
      expect(existsSync(join(raiz, res.url.replace('/api/v1/uploads/file/', '')))).toBe(false);
    });

    // Regresión de seguridad: no se puede borrar lo de otro tenant.
    it('rechaza eliminar un archivo de otro tenant', async () => {
      const res = await service.guardar(TENANT_B, archivo(), 'materiales');

      await expect(service.eliminar(TENANT_A, res.url)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(existsSync(join(raiz, res.url.replace('/api/v1/uploads/file/', '')))).toBe(true);
    });

    it.each([
      '/api/v1/uploads/file/../../.env',
      '/etc/passwd',
      'api/v1/uploads/file/otro/archivo.pdf',
    ])('rechaza la ruta %s', async (url) => {
      await expect(service.eliminar(TENANT_A, url)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rechaza la travesía de rutas dentro del prefijo del tenant', async () => {
      await expect(
        service.eliminar(TENANT_A, `/api/v1/uploads/file/${TENANT_A}/../../.env`),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('devuelve 404 si el archivo no existe', async () => {
      await expect(
        service.eliminar(TENANT_A, `/api/v1/uploads/file/${TENANT_A}/materiales/inexistente.pdf`),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('resolverRutaAbsoluta', () => {
    // Regresión: antes se servía con `useStaticAssets`, sin ningún guard.
    it('resuelve la ruta de un archivo propio existente', async () => {
      const res = await service.guardar(TENANT_A, archivo(), 'materiales');
      const [, , , nombre] = res.url.split('/').slice(-4);

      const ruta = service.resolverRutaAbsoluta(TENANT_A, 'materiales', nombre);
      expect(existsSync(ruta)).toBe(true);
    });

    it('rechaza una carpeta no permitida', () => {
      expect(() =>
        service.resolverRutaAbsoluta(TENANT_A, '../../secretos', 'archivo.pdf'),
      ).toThrow(BadRequestException);
    });

    it.each(['../../.env', '..\\..\\.env', 'sub/archivo.pdf'])(
      'rechaza el nombre de archivo %s',
      (nombre) => {
        expect(() => service.resolverRutaAbsoluta(TENANT_A, 'materiales', nombre)).toThrow(
          BadRequestException,
        );
      },
    );

    it('devuelve 404 si el archivo no existe', () => {
      expect(() =>
        service.resolverRutaAbsoluta(TENANT_A, 'materiales', 'inexistente.pdf'),
      ).toThrow(NotFoundException);
    });
  });
});
