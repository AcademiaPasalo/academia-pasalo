import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDefined,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCourseDto } from '@modules/courses/dto/create-course.dto';

export class CourseSetupEvaluationDto {
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  evaluationTypeId: string;

  @IsInt()
  @Type(() => Number)
  number: number;

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  startDate: string;

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  endDate: string;
}

export class CourseSetupMaterialsRootDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @IsDefined()
  name: string;

  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(255, { each: true })
  @IsOptional()
  subfolderNames?: string[];
}

export class CourseSetupMaterialsTemplateDto {
  @IsBoolean()
  @IsOptional()
  applyToEachEvaluation?: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => CourseSetupMaterialsRootDto)
  roots: CourseSetupMaterialsRootDto[];
}

export class CreateCourseSetupDto {
  @ValidateNested()
  @Type(() => CreateCourseDto)
  @IsDefined()
  course: CreateCourseDto;

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  academicCycleId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @IsDefined()
  allowedEvaluationTypeIds: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(60)
  @ValidateNested({ each: true })
  @Type(() => CourseSetupEvaluationDto)
  @IsDefined()
  evaluationsToCreate: CourseSetupEvaluationDto[];

  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @IsOptional()
  professorUserIds?: string[];

  @ValidateNested()
  @Type(() => CourseSetupMaterialsTemplateDto)
  @IsDefined()
  materialsTemplate: CourseSetupMaterialsTemplateDto;
}
