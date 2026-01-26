import { IsString, IsNotEmpty, IsInt, IsDateString, IsDefined, Min } from 'class-validator';

export class CreateEvaluationDto {
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  courseCycleId: string;

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  evaluationTypeId: string;

  @IsInt()
  @Min(1)
  @IsDefined()
  number: number;

  @IsDateString()
  @IsDefined()
  startDate: string;

  @IsDateString()
  @IsDefined()
  endDate: string;
}
