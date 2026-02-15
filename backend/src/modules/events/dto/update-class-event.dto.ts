import {
  IsString,
  IsOptional,
  IsDateString,
  MaxLength,
  IsUrl,
} from 'class-validator';

export class UpdateClassEventDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  topic?: string;

  @IsDateString()
  @IsOptional()
  startDatetime?: string;

  @IsDateString()
  @IsOptional()
  endDatetime?: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  liveMeetingUrl?: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  recordingUrl?: string;
}
