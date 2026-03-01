import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NotificationsDispatchService } from './notifications-dispatch.service';
import { SettingsService } from '@modules/settings/application/settings.service';
import { QUEUES } from '@infrastructure/queue/queue.constants';
import {
  NOTIFICATION_JOB_NAMES,
  NOTIFICATION_TYPE_CODES,
} from '@modules/notifications/domain/notification.constants';
import { technicalSettings } from '@config/technical-settings';

const mockSettingsService = {
  getString: jest.fn(),
};

const mockJob = {
  remove: jest.fn(),
};

const mockQueue: Partial<Queue> = {
  add: jest.fn(),
  getJob: jest.fn(),
};

describe('NotificationsDispatchService', () => {
  let service: NotificationsDispatchService;

  beforeEach(async () => {
    jest.clearAllMocks();
    (mockQueue.add as jest.Mock).mockResolvedValue({});
    (mockQueue.getJob as jest.Mock).mockResolvedValue(null);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsDispatchService,
        { provide: SettingsService, useValue: mockSettingsService },
        { provide: getQueueToken(QUEUES.NOTIFICATIONS), useValue: mockQueue },
      ],
    }).compile();

    service = module.get(NotificationsDispatchService);
  });

  describe('dispatchNewMaterial', () => {
    it('encola el job con el tipo y datos correctos', async () => {
      await service.dispatchNewMaterial('mat-1', 'folder-1');

      expect(mockQueue.add).toHaveBeenCalledWith(
        NOTIFICATION_JOB_NAMES.DISPATCH,
        {
          type: NOTIFICATION_TYPE_CODES.NEW_MATERIAL,
          materialId: 'mat-1',
          folderId: 'folder-1',
        },
      );
    });

    it('no propaga el error si la queue falla', async () => {
      (mockQueue.add as jest.Mock).mockRejectedValue(new Error('Redis down'));

      await expect(
        service.dispatchNewMaterial('m1', 'f1'),
      ).resolves.toBeUndefined();
    });
  });

  describe('dispatchClassScheduled', () => {
    it('encola el job CLASS_SCHEDULED', async () => {
      await service.dispatchClassScheduled('event-1');

      expect(mockQueue.add).toHaveBeenCalledWith(
        NOTIFICATION_JOB_NAMES.DISPATCH,
        {
          type: NOTIFICATION_TYPE_CODES.CLASS_SCHEDULED,
          classEventId: 'event-1',
        },
      );
    });

    it('no propaga el error si la queue falla', async () => {
      (mockQueue.add as jest.Mock).mockRejectedValue(new Error('fail'));

      await expect(
        service.dispatchClassScheduled('e1'),
      ).resolves.toBeUndefined();
    });
  });

  describe('dispatchClassUpdated', () => {
    it('encola el job CLASS_UPDATED', async () => {
      await service.dispatchClassUpdated('event-2');

      expect(mockQueue.add).toHaveBeenCalledWith(
        NOTIFICATION_JOB_NAMES.DISPATCH,
        {
          type: NOTIFICATION_TYPE_CODES.CLASS_UPDATED,
          classEventId: 'event-2',
        },
      );
    });

    it('no propaga el error si la queue falla', async () => {
      (mockQueue.add as jest.Mock).mockRejectedValue(new Error('fail'));

      await expect(service.dispatchClassUpdated('e2')).resolves.toBeUndefined();
    });
  });

  describe('dispatchClassCancelled', () => {
    it('encola el job CLASS_CANCELLED', async () => {
      await service.dispatchClassCancelled('event-3');

      expect(mockQueue.add).toHaveBeenCalledWith(
        NOTIFICATION_JOB_NAMES.DISPATCH,
        {
          type: NOTIFICATION_TYPE_CODES.CLASS_CANCELLED,
          classEventId: 'event-3',
        },
      );
    });

    it('no propaga el error si la queue falla', async () => {
      (mockQueue.add as jest.Mock).mockRejectedValue(new Error('fail'));

      await expect(
        service.dispatchClassCancelled('e3'),
      ).resolves.toBeUndefined();
    });
  });

  describe('scheduleClassReminder', () => {
    it('omite el reminder si el delay calculado es menor al umbral mínimo', async () => {
      mockSettingsService.getString.mockResolvedValue('30');
      const startDatetime = new Date(Date.now() + 60 * 1000);

      await service.scheduleClassReminder('event-1', startDatetime);

      expect(mockQueue.add).not.toHaveBeenCalled();
    });

    it('encola el reminder con reminderMinutes en el payload, jobId correcto y delay calculado', async () => {
      mockSettingsService.getString.mockResolvedValue('30');
      const thirtyOneMinutesFromNow = Date.now() + 31 * 60 * 1000;
      const startDatetime = new Date(thirtyOneMinutesFromNow + 30 * 60 * 1000);

      await service.scheduleClassReminder('event-5', startDatetime);

      expect(mockQueue.add).toHaveBeenCalledWith(
        NOTIFICATION_JOB_NAMES.CLASS_REMINDER,
        { classEventId: 'event-5', reminderMinutes: 30 },
        expect.objectContaining({
          jobId: 'class-reminder-event-5',
          delay: expect.any(Number),
        }),
      );
    });

    it('omite el reminder si reminderMinutes está fuera del rango permitido', async () => {
      mockSettingsService.getString.mockResolvedValue('5');
      const startDatetime = new Date(Date.now() + 60 * 60 * 1000);

      await service.scheduleClassReminder('event-4', startDatetime);

      expect(mockQueue.add).not.toHaveBeenCalled();
    });

    it('usa el valor por defecto si SettingsService lanza error', async () => {
      mockSettingsService.getString.mockRejectedValue(new Error('not found'));
      const defaultMinutes =
        technicalSettings.notifications.reminderDefaultMinutes;
      const startDatetime = new Date(
        Date.now() + (defaultMinutes + 5) * 60 * 1000,
      );

      await service.scheduleClassReminder('event-6', startDatetime);

      expect(mockQueue.add).toHaveBeenCalled();
    });

    it('usa el valor por defecto si getString devuelve texto no numérico', async () => {
      mockSettingsService.getString.mockResolvedValue('invalid');
      const defaultMinutes =
        technicalSettings.notifications.reminderDefaultMinutes;
      const startDatetime = new Date(
        Date.now() + (defaultMinutes + 5) * 60 * 1000,
      );

      await service.scheduleClassReminder('event-7', startDatetime);

      expect(mockQueue.add).toHaveBeenCalled();
    });

    it('elimina el job existente antes de encolar uno nuevo', async () => {
      mockSettingsService.getString.mockResolvedValue('30');
      (mockQueue.getJob as jest.Mock).mockResolvedValue(mockJob);
      mockJob.remove.mockResolvedValue(undefined);
      const startDatetime = new Date(Date.now() + 35 * 60 * 1000);

      await service.scheduleClassReminder('event-8', startDatetime);

      expect(mockJob.remove).toHaveBeenCalledTimes(1);
      expect(mockQueue.add).toHaveBeenCalled();
    });

    it('no propaga el error si la queue falla', async () => {
      mockSettingsService.getString.mockResolvedValue('30');
      (mockQueue.add as jest.Mock).mockRejectedValue(new Error('fail'));
      const startDatetime = new Date(Date.now() + 35 * 60 * 1000);

      await expect(
        service.scheduleClassReminder('e1', startDatetime),
      ).resolves.toBeUndefined();
    });
  });

  describe('cancelClassReminder', () => {
    it('elimina el job si existe', async () => {
      (mockQueue.getJob as jest.Mock).mockResolvedValue(mockJob);
      mockJob.remove.mockResolvedValue(undefined);

      await service.cancelClassReminder('event-10');

      expect(mockQueue.getJob).toHaveBeenCalledWith('class-reminder-event-10');
      expect(mockJob.remove).toHaveBeenCalledTimes(1);
    });

    it('no falla si el job no existe', async () => {
      (mockQueue.getJob as jest.Mock).mockResolvedValue(null);

      await expect(
        service.cancelClassReminder('event-11'),
      ).resolves.toBeUndefined();
    });

    it('no propaga el error si getJob lanza', async () => {
      (mockQueue.getJob as jest.Mock).mockRejectedValue(new Error('fail'));

      await expect(service.cancelClassReminder('e1')).resolves.toBeUndefined();
    });
  });
});
