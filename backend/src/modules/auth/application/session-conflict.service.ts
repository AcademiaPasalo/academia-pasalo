import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { EntityManager } from 'typeorm';
import { UserSessionRepository } from '@modules/auth/infrastructure/user-session.repository';
import { SecurityEventService } from '@modules/auth/application/security-event.service';
import { SessionStatusService } from '@modules/auth/application/session-status.service';
import {
  ConcurrentDecision,
  CONCURRENT_DECISIONS,
  SECURITY_EVENT_CODES,
  SESSION_STATUS_CODES,
} from '@modules/auth/interfaces/security.constants';
import { technicalSettings } from '@config/technical-settings';

@Injectable()
export class SessionConflictService {
  private readonly logger = new Logger(SessionConflictService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly userSessionRepository: UserSessionRepository,
    private readonly securityEventService: SecurityEventService,
    private readonly sessionStatusService: SessionStatusService,
  ) {}

  async resolveConcurrentSession(params: {
    userId: string;
    deviceId: string;
    refreshTokenJti: string;
    decision: ConcurrentDecision;
    ipAddress: string;
    userAgent: string;
    externalManager?: EntityManager;
  }): Promise<{ keptSessionId: string | null }> {
    const runInTransaction = async (manager: EntityManager) => {
      const activeStatusId = await this.sessionStatusService.getIdByCode(
        SESSION_STATUS_CODES.ACTIVE,
        manager,
      );
      const pendingStatusId = await this.sessionStatusService.getIdByCode(
        SESSION_STATUS_CODES.PENDING_CONCURRENT_RESOLUTION,
        manager,
      );
      const revokedStatusId = await this.sessionStatusService.getIdByCode(
        SESSION_STATUS_CODES.REVOKED,
        manager,
      );

      const newSession =
        await this.userSessionRepository.findByRefreshTokenJtiForUpdate(
          params.refreshTokenJti,
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
          SECURITY_EVENT_CODES.CONCURRENT_SESSION_RESOLVED,
          {
            ipAddress: params.ipAddress,
            userAgent: params.userAgent,
            decision: CONCURRENT_DECISIONS.KEEP_NEW,
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

      if (params.decision === CONCURRENT_DECISIONS.KEEP_NEW) {
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
          SECURITY_EVENT_CODES.CONCURRENT_SESSION_RESOLVED,
          {
            ipAddress: params.ipAddress,
            userAgent: params.userAgent,
            decision: CONCURRENT_DECISIONS.KEEP_NEW,
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
        SECURITY_EVENT_CODES.CONCURRENT_SESSION_RESOLVED,
        {
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
          decision: CONCURRENT_DECISIONS.KEEP_EXISTING,
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

  async cleanupExcessPendingSessions(
    userId: string,
    manager: EntityManager,
  ): Promise<void> {
    const pendingStatusId = await this.sessionStatusService.getIdByCode(
      SESSION_STATUS_CODES.PENDING_CONCURRENT_RESOLUTION,
      manager,
    );

    const pendingSessions =
      await this.userSessionRepository.findSessionsByUserAndStatus(
        userId,
        pendingStatusId,
        manager,
      );

    if (
      pendingSessions.length >=
      technicalSettings.auth.security.maxPendingSessionsPerUser
    ) {
      const revokedStatusId = await this.sessionStatusService.getIdByCode(
        SESSION_STATUS_CODES.REVOKED,
        manager,
      );

      const sessionsToRevoke = pendingSessions.slice(
        technicalSettings.auth.security.maxPendingSessionsPerUser - 1,
      );

      for (const session of sessionsToRevoke) {
        await this.userSessionRepository.update(
          session.id,
          {
            sessionStatusId: revokedStatusId,
            isActive: false,
          },
          manager,
        );
      }
    }
  }
}
