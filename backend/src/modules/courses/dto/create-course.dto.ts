import { IsString, IsNotEmpty, MaxLength, IsDefined } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @IsDefined()
  code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @IsDefined()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  courseTypeId: string;

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  cycleLevelId: string;
}
