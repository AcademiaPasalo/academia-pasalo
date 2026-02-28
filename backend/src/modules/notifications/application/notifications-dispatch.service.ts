import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUES } from '@infrastructure/queue/queue.constants';
import { technicalSettings } from '@config/technical-settings';
import { SettingsService } from '@modules/settings/application/settings.service';
import {
  NOTIFICATION_JOB_NAMES,
  NOTIFICATION_SYSTEM_SETTING_KEYS,
  NOTIFICATION_TYPE_CODES,
} from '@modules/notifications/domain/notification.constants';

@Injectable()
export class NotificationsDispatchService {
  private readonly logger = new Logger(NotificationsDispatchService.name);

  constructor(
    @InjectQueue(QUEUES.NOTIFICATIONS)
    private readonly notificationsQueue: Queue,
    private readonly settingsService: SettingsService,
  ) {}

  async dispatchNewMaterial(
    materialId: string,
    folderId: string,
  ): Promise<void> {
    try {
      await this.notificationsQueue.add(NOTIFICATION_JOB_NAMES.DISPATCH, {
        type: NOTIFICATION_TYPE_CODES.NEW_MATERIAL,
        materialId,
        folderId,
      });
    } catch (error) {
      this.logger.warn({
        context: NotificationsDispatchService.name,
        message: 'No se pudo encolar la notificación NEW_MATERIAL',
        materialId,
        folderId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async dispatchClassScheduled(classEventId: string): Promise<void> {
    try {
      await this.notificationsQueue.add(NOTIFICATION_JOB_NAMES.DISPATCH, {
        type: NOTIFICATION_TYPE_CODES.CLASS_SCHEDULED,
        classEventId,
      });
    } catch (error) {
      this.logger.warn({
        context: NotificationsDispatchService.name,
        message: 'No se pudo encolar la notificación CLASS_SCHEDULED',
        classEventId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async dispatchClassUpdated(classEventId: string): Promise<void> {
    try {
      await this.notificationsQueue.add(NOTIFICATION_JOB_NAMES.DISPATCH, {
        type: NOTIFICATION_TYPE_CODES.CLASS_UPDATED,
        classEventId,
      });
    } catch (error) {
      this.logger.warn({
        context: NotificationsDispatchService.name,
        message: 'No se pudo encolar la notificación CLASS_UPDATED',
        classEventId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async dispatchClassCancelled(classEventId: string): Promise<void> {
    try {
      await this.notificationsQueue.add(NOTIFICATION_JOB_NAMES.DISPATCH, {
        type: NOTIFICATION_TYPE_CODES.CLASS_CANCELLED,
        classEventId,
      });
    } catch (error) {
      this.logger.warn({
        context: NotificationsDispatchService.name,
        message: 'No se pudo encolar la notificación CLASS_CANCELLED',
        classEventId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async scheduleClassReminder(
    classEventId: string,
    startDatetime: Date,
  ): Promise<void> {
    try {
      let reminderMinutes: number;
      try {
        const raw = await this.settingsService.getString(
          NOTIFICATION_SYSTEM_SETTING_KEYS.REMINDER_MINUTES,
        );
        const parsed = parseInt(raw, 10);
        reminderMinutes = Number.isFinite(parsed)
          ? parsed
          : technicalSettings.notifications.reminderDefaultMinutes;
      } catch {
        reminderMinutes =
          technicalSettings.notifications.reminderDefaultMinutes;
        this.logger.warn({
          context: NotificationsDispatchService.name,
          message:
            'No se encontró NOTIFICATION_REMINDER_MINUTES en system_setting al encolar reminder, usando valor por defecto',
          defaultValue: reminderMinutes,
        });
      }

      const minMinutes = technicalSettings.notifications.reminderMinMinutes;
      const maxMinutes = technicalSettings.notifications.reminderMaxMinutes;

      if (reminderMinutes < minMinutes || reminderMinutes > maxMinutes) {
        this.logger.error({
          context: NotificationsDispatchService.name,
          message:
            'Recordatorio omitido: NOTIFICATION_REMINDER_MINUTES está fuera del rango permitido',
          reminderMinutes,
          minMinutes,
          maxMinutes,
          classEventId,
        });
        return;
      }

      const delayMs =
        startDatetime.getTime() - reminderMinutes * 60 * 1000 - Date.now();

      if (delayMs < technicalSettings.notifications.reminderMinEnqueueMs) {
        this.logger.log({
          context: NotificationsDispatchService.name,
          message:
            'Recordatorio de clase omitido: el delay calculado está por debajo del umbral mínimo',
          classEventId,
          delayMs,
          thresholdMs: technicalSettings.notifications.reminderMinEnqueueMs,
        });
        return;
      }

      const jobId = `class-reminder-${classEventId}`;
      const existingJob = await this.notificationsQueue.getJob(jobId);
      if (existingJob) {
        await existingJob.remove();
      }

      await this.notificationsQueue.add(
        NOTIFICATION_JOB_NAMES.CLASS_REMINDER,
        { classEventId, reminderMinutes },
        { jobId, delay: delayMs },
      );
    } catch (error) {
      this.logger.warn({
        context: NotificationsDispatchService.name,
        message: 'No se pudo encolar el recordatorio de clase',
        classEventId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async cancelClassReminder(classEventId: string): Promise<void> {
    try {
      const jobId = `class-reminder-${classEventId}`;
      const existingJob = await this.notificationsQueue.getJob(jobId);
      if (existingJob) {
        await existingJob.remove();
      }
    } catch (error) {
      this.logger.warn({
        context: NotificationsDispatchService.name,
        message: 'No se pudo cancelar el recordatorio de clase',
        classEventId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
