import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumberString,
  MaxLength,
  IsDateString,
} from 'class-validator';

export class CreateMaterialFolderDto {
  @IsNotEmpty()
  @IsNumberString()
  evaluationId: string;

  @IsOptional()
  @IsNumberString()
  parentFolderId?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsDateString()
  visibleFrom?: string;

  @IsOptional()
  @IsDateString()
  visibleUntil?: string;
}
