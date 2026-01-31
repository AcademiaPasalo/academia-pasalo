import { Test, TestingModule } from '@nestjs/testing';
import { RedisCacheService } from './redis-cache.service';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { EventEmitter } from 'events';

jest.mock('ioredis');

describe('RedisCacheService', () => {
  let service: RedisCacheService;
  let redisClientMock: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisCacheService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('localhost'),
          },
        },
      ],
    }).compile();

    service = module.get<RedisCacheService>(RedisCacheService);
    
    // Access the private redisClient for mocking
    redisClientMock = new (Redis as any)();
    (service as any).redisClient = redisClientMock;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('invalidateGroup', () => {
    it('should delete keys and resolve promise when stream ends', async () => {
      const pattern = 'test-pattern:*';
      const keys = ['test-pattern:1', 'test-pattern:2'];
      
      const streamMock = new EventEmitter();
      (streamMock as any).pause = jest.fn();
      (streamMock as any).resume = jest.fn();

      redisClientMock.scanStream.mockReturnValue(streamMock);
      redisClientMock.del.mockResolvedValue(2);

      const promise = service.invalidateGroup(pattern);

      // Emit data
      streamMock.emit('data', keys);
      // Emit end
      streamMock.emit('end');

      await expect(promise).resolves.toBeUndefined();
      expect(redisClientMock.del).toHaveBeenCalledWith(...keys);
    });

    it('should handle empty stream correctly', async () => {
      const pattern = 'empty-pattern:*';
      
      const streamMock = new EventEmitter();
      redisClientMock.scanStream.mockReturnValue(streamMock);
      
      const promise = service.invalidateGroup(pattern);

      streamMock.emit('data', []);
      streamMock.emit('end');

      await expect(promise).resolves.toBeUndefined();
      expect(redisClientMock.del).not.toHaveBeenCalled();
    });

    it('should reject if stream errors', async () => {
      const pattern = 'error-pattern:*';
      const error = new Error('Stream error');
      
      const streamMock = new EventEmitter();
      redisClientMock.scanStream.mockReturnValue(streamMock);

      const promise = service.invalidateGroup(pattern);

      streamMock.emit('error', error);

      await expect(promise).rejects.toThrow(error);
    });
  });
});
