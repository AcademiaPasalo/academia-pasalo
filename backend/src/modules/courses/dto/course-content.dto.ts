import { Expose, Type } from 'class-transformer';

export class EvaluationStatusDto {
  @Expose()
  status: 'LOCKED' | 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';

  @Expose()
  hasAccess: boolean;

  @Expose()
  accessStart: Date | null;

  @Expose()
  accessEnd: Date | null;
}

export class CourseEvaluationDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string | null;

  @Expose()
  evaluationType: string;

  @Expose()
  startDate: Date;

  @Expose()
  endDate: Date;

  @Expose()
  @Type(() => EvaluationStatusDto)
  userStatus: EvaluationStatusDto;
}

export class CourseContentResponseDto {
  @Expose()
  courseCycleId: string;

  @Expose()
  courseName: string;

  @Expose()
  courseCode: string;

  @Expose()
  cycleCode: string;

  @Expose()
  isCurrentCycle: boolean;

  @Expose()
  @Type(() => CourseEvaluationDto)
  evaluations: CourseEvaluationDto[];
}
