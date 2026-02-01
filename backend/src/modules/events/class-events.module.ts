import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassEvent } from '@modules/events/domain/class-event.entity';
import { ClassEventProfessor } from '@modules/events/domain/class-event-professor.entity';
import { ClassEventRepository } from '@modules/events/infrastructure/class-event.repository';
import { ClassEventProfessorRepository } from '@modules/events/infrastructure/class-event-professor.repository';
import { ClassEventsService } from '@modules/events/application/class-events.service';
import { ClassEventsController } from '@modules/events/presentation/class-events.controller';
import { EvaluationsModule } from '@modules/evaluations/evaluations.module';
import { EnrollmentsModule } from '@modules/enrollments/enrollments.module';
import { UsersModule } from '@modules/users/users.module';
import { AuthModule } from '@modules/auth/auth.module';
import { RedisCacheModule } from '@infrastructure/cache/redis-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClassEvent, ClassEventProfessor]),
    AuthModule,
    EvaluationsModule,
    EnrollmentsModule,
    UsersModule,
    RedisCacheModule,
  ],
  providers: [
    ClassEventRepository,
    ClassEventProfessorRepository,
    ClassEventsService,
  ],
  controllers: [ClassEventsController],
  exports: [ClassEventsService, ClassEventRepository],
})
export class ClassEventsModule {}
