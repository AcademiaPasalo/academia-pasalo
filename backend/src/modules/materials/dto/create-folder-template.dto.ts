import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateFolderTemplateDto {
  @IsNotEmpty()
  @IsNumberString()
  evaluationId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  rootName: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(255, { each: true })
  subfolderNames: string[];

  @IsOptional()
  @IsDateString()
  visibleFrom?: string;

  @IsOptional()
  @IsDateString()
  visibleUntil?: string;
}
