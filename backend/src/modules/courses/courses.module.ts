import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '@modules/courses/domain/course.entity';
import { CourseType } from '@modules/courses/domain/course-type.entity';
import { CycleLevel } from '@modules/courses/domain/cycle-level.entity';
import { CourseCycle } from '@modules/courses/domain/course-cycle.entity';
import { CourseCycleProfessor } from '@modules/courses/domain/course-cycle-professor.entity';
import { CourseCycleAllowedEvaluationType } from '@modules/courses/domain/course-cycle-allowed-evaluation-type.entity';
import { CourseRepository } from '@modules/courses/infrastructure/course.repository';
import { CourseTypeRepository } from '@modules/courses/infrastructure/course-type.repository';
import { CycleLevelRepository } from '@modules/courses/infrastructure/cycle-level.repository';
import { CourseCycleRepository } from '@modules/courses/infrastructure/course-cycle.repository';
import { CourseCycleProfessorRepository } from '@modules/courses/infrastructure/course-cycle-professor.repository';
import { CourseCycleAllowedEvaluationTypeRepository } from '@modules/courses/infrastructure/course-cycle-allowed-evaluation-type.repository';
import { CoursesService } from '@modules/courses/application/courses.service';
import { CourseSetupService } from '@modules/courses/application/course-setup.service';
import { CoursesController } from '@modules/courses/presentation/courses.controller';
import { AuthModule } from '@modules/auth/auth.module';
import { EvaluationsModule } from '@modules/evaluations/evaluations.module';
import { CyclesModule } from '@modules/cycles/cycles.module';
import { MediaAccessModule } from '@modules/media-access/media-access.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      CourseType,
      CycleLevel,
      CourseCycle,
      CourseCycleProfessor,
      CourseCycleAllowedEvaluationType,
    ]),
    AuthModule,
    forwardRef(() => EvaluationsModule),
    CyclesModule,
    MediaAccessModule,
  ],
  controllers: [CoursesController],
  providers: [
    CourseRepository,
    CourseTypeRepository,
    CycleLevelRepository,
    CourseCycleRepository,
    CourseCycleProfessorRepository,
    CourseCycleAllowedEvaluationTypeRepository,
    CoursesService,
    CourseSetupService,
  ],
  exports: [
    CourseRepository,
    CourseTypeRepository,
    CycleLevelRepository,
    CourseCycleRepository,
    CourseCycleProfessorRepository,
    CourseCycleAllowedEvaluationTypeRepository,
    CoursesService,
    CourseSetupService,
  ],
})
export class CoursesModule {}
