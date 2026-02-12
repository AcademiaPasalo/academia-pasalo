import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '@modules/auth/interfaces/jwt-payload.interface';
import { AuthSettingsService } from '@modules/auth/application/auth-settings.service';
import { randomUUID } from 'crypto';

export type RefreshTokenPayload = {
  sub: string;
  deviceId: string;
  type: 'refresh';
  jti: string;
  iat?: number;
  exp?: number;
};

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly authSettingsService: AuthSettingsService,
  ) {}

  async generateAccessToken(payload: JwtPayload): Promise<string> {
    const ttlMinutes =
      await this.authSettingsService.getAccessTokenTtlMinutes();
    return this.jwtService.sign(payload, {
      expiresIn: `${ttlMinutes}m`,
    });
  }

  async generateRefreshToken(
    userId: string,
    deviceId: string,
  ): Promise<{ token: string; expiresAt: Date; refreshTokenJti: string }> {
    const ttlDays = await this.authSettingsService.getRefreshTokenTtlDays();
    const refreshTokenJti = randomUUID();
    const payload: RefreshTokenPayload = {
      sub: userId,
      deviceId,
      type: 'refresh',
      jti: refreshTokenJti,
    };

    const token = this.jwtService.sign(payload, {
      expiresIn: `${ttlDays}d`,
    });

    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

    return { token, expiresAt, refreshTokenJti };
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      const payload = this.jwtService.verify<RefreshTokenPayload>(token);

      if (
        !payload ||
        payload.type !== 'refresh' ||
        typeof payload.sub !== 'string' ||
        typeof payload.deviceId !== 'string' ||
        typeof payload.jti !== 'string'
      ) {
        throw new UnauthorizedException('Refresh token inválido');
      }

      return payload;
    } catch (error) {
      this.logger.warn({
        level: 'warn',
        context: TokenService.name,
        message: 'Refresh token inválido o expirado',
        error: error instanceof Error ? error.message : String(error),
      });
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }
}
