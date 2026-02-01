import { Injectable } from '@nestjs/common';
import { SettingsService } from '@modules/settings/application/settings.service';
import { technicalSettings } from '@config/technical-settings';

export type SystemSettingKey =
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
    return technicalSettings.auth.tokens.refreshTokenTtlDays;
  }

  async getAccessTokenTtlMinutes(): Promise<number> {
    return technicalSettings.auth.tokens.accessTokenTtlMinutes;
  }

  async getSessionExpirationWarningMinutes(): Promise<number> {
    return technicalSettings.auth.tokens.sessionExpirationWarningMinutes;
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

  async invalidateCache(key: SystemSettingKey): Promise<void> {
    await this.settingsService.invalidateCache(key);
  }

  async invalidateAllCache(): Promise<void> {
    await this.settingsService.invalidateAllCache();
  }
}