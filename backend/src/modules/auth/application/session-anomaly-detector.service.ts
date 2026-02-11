import { Injectable } from '@nestjs/common';
import type { EntityManager } from 'typeorm';
import { GeolocationService } from '@modules/auth/application/geolocation.service';
import { AuthSettingsService } from '@modules/auth/application/auth-settings.service';
import { GeoProvider } from '@common/interfaces/geo-provider.interface';
import { UserSessionRepository } from '@modules/auth/infrastructure/user-session.repository';
import { RequestMetadata } from '@modules/auth/interfaces/request-metadata.interface';
import {
  AnomalyType,
  ANOMALY_TYPES,
} from '@modules/auth/interfaces/security.constants';

@Injectable()
export class SessionAnomalyDetectorService {
  constructor(
    private readonly geolocationService: GeolocationService,
    private readonly authSettingsService: AuthSettingsService,
    private readonly geoProvider: GeoProvider,
    private readonly userSessionRepository: UserSessionRepository,
  ) {}

  async detectLocationAnomaly(
    userId: string,
    metadata: RequestMetadata,
    locationSource: 'ip' | 'gps' | 'none',
    isNewDevice: boolean,
    manager?: EntityManager,
  ): Promise<{
    isAnomalous: boolean;
    anomalyType: AnomalyType;
    previousSessionId: string | null;
    distanceKm: number | null;
    timeDifferenceMinutes: number | null;
  }> {
    const lastSession =
      await this.userSessionRepository.findLatestSessionByUserId(
        userId,
        manager,
      );

    if (!lastSession) {
      return {
        isAnomalous: false,
        anomalyType: ANOMALY_TYPES.NONE,
        previousSessionId: null,
        distanceKm: null,
        timeDifferenceMinutes: null,
      };
    }

    const timeDifferenceMs =
      new Date().getTime() - lastSession.lastActivityAt.getTime();
    const timeDifferenceMinutes = timeDifferenceMs / (1000 * 60);

    const timeWindowMinutes =
      locationSource === 'gps'
        ? await this.authSettingsService.getGeoGpsTimeWindowMinutes()
        : await this.authSettingsService.getGeoIpTimeWindowMinutes();

    if (isNewDevice && timeDifferenceMinutes < timeWindowMinutes) {
      return {
        isAnomalous: true,
        anomalyType: ANOMALY_TYPES.NEW_DEVICE_QUICK_CHANGE,
        previousSessionId: lastSession.id,
        distanceKm: null,
        timeDifferenceMinutes,
      };
    }

    if (
      locationSource === 'none' ||
      !metadata.latitude ||
      !metadata.longitude ||
      !lastSession.latitude ||
      !lastSession.longitude
    ) {
      return {
        isAnomalous: false,
        anomalyType: ANOMALY_TYPES.NONE,
        previousSessionId: lastSession.id,
        distanceKm: null,
        timeDifferenceMinutes,
      };
    }

    const distanceKm = this.geolocationService.calculateDistance(
      Number(lastSession.latitude),
      Number(lastSession.longitude),
      Number(metadata.latitude),
      Number(metadata.longitude),
    );

    const distanceThresholdKm =
      locationSource === 'gps'
        ? await this.authSettingsService.getGeoGpsDistanceKm()
        : await this.authSettingsService.getGeoIpDistanceKm();

    const isAnomalous =
      timeDifferenceMinutes <= timeWindowMinutes &&
      distanceKm >= distanceThresholdKm;

    return {
      isAnomalous,
      anomalyType: isAnomalous
        ? ANOMALY_TYPES.IMPOSSIBLE_TRAVEL
        : ANOMALY_TYPES.NONE,
      previousSessionId: lastSession.id,
      distanceKm,
      timeDifferenceMinutes,
    };
  }

  async resolveCoordinates(metadata: RequestMetadata): Promise<{
    metadata: RequestMetadata;
    locationSource: 'ip' | 'gps' | 'none';
  }> {
    const hasLatitude = typeof metadata.latitude === 'number';
    const hasLongitude = typeof metadata.longitude === 'number';

    if (hasLatitude && hasLongitude) {
      return { metadata, locationSource: 'gps' };
    }

    const geo = this.geoProvider.resolve(metadata.ipAddress);

    if (!geo) {
      return { metadata, locationSource: 'none' };
    }

    return {
      metadata: {
        ...metadata,
        latitude: geo.latitude,
        longitude: geo.longitude,
        city: geo.city || undefined,
        country: geo.country || undefined,
      },
      locationSource: 'ip',
    };
  }
}
