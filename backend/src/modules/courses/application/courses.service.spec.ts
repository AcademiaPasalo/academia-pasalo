import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { CoursesService } from '@modules/courses/application/courses.service';
import { CourseRepository } from '@modules/courses/infrastructure/course.repository';
import { CourseTypeRepository } from '@modules/courses/infrastructure/course-type.repository';
import { CycleLevelRepository } from '@modules/courses/infrastructure/cycle-level.repository';
import { CourseCycleRepository } from '@modules/courses/infrastructure/course-cycle.repository';
import { CourseCycleProfessorRepository } from '@modules/courses/infrastructure/course-cycle-professor.repository';
import { EvaluationRepository } from '@modules/evaluations/infrastructure/evaluation.repository';
import { CyclesService } from '@modules/cycles/application/cycles.service';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import { STUDENT_EVALUATION_LABELS } from '@modules/courses/domain/student-course.constants';

describe('CoursesService student views', () => {
  let service: CoursesService;
  let dataSource: jest.Mocked<DataSource>;
  let courseCycleRepository: jest.Mocked<CourseCycleRepository>;
  let evaluationRepository: jest.Mocked<EvaluationRepository>;

  const currentCycle = {
    id: '100',
    courseId: '10',
    course: { id: '10', code: 'MAT', name: 'Matematica' },
    academicCycle: {
      id: '200',
      code: '2026-1',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-07-30'),
    },
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: DataSource,
          useValue: {
            query: jest.fn(),
            transaction: jest.fn(),
          },
        },
        { provide: CourseRepository, useValue: {} },
        { provide: CourseTypeRepository, useValue: {} },
        { provide: CycleLevelRepository, useValue: {} },
        {
          provide: CourseCycleRepository,
          useValue: {
            findFullById: jest.fn(),
            findPreviousByCourseId: jest.fn(),
            findByCourseIdAndCycleCode: jest.fn(),
            hasAccessiblePreviousByCourseIdAndUserId: jest.fn(),
          },
        },
        { provide: CourseCycleProfessorRepository, useValue: {} },
        {
          provide: EvaluationRepository,
          useValue: {
            findAllWithUserAccess: jest.fn(),
          },
        },
        { provide: CyclesService, useValue: {} },
        {
          provide: RedisCacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            invalidateGroup: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(CoursesService);
    dataSource = module.get(DataSource);
    courseCycleRepository = module.get(CourseCycleRepository);
    evaluationRepository = module.get(EvaluationRepository);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return current cycle labels and canViewPreviousCycles=true for FULL', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-04-15T12:00:00.000Z'));

    (courseCycleRepository.findFullById as jest.Mock).mockResolvedValue(
      currentCycle,
    );
    (dataSource.query as jest.Mock).mockResolvedValue([{ typeCode: 'FULL' }]);
    (evaluationRepository.findAllWithUserAccess as jest.Mock).mockResolvedValue(
      [
        {
          id: 'e1',
          number: 1,
          startDate: new Date('2026-03-01'),
          endDate: new Date('2026-03-02'),
          evaluationType: { code: 'PC', name: 'PRACTICA CALIFICADA' },
          enrollmentEvaluations: [],
        },
        {
          id: 'e2',
          number: 2,
          startDate: new Date('2026-04-10'),
          endDate: new Date('2026-04-20'),
          evaluationType: { code: 'PC', name: 'PRACTICA CALIFICADA' },
          enrollmentEvaluations: [
            {
              isActive: true,
              accessStartDate: new Date('2026-04-10'),
              accessEndDate: new Date('2026-04-20'),
            },
          ],
        },
        {
          id: 'e3',
          number: 3,
          startDate: new Date('2026-05-10'),
          endDate: new Date('2026-05-20'),
          evaluationType: { code: 'PC', name: 'PRACTICA CALIFICADA' },
          enrollmentEvaluations: [
            {
              isActive: true,
              accessStartDate: new Date('2026-05-10'),
              accessEndDate: new Date('2026-05-20'),
            },
          ],
        },
        {
          id: 'e4',
          number: 1,
          startDate: new Date('2026-06-10'),
          endDate: new Date('2026-06-20'),
          evaluationType: { code: 'EX', name: 'EXAMEN' },
          enrollmentEvaluations: [],
        },
      ],
    );

    const result = await service.getStudentCurrentCycleContent('100', '501');

    expect(result.canViewPreviousCycles).toBe(true);
    expect(result.evaluations[0].label).toBe(STUDENT_EVALUATION_LABELS.COMPLETED);
    expect(result.evaluations[1].label).toBe(
      STUDENT_EVALUATION_LABELS.IN_PROGRESS,
    );
    expect(result.evaluations[2].label).toBe(STUDENT_EVALUATION_LABELS.UPCOMING);
    expect(result.evaluations[3].label).toBe(STUDENT_EVALUATION_LABELS.LOCKED);
    expect(result.evaluations[0].shortName).toBe('PC1');
    expect(result.evaluations[0].fullName).toBe('Practica Calificada 1');
  });

  it('should hide previous-cycles tab for PARTIAL without previous access', async () => {
    (courseCycleRepository.findFullById as jest.Mock).mockResolvedValue(
      currentCycle,
    );
    (dataSource.query as jest.Mock).mockResolvedValue([{ typeCode: 'PARTIAL' }]);
    (
      courseCycleRepository.hasAccessiblePreviousByCourseIdAndUserId as jest.Mock
    ).mockResolvedValue(false);
    (evaluationRepository.findAllWithUserAccess as jest.Mock).mockResolvedValue(
      [],
    );

    const result = await service.getStudentCurrentCycleContent('100', '501');
    expect(result.canViewPreviousCycles).toBe(false);

    await expect(
      service.getStudentPreviousCycles('100', '501'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should list all previous cycles when tab is enabled', async () => {
    (courseCycleRepository.findFullById as jest.Mock).mockResolvedValue(
      currentCycle,
    );
    (dataSource.query as jest.Mock).mockResolvedValue([{ typeCode: 'PARTIAL' }]);
    (
      courseCycleRepository.hasAccessiblePreviousByCourseIdAndUserId as jest.Mock
    ).mockResolvedValue(true);
    (courseCycleRepository.findPreviousByCourseId as jest.Mock).mockResolvedValue(
      [
        { academicCycle: { code: '2025-2' } },
        { academicCycle: { code: '2025-1' } },
      ],
    );

    const result = await service.getStudentPreviousCycles('100', '501');
    expect(result.cycles).toEqual([
      { cycleCode: '2025-2' },
      { cycleCode: '2025-1' },
    ]);
  });

  it('should return archived/locked labels on previous cycle content', async () => {
    (courseCycleRepository.findFullById as jest.Mock).mockResolvedValue(
      currentCycle,
    );
    (dataSource.query as jest.Mock).mockResolvedValue([{ typeCode: 'FULL' }]);
    (courseCycleRepository.findByCourseIdAndCycleCode as jest.Mock).mockResolvedValue(
      {
        id: '55',
        academicCycle: { code: '2025-2', startDate: new Date('2025-01-01') },
      },
    );
    (evaluationRepository.findAllWithUserAccess as jest.Mock).mockResolvedValue(
      [
        {
          id: 'p1',
          number: 1,
          evaluationType: { code: 'PC', name: 'PRACTICA CALIFICADA' },
          enrollmentEvaluations: [
            {
              isActive: true,
              accessStartDate: new Date('2025-01-01'),
              accessEndDate: new Date('2025-02-01'),
            },
          ],
        },
        {
          id: 'p2',
          number: 2,
          evaluationType: { code: 'PC', name: 'PRACTICA CALIFICADA' },
          enrollmentEvaluations: [],
        },
      ],
    );

    const result = await service.getStudentPreviousCycleContent(
      '100',
      '2025-2',
      '501',
    );

    expect(result.evaluations[0].label).toBe(STUDENT_EVALUATION_LABELS.ARCHIVED);
    expect(result.evaluations[1].label).toBe(STUDENT_EVALUATION_LABELS.LOCKED);
  });

  it('should throw ForbiddenException when user has no active enrollment', async () => {
    (courseCycleRepository.findFullById as jest.Mock).mockResolvedValue(
      currentCycle,
    );
    (dataSource.query as jest.Mock).mockResolvedValue([]);

    await expect(
      service.getStudentCurrentCycleContent('100', '501'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should throw NotFoundException when requested cycle code is not previous', async () => {
    (courseCycleRepository.findFullById as jest.Mock).mockResolvedValue(
      currentCycle,
    );
    (dataSource.query as jest.Mock).mockResolvedValue([{ typeCode: 'FULL' }]);
    (courseCycleRepository.findByCourseIdAndCycleCode as jest.Mock).mockResolvedValue(
      {
        id: '200',
        academicCycle: { code: '2026-1', startDate: new Date('2026-01-01') },
      },
    );

    await expect(
      service.getStudentPreviousCycleContent('100', '2026-1', '501'),
    ).rejects.toThrow(NotFoundException);
  });
});
