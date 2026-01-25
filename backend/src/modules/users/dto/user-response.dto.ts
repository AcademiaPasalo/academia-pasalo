import { Expose, Type } from 'class-transformer';
import { PhotoSource } from '@modules/users/domain/user.entity';

class RoleDto {
  @Expose()
  code: string;

  @Expose()
  name: string;
}

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName1: string | null;

  @Expose()
  lastName2: string | null;

  @Expose()
  phone: string | null;

  @Expose()
  career: string | null;

  @Expose()
  profilePhotoUrl: string | null;

  @Expose()
  photoSource: PhotoSource;

  @Expose()
  @Type(() => RoleDto)
  roles: RoleDto[];

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string | null;
}
