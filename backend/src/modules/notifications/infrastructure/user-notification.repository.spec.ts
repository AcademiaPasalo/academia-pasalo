import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserNotificationRepository } from './user-notification.repository';
import { UserNotification } from '@modules/notifications/domain/user-notification.entity';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import { NOTIFICATION_CACHE_KEYS } from '@modules/notifications/domain/notification.constants';

const mockRepo = {
  insert: jest.fn(),
  createQueryBuilder: jest.fn(),
  count: jest.fn(),
  update: jest.fn(),
  findOne: jest.fn(),
};

const mockCache = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

describe('UserNotificationRepository', () => {
  let repo: UserNotificationRepository;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserNotificationRepository,
        { provide: getRepositoryToken(UserNotification), useValue: mockRepo },
        { provide: RedisCacheService, useValue: mockCache },
      ],
    }).compile();

    repo = module.get(UserNotificationRepository);
  });

  describe('bulkCreate', () => {
    it('no llama a insert si el array está vacío', async () => {
      await repo.bulkCreate([]);
      expect(mockRepo.insert).not.toHaveBeenCalled();
    });

    it('llama a insert con los datos correctos', async () => {
      mockRepo.insert.mockResolvedValue(undefined);
      const rows = [
        { userId: 'u1', notificationId: 'n1' },
        { userId: 'u2', notificationId: 'n1' },
      ];

      await repo.bulkCreate(rows);

      expect(mockRepo.insert).toHaveBeenCalledWith([
        { userId: 'u1', notificationId: 'n1', isRead: false, readAt: null },
        { userId: 'u2', notificationId: 'n1', isRead: false, readAt: null },
      ]);
    });
  });

  describe('findByUserPaginated', () => {
    it('construye la query sin filtro de isRead cuando onlyUnread=false', async () => {
      const getMany = jest.fn().mockResolvedValue([]);
      const leftJoinAndSelect = jest.fn().mockReturnThis();
      const qb = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoinAndSelect,
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        getMany,
      };
      mockRepo.createQueryBuilder.mockReturnValue(qb);

      await repo.findByUserPaginated('user-1', false, 20, 0);

      expect(mockRepo.createQueryBuilder).toHaveBeenCalledWith('un');
      expect(leftJoinAndSelect).not.toHaveBeenCalled();
      expect(qb.andWhere).not.toHaveBeenCalled();
      expect(qb.orderBy).toHaveBeenCalledWith('n.createdAt', 'DESC');
      expect(qb.limit).toHaveBeenCalledWith(20);
      expect(qb.offset).toHaveBeenCalledWith(0);
    });

    it('agrega filtro andWhere cuando onlyUnread=true', async () => {
      const getMany = jest.fn().mockResolvedValue([]);
      const andWhere = jest.fn().mockReturnThis();
      const leftJoinAndSelect = jest.fn().mockReturnThis();
      const qb = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoinAndSelect,
        where: jest.fn().mockReturnThis(),
        andWhere,
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        getMany,
      };
      mockRepo.createQueryBuilder.mockReturnValue(qb);

      await repo.findByUserPaginated('user-1', true, 10, 0);

      expect(leftJoinAndSelect).not.toHaveBeenCalled();
      expect(andWhere).toHaveBeenCalledWith('un.isRead = :isRead', {
        isRead: false,
      });
    });
  });

  describe('countUnread', () => {
    it('devuelve el valor desde caché cuando existe (incluyendo 0)', async () => {
      mockCache.get.mockResolvedValue(0);

      const result = await repo.countUnread('user-1');

      expect(result).toBe(0);
      expect(mockRepo.count).not.toHaveBeenCalled();
    });

    it('devuelve el valor desde caché cuando es mayor que 0', async () => {
      mockCache.get.mockResolvedValue(5);

      const result = await repo.countUnread('user-1');

      expect(result).toBe(5);
      expect(mockRepo.count).not.toHaveBeenCalled();
    });

    it('consulta la BD y guarda en caché cuando no hay caché', async () => {
      mockCache.get.mockResolvedValue(null);
      mockRepo.count.mockResolvedValue(3);
      mockCache.set.mockResolvedValue(undefined);

      const result = await repo.countUnread('user-1');

      expect(result).toBe(3);
      expect(mockRepo.count).toHaveBeenCalledWith({
        where: { userId: 'user-1', isRead: false },
      });
      expect(mockCache.set).toHaveBeenCalledWith(
        NOTIFICATION_CACHE_KEYS.UNREAD_COUNT('user-1'),
        3,
        expect.any(Number),
      );
    });

    it('no usa caché cuando el resultado de cacheService.get es undefined', async () => {
      mockCache.get.mockResolvedValue(undefined);
      mockRepo.count.mockResolvedValue(1);

      const result = await repo.countUnread('user-1');

      expect(result).toBe(1);
      expect(mockRepo.count).toHaveBeenCalled();
    });
  });

  describe('markAsRead', () => {
    it('llama a update con los parámetros correctos e invalida el caché', async () => {
      mockRepo.update.mockResolvedValue(undefined);
      mockCache.del.mockResolvedValue(undefined);

      await repo.markAsRead('user-1', 'notif-1');

      expect(mockRepo.update).toHaveBeenCalledWith(
        { userId: 'user-1', notificationId: 'notif-1', isRead: false },
        { isRead: true, readAt: expect.any(Date) },
      );
      expect(mockCache.del).toHaveBeenCalledWith(
        NOTIFICATION_CACHE_KEYS.UNREAD_COUNT('user-1'),
      );
    });
  });

  describe('markAllAsRead', () => {
    it('actualiza solo los no leídos e invalida el caché', async () => {
      mockRepo.update.mockResolvedValue(undefined);
      mockCache.del.mockResolvedValue(undefined);

      await repo.markAllAsRead('user-5');

      expect(mockRepo.update).toHaveBeenCalledWith(
        { userId: 'user-5', isRead: false },
        { isRead: true, readAt: expect.any(Date) },
      );
      expect(mockCache.del).toHaveBeenCalledWith(
        NOTIFICATION_CACHE_KEYS.UNREAD_COUNT('user-5'),
      );
    });
  });

  describe('findOne', () => {
    it('devuelve la entidad cuando existe', async () => {
      const un = {
        userId: 'u1',
        notificationId: 'n1',
        isRead: false,
      } as UserNotification;
      mockRepo.findOne.mockResolvedValue(un);

      const result = await repo.findOne('u1', 'n1');

      expect(result).toBe(un);
      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { userId: 'u1', notificationId: 'n1' },
      });
    });

    it('devuelve null cuando no existe', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      const result = await repo.findOne('u1', 'n99');

      expect(result).toBeNull();
    });
  });
});
