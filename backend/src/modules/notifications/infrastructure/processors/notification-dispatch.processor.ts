import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Job, UnrecoverableError } from 'bullmq';
import { QUEUES } from '@infrastructure/queue/queue.constants';
import { technicalSettings } from '@config/technical-settings';
import { SettingsService } from '@modules/settings/application/settings.service';
import { NotificationRepository } from '@modules/notifications/infrastructure/notification.repository';
import { NotificationTypeRepository } from '@modules/notifications/infrastructure/notification-type.repository';
import { UserNotificationRepository } from '@modules/notifications/infrastructure/user-notification.repository';
import { NotificationRecipientsService } from '@modules/notifications/application/notification-recipients.service';
import { Notification } from '@modules/notifications/domain/notification.entity';
import { UserNotification } from '@modules/notifications/domain/user-notification.entity';
import {
  NOTIFICATION_JOB_NAMES,
  NOTIFICATION_MESSAGES,
  NOTIFICATION_SYSTEM_SETTING_KEYS,
  NOTIFICATION_TYPE_CODES,
  NOTIFICATION_ENTITY_TYPES,
  NotificationTypeCode,
} from '@modules/notifications/domain/notification.constants';

import {
  DispatchPayload,
  DispatchClassPayload,
  DispatchMaterialPayload,
  ClassReminderPayload,
} from '@modules/notifications/interfaces';

