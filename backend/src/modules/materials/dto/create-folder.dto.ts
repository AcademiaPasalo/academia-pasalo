import { IsNotEmpty, IsString, IsOptional, MaxLength, IsDefined } from 'class-validator';

export class CreateFolderDto {
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  @MaxLength(20)
  evaluationId: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  parentFolderId?: string;

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  visibleFrom?: string;

  @IsString()
  @IsOptional()
  visibleUntil?: string;
}