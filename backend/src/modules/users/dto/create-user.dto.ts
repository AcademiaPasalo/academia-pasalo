import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  Matches,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { PhotoSource } from '@modules/users/domain/user.entity';

export class CreateUserDto {
  @IsEmail({}, { message: 'El email debe ser válido' })
  @MaxLength(255, { message: 'El email excede el tamaño máximo permitido' })
  email: string;

  @IsString({ message: 'El nombre debe ser un texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre excede el tamaño máximo permitido' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: 'El nombre solo puede contener letras',
  })
  firstName: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'El apellido excede el tamaño máximo permitido' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: 'El apellido solo puede contener letras',
  })
  lastName1?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'El apellido excede el tamaño máximo permitido' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: 'El apellido solo puede contener letras',
  })
  lastName2?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'El teléfono excede el tamaño máximo permitido' })
  @Matches(/^\+?[0-9\s\-()]+$/, {
    message: 'El teléfono debe contener solo números y caracteres válidos',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'La carrera excede el tamaño máximo permitido' })
  career?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'La URL de foto excede el tamaño máximo permitido' })
  profilePhotoUrl?: string;

  @IsOptional()
  @IsEnum(PhotoSource, {
    message: 'El origen de la foto debe ser google, uploaded o none',
  })
  photoSource?: PhotoSource;
}
