import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { technicalSettings } from '@config/technical-settings';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>(
            'REDIS_HOST',
            technicalSettings.cache.redis.defaultHost,
          ),
          port: configService.get<number>(
            'REDIS_PORT',
            technicalSettings.cache.redis.defaultPort,
          ),
        },
        defaultJobOptions: {
          removeOnComplete: technicalSettings.queue.removeOnComplete,
          removeOnFail: technicalSettings.queue.removeOnFail,
          attempts: technicalSettings.queue.defaultAttempts,
          backoff: {
            type: technicalSettings.queue.backoffType,
            delay: technicalSettings.queue.backoffDelayMs,
          },
        },
      }),
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
