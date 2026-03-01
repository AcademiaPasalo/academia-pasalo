import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, EntityManager } from 'typeorm';
import { ClassEventsService } from '@modules/events/application/class-events.service';
import { ClassEventsPermissionService } from '@modules/events/application/class-events-permission.service';
import { ClassEventsSchedulingService } from '@modules/events/application/class-events-scheduling.service';
import { ClassEventsCacheService } from '@modules/events/application/class-events-cache.service';
import { ClassEventRepository } from '@modules/events/infrastructure/class-event.repository';
import { ClassEventProfessorRepository } from '@modules/events/infrastructure/class-event-professor.repository';
import { ClassEventRecordingStatusRepository } from '@modules/events/infrastructure/class-event-recording-status.repository';
import { EvaluationRepository } from '@modules/evaluations/infrastructure/evaluation.repository';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import { UserWithSession } from '@modules/auth/strategies/jwt.strategy';
import { ClassEvent } from '@modules/events/domain/class-event.entity';
import { Evaluation } from '@modules/evaluations/domain/evaluation.entity';
import { ROLE_CODES } from '@common/constants/role-codes.constants';
import { ForbiddenException } from '@nestjs/common';
import { CLASS_EVENT_STATUS } from '@modules/events/domain/class-event.constants';
import { NotificationsDispatchService } from '@modules/notifications/application/notifications-dispatch.service';

