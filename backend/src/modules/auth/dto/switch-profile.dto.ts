import { IsNotEmpty, IsString } from 'class-validator';

export class SwitchProfileDto {
  @IsString()
  @IsNotEmpty()
  roleId: string;

  @IsString()
  @IsNotEmpty()
  deviceId: string;
}
