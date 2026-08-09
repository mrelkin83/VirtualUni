import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private redisClient: Redis | null = null;
  private isEnabled = false;

  async onModuleInit() {
    try {
      // Redis configuration from environment or defaults
      const redisHost = process.env.REDIS_HOST || 'localhost';
      const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
      const redisPassword = process.env.REDIS_PASSWORD;

      // Try to connect to Redis
      this.redisClient = new Redis({
        host: redisHost,
        port: redisPort,
        password: redisPassword,
        retryStrategy: (times) => {
          if (times > 3) {
            this.logger.warn('Redis connection failed after 3 retries. Cache disabled.');
            return null; // Stop retrying
          }
          return Math.min(times * 100, 3000);
        },
        maxRetriesPerRequest: 3,
      });

      // Test connection
      await this.redisClient.ping();
      this.isEnabled = true;
      this.logger.log(`Redis cache enabled - Connected to ${redisHost}:${redisPort}`);

      // Handle errors
      this.redisClient.on('error', (error) => {
        this.logger.error('Redis error:', error);
        this.isEnabled = false;
      });

      this.redisClient.on('reconnecting', () => {
        this.logger.log('Reconnecting to Redis...');
      });

      this.redisClient.on('ready', () => {
        this.logger.log('Redis connection ready');
        this.isEnabled = true;
      });

    } catch (error) {
      this.logger.warn('Redis not available. Cache disabled. Error:', error.message);
      this.isEnabled = false;
      this.redisClient = null;
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
