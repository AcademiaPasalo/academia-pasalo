import { InternalServerErrorException } from '@nestjs/common';
import { UserNotification } from '@modules/notifications/domain/user-notification.entity';

export class NotificationResponseDto {
  notificationId: string;
  type: string;
  typeName: string;
  title: string;
  message: string;
  entityType: string | null;
  entityId: string | null;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;

  static fromEntity(un: UserNotification): NotificationResponseDto {
    if (!un.notification || !un.notification.notificationType) {
      throw new InternalServerErrorException(
        'fromEntity requiere que las relaciones notification y notificationType estén cargadas',
      );
    }

    return {
      notificationId: un.notificationId,
      type: un.notification.notificationType.code,
      typeName: un.notification.notificationType.name,
      title: un.notification.title,
      message: un.notification.message,
      entityType: un.notification.entityType,
      entityId: un.notification.entityId,
      isRead: un.isRead,
      readAt: un.readAt,
      createdAt: un.notification.createdAt,
    };
  }
}
