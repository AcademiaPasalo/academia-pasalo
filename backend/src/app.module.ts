import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from '@modules/users/users.module';
import { AuthModule } from '@modules/auth/auth.module';
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
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    DatabaseModule,
    RedisCacheModule,
    StorageModule,
    SettingsModule,
    UsersModule,
    AuthModule,
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
