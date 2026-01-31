import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from '../src/modules/courses/application/courses.service';
import { RedisCacheService } from '../src/infrastructure/cache/redis-cache.service';
import { CourseCycleRepository } from '../src/modules/courses/infrastructure/course-cycle.repository';
import { EvaluationRepository } from '../src/modules/evaluations/infrastructure/evaluation.repository';
import { CourseRepository } from '../src/modules/courses/infrastructure/course.repository';
import { CourseTypeRepository } from '../src/modules/courses/infrastructure/course-type.repository';
import { CycleLevelRepository } from '../src/modules/courses/infrastructure/cycle-level.repository';
import { CyclesService } from '../src/modules/cycles/application/cycles.service';
import { DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('Courses Content Logic (Integration)', () => {
  let coursesService: CoursesService;
  let cacheService: RedisCacheService;
  let courseCycleRepository: CourseCycleRepository;
  let evaluationRepository: EvaluationRepository;

  const mockCycleId = 'cycle-123';
  const mockUserId = 'user-abc';

  const mockFullCycle = {
    id: mockCycleId,
    course: { name: 'Física I', code: 'FIS101' },
    academicCycle: { code: '2026-1', startDate: new Date('2026-01-01'), endDate: new Date('2026-07-01') },
  };

  const mockEvaluations = [
    {
      id: 'ev-1',
      name: 'Parcial 1',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-03-02'),
      evaluationType: { name: 'PARCIAL' },
      enrollmentEvaluations: [],
    },
    {
      id: 'ev-2',
      name: 'Final',
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-06-02'),
      evaluationType: { name: 'FINAL' },
      enrollmentEvaluations: [
        {
          isActive: true,
          accessStartDate: new Date('2026-06-01'),
          accessEndDate: new Date('2026-06-02'),
        }
      ],
    },
  ];

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: DataSource,
          useValue: { transaction: jest.fn() }
        },
        {
          provide: CourseRepository,
          useValue: {}
        },
        {
          provide: CourseTypeRepository,
          useValue: {}
        },
        {
          provide: CycleLevelRepository,
          useValue: {}
        },
        {
          provide: CourseCycleRepository,
          useValue: {
            findById: jest.fn().mockResolvedValue({}),
            findFullById: jest.fn().mockResolvedValue(mockFullCycle),
          },
        },
        {
          provide: EvaluationRepository,
          useValue: {
            findAllWithUserAccess: jest.fn().mockResolvedValue(mockEvaluations),
          },
        },
        {
          provide: CyclesService,
          useValue: {}
        },
        {
          provide: RedisCacheService,
          useValue: {
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue(null),
          },
        },
      ],
    }).compile();

    coursesService = moduleRef.get<CoursesService>(CoursesService);
    cacheService = moduleRef.get<RedisCacheService>(RedisCacheService);
    courseCycleRepository = moduleRef.get<CourseCycleRepository>(CourseCycleRepository);
    evaluationRepository = moduleRef.get<EvaluationRepository>(EvaluationRepository);
  });

  describe('getCourseContent', () => {
    it('should calculate LOCKED status correctly when user has no access', async () => {
      const result = await coursesService.getCourseContent(mockCycleId, mockUserId);
      const parcial = result.evaluations.find(e => e.id === 'ev-1');
      
      expect(parcial).toBeDefined();
      expect(parcial.userStatus.status).toBe('LOCKED');
      expect(parcial.userStatus.hasAccess).toBe(false);
    });

    it('should calculate STATUS based on current time vs access dates', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-05-01'));

      const result = await coursesService.getCourseContent(mockCycleId, mockUserId);
      const finalExam = result.evaluations.find(e => e.id === 'ev-2');

      expect(finalExam.userStatus.hasAccess).toBe(true);
      expect(finalExam.userStatus.status).toBe('UPCOMING');

      jest.useFakeTimers().setSystemTime(new Date('2026-06-01T12:00:00'));
      const resultInProgres = await coursesService.getCourseContent(mockCycleId, mockUserId);
      const finalInProgress = resultInProgres.evaluations.find(e => e.id === 'ev-2');
      expect(finalInProgress.userStatus.status).toBe('IN_PROGRESS');

      jest.useFakeTimers().setSystemTime(new Date('2026-07-01'));
      const resultExpired = await coursesService.getCourseContent(mockCycleId, mockUserId);
      const finalExpired = resultExpired.evaluations.find(e => e.id === 'ev-2');
      expect(finalExpired.userStatus.status).toBe('COMPLETED');
      
      jest.useRealTimers();
    });

    it('should use CACHE if available and skip DB calls', async () => {
      const cachedData = {
        cycle: mockFullCycle,
        evaluations: mockEvaluations,
      };
      (cacheService.get as jest.Mock).mockResolvedValue(cachedData);

      await coursesService.getCourseContent(mockCycleId, mockUserId);

      expect(cacheService.get).toHaveBeenCalled();
      expect(evaluationRepository.findAllWithUserAccess).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if cycle does not exist', async () => {
      (courseCycleRepository.findById as jest.Mock).mockResolvedValue(null);
      await expect(coursesService.getCourseContent('invalid-id', mockUserId))
        .rejects.toThrow(NotFoundException);
    });
  });
});