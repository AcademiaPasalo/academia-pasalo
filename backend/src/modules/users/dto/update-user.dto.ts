import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from '@modules/users/dto/create-user.dto';
import { IsEmail, IsOptional, MaxLength } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsEmail({}, { message: 'El email debe ser válido' })
  @MaxLength(255, { message: 'El email excede el tamaño máximo permitido' })
  email?: string;
}
