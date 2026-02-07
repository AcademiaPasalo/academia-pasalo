import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemSetting } from '@modules/settings/domain/system-setting.entity';
import { SystemSettingRepository } from '@modules/settings/infrastructure/system-setting.repository';
import { SettingsService } from '@modules/settings/application/settings.service';
import { RedisCacheModule } from '@infrastructure/cache/redis-cache.module';

@Module({
  imports: [TypeOrmModule.forFeature([SystemSetting]), RedisCacheModule],
  providers: [SystemSettingRepository, SettingsService],
  exports: [SystemSettingRepository, SettingsService],
})
export class SettingsModule {}
