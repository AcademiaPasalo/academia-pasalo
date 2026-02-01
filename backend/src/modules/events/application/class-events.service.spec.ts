import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ClassEventsService } from '@modules/events/application/class-events.service';
import { ClassEventRepository } from '@modules/events/infrastructure/class-event.repository';
import { ClassEventProfessorRepository } from '@modules/events/infrastructure/class-event-professor.repository';
import { EvaluationRepository } from '@modules/evaluations/infrastructure/evaluation.repository';
import { EnrollmentEvaluationRepository } from '@modules/enrollments/infrastructure/enrollment-evaluation.repository';
import { UserRepository } from '@modules/users/infrastructure/user.repository';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';

describe('ClassEventsService', () => {
  let service: ClassEventsService;
  let classEventRepository: jest.Mocked<ClassEventRepository>;
  let classEventProfessorRepository: jest.Mocked<ClassEventProfessorRepository>;
  let evaluationRepository: jest.Mocked<EvaluationRepository>;
  let enrollmentEvaluationRepository: jest.Mocked<EnrollmentEvaluationRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let cacheService: jest.Mocked<RedisCacheService>;
  let dataSource: jest.Mocked<DataSource>;

  const mockAdmin = {
    id: 'admin-1',
    roles: [{ code: 'ADMIN' }],
  };

  const mockProfessor = {
    id: 'prof-1',
    roles: [{ code: 'PROFESSOR' }],
  };

  const mockStudent = {
    id: 'student-1',
    roles: [{ code: 'STUDENT' }],
  };

  const mockEvent = {
    id: 'event-1',
    evaluationId: 'eval-1',
    sessionNumber: 1,
    title: 'Clase 1',
    topic: 'Intro',
    startDatetime: new Date('2026-02-01T08:00:00Z'),
    endDatetime: new Date('2026-02-01T10:00:00Z'),
    meetingLink: 'http://link.com',
    isCancelled: false,
    createdBy: 'prof-1',
  };

  const mockEvaluation = {
    id: 'eval-1',
    courseCycleId: 'cycle-1',
    startDate: new Date('2026-01-01T00:00:00Z'),
    endDate: new Date('2026-12-31T23:59:59Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassEventsService,
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn((cb) => cb({ getRepository: jest.fn() })),
            query: jest.fn().mockResolvedValue([{ 1: 1 }]),
          },
        },
        {
          provide: ClassEventRepository,
          useValue: {
            create: jest.fn(),
            findByEvaluationAndSessionNumber: jest.fn(),
            findByEvaluationId: jest.fn(),
            findById: jest.fn(),
            findByIdSimple: jest.fn(),
            update: jest.fn(),
            cancelEvent: jest.fn(),
            findByUserAndRange: jest.fn(),
          },
        },
        {
          provide: ClassEventProfessorRepository,
          useValue: {
            assignProfessor: jest.fn(),
            isProfessorAssigned: jest.fn(),
            revokeProfessor: jest.fn(),
          },
        },
        {
          provide: EvaluationRepository,
          useValue: {
            findByIdWithCycle: jest.fn(),
          },
        },
        {
          provide: EnrollmentEvaluationRepository,
          useValue: {
            checkAccess: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: RedisCacheService,
          useValue: {
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue(undefined),
            del: jest.fn().mockResolvedValue(undefined),
            invalidateGroup: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<ClassEventsService>(ClassEventsService);
    classEventRepository = module.get(ClassEventRepository);
    classEventProfessorRepository = module.get(ClassEventProfessorRepository);
    evaluationRepository = module.get(EvaluationRepository);
    enrollmentEvaluationRepository = module.get(EnrollmentEvaluationRepository);
    userRepository = module.get(UserRepository);
    cacheService = module.get(RedisCacheService);
    dataSource = module.get(DataSource);
  });

  describe('createEvent', () => {
    it('debe crear un evento exitosamente', async () => {
      evaluationRepository.findByIdWithCycle.mockResolvedValue(mockEvaluation as any);
      classEventRepository.findByEvaluationAndSessionNumber.mockResolvedValue(null);
      classEventRepository.create.mockResolvedValue(mockEvent as any);

      await service.createEvent(
        'eval-1',
        1,
        'Clase 1',
        'Topic',
        new Date('2026-02-01T08:00:00Z'),
        new Date('2026-02-01T10:00:00Z'),
        'link',
        mockProfessor as any,
      );

      expect(classEventRepository.create).toHaveBeenCalled();
    });
  });

  describe('getEventsByEvaluation', () => {
    it('debe retornar eventos si el usuario es STAFF (Bypass)', async () => {
      userRepository.findById.mockResolvedValue(mockAdmin as any);
      classEventRepository.findByEvaluationId.mockResolvedValue([mockEvent] as any);

      const result = await service.getEventsByEvaluation('eval-1', 'admin-1');

      expect(result).toEqual([mockEvent]);
    });

    it('debe retornar eventos si el ALUMNO está matriculado', async () => {
      userRepository.findById.mockResolvedValue(mockStudent as any);
      enrollmentEvaluationRepository.checkAccess.mockResolvedValue(true);
      classEventRepository.findByEvaluationId.mockResolvedValue([mockEvent] as any);

      const result = await service.getEventsByEvaluation('eval-1', 'student-1');

      expect(result).toEqual([mockEvent]);
    });
  });

  describe('getEventDetail', () => {
    it('debe retornar detalle si el STAFF tiene acceso', async () => {
      classEventRepository.findById.mockResolvedValue(mockEvent as any);
      userRepository.findById.mockResolvedValue(mockAdmin as any);

      const result = await service.getEventDetail('event-1', 'admin-1');

      expect(result).toEqual(mockEvent);
    });
  });

  describe('checkUserAuthorization', () => {
    it('debe conceder acceso a ADMINS (Bypass Total)', async () => {
      userRepository.findById.mockResolvedValue(mockAdmin as any);
      const result = await service.checkUserAuthorization('admin-1', 'eval-1');
      expect(result).toBe(true);
    });

    it('debe conceder acceso a PROFESORES asignados', async () => {
      userRepository.findById.mockResolvedValue(mockProfessor as any);
      evaluationRepository.findByIdWithCycle.mockResolvedValue(mockEvaluation as any);
      dataSource.query.mockResolvedValue([{ 1: 1 }]); // Simular que está asignado

      const result = await service.checkUserAuthorization('prof-1', 'eval-1');
      expect(result).toBe(true);
    });

    it('debe denegar acceso a PROFESORES NO asignados', async () => {
      userRepository.findById.mockResolvedValue(mockProfessor as any);
      evaluationRepository.findByIdWithCycle.mockResolvedValue(mockEvaluation as any);
      dataSource.query.mockResolvedValue([]); // Simular que NO está asignado

      const result = await service.checkUserAuthorization('prof-1', 'eval-1');
      expect(result).toBe(false);
    });
  });
});
