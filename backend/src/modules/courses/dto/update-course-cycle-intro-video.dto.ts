import { IsString, IsOptional, IsUrl, MaxLength } from 'class-validator';

export class UpdateCourseCycleIntroVideoDto {
  @IsString()
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  introVideoUrl?: string | null;
}
