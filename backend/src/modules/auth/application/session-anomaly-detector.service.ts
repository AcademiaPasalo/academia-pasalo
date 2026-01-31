import { Injectable } from '@nestjs/common';
import type { EntityManager } from 'typeorm';
import { GeolocationService } from '@modules/auth/application/geolocation.service';
import { AuthSettingsService } from '@modules/auth/application/auth-settings.service';
import { GeoProvider } from '@common/interfaces/geo-provider.interface';
import { UserSessionRepository } from '@modules/auth/infrastructure/user-session.repository';
import { RequestMetadata } from '@modules/auth/interfaces/request-metadata.interface';

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
    manager?: EntityManager,
  ): Promise<{
    isAnomalous: boolean;
    previousSessionId: string | null;
    distanceKm: number | null;
    timeDifferenceMinutes: number | null;
  }> {
    if (locationSource === 'none') {
      return {
        isAnomalous: false,
        previousSessionId: null,
        distanceKm: null,
        timeDifferenceMinutes: null,
      };
    }

    if (!metadata.latitude || !metadata.longitude) {
      return {
        isAnomalous: false,
        previousSessionId: null,
        distanceKm: null,
        timeDifferenceMinutes: null,
      };
    }

    const lastSession =
      await this.userSessionRepository.findLatestSessionByUserId(userId, manager);

    if (!lastSession || !lastSession.latitude || !lastSession.longitude) {
      return {
        isAnomalous: false,
        previousSessionId: null,
        distanceKm: null,
        timeDifferenceMinutes: null,
      };
    }

    const timeDifferenceMs =
      new Date().getTime() - lastSession.createdAt.getTime();
    const timeDifferenceMinutes = timeDifferenceMs / (1000 * 60);

    const distanceKm = this.geolocationService.calculateDistance(
      lastSession.latitude,
      lastSession.longitude,
      metadata.latitude,
      metadata.longitude,
    );

    const timeWindowMinutes =
      locationSource === 'gps'
        ? await this.authSettingsService.getGeoGpsTimeWindowMinutes()
        : await this.authSettingsService.getGeoIpTimeWindowMinutes();
    const distanceThresholdKm =
      locationSource === 'gps'
        ? await this.authSettingsService.getGeoGpsDistanceKm()
        : await this.authSettingsService.getGeoIpDistanceKm();

    const isAnomalous =
      timeDifferenceMinutes <= timeWindowMinutes &&
      distanceKm >= distanceThresholdKm;

    if (!isAnomalous) {
      return {
        isAnomalous: false,
        previousSessionId: lastSession.id,
        distanceKm,
        timeDifferenceMinutes,
      };
    }

    return {
      isAnomalous: true,
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
