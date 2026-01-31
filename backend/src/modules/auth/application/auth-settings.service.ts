import { Injectable } from '@nestjs/common';
import { SettingsService } from '@modules/settings/application/settings.service';

export type SystemSettingKey =
  | 'REFRESH_TOKEN_TTL_DAYS'
  | 'ACCESS_TOKEN_TTL_MINUTES'
  | 'SESSION_EXPIRATION_WARNING_MINUTES'
  | 'GEO_IP_ANOMALY_TIME_WINDOW_MINUTES'
  | 'GEO_IP_ANOMALY_DISTANCE_KM'
  | 'GEO_GPS_ANOMALY_TIME_WINDOW_MINUTES'
  | 'GEO_GPS_ANOMALY_DISTANCE_KM'
  | 'ACTIVE_CYCLE_ID';

@Injectable()
export class AuthSettingsService {
  constructor(
    private readonly settingsService: SettingsService,
  ) {}

  async getActiveCycleId(): Promise<string> {
    return await this.settingsService.getString('ACTIVE_CYCLE_ID');
  }

  async getRefreshTokenTtlDays(): Promise<number> {
    return await this.settingsService.getPositiveInt('REFRESH_TOKEN_TTL_DAYS');
  }

  async getAccessTokenTtlMinutes(): Promise<number> {
    return await this.settingsService.getPositiveInt('ACCESS_TOKEN_TTL_MINUTES');
  }

  async getSessionExpirationWarningMinutes(): Promise<number> {
    return await this.settingsService.getPositiveInt('SESSION_EXPIRATION_WARNING_MINUTES');
  }

  async getGeoGpsTimeWindowMinutes(): Promise<number> {
    return await this.settingsService.getPositiveInt('GEO_GPS_ANOMALY_TIME_WINDOW_MINUTES');
  }

  async getGeoGpsDistanceKm(): Promise<number> {
    return await this.settingsService.getPositiveInt('GEO_GPS_ANOMALY_DISTANCE_KM');
  }

  async getGeoIpTimeWindowMinutes(): Promise<number> {
    return await this.settingsService.getPositiveInt('GEO_IP_ANOMALY_TIME_WINDOW_MINUTES');
  }

  async getGeoIpDistanceKm(): Promise<number> {
    return await this.settingsService.getPositiveInt('GEO_IP_ANOMALY_DISTANCE_KM');
  }

  invalidateCache(key: SystemSettingKey): void {
    this.settingsService.invalidateCache(key);
  }

  invalidateAllCache(): void {
    this.settingsService.invalidateAllCache();
  }
}