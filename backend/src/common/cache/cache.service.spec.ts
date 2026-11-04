import Redis from 'ioredis';
import { CacheService } from './cache.service';

jest.mock('ioredis', () => ({ __esModule: true, default: jest.fn() }));

const RedisMock = Redis as unknown as jest.Mock;

describe('CacheService', () => {
  const hostOriginal = process.env.REDIS_HOST;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.REDIS_HOST;
  });

  afterAll(() => {
    if (hostOriginal === undefined) delete process.env.REDIS_HOST;
    else process.env.REDIS_HOST = hostOriginal;
  });

  it('sin REDIS_HOST no construye cliente: nada que reintentar, nada que loguear', async () => {
    const service = new CacheService();
    await service.onModuleInit();

    expect(RedisMock).not.toHaveBeenCalled();
    expect(await service.get('clave')).toBeNull();
  });

  it('con REDIS_HOST conecta y sirve valores', async () => {
    process.env.REDIS_HOST = 'redis';
    const connect = jest.fn().mockResolvedValue(undefined);
    const ping = jest.fn().mockResolvedValue('PONG');
    const get = jest.fn().mockResolvedValue(JSON.stringify({ a: 1 }));
    RedisMock.mockImplementation(() => ({
      connect,
      ping,
      get,
      on: jest.fn(),
      disconnect: jest.fn(),
    }));

    const service = new CacheService();
    await service.onModuleInit();

    expect(connect).toHaveBeenCalled();
    expect(ping).toHaveBeenCalled();
    expect(await service.get('clave')).toEqual({ a: 1 });
  });

  it('si la conexion falla desconecta el cliente para que deje de reintentar', async () => {
    process.env.REDIS_HOST = 'redis';
    const disconnect = jest.fn();
    RedisMock.mockImplementation(() => ({
      connect: jest.fn().mockRejectedValue(new Error('ECONNREFUSED')),
      ping: jest.fn(),
      on: jest.fn(),
      disconnect,
    }));

    const service = new CacheService();
    await service.onModuleInit();

    expect(disconnect).toHaveBeenCalled();
    expect(await service.get('clave')).toBeNull();
  });

  it('registra los manejadores antes de conectar, no despues', async () => {
    process.env.REDIS_HOST = 'redis';
    const orden: string[] = [];
    RedisMock.mockImplementation(() => ({
      on: (evento: string) => orden.push(`on:${evento}`),
      connect: jest.fn().mockImplementation(async () => orden.push('connect')),
      ping: jest.fn().mockResolvedValue('PONG'),
      disconnect: jest.fn(),
    }));

    const service = new CacheService();
    await service.onModuleInit();

    expect(orden.indexOf('on:error')).toBeLessThan(orden.indexOf('connect'));
  });
});
