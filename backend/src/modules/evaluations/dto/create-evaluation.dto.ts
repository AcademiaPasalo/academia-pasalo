import { IsString, IsNotEmpty, IsInt, IsDateString, IsDefined, Min, MaxLength } from 'class-validator';

export class CreateEvaluationDto {
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  @MaxLength(20)
  courseCycleId: string;

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  @MaxLength(20)
  evaluationTypeId: string;

  @IsInt()
  @Min(0)
  @IsDefined()
  number: number;

  @IsDateString()
  @IsDefined()
  startDate: string;

  @IsDateString()
  @IsDefined()
  endDate: string;
}
