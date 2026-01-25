import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ReauthAnomalousSessionDto {
  @IsNotEmpty({ message: 'El código de autorización de Google es requerido' })
  @IsString({ message: 'El código debe ser una cadena de texto' })
  @MaxLength(5000, { message: 'El código excede el tamaño máximo permitido' })
  code: string;

  @IsNotEmpty({ message: 'El refresh token es requerido' })
  @IsString({ message: 'El refresh token debe ser una cadena de texto' })
  @MaxLength(5000, { message: 'El refresh token excede el tamaño máximo permitido' })
  refreshToken: string;

  @IsNotEmpty({ message: 'El ID del dispositivo es requerido' })
  @IsString({ message: 'El ID del dispositivo debe ser una cadena de texto' })
  @MaxLength(255, { message: 'El ID del dispositivo excede el tamaño máximo permitido' })
  deviceId: string;
}