describe('ClassEventsService', () => {
  let service: ClassEventsService;
  let classEventRepository: jest.Mocked<ClassEventRepository>;
  let evaluationRepository: jest.Mocked<EvaluationRepository>;
  let permissionService: jest.Mocked<ClassEventsPermissionService>;
  let schedulingService: jest.Mocked<ClassEventsSchedulingService>;
  let cacheModuleService: jest.Mocked<ClassEventsCacheService>;

  const mockProfessor: UserWithSession = {
    id: 'prof-1',
    activeRole: ROLE_CODES.PROFESSOR,
    roles: [{ code: ROLE_CODES.PROFESSOR }],
  } as UserWithSession;

  const mockEvent = {
    id: 'event-1',
    evaluationId: 'eval-1',
    sessionNumber: 1,
    title: 'Clase 1',
    topic: 'Intro',
    startDatetime: new Date('2026-02-01T08:00:00Z'),
    endDatetime: new Date('2026-02-01T10:00:00Z'),
    liveMeetingUrl: 'http://link.com',
    recordingUrl: null,
    isCancelled: false,
    createdBy: 'prof-1',
  } as ClassEvent;

  const mockEvaluation = {
    id: 'eval-1',
    courseCycleId: 'cycle-1',
    courseCycle: {
      academicCycleId: 'ac-1',
      course: { courseTypeId: 'ct-1' },
    },
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
            transaction: jest.fn((arg1: unknown, arg2?: unknown) => {
              const runInTransaction = (
                typeof arg1 === 'function' ? arg1 : arg2
              ) as (manager: EntityManager) => Promise<unknown>;
              return runInTransaction({
                getRepository: jest.fn(),
                query: jest.fn().mockResolvedValue([{ acquired: 1 }]),
              } as unknown as EntityManager);
            }),
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
          provide: ClassEventRecordingStatusRepository,
          useValue: {
            findByCode: jest.fn().mockResolvedValue({
              id: '1',
              code: 'NOT_AVAILABLE',
              name: 'Grabación no disponible',
            }),
          },
        },
        {
          provide: EvaluationRepository,
          useValue: {
            findByIdWithCycle: jest.fn(),
          },
        },
        {
          provide: ClassEventsPermissionService,
          useValue: {
            checkUserAuthorization: jest.fn(),
            checkUserAuthorizationForUser: jest.fn(),
            assertMutationAllowedForEvaluation: jest.fn(),
            validateEventOwnership: jest.fn(),
            isAdminUser: jest.fn(),
          },
        },
        {
          provide: ClassEventsSchedulingService,
          useValue: {
            acquireCalendarLock: jest.fn().mockResolvedValue('lock-key'),
            releaseCalendarLock: jest.fn().mockResolvedValue(undefined),
            findOverlap: jest.fn().mockResolvedValue(null),
            validateEventDates: jest.fn().mockReturnValue(undefined),
          },
        },
        {
          provide: ClassEventsCacheService,
          useValue: {
            getRecordingStatusCacheKey: jest.fn().mockReturnValue('cache-key'),
            invalidateForEvaluation: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: RedisCacheService,
          useValue: {
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue(undefined),
            del: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: NotificationsDispatchService,
          useValue: {
            dispatchClassScheduled: jest.fn().mockResolvedValue(undefined),
            dispatchClassUpdated: jest.fn().mockResolvedValue(undefined),
            dispatchClassCancelled: jest.fn().mockResolvedValue(undefined),
            scheduleClassReminder: jest.fn().mockResolvedValue(undefined),
            cancelClassReminder: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<ClassEventsService>(ClassEventsService);
    classEventRepository = module.get(ClassEventRepository);
    evaluationRepository = module.get(EvaluationRepository);
    permissionService = module.get(ClassEventsPermissionService);
    schedulingService = module.get(ClassEventsSchedulingService);
    cacheModuleService = module.get(ClassEventsCacheService);

    // Default mocks behavior
    permissionService.checkUserAuthorization.mockResolvedValue(true);
    permissionService.checkUserAuthorizationForUser.mockResolvedValue(true);
    permissionService.assertMutationAllowedForEvaluation.mockResolvedValue(
      undefined,
    );
    permissionService.validateEventOwnership.mockReturnValue(undefined);
    permissionService.isAdminUser.mockReturnValue(false);
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
      expect(
        permissionService.assertMutationAllowedForEvaluation,
      ).toHaveBeenCalled();
      expect(schedulingService.acquireCalendarLock).toHaveBeenCalled();
      expect(cacheModuleService.invalidateForEvaluation).toHaveBeenCalled();
    });
  });

  describe('getEventsByEvaluation', () => {
    it('debe retornar eventos si el usuario tiene autorización', async () => {
      permissionService.checkUserAuthorization.mockResolvedValue(true);
      classEventRepository.findByEvaluationId.mockResolvedValue([mockEvent]);

      const result = await service.getEventsByEvaluation('eval-1', 'user-1');

      expect(result).toEqual([mockEvent]);
      expect(permissionService.checkUserAuthorization).toHaveBeenCalledWith(
        'user-1',
        'eval-1',
      );
    });

    it('debe lanzar ForbiddenException si no hay acceso', async () => {
      permissionService.checkUserAuthorization.mockResolvedValue(false);

      await expect(
        service.getEventsByEvaluation('eval-1', 'user-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Integridad de Tipos de Fecha', () => {
    it('debe calcular PROGRAMADA aunque la BD devuelva fechas como STRINGS', () => {
      const eventWithStrings = {
        startDatetime: '2026-12-01T10:00:00.000Z',
        endDatetime: '2026-12-01T12:00:00.000Z',
        isCancelled: false,
      } as unknown as ClassEvent;

      const status = service.calculateEventStatus(eventWithStrings);
      expect(status).toBe(CLASS_EVENT_STATUS.PROGRAMADA);
    });

    it('debe calcular correctamente usando una fecha de referencia externa (Atómica)', () => {
      const event = {
        startDatetime: new Date('2026-12-01T10:00:00Z'),
        endDatetime: new Date('2026-12-01T12:00:00Z'),
        isCancelled: false,
      } as ClassEvent;

      const referenceDate = new Date('2026-12-01T11:00:00Z');
      const status = service.calculateEventStatus(event, referenceDate);
      expect(status).toBe(CLASS_EVENT_STATUS.EN_CURSO);
    });
  });

  describe('updateEvent', () => {
    it('debe actualizar el evento exitosamente', async () => {
      classEventRepository.findByIdSimple.mockResolvedValue(mockEvent);
      evaluationRepository.findByIdWithCycle.mockResolvedValue(mockEvaluation);
      classEventRepository.update.mockResolvedValue({
        ...mockEvent,
        title: 'Updated',
      });

      await service.updateEvent('event-1', mockProfessor, 'Updated');

      expect(classEventRepository.update).toHaveBeenCalled();
      expect(permissionService.validateEventOwnership).toHaveBeenCalled();
      expect(cacheModuleService.invalidateForEvaluation).toHaveBeenCalled();
    });
  });
});
