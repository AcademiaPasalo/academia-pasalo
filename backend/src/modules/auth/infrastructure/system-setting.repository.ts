import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from '@modules/auth/domain/system-setting.entity';

@Injectable()
export class SystemSettingRepository {
  constructor(
    @InjectRepository(SystemSetting)
    private readonly ormRepository: Repository<SystemSetting>,
  ) {}

  async findByKey(settingKey: string): Promise<SystemSetting | null> {
    return await this.ormRepository.findOne({
      where: { settingKey },
    });
  }
}

