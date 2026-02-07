import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { SystemSettingRepository } from '@modules/settings/infrastructure/system-setting.repository';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);
  private readonly memoryCache: Map<string, string>;

  constructor(
    private readonly systemSettingRepository: SystemSettingRepository,
  ) {
    this.memoryCache = new Map<string, string>();
  }

  async getString(key: string): Promise<string> {
    const cachedValue = this.memoryCache.get(key);
    if (cachedValue !== undefined) {
      return cachedValue;
    }

    const row = await this.systemSettingRepository.findByKey(key);
    if (!row) {
      this.logger.error({
        message: 'Configuración del sistema no encontrada',
        key,
        timestamp: new Date().toISOString(),
      });
      throw new InternalServerErrorException(
        'Configuración del sistema incompleta',
      );
    }

    this.memoryCache.set(key, row.settingValue);
    return row.settingValue;
  }

  async getPositiveInt(key: string): Promise<number> {
    const rawValue = await this.getString(key);
    const value = Number.parseInt(rawValue, 10);

    if (!Number.isFinite(value) || value <= 0) {
      this.logger.error({
        message: 'Valor de configuración inválido',
        key,
        value: rawValue,
        timestamp: new Date().toISOString(),
      });
      throw new InternalServerErrorException(
        'Configuración del sistema inválida',
      );
    }

    return value;
  }

  async invalidateCache(key: string): Promise<void> {
    this.memoryCache.delete(key);
    await this.systemSettingRepository.invalidateKey(key);
  }

  async invalidateAllCache(): Promise<void> {
    this.memoryCache.clear();
    await this.systemSettingRepository.invalidateAllCache();
  }
}
