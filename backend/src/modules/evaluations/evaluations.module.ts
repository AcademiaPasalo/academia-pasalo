import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Evaluation } from '@modules/evaluations/domain/evaluation.entity';
import { EvaluationType } from '@modules/evaluations/domain/evaluation-type.entity';
import { EvaluationRepository } from '@modules/evaluations/infrastructure/evaluation.repository';
import { EvaluationsService } from '@modules/evaluations/application/evaluations.service';
import { EvaluationsController } from '@modules/evaluations/presentation/evaluations.controller';
import { CoursesModule } from '@modules/courses/courses.module';
import { CyclesModule } from '@modules/cycles/cycles.module';
import { AuthModule } from '@modules/auth/auth.module';

import { EvaluationSubscriber } from '@modules/evaluations/infrastructure/evaluation.subscriber';

@Module({
  imports: [
    TypeOrmModule.forFeature([Evaluation, EvaluationType]),
    AuthModule,
    forwardRef(() => CoursesModule),
    CyclesModule,
  ],
  providers: [EvaluationRepository, EvaluationsService, EvaluationSubscriber],
  controllers: [EvaluationsController],
  exports: [EvaluationRepository, EvaluationsService, TypeOrmModule],
})
export class EvaluationsModule {}
