import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { technicalSettings } from '@config/technical-settings';

@Injectable()
export class RedisCacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheService.name);
  private redisClient!: Redis;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>(
      'REDIS_HOST',
      technicalSettings.cache.redis.defaultHost,
    );
    const port = this.configService.get<number>(
      'REDIS_PORT',
      technicalSettings.cache.redis.defaultPort,
    );

    this.redisClient = new Redis({
      host,
      port,
      lazyConnect: true,
    });

    this.redisClient.on('error', (error: Error) => {
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

    this.redisClient.connect().catch((error: Error) => {
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
        error: error instanceof Error ? error.message : 'Error desconocido',
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
        error: error instanceof Error ? error.message : 'Error desconocido',
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
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString(),
      });
    }
  }

  async invalidateGroup(pattern: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const stream = this.redisClient.scanStream({
        match: pattern,
        count: technicalSettings.cache.redis.invalidateGroupScanCount,
      });

      const keysToDelete: string[] = [];

      stream.on('data', (keys: string[]) => {
        if (keys.length > 0) {
          keysToDelete.push(...keys);
        }
      });

      stream.on('end', () => {
        if (keysToDelete.length === 0) {
          this.logger.log({
            message:
              'Invalidación de grupo completada (sin llaves encontradas)',
            pattern,
            keysDeleted: 0,
            timestamp: new Date().toISOString(),
          });
          resolve();
          return;
        }

        this.redisClient
          .del(...keysToDelete)
          .then(() => {
            this.logger.log({
              message: 'Invalidación de grupo completada',
              pattern,
              keysDeleted: keysToDelete.length,
              timestamp: new Date().toISOString(),
            });
            resolve();
          })
          .catch((error: Error) => {
            reject(error);
          });
      });

      stream.on('error', (error: unknown) => {
        const errObject =
          error instanceof Error ? error : new Error(String(error));
        this.logger.error({
          message: 'Error durante la invalidación de grupo',
          pattern,
          error: errObject.message,
          timestamp: new Date().toISOString(),
        });
        reject(errObject);
      });
    });
  }
}

