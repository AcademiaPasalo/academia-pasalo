import { IsString, IsNotEmpty, MaxLength, IsOptional, IsDefined, IsDateString } from 'class-validator';

export class CreateMaterialDto {
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  materialFolderId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @IsDefined()
  displayName: string;

  @IsDateString()
  @IsOptional()
  visibleFrom?: string;

  @IsDateString()
  @IsOptional()
  visibleUntil?: string;
}
