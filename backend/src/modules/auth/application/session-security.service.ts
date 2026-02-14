import { Injectable, Logger } from '@nestjs/common';
import type { EntityManager } from 'typeorm';
import { SecurityEventService } from '@modules/auth/application/security-event.service';
import { technicalSettings } from '@config/technical-settings';
import { UserSession } from '@modules/auth/domain/user-session.entity';
import { RequestMetadata } from '@modules/auth/interfaces/request-metadata.interface';
import { AnomalyType } from '@modules/auth/interfaces/security.constants';

@Injectable()
export class SessionSecurityService {
  private readonly logger = new Logger(SessionSecurityService.name);

  constructor(private readonly securityEventService: SecurityEventService) {}

  async logSessionCreationEvents(params: {
    userId: string;
    metadata: RequestMetadata;
    session: UserSession;
    locationSource: 'ip' | 'gps' | 'none';
    isNewDevice: boolean;
    anomaly: {
      isAnomalous: boolean;
      anomalyType: AnomalyType;
      previousSessionId: string | null;
      distanceKm: number | null;
      timeDifferenceMinutes: number | null;
    };
    isConcurrent: boolean;
    existingSession?: UserSession | null;
    manager: EntityManager;
  }): Promise<void> {
    const {
      userId,
      metadata,
      session,
      anomaly,
      isConcurrent,
      existingSession,
      manager,
    } = params;

    if (isConcurrent && existingSession) {
      await this.securityEventService.logEvent(
        userId,
        'CONCURRENT_SESSION_DETECTED',
        {
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent,
          deviceId: metadata.deviceId,
          locationSource: params.locationSource,
          city: metadata.city,
          country: metadata.country,
          newSessionId: session.id,
          existingSessionId: existingSession.id,
          existingDeviceId: existingSession.deviceId,
        },
        manager,
      );
    }

    if (anomaly.isAnomalous) {
      await this.securityEventService.logEvent(
        userId,
        'ANOMALOUS_LOGIN_DETECTED',
        {
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent,
          deviceId: metadata.deviceId,
          locationSource: params.locationSource,
          city: metadata.city,
          country: metadata.country,
          anomalyType: anomaly.anomalyType,
          previousSessionId: anomaly.previousSessionId,
          distanceKm: anomaly.distanceKm,
          timeDifferenceMinutes: anomaly.timeDifferenceMinutes,
          newSessionId: session.id,
        },
        manager,
      );

      await this.handleAnomalousStrikes(userId, manager);
    }

    if (!isConcurrent && !anomaly.isAnomalous) {
      if (params.isNewDevice) {
        await this.securityEventService.logEvent(
          userId,
          'NEW_DEVICE_DETECTED',
          {
            ipAddress: metadata.ipAddress,
            userAgent: metadata.userAgent,
            deviceId: metadata.deviceId,
            locationSource: params.locationSource,
            city: metadata.city,
            country: metadata.country,
            sessionId: session.id,
          },
          manager,
        );
      }

      await this.securityEventService.logEvent(
        userId,
        'LOGIN_SUCCESS',
        {
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent,
          deviceId: metadata.deviceId,
          sessionId: session.id,
        },
        manager,
      );
    }
  }

  private async handleAnomalousStrikes(
    userId: string,
    manager: EntityManager,
  ): Promise<void> {
    const strikeCount = await this.securityEventService.countEventsByCode(
      userId,
      'ANOMALOUS_LOGIN_DETECTED',
      manager,
    );

    if (
      strikeCount === technicalSettings.auth.security.anomalyStrikeThreshold
    ) {
      this.logger.log({
        level: 'info',
        context: SessionSecurityService.name,
        message:
          'Umbral de strikes alcanzado para el usuario. Preparando notificación.',
        userId,
        strikes: strikeCount,
      });

      /**
       * TODO: Implementar integración con NotificationModule cuando esté disponible.
       */
    }
  }
}
