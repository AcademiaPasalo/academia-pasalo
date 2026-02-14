import {
  IsNotEmpty,
  IsString,
  IsOptional,
  MaxLength,
  IsDefined,
  IsNumberString,
} from 'class-validator';

export class CreateMaterialDto {
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  @MaxLength(20)
  materialFolderId: string;

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  @MaxLength(255)
  displayName: string;

  @IsString()
  @IsOptional()
  visibleFrom?: string;

  @IsString()
  @IsOptional()
  visibleUntil?: string;

  @IsOptional()
  @IsNumberString()
  classEventId?: string;
}
