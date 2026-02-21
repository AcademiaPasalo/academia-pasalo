import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumberString,
  MaxLength,
  IsDateString,
} from 'class-validator';

export class UploadMaterialDto {
  @IsNotEmpty()
  @IsNumberString()
  materialFolderId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  displayName: string;

  @IsOptional()
  @IsDateString()
  visibleFrom?: string;

  @IsOptional()
  @IsDateString()
  visibleUntil?: string;

  @IsOptional()
  @IsNumberString()
  classEventId?: string;
}
