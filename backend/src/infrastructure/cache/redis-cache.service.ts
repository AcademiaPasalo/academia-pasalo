import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisCacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheService.name);
  private redisClient!: Redis;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);

    this.redisClient = new Redis({
      host,
      port,
      lazyConnect: true,
    });

    this.redisClient.on('error', (error) => {
      this.logger.error({
        message: 'Error en la conexión a Redis',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    });

    this.redisClient.on('connect', () => {
      this.logger.log({
        message: 'Conexión a Redis establecida correctamente',
        timestamp: new Date().toISOString(),
      });
    });

    this.redisClient.connect().catch((error) => {
      this.logger.error({
        message: 'Fallo al inicializar la conexión a Redis',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    });
  }

  async onModuleDestroy() {
    await this.redisClient.quit();
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redisClient.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      this.logger.error({
        message: 'Error al obtener dato de caché',
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      if (ttlSeconds) {
        await this.redisClient.set(key, serializedValue, 'EX', ttlSeconds);
      } else {
        await this.redisClient.set(key, serializedValue);
      }
    } catch (error) {
      this.logger.error({
        message: 'Error al guardar dato en caché',
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redisClient.del(key);
    } catch (error) {
      this.logger.error({
        message: 'Error al eliminar dato de caché',
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  async invalidateGroup(pattern: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const stream = this.redisClient.scanStream({
        match: pattern,
        count: 100,
      });

      const keysToDelete: string[] = [];

      stream.on('data', (keys: string[]) => {
        if (keys.length > 0) {
          keysToDelete.push(...keys);
        }
      });

      stream.on('end', async () => {
        try {
          if (keysToDelete.length > 0) {
            await this.redisClient.del(...keysToDelete);
          }
          this.logger.log({
            message: 'Invalidación de grupo completada',
            pattern,
            keysDeleted: keysToDelete.length,
            timestamp: new Date().toISOString(),
          });
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      stream.on('error', (error) => {
        this.logger.error({
          message: 'Error durante la invalidación de grupo',
          pattern,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
        reject(error);
      });
    });
  }
}
