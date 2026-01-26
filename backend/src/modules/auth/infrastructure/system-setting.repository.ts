import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from '@modules/auth/domain/system-setting.entity';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';

@Injectable()
export class SystemSettingRepository {
  constructor(
    @InjectRepository(SystemSetting)
    private readonly ormRepository: Repository<SystemSetting>,
    private readonly cacheService: RedisCacheService,
  ) {}

  async findByKey(settingKey: string): Promise<SystemSetting | null> {
    const cacheKey = `cache:setting:${settingKey}`;
    const cachedSetting = await this.cacheService.get<SystemSetting>(cacheKey);

    if (cachedSetting) {
      return cachedSetting;
    }

    const setting = await this.ormRepository.findOne({
      where: { settingKey },
    });

    if (setting) {
      await this.cacheService.set(cacheKey, setting, 3600);
    }

    return setting;
  }
}

