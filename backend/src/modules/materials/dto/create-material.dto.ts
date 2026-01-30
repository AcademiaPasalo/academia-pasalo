import { IsNotEmpty, IsString, IsOptional, MaxLength, IsDefined } from 'class-validator';

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
}