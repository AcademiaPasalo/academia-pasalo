import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UserSessionRepository } from '@modules/auth/infrastructure/user-session.repository';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import { SessionStatusService } from '@modules/auth/application/session-status.service';
import { UserSession } from '@modules/auth/domain/user-session.entity';
import { SESSION_STATUS_CODES } from '@modules/auth/interfaces/security.constants';
import { createHash } from 'crypto';

@Injectable()
export class SessionValidatorService {
  private readonly logger = new Logger(SessionValidatorService.name);

  constructor(
    private readonly userSessionRepository: UserSessionRepository,
    private readonly sessionStatusService: SessionStatusService,
    private readonly cacheService: RedisCacheService,
  ) {}

  async validateRefreshTokenSession(
    userId: string,
    deviceId: string,
    refreshToken: string,
  ): Promise<UserSession> {
    const refreshTokenHash = this.hashRefreshToken(refreshToken);

    const isBlacklisted = await this.cacheService.get(
      `blacklist:refresh:${refreshTokenHash}`,
    );
    if (isBlacklisted) {
      this.logger.warn({
        level: 'warn',
        context: SessionValidatorService.name,
        message: 'Intento de uso de refresh token revocado',
        userId,
        deviceId,
      });
      throw new UnauthorizedException('Token revocado');
    }

    const session =
      await this.userSessionRepository.findByRefreshTokenHash(refreshTokenHash);

    if (!session || session.userId !== userId) {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }

    if (session.deviceId !== deviceId) {
      throw new UnauthorizedException('Dispositivo no autorizado');
    }

    if (session.expiresAt < new Date()) {
      const revokedStatusId =
        await this.sessionStatusService.getIdByCode(SESSION_STATUS_CODES.REVOKED);
      await this.userSessionRepository.update(session.id, {
        isActive: false,
        sessionStatusId: revokedStatusId,
      });
      throw new UnauthorizedException('Sesión inválida o expirada');
    }

    const activeStatusId =
      await this.sessionStatusService.getIdByCode(SESSION_STATUS_CODES.ACTIVE);
    if (session.sessionStatusId !== activeStatusId || !session.isActive) {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }

    await this.userSessionRepository.update(session.id, {
      lastActivityAt: new Date(),
    });

    return session;
  }

  async validateSession(
    sessionId: string,
    userId: string,
    deviceId: string,
  ): Promise<UserSession> {
    const session =
      await this.userSessionRepository.findByIdWithUser(sessionId);

    if (!session || session.userId !== userId) {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }

    const activeStatusId =
      await this.sessionStatusService.getIdByCode(SESSION_STATUS_CODES.ACTIVE);

    if (
      !session.isActive ||
      session.sessionStatusId !== activeStatusId ||
      session.expiresAt < new Date()
    ) {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }

    if (session.deviceId !== deviceId) {
      this.logger.warn({
        level: 'warn',
        context: SessionValidatorService.name,
        message: 'Intento de uso de sesión con dispositivo diferente',
        sessionId: session.id,
        expectedDeviceId: session.deviceId,
        providedDeviceId: deviceId,
      });
      throw new UnauthorizedException('Dispositivo no autorizado');
    }

    await this.userSessionRepository.update(session.id, {
      lastActivityAt: new Date(),
    });
    return session;
  }

  hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
