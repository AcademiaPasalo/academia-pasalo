import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '@modules/auth/interfaces/jwt-payload.interface';
import { UsersService } from '@modules/users/application/users.service';
import { User } from '@modules/users/domain/user.entity';
import { UserSessionRepository } from '@modules/auth/infrastructure/user-session.repository';
import { SessionStatusService } from '@modules/auth/application/session-status.service';

export type UserWithSession = User & { sessionId: string };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly userSessionRepository: UserSessionRepository,
    private readonly sessionStatusService: SessionStatusService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET no está configurado');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<UserWithSession> {
    const activeStatusId =
      await this.sessionStatusService.getIdByCode('ACTIVE');

    const session = await this.userSessionRepository.findById(payload.sessionId);
    if (
      !session ||
      !session.isActive ||
      session.sessionStatusId !== activeStatusId ||
      session.expiresAt < new Date()
    ) {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }

    const user = await this.usersService.findOne(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const userWithSession: UserWithSession = { ...user, sessionId: payload.sessionId };
    return userWithSession;
  }
}
