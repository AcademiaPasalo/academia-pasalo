import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserNotification } from '@modules/notifications/domain/user-notification.entity';
import { NOTIFICATION_CACHE_KEYS } from '@modules/notifications/domain/notification.constants';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import { technicalSettings } from '@config/technical-settings';

@Injectable()
export class UserNotificationRepository {
  private static readonly CACHE_TTL_SECONDS =
    technicalSettings.cache.notifications.unreadCountCacheTtlSeconds;

  constructor(
    @InjectRepository(UserNotification)
    private readonly repository: Repository<UserNotification>,
    private readonly cacheService: RedisCacheService,
  ) {}

  async bulkCreate(
    rows: Array<{ userId: string; notificationId: string }>,
  ): Promise<void> {
    if (rows.length === 0) {
      return;
    }

    await this.repository.insert(
      rows.map((row) => ({
        userId: row.userId,
        notificationId: row.notificationId,
        isRead: false,
        readAt: null as Date | null,
      })),
    );
  }

  async findByUserPaginated(
    userId: string,
    onlyUnread: boolean,
    limit: number,
    offset: number,
  ): Promise<UserNotification[]> {
    const query = this.repository
      .createQueryBuilder('un')
      .innerJoinAndSelect('un.notification', 'n')
      .innerJoinAndSelect('n.notificationType', 'nt')
      .where('un.userId = :userId', { userId });

    if (onlyUnread) {
      query.andWhere('un.isRead = :isRead', { isRead: false });
    }

    return await query
      .orderBy('n.createdAt', 'DESC')
      .limit(limit)
      .offset(offset)
      .getMany();
  }

  async countUnread(userId: string): Promise<number> {
    const cacheKey = NOTIFICATION_CACHE_KEYS.UNREAD_COUNT(userId);
    const cached = await this.cacheService.get<number>(cacheKey);

    if (cached !== null && cached !== undefined) {
      return cached;
    }

    const count = await this.repository.count({
      where: { userId, isRead: false },
    });

    await this.cacheService.set(
      cacheKey,
      count,
      UserNotificationRepository.CACHE_TTL_SECONDS,
    );

    return count;
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    await this.repository.update(
      { userId, notificationId, isRead: false },
      { isRead: true, readAt: new Date() },
    );

    const cacheKey = NOTIFICATION_CACHE_KEYS.UNREAD_COUNT(userId);
    await this.cacheService.del(cacheKey);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.repository.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );

    const cacheKey = NOTIFICATION_CACHE_KEYS.UNREAD_COUNT(userId);
    await this.cacheService.del(cacheKey);
  }

  async findOne(
    userId: string,
    notificationId: string,
  ): Promise<UserNotification | null> {
    return await this.repository.findOne({ where: { userId, notificationId } });
  }
}
