import { IsString, IsNotEmpty, IsDefined } from 'class-validator';

export class AssignCourseToCycleDto {
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  courseId: string;

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  academicCycleId: string;
}
