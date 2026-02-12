import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import {
  CONCURRENT_DECISIONS,
  type ConcurrentDecision,
} from '@modules/auth/interfaces/security.constants';

export class ResolveConcurrentSessionDto {
  @IsNotEmpty({ message: 'El refresh token es requerido' })
  @IsString({ message: 'El refresh token debe ser una cadena de texto' })
  @MaxLength(5000, {
    message: 'El refresh token excede el tamaño máximo permitido',
  })
  refreshToken: string;

  @IsNotEmpty({ message: 'El ID del dispositivo es requerido' })
  @IsString({ message: 'El ID del dispositivo debe ser una cadena de texto' })
  @MaxLength(255, {
    message: 'El ID del dispositivo excede el tamaño máximo permitido',
  })
  deviceId: string;

  @IsNotEmpty({ message: 'La decisión es requerida' })
  @IsString({ message: 'La decisión debe ser una cadena de texto' })
  @MaxLength(20, { message: 'La decisión excede el tamaño máximo permitido' })
  @IsIn(Object.values(CONCURRENT_DECISIONS), {
    message: 'La decisión debe ser KEEP_NEW o KEEP_EXISTING',
  })
  decision: ConcurrentDecision;
}
