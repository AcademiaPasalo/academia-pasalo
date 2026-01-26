import { IsString, IsNotEmpty, IsBoolean, IsArray, IsOptional, IsDefined } from 'class-validator';

export class CreateEnrollmentDto {
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  courseCycleId: string;

  @IsBoolean()
  @IsDefined()
  isFullCourse: boolean;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  evaluationIds?: string[];
}
