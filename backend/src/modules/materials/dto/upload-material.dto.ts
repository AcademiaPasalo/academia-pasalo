import { IsNotEmpty, IsString, IsOptional, IsNumberString, MaxLength } from 'class-validator';

export class UploadMaterialDto {
  @IsNotEmpty()
  @IsNumberString()
  materialFolderId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  displayName: string;

  @IsOptional()
  @IsString()
  visibleFrom?: string;

  @IsOptional()
  @IsString()
  visibleUntil?: string;
}
