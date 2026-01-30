import { IsNotEmpty, IsInt, IsBoolean } from 'class-validator';

export class FeatureTestimonyDto {
  @IsNotEmpty()
  @IsInt()
  displayOrder: number;

  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
