import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class UpdateCourseCycleEvaluationStructureDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  evaluationTypeIds: string[];
}
