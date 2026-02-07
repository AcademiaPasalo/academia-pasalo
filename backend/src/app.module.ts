import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from '@modules/users/users.module';
import { AuthModule } from '@modules/auth/auth.module';
import { AuditModule } from '@modules/audit/audit.module';
import { CyclesModule } from '@modules/cycles/cycles.module';
import { CoursesModule } from '@modules/courses/courses.module';
import { EvaluationsModule } from '@modules/evaluations/evaluations.module';
import { EnrollmentsModule } from '@modules/enrollments/enrollments.module';
import { MaterialsModule } from '@modules/materials/materials.module';
import { FeedbackModule } from '@modules/feedback/feedback.module';
import { SettingsModule } from '@modules/settings/settings.module';
import { ClassEventsModule } from '@modules/events/class-events.module';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { RedisCacheModule } from '@infrastructure/cache/redis-cache.module';
import { StorageModule } from '@infrastructure/storage/storage.module';
import { QueueModule } from '@infrastructure/queue/queue.module';
import { HealthModule } from './health/health.module';
import { technicalSettings } from '@config/technical-settings';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: technicalSettings.throttler.ttlMs,
        limit: technicalSettings.throttler.limit,
      },
    ]),
    DatabaseModule,
    RedisCacheModule,
    StorageModule,
    QueueModule,
    SettingsModule,
    UsersModule,
    AuthModule,
    AuditModule,
    CyclesModule,
    CoursesModule,
    EvaluationsModule,
    EnrollmentsModule,
    MaterialsModule,
    FeedbackModule,
    ClassEventsModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
