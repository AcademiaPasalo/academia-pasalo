import { IsString, IsNotEmpty, MaxLength, IsOptional, IsDefined, IsDateString } from 'class-validator';

export class CreateFolderDto {
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  evaluationId: string;

  @IsString()
  @IsOptional()
  parentFolderId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @IsDefined()
  name: string;

  @IsDateString()
  @IsOptional()
  visibleFrom?: string;

  @IsDateString()
  @IsOptional()
  visibleUntil?: string;
}
