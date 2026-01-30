import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '@modules/courses/domain/course.entity';
import { CourseType } from '@modules/courses/domain/course-type.entity';
import { CycleLevel } from '@modules/courses/domain/cycle-level.entity';
import { CourseCycle } from '@modules/courses/domain/course-cycle.entity';
import { CourseCycleProfessor } from '@modules/courses/domain/course-cycle-professor.entity';
import { CourseRepository } from '@modules/courses/infrastructure/course.repository';
import { CourseTypeRepository } from '@modules/courses/infrastructure/course-type.repository';
import { CycleLevelRepository } from '@modules/courses/infrastructure/cycle-level.repository';
import { CourseCycleRepository } from '@modules/courses/infrastructure/course-cycle.repository';
import { CoursesService } from '@modules/courses/application/courses.service';
import { CoursesController } from '@modules/courses/presentation/courses.controller';
import { AuthModule } from '@modules/auth/auth.module';
import { EvaluationsModule } from '@modules/evaluations/evaluations.module';
import { CyclesModule } from '@modules/cycles/cycles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      CourseType,
      CycleLevel,
      CourseCycle,
      CourseCycleProfessor,
    ]),
    AuthModule,
    forwardRef(() => EvaluationsModule),
    CyclesModule,
  ],
  controllers: [CoursesController],
  providers: [
    CourseRepository,
    CourseTypeRepository,
    CycleLevelRepository,
    CourseCycleRepository,
    CoursesService,
  ],
  exports: [
    CourseRepository,
    CourseTypeRepository,
    CycleLevelRepository,
    CourseCycleRepository,
    CoursesService,
  ],
})
export class CoursesModule {}
