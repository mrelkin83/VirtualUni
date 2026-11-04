import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private redisClient: Redis | null = null;
  private isEnabled = false;

  async onModuleInit() {
    // Sin REDIS_HOST no hay cache que montar. Antes se asumia 'localhost' y
    // cada arranque sin Redis —produccion incluida— soltaba una rafaga de
    // ECONNREFUSED. Solo analytics usa la cache, asi que apagarla es benigno.
    const redisHost = process.env.REDIS_HOST;
    if (!redisHost) {
      this.logger.log('REDIS_HOST sin definir: cache deshabilitada');
      return;
    }

    const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
    const client = new Redis({
      host: redisHost,
      port: redisPort,
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => (times > 3 ? null : Math.min(times * 100, 3000)),
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    // Los manejadores van ANTES de conectar: registrarlos despues dejaba el
    // fallo inicial sin dueno y ioredis lo escupia como "Unhandled error
    // event" por consola, fuera del logger de Nest.
    client.on('error', (error) => {
      this.isEnabled = false;
      this.logger.warn(`Error de Redis: ${error.message}`);
    });
    client.on('ready', () => {
      this.isEnabled = true;
    });

    try {
      await client.connect();
      await client.ping();
      this.redisClient = client;
      this.isEnabled = true;
      this.logger.log(`Cache de Redis activa en ${redisHost}:${redisPort}`);
    } catch (error) {
      // disconnect() corta los reintentos. Sin esto el cliente seguia
      // golpeando el puerto indefinidamente aunque la cache quedara apagada.
      client.disconnect();
      this.redisClient = null;
      this.isEnabled = false;
      this.logger.warn(`Redis no disponible, cache deshabilitada: ${error.message}`);
    }
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit();
      this.logger.log('Redis connection closed');
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isEnabled || !this.redisClient) {
      return null;
    }

    try {
      const value = await this.redisClient.get(key);
      if (!value) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL (Time To Live) in seconds
   */
  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    if (!this.isEnabled || !this.redisClient) {
      return;
    }

    try {
      const serialized = JSON.stringify(value);
      await this.redisClient.setex(key, ttl, serialized);
      this.logger.debug(`Cache set: ${key} (TTL: ${ttl}s)`);
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}:`, error);
    }
  }

  /**
   * Delete a key from cache
   */
  async delete(key: string): Promise<void> {
    if (!this.isEnabled || !this.redisClient) {
      return;
    }

    try {
      await this.redisClient.del(key);
      this.logger.debug(`Cache deleted: ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting cache key ${key}:`, error);
    }
  }

  /**
   * Delete all keys matching a pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    if (!this.isEnabled || !this.redisClient) {
      return;
    }

    try {
      const keys = await this.redisClient.keys(pattern);
      if (keys.length > 0) {
        await this.redisClient.del(...keys);
        this.logger.debug(`Cache deleted pattern: ${pattern} (${keys.length} keys)`);
      }
    } catch (error) {
      this.logger.error(`Error deleting cache pattern ${pattern}:`, error);
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    if (!this.isEnabled || !this.redisClient) {
      return;
    }

    try {
      await this.redisClient.flushdb();
      this.logger.log('Cache cleared');
    } catch (error) {
      this.logger.error('Error clearing cache:', error);
    }
  }

  /**
   * Get or set cache with a callback
   */
  async getOrSet<T>(
    key: string,
    callback: () => Promise<T>,
    ttl: number = 300,
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      this.logger.debug(`Cache hit: ${key}`);
      return cached;
    }

    // Cache miss - execute callback
    this.logger.debug(`Cache miss: ${key}`);
    const value = await callback();

    // Store in cache
    await this.set(key, value, ttl);

    return value;
  }

  /**
   * Check if cache is enabled
   */
  isCacheEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Get cache statistics (keys count)
   */
  async getStats(): Promise<{ enabled: boolean; keysCount: number }> {
    if (!this.isEnabled || !this.redisClient) {
      return { enabled: false, keysCount: 0 };
    }

    try {
      const dbSize = await this.redisClient.dbsize();
      return { enabled: true, keysCount: dbSize };
    } catch (error) {
      this.logger.error('Error getting cache stats:', error);
      return { enabled: this.isEnabled, keysCount: 0 };
    }
  }
}
