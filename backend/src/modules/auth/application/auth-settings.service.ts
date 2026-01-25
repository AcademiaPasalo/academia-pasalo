import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SystemSettingRepository } from '@modules/auth/infrastructure/system-setting.repository';

export type SystemSettingKey =
  | 'REFRESH_TOKEN_TTL_DAYS'
  | 'ACCESS_TOKEN_TTL_MINUTES'
  | 'SESSION_EXPIRATION_WARNING_MINUTES'
  | 'GEO_IP_ANOMALY_TIME_WINDOW_MINUTES'
  | 'GEO_IP_ANOMALY_DISTANCE_KM'
  | 'GEO_GPS_ANOMALY_TIME_WINDOW_MINUTES'
  | 'GEO_GPS_ANOMALY_DISTANCE_KM';

@Injectable()
export class AuthSettingsService {
  private readonly cache = new Map<SystemSettingKey, number>();

  constructor(private readonly systemSettingRepository: SystemSettingRepository) {}

  async getRefreshTokenTtlDays(): Promise<number> {
    return await this.getPositiveInt('REFRESH_TOKEN_TTL_DAYS');
  }

  async getAccessTokenTtlMinutes(): Promise<number> {
    return await this.getPositiveInt('ACCESS_TOKEN_TTL_MINUTES');
  }

  async getSessionExpirationWarningMinutes(): Promise<number> {
    return await this.getPositiveInt('SESSION_EXPIRATION_WARNING_MINUTES');
  }

  async getGeoGpsTimeWindowMinutes(): Promise<number> {
    return await this.getPositiveInt('GEO_GPS_ANOMALY_TIME_WINDOW_MINUTES');
  }

  async getGeoGpsDistanceKm(): Promise<number> {
    return await this.getPositiveInt('GEO_GPS_ANOMALY_DISTANCE_KM');
  }

  async getGeoIpTimeWindowMinutes(): Promise<number> {
    return await this.getPositiveInt('GEO_IP_ANOMALY_TIME_WINDOW_MINUTES');
  }

  async getGeoIpDistanceKm(): Promise<number> {
    return await this.getPositiveInt('GEO_IP_ANOMALY_DISTANCE_KM');
  }

  private async getPositiveInt(key: SystemSettingKey): Promise<number> {
    const cached = this.cache.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const row = await this.systemSettingRepository.findByKey(key);
    if (!row) {
      throw new InternalServerErrorException(
        'Configuración del sistema incompleta',
      );
    }

    const value = Number.parseInt(row.settingValue, 10);
    if (!Number.isFinite(value) || value <= 0) {
      throw new InternalServerErrorException(
        'Configuración del sistema inválida',
      );
    }

    this.cache.set(key, value);
    return value;
  }
}

