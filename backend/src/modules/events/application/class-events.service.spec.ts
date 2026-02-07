import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, EntityManager } from 'typeorm';
import { ClassEventsService } from '@modules/events/application/class-events.service';
import { ClassEventRepository } from '@modules/events/infrastructure/class-event.repository';
import { ClassEventProfessorRepository } from '@modules/events/infrastructure/class-event-professor.repository';
import { EvaluationRepository } from '@modules/evaluations/infrastructure/evaluation.repository';
import { EnrollmentEvaluationRepository } from '@modules/enrollments/infrastructure/enrollment-evaluation.repository';
import { UserRepository } from '@modules/users/infrastructure/user.repository';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import { User } from '@modules/users/domain/user.entity';
import { ClassEvent } from '@modules/events/domain/class-event.entity';
import { Evaluation } from '@modules/evaluations/domain/evaluation.entity';

describe('ClassEventsService', () => {
  let service: ClassEventsService;
  let classEventRepository: jest.Mocked<ClassEventRepository>;
  let evaluationRepository: jest.Mocked<EvaluationRepository>;
  let enrollmentEvaluationRepository: jest.Mocked<EnrollmentEvaluationRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let cacheService: jest.Mocked<RedisCacheService>;
  let dataSource: jest.Mocked<DataSource>;

  const mockAdmin = {
    id: 'admin-1',
    roles: [{ code: 'ADMIN' }],
  } as User;

  const mockProfessor = {
    id: 'prof-1',
    roles: [{ code: 'PROFESSOR' }],
  } as User;

  const mockStudent = {
    id: 'student-1',
    roles: [{ code: 'STUDENT' }],
  } as User;

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
  } as ClassEvent;

  const mockEvaluation = {
    id: 'eval-1',
    courseCycleId: 'cycle-1',
    startDate: new Date('2026-01-01T00:00:00Z'),
    endDate: new Date('2026-12-31T23:59:59Z'),
  } as Evaluation;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassEventsService,
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn((cb: (manager: unknown) => Promise<unknown>) =>
              cb({ getRepository: jest.fn() }),
            ),
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
    evaluationRepository = module.get(EvaluationRepository);
    enrollmentEvaluationRepository = module.get(EnrollmentEvaluationRepository);
    userRepository = module.get(UserRepository);
    cacheService = module.get(RedisCacheService);
    dataSource = module.get(DataSource);
  });

  describe('createEvent', () => {
    it('debe crear un evento exitosamente', async () => {
      evaluationRepository.findByIdWithCycle.mockResolvedValue(mockEvaluation);
      classEventRepository.findByEvaluationAndSessionNumber.mockResolvedValue(
        null,
      );
      classEventRepository.create.mockResolvedValue(mockEvent);

      await service.createEvent(
        'eval-1',
        1,
        'Clase 1',
        'Topic',
        new Date('2026-02-01T08:00:00Z'),
        new Date('2026-02-01T10:00:00Z'),
        'link',
        mockProfessor,
      );

      expect(classEventRepository.create).toHaveBeenCalled();
    });
  });

  describe('getEventsByEvaluation', () => {
    it('debe retornar eventos si el usuario es STAFF (Bypass)', async () => {
      userRepository.findById.mockResolvedValue(mockAdmin);
      classEventRepository.findByEvaluationId.mockResolvedValue([mockEvent]);

      const result = await service.getEventsByEvaluation('eval-1', 'admin-1');

      expect(result).toEqual([mockEvent]);
    });

    it('debe retornar eventos si el ALUMNO está matriculado', async () => {
      userRepository.findById.mockResolvedValue(mockStudent);
      enrollmentEvaluationRepository.checkAccess.mockResolvedValue(true);
      classEventRepository.findByEvaluationId.mockResolvedValue([mockEvent]);

      const result = await service.getEventsByEvaluation('eval-1', 'student-1');

      expect(result).toEqual([mockEvent]);
    });
  });

  describe('getEventDetail', () => {
    it('debe retornar detalle si el STAFF tiene acceso', async () => {
      classEventRepository.findById.mockResolvedValue(mockEvent);
      userRepository.findById.mockResolvedValue(mockAdmin);

      const result = await service.getEventDetail('event-1', 'admin-1');

      expect(result).toEqual(mockEvent);
    });
  });

  describe('checkUserAuthorization', () => {
    it('debe conceder acceso a ADMINS (Bypass Total)', async () => {
      userRepository.findById.mockResolvedValue(mockAdmin);
      const result = await service.checkUserAuthorization('admin-1', 'eval-1');
      expect(result).toBe(true);
    });

    it('debe conceder acceso a PROFESORES asignados', async () => {
      userRepository.findById.mockResolvedValue(mockProfessor);
      evaluationRepository.findByIdWithCycle.mockResolvedValue(mockEvaluation);
      dataSource.query.mockResolvedValue([{ 1: 1 }]);

      const result = await service.checkUserAuthorization('prof-1', 'eval-1');
      expect(result).toBe(true);
    });

    it('debe denegar acceso a PROFESORES NO asignados', async () => {
      userRepository.findById.mockResolvedValue(mockProfessor);
      evaluationRepository.findByIdWithCycle.mockResolvedValue(mockEvaluation);
      dataSource.query.mockResolvedValue([]);

      const result = await service.checkUserAuthorization('prof-1', 'eval-1');
      expect(result).toBe(false);
    });
  });

  describe('canAccessMeetingLink', () => {
    it('no debe consultar userRepository.findById cuando recibe el User (admin bypass)', async () => {
      const now = Date.now();
      const event = {
        ...mockEvent,
        startDatetime: new Date(now + 60 * 60 * 1000),
        endDatetime: new Date(now + 2 * 60 * 60 * 1000),
      } as ClassEvent;

      const result = await service.canAccessMeetingLink(event, mockAdmin);

      expect(result).toBe(true);
      expect(userRepository.findById).not.toHaveBeenCalled();
    });

    it('debe denegar si el evento no tiene meetingLink sin consultar repositorios', async () => {
      const event = {
        ...mockEvent,
        meetingLink: null,
      } as unknown as ClassEvent;

      const result = await service.canAccessMeetingLink(event, mockAdmin);

      expect(result).toBe(false);
      expect(userRepository.findById).not.toHaveBeenCalled();
      expect(enrollmentEvaluationRepository.checkAccess).not.toHaveBeenCalled();
      expect(evaluationRepository.findByIdWithCycle).not.toHaveBeenCalled();
      expect(dataSource.query).not.toHaveBeenCalled();
    });

    it('como STUDENT debe consultar checkAccess (sin consultar userRepository.findById)', async () => {
      const now = Date.now();
      const event = {
        ...mockEvent,
        startDatetime: new Date(now + 60 * 60 * 1000),
        endDatetime: new Date(now + 2 * 60 * 60 * 1000),
      } as ClassEvent;
      enrollmentEvaluationRepository.checkAccess.mockResolvedValue(true);

      const result = await service.canAccessMeetingLink(event, mockStudent);

      expect(result).toBe(true);
      expect(userRepository.findById).not.toHaveBeenCalled();
      expect(enrollmentEvaluationRepository.checkAccess).toHaveBeenCalledWith(
        'student-1',
        'eval-1',
      );
    });

    it('como PROFESSOR debe consultar la evaluación y la asignación (sin consultar userRepository.findById)', async () => {
      const now = Date.now();
      const event = {
        ...mockEvent,
        startDatetime: new Date(now + 60 * 60 * 1000),
        endDatetime: new Date(now + 2 * 60 * 60 * 1000),
      } as ClassEvent;
      evaluationRepository.findByIdWithCycle.mockResolvedValue(mockEvaluation);
      dataSource.query.mockResolvedValue([{ 1: 1 }]);

      const result = await service.canAccessMeetingLink(event, mockProfessor);

      expect(result).toBe(true);
      expect(userRepository.findById).not.toHaveBeenCalled();
      expect(evaluationRepository.findByIdWithCycle).toHaveBeenCalledWith(
        'eval-1',
      );
      expect(dataSource.query).toHaveBeenCalled();
      expect(cacheService.set).toHaveBeenCalled();
    });
  });
});
