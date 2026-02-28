import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationRepository } from './notification.repository';
import { Notification } from '@modules/notifications/domain/notification.entity';

const mockRepo = {
  create: jest.fn(),
  save: jest.fn(),
  query: jest.fn(),
};

describe('NotificationRepository', () => {
  let repo: NotificationRepository;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationRepository,
        { provide: getRepositoryToken(Notification), useValue: mockRepo },
      ],
    }).compile();

    repo = module.get(NotificationRepository);
  });

  describe('create', () => {
    it('crea y persiste la entidad', async () => {
      const data = {
        title: 'Test',
        message: 'Msg',
        notificationTypeId: '1',
        createdAt: new Date(),
      };
      const saved = { id: 'n-1', ...data } as Notification;
      mockRepo.create.mockReturnValue(data);
      mockRepo.save.mockResolvedValue(saved);

      const result = await repo.create(data);

      expect(mockRepo.create).toHaveBeenCalledWith(data);
      expect(mockRepo.save).toHaveBeenCalledWith(data);
      expect(result).toBe(saved);
    });
  });

  describe('deleteOlderThan', () => {
    it('ejecuta DELETE con LIMIT y acumula correctamente cuando hay menos filas que el batch', async () => {
      const cutOff = new Date('2025-01-01');
      mockRepo.query.mockResolvedValueOnce({ affectedRows: 50 });

      const total = await repo.deleteOlderThan(cutOff, 5000);

      expect(total).toBe(50);
      expect(mockRepo.query).toHaveBeenCalledTimes(1);
      expect(mockRepo.query).toHaveBeenCalledWith(
        'DELETE FROM notification WHERE created_at < ? LIMIT ?',
        [cutOff, 5000],
      );
    });

    it('realiza múltiples iteraciones hasta que una devuelve menos que el batchSize', async () => {
      const cutOff = new Date('2025-01-01');
      mockRepo.query
        .mockResolvedValueOnce({ affectedRows: 100 })
        .mockResolvedValueOnce({ affectedRows: 100 })
        .mockResolvedValueOnce({ affectedRows: 40 });

      const total = await repo.deleteOlderThan(cutOff, 100);

      expect(total).toBe(240);
      expect(mockRepo.query).toHaveBeenCalledTimes(3);
    });

    it('devuelve 0 cuando no hay nada que borrar', async () => {
      const cutOff = new Date('2025-01-01');
      mockRepo.query.mockResolvedValueOnce({ affectedRows: 0 });

      const total = await repo.deleteOlderThan(cutOff, 5000);

      expect(total).toBe(0);
      expect(mockRepo.query).toHaveBeenCalledTimes(1);
    });

    it('detiene las iteraciones al alcanzar maxCleanupBatchesPerRun aunque siga habiendo filas', async () => {
      const cutOff = new Date('2025-01-01');
      mockRepo.query.mockResolvedValue({ affectedRows: 2 });

      const total = await repo.deleteOlderThan(cutOff, 2);

      expect(mockRepo.query).toHaveBeenCalledTimes(100);
      expect(total).toBe(200);
    });

    it('trata affectedRows undefined como 0', async () => {
      mockRepo.query.mockResolvedValueOnce({});

      const total = await repo.deleteOlderThan(new Date(), 5000);

      expect(total).toBe(0);
    });
  });
});
