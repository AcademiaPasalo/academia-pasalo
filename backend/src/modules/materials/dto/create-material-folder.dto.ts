import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumberString,
  MaxLength,
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
  @IsString()
  visibleFrom?: string;

  @IsOptional()
  @IsString()
  visibleUntil?: string;
}
