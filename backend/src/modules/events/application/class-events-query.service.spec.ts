import { Test, TestingModule } from '@nestjs/testing';
import { ClassEventsQueryService } from '@modules/events/application/class-events-query.service';
import { ClassEventRepository } from '@modules/events/infrastructure/class-event.repository';
import { EvaluationRepository } from '@modules/evaluations/infrastructure/evaluation.repository';
import { CourseCycleRepository } from '@modules/courses/infrastructure/course-cycle.repository';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import { AuthSettingsService } from '@modules/auth/application/auth-settings.service';
import { ClassEvent } from '@modules/events/domain/class-event.entity';
import { CourseCycle } from '@modules/courses/domain/course-cycle.entity';
import { Evaluation } from '@modules/evaluations/domain/evaluation.entity';

describe('ClassEventsQueryService', () => {
  let service: ClassEventsQueryService;
  let classEventRepository: jest.Mocked<ClassEventRepository>;
  let evaluationRepository: jest.Mocked<EvaluationRepository>;
  let courseCycleRepository: jest.Mocked<CourseCycleRepository>;
  let authSettingsService: jest.Mocked<AuthSettingsService>;
  let cacheService: jest.Mocked<RedisCacheService>;

  const mockEvent = {
    id: 'event-1',
    evaluationId: 'eval-1',
    startDatetime: new Date('2026-02-01T08:00:00Z'),
    endDatetime: new Date('2026-02-01T10:00:00Z'),
  } as ClassEvent;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassEventsQueryService,
        {
          provide: ClassEventRepository,
          useValue: {
            findByUserAndRange: jest.fn(),
            findGlobalSessionsByCourseCyclesAndRange: jest.fn(),
          },
        },
        {
          provide: EvaluationRepository,
          useValue: {
            findByIdWithCycle: jest.fn(),
          },
        },
        {
          provide: CourseCycleRepository,
          useValue: {
            findFullById: jest.fn(),
            findSiblingLayersByCategoryAndCycle: jest.fn(),
            findCategoryMetadataByIds: jest.fn(),
          },
        },
        {
          provide: AuthSettingsService,
          useValue: {
            getActiveCycleId: jest.fn(),
          },
        },
        {
          provide: RedisCacheService,
          useValue: {
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue(undefined),
            addToIndex: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<ClassEventsQueryService>(ClassEventsQueryService);
    classEventRepository = module.get(ClassEventRepository);
    evaluationRepository = module.get(EvaluationRepository);
    courseCycleRepository = module.get(CourseCycleRepository);
    authSettingsService = module.get(AuthSettingsService);
    cacheService = module.get(RedisCacheService);
  });

  describe('getMySchedule', () => {
    it('debe retornar eventos del repositorio', async () => {
      const start = new Date('2026-02-01');
      const end = new Date('2026-02-07');
      classEventRepository.findByUserAndRange.mockResolvedValue([mockEvent]);

      const result = await service.getMySchedule('user-1', start, end);

      expect(result).toEqual([mockEvent]);
      expect(classEventRepository.findByUserAndRange).toHaveBeenCalled();
    });
  });

  describe('getDiscoveryLayers', () => {
    it('debe fallar si el curso no pertenece al ciclo activo', async () => {
      courseCycleRepository.findFullById.mockResolvedValue({
        id: 'cc-1',
        academicCycleId: 'ac-1',
        course: { courseTypeId: 'ct-1' },
      } as unknown as CourseCycle);
      authSettingsService.getActiveCycleId.mockResolvedValue('ac-2');

      await expect(service.getDiscoveryLayers('cc-1')).rejects.toThrow(
        'ciclo actual',
      );
    });
  });

  describe('isCycleActive', () => {
    it('debe retornar true si el ciclo está en el rango actual', async () => {
      const now = new Date();
      const start = new Date(now.getTime() - 100000);
      const end = new Date(now.getTime() + 100000);

      evaluationRepository.findByIdWithCycle.mockResolvedValue({
        courseCycle: {
          academicCycle: { startDate: start, endDate: end },
        },
      } as unknown as Evaluation);

      const result = await service.isCycleActive('eval-1');
      expect(result).toBe(true);
    });
  });
});
