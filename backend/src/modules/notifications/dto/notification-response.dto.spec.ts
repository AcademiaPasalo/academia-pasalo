import { NotificationResponseDto } from './notification-response.dto';
import { UserNotification } from '@modules/notifications/domain/user-notification.entity';
import { Notification } from '@modules/notifications/domain/notification.entity';
import { NotificationType } from '@modules/notifications/domain/notification-type.entity';

function makeUserNotification(
  overrides: Partial<UserNotification> = {},
): UserNotification {
  const notifType = {
    id: '10',
    code: 'CLASS_SCHEDULED',
    name: 'Nueva clase programada',
  } as NotificationType;

  const notification = {
    id: '99',
    notificationTypeId: '10',
    notificationType: notifType,
    title: 'Nueva clase programada',
    message: "La clase 'Álgebra' ha sido programada para el 01/03/2026.",
    entityType: 'class_event',
    entityId: 'evt-1',
    createdAt: new Date('2026-02-28T10:00:00Z'),
  } as Notification;

  const base: UserNotification = {
    userId: 'u1',
    notificationId: '99',
    user: {} as never,
    notification,
    isRead: false,
    readAt: null,
  };

  return { ...base, ...overrides };
}

describe('NotificationResponseDto', () => {
  describe('fromEntity', () => {
    it('mapea todos los campos correctamente para notificación no leída', () => {
      const un = makeUserNotification();
      const dto = NotificationResponseDto.fromEntity(un);

      expect(dto.notificationId).toBe('99');
      expect(dto.type).toBe('CLASS_SCHEDULED');
      expect(dto.typeName).toBe('Nueva clase programada');
      expect(dto.title).toBe('Nueva clase programada');
      expect(dto.message).toBe(
        "La clase 'Álgebra' ha sido programada para el 01/03/2026.",
      );
      expect(dto.entityType).toBe('class_event');
      expect(dto.entityId).toBe('evt-1');
      expect(dto.isRead).toBe(false);
      expect(dto.readAt).toBeNull();
      expect(dto.createdAt).toEqual(new Date('2026-02-28T10:00:00Z'));
    });

    it('mapea correctamente una notificación ya leída', () => {
      const readAt = new Date('2026-02-28T12:00:00Z');
      const un = makeUserNotification({ isRead: true, readAt });
      const dto = NotificationResponseDto.fromEntity(un);

      expect(dto.isRead).toBe(true);
      expect(dto.readAt).toEqual(readAt);
    });

    it('mapea entityType y entityId como null cuando son null', () => {
      const un = makeUserNotification();
      un.notification.entityType = null;
      un.notification.entityId = null;

      const dto = NotificationResponseDto.fromEntity(un);

      expect(dto.entityType).toBeNull();
      expect(dto.entityId).toBeNull();
    });

    it('mapea el código y nombre del tipo de notificación correctamente', () => {
      const un = makeUserNotification();
      un.notification.notificationType.code = 'NEW_MATERIAL';
      un.notification.notificationType.name = 'Nuevo material disponible';

      const dto = NotificationResponseDto.fromEntity(un);

      expect(dto.type).toBe('NEW_MATERIAL');
      expect(dto.typeName).toBe('Nuevo material disponible');
    });

    it('devuelve un objeto plano, no una instancia de NotificationResponseDto', () => {
      const un = makeUserNotification();
      const dto = NotificationResponseDto.fromEntity(un);

      expect(dto).toBeDefined();
      expect(dto).not.toBeInstanceOf(NotificationResponseDto);
    });

    it('lanza InternalServerErrorException si notification no está cargada', () => {
      const un = makeUserNotification();
      (un as any).notification = undefined;

      expect(() => NotificationResponseDto.fromEntity(un)).toThrow(
        'fromEntity requiere que las relaciones notification y notificationType estén cargadas',
      );
    });

    it('lanza InternalServerErrorException si notificationType no está cargada', () => {
      const un = makeUserNotification();
      (un.notification as any).notificationType = undefined;

      expect(() => NotificationResponseDto.fromEntity(un)).toThrow(
        'fromEntity requiere que las relaciones notification y notificationType estén cargadas',
      );
    });
  });
});
