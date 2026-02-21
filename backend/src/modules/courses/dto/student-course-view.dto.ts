import { Expose, Type } from 'class-transformer';
import type { StudentEvaluationLabel } from '@modules/courses/domain/student-course.constants';

export class StudentEvaluationCardDto {
  @Expose()
  id: string;

  @Expose()
  shortName: string;

  @Expose()
  fullName: string;

  @Expose()
  label: StudentEvaluationLabel;
}

export class StudentCurrentCycleContentResponseDto {
  @Expose()
  courseCycleId: string;

  @Expose()
  cycleCode: string;

  @Expose()
  canViewPreviousCycles: boolean;

  @Expose()
  @Type(() => StudentEvaluationCardDto)
  evaluations: StudentEvaluationCardDto[];
}

export class StudentPreviousCycleItemDto {
  @Expose()
  cycleCode: string;
}

export class StudentPreviousCycleListResponseDto {
  @Expose()
  @Type(() => StudentPreviousCycleItemDto)
  cycles: StudentPreviousCycleItemDto[];
}

export class StudentPreviousCycleContentResponseDto {
  @Expose()
  cycleCode: string;

  @Expose()
  @Type(() => StudentEvaluationCardDto)
  evaluations: StudentEvaluationCardDto[];
}
