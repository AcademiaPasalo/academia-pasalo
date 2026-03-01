import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '@modules/notifications/domain/notification.entity';
import { technicalSettings } from '@config/technical-settings';

import { MysqlDeleteResult } from '@modules/notifications/interfaces';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly repository: Repository<Notification>,
  ) {}

  async create(data: Partial<Notification>): Promise<Notification> {
    const entity = this.repository.create(data);
    return await this.repository.save(entity);
  }

  async deleteOlderThan(
    date: Date,
    batchSize: number = technicalSettings.notifications.cleanupBatchSize,
  ): Promise<number> {
    let totalDeleted = 0;
    let batchDeleted = 0;
    let iterationCount = 0;
    const maxBatches = technicalSettings.notifications.maxCleanupBatchesPerRun;

    do {
      // user_notification hijos se eliminan automáticamente via ON DELETE CASCADE
      // definida en fk_un_notification. Esta operación depende de esa constraint.
      const result: MysqlDeleteResult = await this.repository.query(
        'DELETE FROM notification WHERE created_at < ? LIMIT ?',
        [date, batchSize],
      );
      batchDeleted = result.affectedRows || 0;
      totalDeleted += batchDeleted;
      iterationCount++;
    } while (batchDeleted === batchSize && iterationCount < maxBatches);

    return totalDeleted;
  }
}
