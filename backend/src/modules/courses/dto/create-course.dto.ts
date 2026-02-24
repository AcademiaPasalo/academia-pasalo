import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsDefined,
  IsOptional,
  Matches,
} from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @IsDefined()
  code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @IsDefined()
  name: string;

  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'El color primario debe ser un hexadecimal válido (ej: #FFFFFF)',
  })
  primaryColor?: string;

  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'El color secundario debe ser un hexadecimal válido (ej: #FFFFFF)',
  })
  secondaryColor?: string;

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  courseTypeId: string;

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  cycleLevelId: string;
}
