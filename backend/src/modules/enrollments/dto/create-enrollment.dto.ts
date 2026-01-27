import { IsString, IsNotEmpty, IsArray, IsOptional, IsDefined, MaxLength } from 'class-validator';

export class CreateEnrollmentDto {
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  @MaxLength(20)
  userId: string;

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  @MaxLength(20)
  courseCycleId: string;

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  @MaxLength(32)
  enrollmentTypeCode: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @MaxLength(20, { each: true })
  evaluationIds?: string[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @MaxLength(20, { each: true })
  historicalCourseCycleIds?: string[];
}
