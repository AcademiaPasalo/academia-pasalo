import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from '@modules/auth/domain/system-setting.entity';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import { technicalSettings } from '@config/technical-settings';

@Injectable()
export class SystemSettingRepository {
  private static readonly CACHE_PREFIX = 'cache:setting:';
  private static readonly CACHE_TTL_SECONDS =
    technicalSettings.cache.settings.systemSettingCacheTtlSeconds;

  constructor(
    @InjectRepository(SystemSetting)
    private readonly ormRepository: Repository<SystemSetting>,
    private readonly cacheService: RedisCacheService,
  ) {}

  async findByKey(settingKey: string): Promise<SystemSetting | null> {
    const cacheKey = `${SystemSettingRepository.CACHE_PREFIX}${settingKey}`;
    const cachedSetting = await this.cacheService.get<SystemSetting>(cacheKey);

    if (cachedSetting) {
      return cachedSetting;
    }

    const setting = await this.ormRepository.findOne({
      where: { settingKey },
    });

    if (setting) {
      await this.cacheService.set(
        cacheKey,
        setting,
        SystemSettingRepository.CACHE_TTL_SECONDS,
      );
    }

    return setting;
  }

  async updateByKey(
    settingKey: string,
    settingValue: string,
  ): Promise<SystemSetting | null> {
    const setting = await this.ormRepository.findOne({
      where: { settingKey },
    });

    if (!setting) {
      return null;
    }

    setting.settingValue = settingValue;
    setting.updatedAt = new Date();

    const updated = await this.ormRepository.save(setting);

    const cacheKey = `${SystemSettingRepository.CACHE_PREFIX}${settingKey}`;
    await this.cacheService.del(cacheKey);

    return updated;
  }

  async invalidateAllCache(): Promise<void> {
    await this.cacheService.invalidateGroup(
      `${SystemSettingRepository.CACHE_PREFIX}*`,
    );
  }
}
