import { Injectable } from '@nestjs/common';
import { SettingsService } from '@modules/settings/application/settings.service';
import { technicalSettings } from '@config/technical-settings';

@Injectable()
export class AuthSettingsService {
  constructor(private readonly settingsService: SettingsService) {}

  async getActiveCycleId(): Promise<string> {
    return await this.settingsService.getString('ACTIVE_CYCLE_ID');
  }

  getRefreshTokenTtlDays(): Promise<number> {
    return Promise.resolve(technicalSettings.auth.tokens.refreshTokenTtlDays);
  }

  getAccessTokenTtlMinutes(): Promise<number> {
    return Promise.resolve(technicalSettings.auth.tokens.accessTokenTtlMinutes);
  }

  getSessionExpirationWarningMinutes(): Promise<number> {
    return Promise.resolve(
      technicalSettings.auth.tokens.sessionExpirationWarningMinutes,
    );
  }

  async getGeoGpsTimeWindowMinutes(): Promise<number> {
    return await this.settingsService.getPositiveInt(
      'GEO_GPS_ANOMALY_TIME_WINDOW_MINUTES',
    );
  }

  async getGeoGpsDistanceKm(): Promise<number> {
    return await this.settingsService.getPositiveInt(
      'GEO_GPS_ANOMALY_DISTANCE_KM',
    );
  }

  async getGeoIpTimeWindowMinutes(): Promise<number> {
    return await this.settingsService.getPositiveInt(
      'GEO_IP_ANOMALY_TIME_WINDOW_MINUTES',
    );
  }

  async getGeoIpDistanceKm(): Promise<number> {
    return await this.settingsService.getPositiveInt(
      'GEO_IP_ANOMALY_DISTANCE_KM',
    );
  }

  invalidateCache(key: string) {
    this.settingsService.invalidateCache(key);
  }

  invalidateAllCache() {
    this.settingsService.invalidateAllCache();
  }
}
