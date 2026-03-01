import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationTypeRepository } from './notification-type.repository';
import { NotificationType } from '@modules/notifications/domain/notification-type.entity';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import { NOTIFICATION_CACHE_KEYS } from '@modules/notifications/domain/notification.constants';

const mockRepo = {
  create: jest.fn((plain) => plain),
  findOne: jest.fn(),
};

const mockCache = {
  get: jest.fn(),
  set: jest.fn(),
};

describe('NotificationTypeRepository', () => {
  let repo: NotificationTypeRepository;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationTypeRepository,
        { provide: getRepositoryToken(NotificationType), useValue: mockRepo },
        { provide: RedisCacheService, useValue: mockCache },
      ],
    }).compile();

    repo = module.get(NotificationTypeRepository);
  });

  describe('findByCode', () => {
    it('devuelve el valor desde caché cuando existe', async () => {
      const cached = {
        id: '1',
        code: 'NEW_MATERIAL',
        name: 'Nuevo Material',
      };
      mockCache.get.mockResolvedValue(cached);

      const result = await repo.findByCode('NEW_MATERIAL');

      expect(result).toEqual(cached);
      expect(mockRepo.findOne).not.toHaveBeenCalled();
    });

    it('consulta la BD y cachea cuando no hay hit de caché', async () => {
      const notifType = {
        id: '2',
        code: 'CLASS_REMINDER',
        name: 'Recordatorio',
      } as NotificationType;
      mockCache.get.mockResolvedValue(null);
      mockRepo.findOne.mockResolvedValue(notifType);
      mockCache.set.mockResolvedValue(undefined);

      const result = await repo.findByCode('CLASS_REMINDER');

      expect(result).toBe(notifType);
      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { code: 'CLASS_REMINDER' },
      });
      expect(mockCache.set).toHaveBeenCalledWith(
        NOTIFICATION_CACHE_KEYS.TYPE_BY_CODE('CLASS_REMINDER'),
        { id: '2', code: 'CLASS_REMINDER', name: 'Recordatorio' },
        expect.any(Number),
      );
    });

    it('no cachea si la BD devuelve null', async () => {
      mockCache.get.mockResolvedValue(null);
      mockRepo.findOne.mockResolvedValue(null);

      const result = await repo.findByCode('UNKNOWN');

      expect(result).toBeNull();
      expect(mockCache.set).not.toHaveBeenCalled();
    });
  });
});