@Processor(QUEUES.NOTIFICATIONS, {
  lockDuration: technicalSettings.notifications.workerLockDurationMs,
})
export class NotificationDispatchProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationDispatchProcessor.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly notificationRepository: NotificationRepository,
    private readonly notificationTypeRepository: NotificationTypeRepository,
    private readonly userNotificationRepository: UserNotificationRepository,
    private readonly recipientsService: NotificationRecipientsService,
    private readonly settingsService: SettingsService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case NOTIFICATION_JOB_NAMES.DISPATCH:
        await this.handleDispatch(job as Job<DispatchPayload>);
        break;

      case NOTIFICATION_JOB_NAMES.CLASS_REMINDER:
        await this.handleClassReminder(job as Job<ClassReminderPayload>);
        break;

      case NOTIFICATION_JOB_NAMES.CLEANUP:
        await this.handleCleanup(job.name);
        break;

      default:
        this.logger.warn({
          context: NotificationDispatchProcessor.name,
          message: 'Job recibido con nombre desconocido, ignorado',
          jobName: job.name,
          jobId: job.id,
        });
    }
  }

  private async handleDispatch(job: Job<DispatchPayload>): Promise<void> {
    const { type } = job.data;

    this.logger.log({
      context: NotificationDispatchProcessor.name,
      message: 'Procesando job de dispatch de notificación',
      jobId: job.id,
      type,
    });

    if (type === NOTIFICATION_TYPE_CODES.NEW_MATERIAL) {
      await this.handleNewMaterial(job.data);
      return;
    }

    if (
      type === NOTIFICATION_TYPE_CODES.CLASS_SCHEDULED ||
      type === NOTIFICATION_TYPE_CODES.CLASS_UPDATED ||
      type === NOTIFICATION_TYPE_CODES.CLASS_CANCELLED
    ) {
      await this.handleClassEvent(job.data);
      return;
    }

    const msg = `Error de integridad: tipo de notificación desconocido '${String(
      type,
    )}' recibido en el job de dispatch`;
    this.logger.error({
      context: NotificationDispatchProcessor.name,
      message: msg,
      jobId: job.id,
      type,
    });
    throw new UnrecoverableError(msg);
  }

  private async handleNewMaterial(
    payload: DispatchMaterialPayload,
  ): Promise<void> {
    const { materialId, folderId } = payload;

    const context = await this.recipientsService.resolveMaterialContext(
      materialId,
      folderId,
    );

    if (context.recipientUserIds.length === 0) {
      this.logger.log({
        context: NotificationDispatchProcessor.name,
        message:
          'NEW_MATERIAL: sin destinatarios para este material, job completado sin insertar notificación',
        materialId,
        folderId,
      });
      return;
    }

    const notificationType = await this.resolveNotificationTypeOrFail(
      NOTIFICATION_TYPE_CODES.NEW_MATERIAL,
    );

    const template =
      NOTIFICATION_MESSAGES[NOTIFICATION_TYPE_CODES.NEW_MATERIAL];
    const title = template.title;
    const message = template.message(
      context.materialDisplayName,
      context.courseName,
    );

    const notificationData: Partial<Notification> = {
      notificationTypeId: notificationType.id,
      title,
      message,
      entityType: NOTIFICATION_ENTITY_TYPES.MATERIAL_FOLDER,
      entityId: context.folderId,
      createdAt: new Date(),
    };

    const notificationId = await this.dataSource.transaction(
      async (manager) => {
        const entity = manager.create(Notification, notificationData);
        const saved = await manager.save(entity);

        await manager.insert(
          UserNotification,
          context.recipientUserIds.map((userId) => ({
            userId,
            notificationId: saved.id,
            isRead: false,
            readAt: null as Date | null,
          })),
        );

        return saved.id;
      },
    );

    this.logger.log({
      context: NotificationDispatchProcessor.name,
      message: 'NEW_MATERIAL: notificación creada y distribuida',
      notificationId,
      materialId,
      folderId,
      recipientCount: context.recipientUserIds.length,
    });
  }

  private async handleClassEvent(payload: DispatchClassPayload): Promise<void> {
    const { type, classEventId } = payload;

    const context =
      await this.recipientsService.resolveClassEventContext(classEventId);

    if (context.recipientUserIds.length === 0) {
      this.logger.log({
        context: NotificationDispatchProcessor.name,
        message:
          'Notificación de clase: sin destinatarios, job completado sin insertar notificación',
        classEventId,
        type,
      });
      return;
    }

    const notificationType = await this.resolveNotificationTypeOrFail(type);

    const fechaFormateada = this.formatDatetime(context.startDatetime);
    const template = NOTIFICATION_MESSAGES[type];
    const message = template.message(context.classTitle, fechaFormateada);

    const notificationData: Partial<Notification> = {
      notificationTypeId: notificationType.id,
      title: template.title,
      message,
      entityType: NOTIFICATION_ENTITY_TYPES.CLASS_EVENT,
      entityId: classEventId,
      createdAt: new Date(),
    };

    const notificationId = await this.dataSource.transaction(
      async (manager) => {
        const entity = manager.create(Notification, notificationData);
        const saved = await manager.save(entity);

        await manager.insert(
          UserNotification,
          context.recipientUserIds.map((userId) => ({
            userId,
            notificationId: saved.id,
            isRead: false,
            readAt: null as Date | null,
          })),
        );

        return saved.id;
      },
    );

    this.logger.log({
      context: NotificationDispatchProcessor.name,
      message: 'Notificación de clase creada y distribuida',
      notificationId,
      classEventId,
      type,
      recipientCount: context.recipientUserIds.length,
    });
  }

  private async handleClassReminder(
    job: Job<ClassReminderPayload>,
  ): Promise<void> {
    const { classEventId, reminderMinutes } = job.data;

    this.logger.log({
      context: NotificationDispatchProcessor.name,
      message: 'Procesando recordatorio de clase',
      jobId: job.id,
      classEventId,
      reminderMinutes,
    });

    const context =
      await this.recipientsService.resolveClassEventContext(classEventId);

    if (context.recipientUserIds.length === 0) {
      this.logger.log({
        context: NotificationDispatchProcessor.name,
        message:
          'CLASS_REMINDER: sin destinatarios, job completado sin insertar notificación',
        classEventId,
      });
      return;
    }

    const notificationType = await this.resolveNotificationTypeOrFail(
      NOTIFICATION_TYPE_CODES.CLASS_REMINDER,
    );

    const template =
      NOTIFICATION_MESSAGES[NOTIFICATION_TYPE_CODES.CLASS_REMINDER];
    const message = template.message(context.classTitle, reminderMinutes);

    const notificationData: Partial<Notification> = {
      notificationTypeId: notificationType.id,
      title: template.title,
      message,
      entityType: NOTIFICATION_ENTITY_TYPES.CLASS_EVENT,
      entityId: classEventId,
      createdAt: new Date(),
    };

    const notificationId = await this.dataSource.transaction(
      async (manager) => {
        const entity = manager.create(Notification, notificationData);
        const saved = await manager.save(entity);

        await manager.insert(
          UserNotification,
          context.recipientUserIds.map((userId) => ({
            userId,
            notificationId: saved.id,
            isRead: false,
            readAt: null as Date | null,
          })),
        );

        return saved.id;
      },
    );

    this.logger.log({
      context: NotificationDispatchProcessor.name,
      message: 'CLASS_REMINDER: notificación creada y distribuida',
      notificationId,
      classEventId,
      reminderMinutes,
      recipientCount: context.recipientUserIds.length,
    });
  }

  private async handleCleanup(jobName: string): Promise<void> {
    this.logger.log({
      context: NotificationDispatchProcessor.name,
      job: jobName,
      message: 'Iniciando proceso de limpieza de notificaciones antiguas',
    });

    let retentionDays: number;
    try {
      const raw = await this.settingsService.getString(
        NOTIFICATION_SYSTEM_SETTING_KEYS.CLEANUP_RETENTION_DAYS,
      );
      const parsed = parseInt(raw, 10);
      retentionDays = Number.isFinite(parsed)
        ? parsed
        : technicalSettings.notifications.retentionDefaultDays;

      if (
        retentionDays < technicalSettings.notifications.retentionMinSafeDays
      ) {
        const msg = `Error de seguridad: Se intentó configurar una retención menor a ${technicalSettings.notifications.retentionMinSafeDays} días`;
        this.logger.error({
          context: NotificationDispatchProcessor.name,
          message: msg,
          valueReceived: retentionDays,
        });
        throw new UnrecoverableError(msg);
      }
    } catch (error) {
      if (error instanceof UnrecoverableError) throw error;

      retentionDays = technicalSettings.notifications.retentionDefaultDays;
      this.logger.warn({
        context: NotificationDispatchProcessor.name,
        job: jobName,
        message:
          'No se encontró NOTIFICATION_CLEANUP_RETENTION_DAYS en system_setting, usando valor por defecto',
        defaultValue: retentionDays,
      });
    }

    const cutOffDate = new Date(
      Date.now() - retentionDays * 24 * 60 * 60 * 1000,
    );

    const totalDeleted = await this.notificationRepository.deleteOlderThan(
      cutOffDate,
      technicalSettings.notifications.cleanupBatchSize,
    );

    this.logger.log({
      context: NotificationDispatchProcessor.name,
      job: jobName,
      message: 'Limpieza de notificaciones completada',
      totalDeleted,
      retentionDays,
      cutOffDate: cutOffDate.toISOString(),
    });
  }

  private async resolveNotificationTypeOrFail(code: NotificationTypeCode) {
    const notificationType =
      await this.notificationTypeRepository.findByCode(code);

    if (!notificationType) {
      const msg = `Crítico: No existe el notification_type con código '${code}' en la base de datos`;
      this.logger.error({
        context: NotificationDispatchProcessor.name,
        message: msg,
        code,
      });
      throw new UnrecoverableError(
        `Error de integridad: notification_type '${code}' no configurado`,
      );
    }

    return notificationType;
  }

  private formatDatetime(date: Date): string {
    return date.toLocaleString('es-PE', {
      timeZone: 'America/Lima',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
