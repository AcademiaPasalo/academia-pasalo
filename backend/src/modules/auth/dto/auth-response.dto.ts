import { Expose } from 'class-transformer';
import { UserResponseDto } from '@modules/users/dto/user-response.dto';

export class AuthResponseDto {
  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;

  @Expose()
  expiresIn: number;

  @Expose()
  sessionStatus?: string;

  @Expose()
  concurrentSessionId?: string | null;

  @Expose()
  user?: UserResponseDto | null;
}
