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
  LOCATION_SOURCES,
  LocationSource,
} from '@modules/auth/interfaces/security.constants';
import { technicalSettings } from '@config/technical-settings';

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
    locationSource: LocationSource,
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
      locationSource === LOCATION_SOURCES.GPS
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
      locationSource === LOCATION_SOURCES.NONE ||
      !this.isValidCoordinate(metadata.latitude, metadata.longitude) ||
      !this.isValidCoordinate(lastSession.latitude, lastSession.longitude)
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
      locationSource === LOCATION_SOURCES.GPS
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

  private isValidCoordinate(
    lat: number | string | undefined | null,
    lon: number | string | undefined | null,
  ): boolean {
    if (
      lat === undefined ||
      lat === null ||
      lon === undefined ||
      lon === null
    ) {
      return false;
    }

    const nLat = Number(lat);
    const nLon = Number(lon);

    if (isNaN(nLat) || isNaN(nLon)) {
      return false;
    }

    const { minLat, maxLat, minLon, maxLon } =
      technicalSettings.auth.security.coordinates;

    return nLat >= minLat && nLat <= maxLat && nLon >= minLon && nLon <= maxLon;
  }

  async resolveCoordinates(metadata: RequestMetadata): Promise<{
    metadata: RequestMetadata;
    locationSource: LocationSource;
  }> {
    const hasLatitude = typeof metadata.latitude === 'number';
    const hasLongitude = typeof metadata.longitude === 'number';

    if (hasLatitude && hasLongitude) {
      return { metadata, locationSource: LOCATION_SOURCES.GPS };
    }

    const geo = this.geoProvider.resolve(metadata.ipAddress);

    if (!geo) {
      return { metadata, locationSource: LOCATION_SOURCES.NONE };
    }

    return {
      metadata: {
        ...metadata,
        latitude: geo.latitude,
        longitude: geo.longitude,
        city: geo.city || undefined,
        country: geo.country || undefined,
      },
      locationSource: LOCATION_SOURCES.IP,
    };
  }
}
