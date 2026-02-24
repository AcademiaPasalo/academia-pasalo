import { Expose, Type } from 'class-transformer';

export class CourseTypeResponseDto {
  @Expose()
  id: string;

  @Expose()
  code: string;

  @Expose()
  name: string;
}

export class CycleLevelResponseDto {
  @Expose()
  id: string;

  @Expose()
  levelNumber: number;

  @Expose()
  name: string;
}

export class CourseResponseDto {
  @Expose()
  id: string;

  @Expose()
  code: string;

  @Expose()
  name: string;

  @Expose()
  primaryColor: string;

  @Expose()
  secondaryColor: string;

  @Expose()
  @Type(() => CourseTypeResponseDto)
  courseType: CourseTypeResponseDto;

  @Expose()
  @Type(() => CycleLevelResponseDto)
  cycleLevel: CycleLevelResponseDto;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
