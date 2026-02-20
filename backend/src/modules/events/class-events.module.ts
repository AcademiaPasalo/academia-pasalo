import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassEvent } from '@modules/events/domain/class-event.entity';
import { ClassEventProfessor } from '@modules/events/domain/class-event-professor.entity';
import { ClassEventRecordingStatus } from '@modules/events/domain/class-event-recording-status.entity';
import { ClassEventRepository } from '@modules/events/infrastructure/class-event.repository';
import { ClassEventProfessorRepository } from '@modules/events/infrastructure/class-event-professor.repository';
import { ClassEventRecordingStatusRepository } from '@modules/events/infrastructure/class-event-recording-status.repository';
import { ClassEventsService } from '@modules/events/application/class-events.service';
import { ClassEventsController } from '@modules/events/presentation/class-events.controller';
import { EvaluationsModule } from '@modules/evaluations/evaluations.module';
import { EnrollmentsModule } from '@modules/enrollments/enrollments.module';
import { UsersModule } from '@modules/users/users.module';
import { CoursesModule } from '@modules/courses/courses.module';
import { AuthModule } from '@modules/auth/auth.module';
import { RedisCacheModule } from '@infrastructure/cache/redis-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClassEvent,
      ClassEventProfessor,
      ClassEventRecordingStatus,
    ]),
    AuthModule,
    EvaluationsModule,
    EnrollmentsModule,
    UsersModule,
    CoursesModule,
    RedisCacheModule,
  ],
  providers: [
    ClassEventRepository,
    ClassEventProfessorRepository,
    ClassEventRecordingStatusRepository,
    ClassEventsService,
  ],
  controllers: [ClassEventsController],
  exports: [ClassEventsService, ClassEventRepository],
})
export class ClassEventsModule {}
