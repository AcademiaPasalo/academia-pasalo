import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { UserNotificationRepository } from '@modules/notifications/infrastructure/user-notification.repository';
import { UserNotification } from '@modules/notifications/domain/user-notification.entity';
import { Notification } from '@modules/notifications/domain/notification.entity';
import { QUEUES } from '@infrastructure/queue/queue.constants';
import { NOTIFICATION_JOB_NAMES } from '@modules/notifications/domain/notification.constants';
import { technicalSettings } from '@config/technical-settings';

const mockUserNotifRepo = {
  findByUserPaginated: jest.fn(),
  countUnread: jest.fn(),
  findOne: jest.fn(),
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
};

const mockQueue: Partial<Queue> = {
  getJobSchedulers: jest.fn(),
  add: jest.fn(),
  removeJobScheduler: jest.fn(),
};

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    (mockQueue.getJobSchedulers as jest.Mock).mockResolvedValue([]);
    (mockQueue.add as jest.Mock).mockResolvedValue({});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: UserNotificationRepository, useValue: mockUserNotifRepo },
        { provide: getQueueToken(QUEUES.NOTIFICATIONS), useValue: mockQueue },
      ],
    }).compile();

    service = module.get(NotificationsService);
    await service.onApplicationBootstrap();
  });

  describe('onApplicationBootstrap — setupCleanupScheduler', () => {
    it('registra el job de cleanup cuando no existe aún', () => {
      expect(mockQueue.add).toHaveBeenCalledWith(
        NOTIFICATION_JOB_NAMES.CLEANUP,
        {},
        {
          repeat: {
            pattern: technicalSettings.notifications.cleanupCronPattern,
          },
        },
      );
      expect(mockQueue.removeJobScheduler).not.toHaveBeenCalled();
    });

    it('no re-registra si el scheduler ya existe con el mismo patrón', async () => {
      jest.clearAllMocks();
      (mockQueue.getJobSchedulers as jest.Mock).mockResolvedValue([
        {
          name: NOTIFICATION_JOB_NAMES.CLEANUP,
          cron: technicalSettings.notifications.cleanupCronPattern,
        },
      ]);

      await service.onApplicationBootstrap();

      expect(mockQueue.add).not.toHaveBeenCalled();
      expect(mockQueue.removeJobScheduler).not.toHaveBeenCalled();
    });

    it('elimina y re-registra el scheduler si el patrón cron cambió', async () => {
      jest.clearAllMocks();
      (mockQueue.getJobSchedulers as jest.Mock).mockResolvedValue([
        { name: NOTIFICATION_JOB_NAMES.CLEANUP, cron: '0 0 * * *' },
      ]);
      (mockQueue.removeJobScheduler as jest.Mock).mockResolvedValue(undefined);
      (mockQueue.add as jest.Mock).mockResolvedValue({});

      await service.onApplicationBootstrap();

      expect(mockQueue.removeJobScheduler).toHaveBeenCalledWith(
        NOTIFICATION_JOB_NAMES.CLEANUP,
      );
      expect(mockQueue.add).toHaveBeenCalledWith(
        NOTIFICATION_JOB_NAMES.CLEANUP,
        {},
        {
          repeat: {
            pattern: technicalSettings.notifications.cleanupCronPattern,
          },
        },
      );
    });

    it('usa la propiedad "pattern" como fallback si "cron" no existe en el scheduler', async () => {
      jest.clearAllMocks();
      (mockQueue.getJobSchedulers as jest.Mock).mockResolvedValue([
        {
          name: NOTIFICATION_JOB_NAMES.CLEANUP,
          pattern: technicalSettings.notifications.cleanupCronPattern,
        },
      ]);

      await service.onApplicationBootstrap();

      expect(mockQueue.add).not.toHaveBeenCalled();
    });
  });

  describe('onApplicationBootstrap — validateReminderSettings', () => {
    it('no loguea error cuando reminderDefaultMinutes está en rango', () => {
      const errorSpy = jest
        .spyOn((service as any).logger, 'error')
        .mockImplementation(() => undefined);

      (service as any).validateReminderSettings();

      expect(errorSpy).not.toHaveBeenCalled();
      errorSpy.mockRestore();
    });
  });

  describe('getMyNotifications', () => {
    it('delega al repositorio con los parámetros correctos', async () => {
      const items: UserNotification[] = [];
      mockUserNotifRepo.findByUserPaginated.mockResolvedValue(items);

      const result = await service.getMyNotifications('u1', true, 10, 20);

      expect(mockUserNotifRepo.findByUserPaginated).toHaveBeenCalledWith(
        'u1',
        true,
        10,
        20,
      );
      expect(result).toBe(items);
    });
  });

  describe('getUnreadCount', () => {
    it('delega al repositorio', async () => {
      mockUserNotifRepo.countUnread.mockResolvedValue(7);

      const result = await service.getUnreadCount('u1');

      expect(result).toBe(7);
    });
  });

  describe('markAsRead', () => {
    it('lanza NotFoundException si la notificación no pertenece al usuario', async () => {
      mockUserNotifRepo.findOne.mockResolvedValue(null);

      await expect(service.markAsRead('u1', 'n99')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(mockUserNotifRepo.markAsRead).not.toHaveBeenCalled();
    });

    it('llama a markAsRead del repositorio cuando la notificación existe', async () => {
      const un = {
        userId: 'u1',
        notificationId: 'n1',
        isRead: false,
      } as UserNotification;
      mockUserNotifRepo.findOne.mockResolvedValue(un);
      mockUserNotifRepo.markAsRead.mockResolvedValue(undefined);

      await service.markAsRead('u1', 'n1');

      expect(mockUserNotifRepo.markAsRead).toHaveBeenCalledWith('u1', 'n1');
    });

    it('no llama a markAsRead del repositorio si la notificación ya está leída', async () => {
      const un = {
        userId: 'u1',
        notificationId: 'n1',
        isRead: true,
      } as UserNotification;
      mockUserNotifRepo.findOne.mockResolvedValue(un);

      await service.markAsRead('u1', 'n1');

      expect(mockUserNotifRepo.markAsRead).not.toHaveBeenCalled();
    });
  });

  describe('markAllAsRead', () => {
    it('delega al repositorio', async () => {
      mockUserNotifRepo.markAllAsRead.mockResolvedValue(undefined);

      await service.markAllAsRead('u5');

      expect(mockUserNotifRepo.markAllAsRead).toHaveBeenCalledWith('u5');
    });
  });
});
