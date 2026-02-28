import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from '@modules/notifications/application/notifications.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { UserNotification } from '@modules/notifications/domain/user-notification.entity';
import { Notification } from '@modules/notifications/domain/notification.entity';
import { NotificationType } from '@modules/notifications/domain/notification-type.entity';
import { User } from '@modules/users/domain/user.entity';
import { GetNotificationsQueryDto } from '@modules/notifications/dto/get-notifications-query.dto';
import { technicalSettings } from '@config/technical-settings';

const mockNotificationsService = {
  getMyNotifications: jest.fn(),
  getUnreadCount: jest.fn(),
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
};

function makeUserNotification(id: string): UserNotification {
  const notifType = {
    id: '10',
    code: 'NEW_MATERIAL',
    name: 'Nuevo material',
  } as NotificationType;
  const notification = {
    id,
    notificationTypeId: '10',
    notificationType: notifType,
    title: 'Material subido',
    message: 'Se publicó algo.',
    entityType: 'material_folder',
    entityId: 'folder-1',
    createdAt: new Date('2026-02-28T10:00:00Z'),
  } as Notification;

  return {
    userId: 'u1',
    notificationId: id,
    user: {} as never,
    notification,
    isRead: false,
    readAt: null,
  } as UserNotification;
}

describe('NotificationsController', () => {
  let controller: NotificationsController;

  const mockUser = { id: 'u1' } as User;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(NotificationsController);
  });

  describe('RBAC — ningún endpoint tiene roles restrictivos', () => {
    it('getMyNotifications no tiene metadatos de roles específicos (cualquier usuario autenticado)', () => {
      const roles = Reflect.getMetadata('roles', controller.getMyNotifications);
      expect(roles).toBeUndefined();
    });

    it('getUnreadCount no tiene metadatos de roles específicos', () => {
      const roles = Reflect.getMetadata('roles', controller.getUnreadCount);
      expect(roles).toBeUndefined();
    });

    it('markAsRead no tiene metadatos de roles específicos', () => {
      const roles = Reflect.getMetadata('roles', controller.markAsRead);
      expect(roles).toBeUndefined();
    });

    it('markAllAsRead no tiene metadatos de roles específicos', () => {
      const roles = Reflect.getMetadata('roles', controller.markAllAsRead);
      expect(roles).toBeUndefined();
    });
  });

  describe('getMyNotifications', () => {
    it('delega al servicio y mapea los resultados a DTOs', async () => {
      const items = [makeUserNotification('99'), makeUserNotification('100')];
      mockNotificationsService.getMyNotifications.mockResolvedValue(items);

      const query: GetNotificationsQueryDto = {
        onlyUnread: false,
        limit: technicalSettings.notifications.defaultPageLimit,
        offset: 0,
      };

      const result = await controller.getMyNotifications(mockUser, query);

      expect(mockNotificationsService.getMyNotifications).toHaveBeenCalledWith(
        'u1',
        false,
        technicalSettings.notifications.defaultPageLimit,
        0,
      );
      expect(result).toHaveLength(2);
      expect(result[0].notificationId).toBe('99');
      expect(result[1].notificationId).toBe('100');
    });

    it('usa onlyUnread=false cuando el query no lo provee (undefined)', async () => {
      mockNotificationsService.getMyNotifications.mockResolvedValue([]);

      const query: GetNotificationsQueryDto = {
        onlyUnread: undefined,
        limit: 20,
        offset: 0,
      };

      await controller.getMyNotifications(mockUser, query);

      expect(mockNotificationsService.getMyNotifications).toHaveBeenCalledWith(
        'u1',
        false,
        20,
        0,
      );
    });
  });

  describe('getUnreadCount', () => {
    it('devuelve el conteo como { count: N }', async () => {
      mockNotificationsService.getUnreadCount.mockResolvedValue(5);

      const result = await controller.getUnreadCount(mockUser);

      expect(mockNotificationsService.getUnreadCount).toHaveBeenCalledWith(
        'u1',
      );
      expect(result).toEqual({ count: 5 });
    });
  });

  describe('markAsRead', () => {
    it('llama al servicio con userId y notificationId correctos', async () => {
      mockNotificationsService.markAsRead.mockResolvedValue(undefined);

      const result = await controller.markAsRead(mockUser, 'notif-42');

      expect(mockNotificationsService.markAsRead).toHaveBeenCalledWith(
        'u1',
        'notif-42',
      );
      expect(result).toBeUndefined();
    });
  });

  describe('markAllAsRead', () => {
    it('llama al servicio con el userId correcto', async () => {
      mockNotificationsService.markAllAsRead.mockResolvedValue(undefined);

      const result = await controller.markAllAsRead(mockUser);

      expect(mockNotificationsService.markAllAsRead).toHaveBeenCalledWith('u1');
      expect(result).toBeUndefined();
    });
  });
});
