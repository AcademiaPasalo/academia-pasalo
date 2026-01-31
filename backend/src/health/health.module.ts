import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { RedisCacheModule } from '@infrastructure/cache/redis-cache.module';

@Module({
  imports: [TerminusModule, RedisCacheModule],
  controllers: [HealthController],
})
export class HealthModule {}
