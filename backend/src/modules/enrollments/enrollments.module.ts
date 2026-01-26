import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from './domain/enrollment.entity';
import { EnrollmentStatus } from './domain/enrollment-status.entity';
import { EnrollmentEvaluation } from './domain/enrollment-evaluation.entity';
import { EnrollmentRepository } from './infrastructure/enrollment.repository';
import { EnrollmentStatusRepository } from './infrastructure/enrollment-status.repository';
import { EnrollmentEvaluationRepository } from './infrastructure/enrollment-evaluation.repository';
import { EnrollmentsService } from './application/enrollments.service';
import { AccessEngineService } from './application/access-engine.service';
import { EnrollmentsController } from './presentation/enrollments.controller';
import { AuthModule } from '@modules/auth/auth.module';
import { CoursesModule } from '@modules/courses/courses.module';
import { EvaluationsModule } from '@modules/evaluations/evaluations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Enrollment, EnrollmentStatus, EnrollmentEvaluation]),
    AuthModule,
    CoursesModule,
    EvaluationsModule,
  ],
  controllers: [EnrollmentsController],
  providers: [
    EnrollmentRepository,
    EnrollmentStatusRepository,
    EnrollmentEvaluationRepository,
    EnrollmentsService,
    AccessEngineService,
  ],
  exports: [
    EnrollmentRepository,
    EnrollmentStatusRepository,
    EnrollmentEvaluationRepository,
    EnrollmentsService,
    AccessEngineService,
  ],
})
export class EnrollmentsModule {}