import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationType } from '@modules/notifications/domain/notification-type.entity';
import { NOTIFICATION_CACHE_KEYS } from '@modules/notifications/domain/notification.constants';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import { technicalSettings } from '@config/technical-settings';

@Injectable()
export class NotificationTypeRepository {
  private static readonly CACHE_TTL_SECONDS =
    technicalSettings.cache.notifications.notificationTypeCacheTtlSeconds;

  private readonly logger = new Logger(NotificationTypeRepository.name);

  constructor(
    @InjectRepository(NotificationType)
    private readonly repository: Repository<NotificationType>,
    private readonly cacheService: RedisCacheService,
  ) {}

  async findByCode(code: string): Promise<NotificationType | null> {
    const cacheKey = NOTIFICATION_CACHE_KEYS.TYPE_BY_CODE(code);
    const cached = await this.cacheService.get<{
      id: string;
      code: string;
      name: string;
    }>(cacheKey);

    if (cached) {
      return this.repository.create(cached);
    }

    const notificationType = await this.repository.findOne({ where: { code } });

    if (!notificationType) {
      this.logger.warn({
        context: NotificationTypeRepository.name,
        message: `notification_type con código '${code}' no encontrado en la base de datos`,
        code,
      });
      return null;
    }

    await this.cacheService.set(
      cacheKey,
      {
        id: notificationType.id,
        code: notificationType.code,
        name: notificationType.name,
      },
      NotificationTypeRepository.CACHE_TTL_SECONDS,
    );

    return notificationType;
  }
}
