import { IsNotEmpty, IsInt, Min, Max, IsString, MaxLength, IsEnum, IsNumberString } from 'class-validator';
import { PhotoSource } from '@modules/feedback/domain/course-testimony.entity';

export class CreateTestimonyDto {
  @IsNotEmpty()
  @IsNumberString()
  courseCycleId: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(5)
  rating: number; 

  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  comment: string;

  @IsNotEmpty()
  @IsEnum(PhotoSource)
  photoSource: PhotoSource;
}