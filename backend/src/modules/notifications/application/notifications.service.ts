import {
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUES } from '@infrastructure/queue/queue.constants';
import { JobScheduler } from '@infrastructure/queue/queue.interfaces';
import { technicalSettings } from '@config/technical-settings';
import { UserNotificationRepository } from '@modules/notifications/infrastructure/user-notification.repository';
import { UserNotification } from '@modules/notifications/domain/user-notification.entity';
import { NOTIFICATION_JOB_NAMES } from '@modules/notifications/domain/notification.constants';

@Injectable()
export class NotificationsService implements OnApplicationBootstrap {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly userNotificationRepository: UserNotificationRepository,
    @InjectQueue(QUEUES.NOTIFICATIONS)
    private readonly notificationsQueue: Queue,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.setupCleanupScheduler();
    this.validateReminderSettings();
  }

  private validateReminderSettings(): void {
    const { reminderDefaultMinutes, reminderMinMinutes, reminderMaxMinutes } =
      technicalSettings.notifications;

    if (
      reminderDefaultMinutes < reminderMinMinutes ||
      reminderDefaultMinutes > reminderMaxMinutes
    ) {
      this.logger.error({
        context: NotificationsService.name,
        message:
          'reminderDefaultMinutes está fuera del rango permitido [min, max]. Revise technical-settings.ts.',
        reminderDefaultMinutes,
        reminderMinMinutes,
        reminderMaxMinutes,
      });
    }
  }

  private async setupCleanupScheduler(): Promise<void> {
    const jobName = NOTIFICATION_JOB_NAMES.CLEANUP;
    const cronPattern = technicalSettings.notifications.cleanupCronPattern;

    const schedulers =
      (await this.notificationsQueue.getJobSchedulers()) as unknown as JobScheduler[];
    const existing = schedulers.find((s) => s.name === jobName);

    if (existing) {
      const currentPattern = existing.cron ?? existing.pattern;

      if (currentPattern !== cronPattern) {
        this.logger.log({
          context: NotificationsService.name,
          message:
            'Detectado cambio en el patrón de horario del cleanup. Actualizando Redis...',
          oldPattern: currentPattern,
          newPattern: cronPattern,
        });

        await this.notificationsQueue.removeJobScheduler(jobName);
        await this.notificationsQueue.add(
          jobName,
          {},
          { repeat: { pattern: cronPattern } },
        );
      } else {
        this.logger.debug({
          context: NotificationsService.name,
          message:
            'Scheduler de cleanup ya registrado con el patrón actual. Sin cambios.',
          pattern: cronPattern,
        });
      }
    } else {
      await this.notificationsQueue.add(
        jobName,
        {},
        { repeat: { pattern: cronPattern } },
      );

      this.logger.log({
        context: NotificationsService.name,
        message: 'Tarea repetitiva de limpieza de notificaciones registrada',
        job: jobName,
        pattern: cronPattern,
      });
    }
  }

  async getMyNotifications(
    userId: string,
    onlyUnread: boolean,
    limit: number,
    offset: number,
  ): Promise<UserNotification[]> {
    return await this.userNotificationRepository.findByUserPaginated(
      userId,
      onlyUnread,
      limit,
      offset,
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.userNotificationRepository.countUnread(userId);
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const userNotification = await this.userNotificationRepository.findOne(
      userId,
      notificationId,
    );

    if (!userNotification) {
      throw new NotFoundException(
        'La notificación no existe o no pertenece al usuario',
      );
    }

    if (userNotification.isRead) {
      return;
    }

    await this.userNotificationRepository.markAsRead(userId, notificationId);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.userNotificationRepository.markAllAsRead(userId);
  }
}
