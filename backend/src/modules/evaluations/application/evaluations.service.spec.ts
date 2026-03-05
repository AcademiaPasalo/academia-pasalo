import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EvaluationsService } from '@modules/evaluations/application/evaluations.service';
import { EvaluationRepository } from '@modules/evaluations/infrastructure/evaluation.repository';
import { CourseCycleRepository } from '@modules/courses/infrastructure/course-cycle.repository';
import { CourseCycleProfessorRepository } from '@modules/courses/infrastructure/course-cycle-professor.repository';
import { CourseCycleAllowedEvaluationTypeRepository } from '@modules/courses/infrastructure/course-cycle-allowed-evaluation-type.repository';
import { AcademicCycleRepository } from '@modules/cycles/infrastructure/academic-cycle.repository';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import { DataSource } from 'typeorm';

describe('EvaluationsService create', () => {
  let service: EvaluationsService;
  let evaluationRepository: jest.Mocked<EvaluationRepository>;
  let courseCycleRepository: jest.Mocked<CourseCycleRepository>;
  let courseCycleAllowedEvaluationTypeRepository: jest.Mocked<CourseCycleAllowedEvaluationTypeRepository>;
  let academicCycleRepository: jest.Mocked<AcademicCycleRepository>;
  let dataSource: jest.Mocked<DataSource>;
  let cacheService: jest.Mocked<RedisCacheService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluationsService,
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn(),
          },
        },
        {
          provide: EvaluationRepository,
          useValue: {
            create: jest.fn(),
            findByCourseCycle: jest.fn(),
          },
        },
        {
          provide: CourseCycleRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: CourseCycleProfessorRepository,
          useValue: {
            isProfessorAssigned: jest.fn(),
          },
        },
        {
          provide: CourseCycleAllowedEvaluationTypeRepository,
          useValue: {
            findActiveByCourseCycleId: jest.fn(),
          },
        },
        {
          provide: AcademicCycleRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: RedisCacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            invalidateGroup: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(EvaluationsService);
    evaluationRepository = module.get(EvaluationRepository);
    courseCycleRepository = module.get(CourseCycleRepository);
    dataSource = module.get(DataSource);
    courseCycleAllowedEvaluationTypeRepository = module.get(
      CourseCycleAllowedEvaluationTypeRepository,
    );
    academicCycleRepository = module.get(AcademicCycleRepository);
    cacheService = module.get(RedisCacheService);
    (dataSource.transaction as jest.Mock).mockImplementation(
      async (cb) => await cb({}),
    );
  });

  it('should create evaluation when type is allowed in structure', async () => {
    (courseCycleRepository.findById as jest.Mock).mockResolvedValue({
      id: '10',
      academicCycleId: '20',
    });
    (academicCycleRepository.findById as jest.Mock).mockResolvedValue({
      id: '20',
      startDate: new Date('2026-01-01T00:00:00.000Z'),
      endDate: new Date('2026-07-30T23:59:59.000Z'),
    });
    (
      courseCycleAllowedEvaluationTypeRepository.findActiveByCourseCycleId as jest.Mock
    ).mockResolvedValue([{ evaluationTypeId: '2' }]);
    (evaluationRepository.create as jest.Mock).mockResolvedValue({
      id: '200',
      courseCycleId: '10',
      evaluationTypeId: '2',
      number: 1,
    });

    const result = await service.create({
      courseCycleId: '10',
      evaluationTypeId: '2',
      number: 1,
      startDate: '2026-02-01T05:00:00.000Z',
      endDate: '2026-02-01T23:59:59.000Z',
    });

    expect(result.id).toBe('200');
    expect(evaluationRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        courseCycleId: '10',
        evaluationTypeId: '2',
      }),
      expect.anything(),
    );
    expect(cacheService.invalidateGroup).toHaveBeenCalled();
  });

  it('should reject create when structure is empty for course-cycle', async () => {
    (courseCycleRepository.findById as jest.Mock).mockResolvedValue({
      id: '10',
      academicCycleId: '20',
    });
    (academicCycleRepository.findById as jest.Mock).mockResolvedValue({
      id: '20',
      startDate: new Date('2026-01-01T00:00:00.000Z'),
      endDate: new Date('2026-07-30T23:59:59.000Z'),
    });
    (
      courseCycleAllowedEvaluationTypeRepository.findActiveByCourseCycleId as jest.Mock
    ).mockResolvedValue([]);

    await expect(
      service.create({
        courseCycleId: '10',
        evaluationTypeId: '2',
        number: 1,
        startDate: '2026-02-01T05:00:00.000Z',
        endDate: '2026-02-01T23:59:59.000Z',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(evaluationRepository.create).not.toHaveBeenCalled();
  });

  it('should reject create when type is not allowed in structure', async () => {
    (courseCycleRepository.findById as jest.Mock).mockResolvedValue({
      id: '10',
      academicCycleId: '20',
    });
    (academicCycleRepository.findById as jest.Mock).mockResolvedValue({
      id: '20',
      startDate: new Date('2026-01-01T00:00:00.000Z'),
      endDate: new Date('2026-07-30T23:59:59.000Z'),
    });
    (
      courseCycleAllowedEvaluationTypeRepository.findActiveByCourseCycleId as jest.Mock
    ).mockResolvedValue([{ evaluationTypeId: '3' }]);

    await expect(
      service.create({
        courseCycleId: '10',
        evaluationTypeId: '2',
        number: 1,
        startDate: '2026-02-01T05:00:00.000Z',
        endDate: '2026-02-01T23:59:59.000Z',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(evaluationRepository.create).not.toHaveBeenCalled();
  });

  it('should reject blank evaluationTypeId', async () => {
    await expect(
      service.create({
        courseCycleId: '10',
        evaluationTypeId: '   ',
        number: 1,
        startDate: '2026-02-01T05:00:00.000Z',
        endDate: '2026-02-01T23:59:59.000Z',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject create when course-cycle does not exist', async () => {
    (courseCycleRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      service.create({
        courseCycleId: 'missing',
        evaluationTypeId: '2',
        number: 1,
        startDate: '2026-02-01T05:00:00.000Z',
        endDate: '2026-02-01T23:59:59.000Z',
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
