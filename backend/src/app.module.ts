import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
import { DatabaseModule } from '@infrastructure/database/database.module';
import { RedisCacheModule } from '@infrastructure/cache/redis-cache.module';
import { StorageModule } from '@infrastructure/storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
