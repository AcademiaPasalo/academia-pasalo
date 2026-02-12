import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { EntityManager } from 'typeorm';
import { UserSessionRepository } from '@modules/auth/infrastructure/user-session.repository';
import { SessionAnomalyDetectorService } from '@modules/auth/application/session-anomaly-detector.service';
import { UserSession } from '@modules/auth/domain/user-session.entity';
import { RequestMetadata } from '@modules/auth/interfaces/request-metadata.interface';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import {
  SessionStatusCode,
  SessionStatusService,
} from '@modules/auth/application/session-status.service';
import {
  ConcurrentDecision,
  SESSION_STATUS_CODES,
} from '@modules/auth/interfaces/security.constants';
import { SessionValidatorService } from '@modules/auth/application/session-validator.service';
import { SessionConflictService } from '@modules/auth/application/session-conflict.service';
import { SessionSecurityService } from '@modules/auth/application/session-security.service';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly userSessionRepository: UserSessionRepository,
    private readonly sessionAnomalyDetector: SessionAnomalyDetectorService,
    private readonly sessionStatusService: SessionStatusService,
    private readonly cacheService: RedisCacheService,
    private readonly sessionValidator: SessionValidatorService,
    private readonly sessionConflict: SessionConflictService,
    private readonly sessionSecurity: SessionSecurityService,
  ) {}

  async createSession(
    userId: string,
    metadata: RequestMetadata,
    refreshToken: string,
    refreshTokenJti: string,
    expiresAt: Date,
    activeRoleId?: string,
    externalManager?: EntityManager,
  ): Promise<{
    session: UserSession;
    sessionStatus: SessionStatusCode;
    concurrentSessionId: string | null;
  }> {
    const resolved =
      await this.sessionAnomalyDetector.resolveCoordinates(metadata);

    const runInTransaction = async (manager: EntityManager) => {
      const activeStatusId = await this.sessionStatusService.getIdByCode(
        SESSION_STATUS_CODES.ACTIVE,
        manager,
      );
      const pendingStatusId = await this.sessionStatusService.getIdByCode(
        SESSION_STATUS_CODES.PENDING_CONCURRENT_RESOLUTION,
        manager,
      );

      const isNewDevice =
        !(await this.userSessionRepository.existsByUserIdAndDeviceId(
          userId,
          resolved.metadata.deviceId,
          manager,
        ));

      const anomaly = await this.sessionAnomalyDetector.detectLocationAnomaly(
        userId,
        resolved.metadata,
        resolved.locationSource,
        isNewDevice,
        manager,
      );

      const concurrentSession =
        await this.userSessionRepository.findOtherActiveSession(
          userId,
          resolved.metadata.deviceId,
          activeStatusId,
          manager,
        );

      const refreshTokenHash =
        this.sessionValidator.hashRefreshToken(refreshToken);

      const sessionStatusId = concurrentSession
        ? pendingStatusId
        : activeStatusId;

      const session = await this.userSessionRepository.create(
        {
          userId,
          deviceId: resolved.metadata.deviceId,
          ipAddress: resolved.metadata.ipAddress,
          latitude: resolved.metadata.latitude || null,
          longitude: resolved.metadata.longitude || null,
          refreshTokenHash,
          refreshTokenJti,
          sessionStatusId,
          activeRoleId: activeRoleId || null,
          expiresAt,
          lastActivityAt: new Date(),
          isActive: !concurrentSession,
          createdAt: new Date(),
        },
        manager,
      );

      if (concurrentSession) {
        await this.sessionConflict.cleanupExcessPendingSessions(
          userId,
          manager,
        );
      }

      await this.sessionSecurity.logSessionCreationEvents({
        userId,
        metadata: resolved.metadata,
        session,
        locationSource: resolved.locationSource,
        isNewDevice,
        anomaly,
        isConcurrent: !!concurrentSession,
        existingSession: concurrentSession,
        manager,
      });

      this.logger.debug({
        level: 'debug',
        context: SessionService.name,
        message: 'Sesión procesada',
        userId,
        sessionId: session.id,
        deviceId: resolved.metadata.deviceId,
        isAnomalous: anomaly.isAnomalous,
        isConcurrent: !!concurrentSession,
      });

      return {
        session,
        sessionStatus: (concurrentSession
          ? SESSION_STATUS_CODES.PENDING_CONCURRENT_RESOLUTION
          : SESSION_STATUS_CODES.ACTIVE) as SessionStatusCode,
        concurrentSessionId: concurrentSession ? concurrentSession.id : null,
      };
    };

    if (externalManager) {
      return await runInTransaction(externalManager);
    }

    return await this.dataSource.transaction(runInTransaction);
  }

  async rotateRefreshToken(
    sessionId: string,
    refreshToken: string,
    refreshTokenJti: string,
    expiresAt: Date,
    manager?: EntityManager,
  ): Promise<UserSession> {
    const refreshTokenHash =
      this.sessionValidator.hashRefreshToken(refreshToken);

    return await this.userSessionRepository.update(
      sessionId,
      {
        refreshTokenHash,
        refreshTokenJti,
        expiresAt,
        lastActivityAt: new Date(),
      },
      manager,
    );
  }

  async deactivateSession(
    sessionId: string,
    manager?: EntityManager,
  ): Promise<void> {
    const revokedStatusId = await this.sessionStatusService.getIdByCode(
      SESSION_STATUS_CODES.REVOKED,
      manager,
    );

    await this.userSessionRepository.update(
      sessionId,
      {
        sessionStatusId: revokedStatusId,
        isActive: false,
      },
      manager,
    );
  }

  async deactivateAllUserSessions(userId: string): Promise<void> {
    const sessions =
      await this.userSessionRepository.findActiveSessionsByUserId(userId);

    const revokedStatusId =
      await this.sessionStatusService.getIdByCode(SESSION_STATUS_CODES.REVOKED);

    for (const session of sessions) {
      await this.userSessionRepository.update(session.id, {
        sessionStatusId: revokedStatusId,
        isActive: false,
      });
      await this.cacheService.del(`cache:session:${session.id}:user`);
    }

    this.logger.log({
      level: 'info',
      context: SessionService.name,
      message: 'Todas las sesiones del usuario desactivadas',
      userId,
      sessionsCount: sessions.length,
    });
  }

  async findSessionByRefreshToken(
    refreshTokenJti: string,
    manager?: EntityManager,
  ): Promise<UserSession | null> {
    return await this.userSessionRepository.findByRefreshTokenJti(
      refreshTokenJti,
      manager,
    );
  }

  async findSessionByRefreshTokenForUpdate(
    refreshTokenJti: string,
    manager: EntityManager,
  ): Promise<UserSession | null> {
    return await this.userSessionRepository.findByRefreshTokenJtiForUpdate(
      refreshTokenJti,
      manager,
    );
  }

  async resolveConcurrentSession(params: {
    userId: string;
    deviceId: string;
    refreshTokenJti: string;
    decision: ConcurrentDecision;
    ipAddress: string;
    userAgent: string;
    externalManager?: EntityManager;
  }): Promise<{ keptSessionId: string | null }> {
    return await this.sessionConflict.resolveConcurrentSession(params);
  }

  async activateBlockedSession(
    sessionId: string,
    manager?: EntityManager,
  ): Promise<void> {
    const activeStatusId = await this.sessionStatusService.getIdByCode(
      SESSION_STATUS_CODES.ACTIVE,
      manager,
    );
    await this.userSessionRepository.update(
      sessionId,
      {
        sessionStatusId: activeStatusId,
        isActive: true,
      },
      manager,
    );
  }
}
