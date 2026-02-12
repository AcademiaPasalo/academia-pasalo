import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '@modules/auth/interfaces/jwt-payload.interface';
import { User } from '@modules/users/domain/user.entity';
import { SessionValidatorService } from '@modules/auth/application/session-validator.service';
import { SECURITY_MESSAGES } from '@modules/auth/interfaces/security.constants';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import { technicalSettings } from '@config/technical-settings';

export type UserWithSession = User & { sessionId: string; activeRole: string };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly sessionValidatorService: SessionValidatorService,
    private readonly cacheService: RedisCacheService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new InternalServerErrorException('JWT_SECRET no está configurado');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<UserWithSession> {
    const cacheKey = `cache:session:${payload.sessionId}:user`;
    const session = await this.sessionValidatorService.validateSession(
      payload.sessionId,
      payload.sub,
      payload.deviceId,
    );

    if (!session.user) {
      await this.cacheService.del(cacheKey);
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (!session.user.isActive) {
      await this.cacheService.del(cacheKey);
      throw new ForbiddenException(SECURITY_MESSAGES.INACTIVE_ACCOUNT);
    }

    const userWithSession = session.user as UserWithSession;
    userWithSession.sessionId = payload.sessionId;
    userWithSession.activeRole = payload.activeRole;

    const cachedUser = await this.cacheService.get<UserWithSession>(cacheKey);
    if (cachedUser && cachedUser.id === userWithSession.id) {
      cachedUser.sessionId = payload.sessionId;
      cachedUser.activeRole = payload.activeRole;
      return cachedUser;
    }

    await this.cacheService.set(
      cacheKey,
      userWithSession,
      technicalSettings.auth.session.sessionUserCacheTtlSeconds,
    );

    return userWithSession;
  }
}
