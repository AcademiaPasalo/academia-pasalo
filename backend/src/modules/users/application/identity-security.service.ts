import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import type { EntityManager } from 'typeorm';
import { UserSessionRepository } from '@modules/auth/infrastructure/user-session.repository';
import { SessionStatusRepository } from '@modules/auth/infrastructure/session-status.repository';
import {
  IDENTITY_INVALIDATION_REASONS,
  SESSION_STATUS_CODES,
  type IdentityInvalidationReason,
} from '@modules/auth/interfaces/security.constants';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';

@Injectable()
export class IdentitySecurityService {
  private readonly logger = new Logger(IdentitySecurityService.name);

  constructor(
    private readonly userSessionRepository: UserSessionRepository,
    private readonly sessionStatusRepository: SessionStatusRepository,
    private readonly cacheService: RedisCacheService,
  ) {}

  async invalidateUserIdentity(
    userId: string,
    options?: {
      revokeSessions?: boolean;
      reason?: IdentityInvalidationReason;
      manager?: EntityManager;
    },
  ): Promise<void> {
    const revokeSessions = options?.revokeSessions ?? false;
    const reason = options?.reason ?? IDENTITY_INVALIDATION_REASONS.UNSPECIFIED;
    const manager = options?.manager;

    const activeSessions =
      await this.userSessionRepository.findActiveSessionsByUserId(
        userId,
        manager,
      );

    if (revokeSessions && activeSessions.length > 0) {
      const revokedStatus = await this.sessionStatusRepository.findByCode(
        SESSION_STATUS_CODES.REVOKED,
        manager,
      );
      if (!revokedStatus) {
        throw new InternalServerErrorException(
          'Configuracion de estado de sesion incompleta',
        );
      }

      for (const session of activeSessions) {
        await this.userSessionRepository.update(
          session.id,
          {
            sessionStatusId: revokedStatus.id,
            isActive: false,
          },
          manager,
        );
      }
    }

    for (const session of activeSessions) {
      await this.cacheService.del(`cache:session:${session.id}:user`);
    }

    await this.cacheService.del(`cache:user:profile:${userId}`);

    this.logger.log({
      level: 'info',
      context: IdentitySecurityService.name,
      message: 'Invalidacion de identidad ejecutada',
      userId,
      revokeSessions,
      sessionsAffected: activeSessions.length,
      reason,
    });
  }
}
