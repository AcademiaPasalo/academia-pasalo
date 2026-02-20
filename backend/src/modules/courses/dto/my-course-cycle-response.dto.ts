import { Expose, Type } from 'class-transformer';

class CourseDto {
  @Expose()
  id: string;

  @Expose()
  code: string;

  @Expose()
  name: string;
}

class AcademicCycleDto {
  @Expose()
  id: string;

  @Expose()
  code: string;

  @Expose()
  startDate: Date;

  @Expose()
  endDate: Date;
}

export class MyCourseCycleResponseDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => CourseDto)
  course: CourseDto;

  @Expose()
  @Type(() => AcademicCycleDto)
  academicCycle: AcademicCycleDto;
}
