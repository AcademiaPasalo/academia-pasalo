import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { SystemSettingRepository } from '@modules/auth/infrastructure/system-setting.repository';

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
  private readonly logger = new Logger(AuthSettingsService.name);

  constructor(
    private readonly systemSettingRepository: SystemSettingRepository,
  ) {}

  async getActiveCycleId(): Promise<string> {
    return await this.getSetting('ACTIVE_CYCLE_ID');
  }

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

  private async getSetting(key: SystemSettingKey): Promise<string> {
    const row = await this.systemSettingRepository.findByKey(key);
    if (!row) {
      this.logger.error({
        message: 'Configuración del sistema no encontrada',
        key,
        timestamp: new Date().toISOString(),
      });
      throw new InternalServerErrorException('Configuración del sistema incompleta');
    }

    return row.settingValue;
  }

  private async getPositiveInt(key: SystemSettingKey): Promise<number> {
    const rawValue = await this.getSetting(key);
    const value = Number.parseInt(rawValue, 10);

    if (!Number.isFinite(value) || value <= 0) {
      this.logger.error({
        message: 'Configuración del sistema con valor inválido',
        key,
        value: rawValue,
        timestamp: new Date().toISOString(),
      });
      throw new InternalServerErrorException('Configuración del sistema inválida');
    }

    return value;
  }
}