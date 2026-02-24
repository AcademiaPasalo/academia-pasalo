import { Expose, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class AdminCourseCycleListQueryDto {
  @Expose()
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @Expose()
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;

  @Expose()
  @IsOptional()
  @IsString()
  search?: string;
}

class AdminCourseCycleListCourseDto {
  @Expose()
  id: string;

  @Expose()
  code: string;

  @Expose()
  name: string;
}

class AdminCourseCycleListAcademicCycleDto {
  @Expose()
  id: string;

  @Expose()
  code: string;

  @Expose()
  startDate: Date;

  @Expose()
  endDate: Date;

  @Expose()
  isCurrent: boolean;
}

class AdminCourseCycleProfessorDto {
  @Expose()
  id: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName1: string;

  @Expose()
  lastName2: string;

  @Expose()
  profilePhotoUrl: string | null;
}

export class AdminCourseCycleListItemDto {
  @Expose()
  courseCycleId: string;

  @Expose()
  @Type(() => AdminCourseCycleListCourseDto)
  course: AdminCourseCycleListCourseDto;

  @Expose()
  @Type(() => AdminCourseCycleListAcademicCycleDto)
  academicCycle: AdminCourseCycleListAcademicCycleDto;

  @Expose()
  @Type(() => AdminCourseCycleProfessorDto)
  professors: AdminCourseCycleProfessorDto[];
}

export class AdminCourseCycleListResponseDto {
  @Expose()
  @Type(() => AdminCourseCycleListItemDto)
  items: AdminCourseCycleListItemDto[];

  @Expose()
  page: number;

  @Expose()
  pageSize: number;

  @Expose()
  totalItems: number;

  @Expose()
  totalPages: number;
}
