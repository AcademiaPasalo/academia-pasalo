import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { EntityManager } from 'typeorm';
import { UserSessionRepository } from '@modules/auth/infrastructure/user-session.repository';
import { SecurityEventService } from '@modules/auth/application/security-event.service';
import { SessionAnomalyDetectorService } from '@modules/auth/application/session-anomaly-detector.service';
import { UserSession } from '@modules/auth/domain/user-session.entity';
import { RequestMetadata } from '@modules/auth/interfaces/request-metadata.interface';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import {
  SessionStatusCode,
  SessionStatusService,
} from '@modules/auth/application/session-status.service';
import { createHash } from 'crypto';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly userSessionRepository: UserSessionRepository,
    private readonly securityEventService: SecurityEventService,
    private readonly sessionAnomalyDetector: SessionAnomalyDetectorService,
    private readonly sessionStatusService: SessionStatusService,
    private readonly cacheService: RedisCacheService,
  ) {}

  async createSession(
    userId: string,
    metadata: RequestMetadata,
    refreshToken: string,
    expiresAt: Date,
    externalManager?: EntityManager,
  ): Promise<{
    session: UserSession;
    sessionStatus: SessionStatusCode;
    concurrentSessionId: string | null;
  }> {
    const resolved = await this.sessionAnomalyDetector.resolveCoordinates(metadata);
    
    const runInTransaction = async (manager: EntityManager) => {
      const activeStatusId = await this.sessionStatusService.getIdByCode(
        'ACTIVE',
        manager,
      );
      const pendingStatusId = await this.sessionStatusService.getIdByCode(
        'PENDING_CONCURRENT_RESOLUTION',
        manager,
      );
      const blockedStatusId = await this.sessionStatusService.getIdByCode(
        'BLOCKED_PENDING_REAUTH',
        manager,
      );

      const anomaly = await this.sessionAnomalyDetector.detectLocationAnomaly(
        userId,
        resolved.metadata,
        resolved.locationSource,
        manager,
      );

      if (anomaly.isAnomalous) {
        const refreshTokenHash = this.hashRefreshToken(refreshToken);

        const session = await this.userSessionRepository.create(
          {
            userId,
            deviceId: resolved.metadata.deviceId,
            ipAddress: resolved.metadata.ipAddress,
            latitude: resolved.metadata.latitude || null,
            longitude: resolved.metadata.longitude || null,
            refreshTokenHash,
            sessionStatusId: blockedStatusId,
            expiresAt,
            lastActivityAt: new Date(),
            isActive: false,
            createdAt: new Date(),
          },
          manager,
        );

        await this.securityEventService.logEvent(
          userId,
          'ANOMALOUS_LOGIN_DETECTED',
          {
            ipAddress: resolved.metadata.ipAddress,
            userAgent: resolved.metadata.userAgent,
            deviceId: resolved.metadata.deviceId,
            locationSource: resolved.locationSource,
            city: resolved.metadata.city,
            country: resolved.metadata.country,
            previousSessionId: anomaly.previousSessionId,
            distanceKm: anomaly.distanceKm,
            timeDifferenceMinutes: anomaly.timeDifferenceMinutes,
            newSessionId: session.id,
          },
          manager,
        );

        return {
          session,
          sessionStatus: 'BLOCKED_PENDING_REAUTH' as SessionStatusCode,
          concurrentSessionId: null,
        };
      }

      const concurrentSession =
        await this.userSessionRepository.findOtherActiveSession(
          userId,
          resolved.metadata.deviceId,
          activeStatusId,
          manager,
        );

      const refreshTokenHash = this.hashRefreshToken(refreshToken);

      const session = await this.userSessionRepository.create(
        {
          userId,
          deviceId: resolved.metadata.deviceId,
          ipAddress: resolved.metadata.ipAddress,
          latitude: resolved.metadata.latitude || null,
          longitude: resolved.metadata.longitude || null,
          refreshTokenHash,
          sessionStatusId: concurrentSession ? pendingStatusId : activeStatusId,
          expiresAt,
          lastActivityAt: new Date(),
          isActive: !concurrentSession,
          createdAt: new Date(),
        },
        manager,
      );

      if (concurrentSession) {
        await this.securityEventService.logEvent(
          userId,
          'CONCURRENT_SESSION_DETECTED',
          {
            ipAddress: resolved.metadata.ipAddress,
            userAgent: resolved.metadata.userAgent,
            deviceId: resolved.metadata.deviceId,
            locationSource: resolved.locationSource,
            city: resolved.metadata.city,
            country: resolved.metadata.country,
            newSessionId: session.id,
            existingSessionId: concurrentSession.id,
            existingDeviceId: concurrentSession.deviceId,
          },
          manager,
        );
      }

      this.logger.debug({
        level: 'debug',
        context: SessionService.name,
        message: 'Sesión creada',
        userId,
        sessionId: session.id,
        deviceId: resolved.metadata.deviceId,
      });

      return {
        session,
        sessionStatus: (concurrentSession
          ? 'PENDING_CONCURRENT_RESOLUTION'
          : 'ACTIVE') as SessionStatusCode,
        concurrentSessionId: concurrentSession ? concurrentSession.id : null,
      };
    };

    if (externalManager) {
      return await runInTransaction(externalManager);
    }

    return await this.dataSource.transaction(runInTransaction);
  }

  async validateRefreshTokenSession(
    userId: string,
    deviceId: string,
    refreshToken: string,
  ): Promise<UserSession> {
    const refreshTokenHash = this.hashRefreshToken(refreshToken);

    const isBlacklisted = await this.cacheService.get(`blacklist:refresh:${refreshTokenHash}`);
    if (isBlacklisted) {
      this.logger.warn({
        level: 'warn',
        context: SessionService.name,
        message: 'Intento de uso de refresh token revocado',
        userId,
        deviceId,
      });
      throw new UnauthorizedException('Token revocado');
    }

    const session = await this.userSessionRepository.findByRefreshTokenHash(
      refreshTokenHash,
    );

    if (!session) {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }

    if (session.userId !== userId) {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }

    if (session.deviceId !== deviceId) {
      throw new UnauthorizedException('Dispositivo no autorizado');
    }

    if (session.expiresAt < new Date()) {
      await this.userSessionRepository.update(session.id, {
        isActive: false,
      });
      throw new UnauthorizedException('Sesión inválida o expirada');
    }

    const activeStatusId = await this.sessionStatusService.getIdByCode('ACTIVE');
    if (session.sessionStatusId !== activeStatusId || !session.isActive) {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }

    await this.userSessionRepository.update(session.id, {
      lastActivityAt: new Date(),
    });

    return session;
  }

  async rotateRefreshToken(
    sessionId: string,
    refreshToken: string,
    expiresAt: Date,
    manager?: EntityManager,
  ): Promise<UserSession> {
    const refreshTokenHash = this.hashRefreshToken(refreshToken);

    return await this.userSessionRepository.update(
      sessionId,
      {
        refreshTokenHash,
        expiresAt,
        lastActivityAt: new Date(),
      },
      manager,
    );
  }

  async validateSession(sessionId: string, userId: string, deviceId: string): Promise<UserSession> {
    const session = await this.userSessionRepository.findActiveById(sessionId);

    if (!session) {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }

    if (session.userId !== userId) {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }

    if (session.deviceId !== deviceId) {
      this.logger.warn({
        level: 'warn',
        context: SessionService.name,
        message: 'Intento de uso de sesión con dispositivo diferente',
        sessionId: session.id,
        expectedDeviceId: session.deviceId,
        providedDeviceId: deviceId,
      });
      throw new UnauthorizedException('Dispositivo no autorizado');
    }

    await this.userSessionRepository.update(session.id, { lastActivityAt: new Date() });
    return session;
  }

  async deactivateSession(sessionId: string, manager?: EntityManager): Promise<void> {
    const revokedStatusId =
      await this.sessionStatusService.getIdByCode('REVOKED', manager);

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

    for (const session of sessions) {
      await this.userSessionRepository.deactivateSession(session.id);
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

  private hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async findSessionByRefreshToken(
    refreshToken: string,
    manager?: EntityManager,
  ): Promise<UserSession | null> {
    const refreshTokenHash = this.hashRefreshToken(refreshToken);
    return await this.userSessionRepository.findByRefreshTokenHash(
      refreshTokenHash,
      manager,
    );
  }

  async findSessionByRefreshTokenForUpdate(
    refreshToken: string,
    manager: EntityManager,
  ): Promise<UserSession | null> {
    const refreshTokenHash = this.hashRefreshToken(refreshToken);
    return await this.userSessionRepository.findByRefreshTokenHashForUpdate(
      refreshTokenHash,
      manager,
    );
  }

  async resolveConcurrentSession(params: {
    userId: string;
    deviceId: string;
    refreshToken: string;
    decision: 'KEEP_NEW' | 'KEEP_EXISTING';
    ipAddress: string;
    userAgent: string;
    externalManager?: EntityManager;
  }): Promise<{ keptSessionId: string | null }> {
    const runInTransaction = async (manager: EntityManager) => {
      const activeStatusId = await this.sessionStatusService.getIdByCode(
        'ACTIVE',
        manager,
      );
      const pendingStatusId = await this.sessionStatusService.getIdByCode(
        'PENDING_CONCURRENT_RESOLUTION',
        manager,
      );
      const revokedStatusId = await this.sessionStatusService.getIdByCode(
        'REVOKED',
        manager,
      );

      const refreshTokenHash = this.hashRefreshToken(params.refreshToken);
      const newSession =
        await this.userSessionRepository.findByRefreshTokenHashForUpdate(
          refreshTokenHash,
          manager,
        );

      if (
        !newSession ||
        newSession.userId !== params.userId ||
        newSession.deviceId !== params.deviceId ||
        newSession.sessionStatusId !== pendingStatusId
      ) {
        throw new UnauthorizedException('Sesión inválida o expirada');
      }

      const existingSession =
        await this.userSessionRepository.findOtherActiveSession(
          params.userId,
          params.deviceId,
          activeStatusId,
          manager,
        );

      if (!existingSession) {
        await this.userSessionRepository.update(
          newSession.id,
          {
            sessionStatusId: activeStatusId,
            isActive: true,
          },
          manager,
        );

        await this.securityEventService.logEvent(
          params.userId,
          'CONCURRENT_SESSION_RESOLVED',
          {
            ipAddress: params.ipAddress,
            userAgent: params.userAgent,
            decision: 'KEEP_NEW',
            newSessionId: newSession.id,
            existingSessionId: null,
          },
          manager,
        );

        return { keptSessionId: newSession.id };
      }

      const lockedExisting = await this.userSessionRepository.findByIdForUpdate(
        existingSession.id,
        manager,
      );

      if (!lockedExisting) {
        throw new UnauthorizedException('Sesión inválida o expirada');
      }

      if (params.decision === 'KEEP_NEW') {
        await this.userSessionRepository.update(
          lockedExisting.id,
          {
            sessionStatusId: revokedStatusId,
            isActive: false,
          },
          manager,
        );

        await this.userSessionRepository.update(
          newSession.id,
          {
            sessionStatusId: activeStatusId,
            isActive: true,
          },
          manager,
        );

        await this.securityEventService.logEvent(
          params.userId,
          'CONCURRENT_SESSION_RESOLVED',
          {
            ipAddress: params.ipAddress,
            userAgent: params.userAgent,
            decision: 'KEEP_NEW',
            newSessionId: newSession.id,
            existingSessionId: lockedExisting.id,
          },
          manager,
        );

        return { keptSessionId: newSession.id };
      }

      await this.userSessionRepository.update(
        newSession.id,
        {
          sessionStatusId: revokedStatusId,
          isActive: false,
        },
        manager,
      );

      await this.securityEventService.logEvent(
        params.userId,
        'CONCURRENT_SESSION_RESOLVED',
        {
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
          decision: 'KEEP_EXISTING',
          newSessionId: newSession.id,
          existingSessionId: lockedExisting.id,
        },
        manager,
      );

      return { keptSessionId: null };
    };

    if (params.externalManager) {
      return await runInTransaction(params.externalManager);
    }

    return await this.dataSource.transaction(runInTransaction);
  }

  async activateBlockedSession(sessionId: string, manager?: EntityManager): Promise<void> {
    const activeStatusId = await this.sessionStatusService.getIdByCode(
      'ACTIVE',
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
