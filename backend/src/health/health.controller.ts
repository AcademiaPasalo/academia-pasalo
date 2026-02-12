import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private cacheService: RedisCacheService,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    return await this.health.check([
      () => this.db.pingCheck('database'),
      async () => {
        try {
          await this.cacheService.set('health:check', 'ok', 10);
          const result = await this.cacheService.get('health:check');
          if (result !== 'ok') throw new Error('Redis check failed');
          return { redis: { status: 'up' } };
        } catch (error) {
          return {
            redis: {
              status: 'down',
            },
          };
        }
      },
    ]);
  }
}
