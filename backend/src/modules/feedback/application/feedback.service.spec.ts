import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { FeedbackService } from '@modules/feedback/application/feedback.service';
import { CourseTestimonyRepository } from '@modules/feedback/infrastructure/course-testimony.repository';
import { FeaturedTestimonyRepository } from '@modules/feedback/infrastructure/featured-testimony.repository';
import { EnrollmentRepository } from '@modules/enrollments/infrastructure/enrollment.repository';
import { StorageService } from '@infrastructure/storage/storage.service';
import { UsersService } from '@modules/users/application/users.service';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import {
  PhotoSource,
  CourseTestimony,
} from '@modules/feedback/domain/course-testimony.entity';
import { FeaturedTestimony } from '@modules/feedback/domain/featured-testimony.entity';
import { Enrollment } from '@modules/enrollments/domain/enrollment.entity';

describe('FeedbackService', () => {
  let service: FeedbackService;
  let testimonyRepo: CourseTestimonyRepository;
  let featuredRepo: FeaturedTestimonyRepository;
  let enrollmentRepo: EnrollmentRepository;
  let storageService: StorageService;
  let cacheService: RedisCacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbackService,
        {
          provide: CourseTestimonyRepository,
          useValue: {
            create: jest.fn(),
            findByUserAndCycle: jest.fn(),
            findById: jest.fn(),
            findByCycleId: jest.fn(),
          },
        },
        {
          provide: FeaturedTestimonyRepository,
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findByTestimonyId: jest.fn(),
            findActiveByCycle: jest.fn(),
          },
        },
        {
          provide: EnrollmentRepository,
          useValue: {
            findActiveByUserAndCourseCycle: jest.fn(),
          },
        },
        {
          provide: StorageService,
          useValue: {
            saveFile: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: RedisCacheService,
          useValue: {
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue(null),
            del: jest.fn().mockResolvedValue(null),
          },
        },
      ],
    }).compile();

    service = module.get<FeedbackService>(FeedbackService);
    testimonyRepo = module.get<CourseTestimonyRepository>(
      CourseTestimonyRepository,
    );
    featuredRepo = module.get<FeaturedTestimonyRepository>(
      FeaturedTestimonyRepository,
    );
    enrollmentRepo = module.get<EnrollmentRepository>(EnrollmentRepository);
    storageService = module.get<StorageService>(StorageService);
    cacheService = module.get<RedisCacheService>(RedisCacheService);
  });

  describe('createTestimony', () => {
    const mockDto = {
      courseCycleId: '100',
      rating: 5,
      comment: 'Excellent!',
      photoSource: PhotoSource.NONE,
    };

    it('should create testimony successfully if enrolled', async () => {
      jest
        .spyOn(enrollmentRepo, 'findActiveByUserAndCourseCycle')
        .mockResolvedValue({ id: '1' } as Enrollment);
      jest.spyOn(testimonyRepo, 'findByUserAndCycle').mockResolvedValue(null);
      jest
        .spyOn(testimonyRepo, 'create')
        .mockResolvedValue({ id: 'test1' } as CourseTestimony);

      const result = await service.createTestimony('user1', mockDto);

      expect(
        enrollmentRepo.findActiveByUserAndCourseCycle,
      ).toHaveBeenCalledWith('user1', '100');
      expect(testimonyRepo.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw ForbiddenException if user is NOT enrolled', async () => {
      jest
        .spyOn(enrollmentRepo, 'findActiveByUserAndCourseCycle')
        .mockResolvedValue(null);

      await expect(service.createTestimony('user1', mockDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ConflictException if user already has a testimony for this cycle', async () => {
      jest
        .spyOn(enrollmentRepo, 'findActiveByUserAndCourseCycle')
        .mockResolvedValue({ id: '1' } as Enrollment);
      jest
        .spyOn(testimonyRepo, 'findByUserAndCycle')
        .mockResolvedValue({ id: 'existing' } as CourseTestimony);

      await expect(service.createTestimony('user1', mockDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should upload photo if source is UPLOADED', async () => {
      const uploadDto = { ...mockDto, photoSource: PhotoSource.UPLOADED };
      const mockFile = {
        originalname: 'pic.jpg',
        buffer: Buffer.from('img'),
      } as Express.Multer.File;

      jest
        .spyOn(enrollmentRepo, 'findActiveByUserAndCourseCycle')
        .mockResolvedValue({ id: '1' } as Enrollment);
      jest.spyOn(testimonyRepo, 'findByUserAndCycle').mockResolvedValue(null);
      jest
        .spyOn(storageService, 'saveFile')
        .mockResolvedValue({
          storageProvider: 'LOCAL' as const,
          storageKey: 'pic.jpg',
          storageUrl: 'path/to/pic.jpg',
        });
      jest.spyOn(testimonyRepo, 'create').mockResolvedValue({
        id: 'test1',
        photoUrl: 'path/to/pic.jpg',
      } as CourseTestimony);

      await service.createTestimony('user1', uploadDto, mockFile);

      expect(storageService.saveFile).toHaveBeenCalled();
    });

    it('should throw BadRequest if UPLOADED source but no file provided', async () => {
      const uploadDto = { ...mockDto, photoSource: PhotoSource.UPLOADED };
      jest
        .spyOn(enrollmentRepo, 'findActiveByUserAndCourseCycle')
        .mockResolvedValue({ id: '1' } as Enrollment);
      jest.spyOn(testimonyRepo, 'findByUserAndCycle').mockResolvedValue(null);

      await expect(
        service.createTestimony('user1', uploadDto, undefined),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('featureTestimony (Admin)', () => {
    const featureDto = { displayOrder: 1, isActive: true };

    it('should create new featured record if not exists', async () => {
      jest.spyOn(testimonyRepo, 'findById').mockResolvedValue({
        id: 't1',
        courseCycleId: '100',
      } as CourseTestimony);
      jest.spyOn(featuredRepo, 'findByTestimonyId').mockResolvedValue(null);
      jest
        .spyOn(featuredRepo, 'create')
        .mockResolvedValue({ id: 'f1' } as FeaturedTestimony);

      const result = await service.featureTestimony('admin1', 't1', featureDto);

      expect(featuredRepo.create).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(cacheService.del).toHaveBeenCalled();
    });

    it('should update existing featured record', async () => {
      const existing = {
        id: 'f1',
        isActive: false,
        displayOrder: 99,
      } as FeaturedTestimony;
      jest.spyOn(testimonyRepo, 'findById').mockResolvedValue({
        id: 't1',
        courseCycleId: '100',
      } as CourseTestimony);
      jest.spyOn(featuredRepo, 'findByTestimonyId').mockResolvedValue(existing);
      jest
        .spyOn(featuredRepo, 'save')
        .mockResolvedValue({ ...existing, ...featureDto });

      const result = await service.featureTestimony('admin1', 't1', featureDto);

      expect(featuredRepo.save).toHaveBeenCalled();
      expect(result.isActive).toBe(true);
      expect(result.displayOrder).toBe(1);
      expect(cacheService.del).toHaveBeenCalled();
    });

    it('should throw NotFound if testimony does not exist', async () => {
      jest.spyOn(testimonyRepo, 'findById').mockResolvedValue(null);

      await expect(
        service.featureTestimony('admin1', '999', featureDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPublicTestimonies', () => {
    it('should return from cache if available', async () => {
      const cached = [{ id: 'f1' }] as FeaturedTestimony[];
      jest.spyOn(cacheService, 'get').mockResolvedValue(cached);

      const result = await service.getPublicTestimonies('100');

      expect(result).toEqual(cached);
      expect(cacheService.get).toHaveBeenCalled();
    });

    it('should return from DB and set cache if not available', async () => {
      const items = [{ id: 'f1' }] as FeaturedTestimony[];
      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      jest.spyOn(featuredRepo, 'findActiveByCycle').mockResolvedValue(items);

      const result = await service.getPublicTestimonies('100');

      expect(result).toEqual(items);
      expect(cacheService.set).toHaveBeenCalled();
    });
  });
});
