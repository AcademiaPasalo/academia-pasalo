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
import { PhotoSource } from '@modules/users/domain/user.entity';

describe('ClassEventsService', () => {
  let service: ClassEventsService;
  let classEventRepository: jest.Mocked<ClassEventRepository>;
  let classEventProfessorRepository: jest.Mocked<ClassEventProfessorRepository>;
  let evaluationRepository: jest.Mocked<EvaluationRepository>;
  let enrollmentEvaluationRepository: jest.Mocked<EnrollmentEvaluationRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let cacheService: jest.Mocked<RedisCacheService>;

  const mockAdmin = {
    id: 'admin-1',
    email: 'admin@test.com',
    firstName: 'Admin',
    roles: [{ id: '1', code: 'ADMIN', name: 'Admin' }],
  };

  const mockProfessor = {
    id: 'prof-1',
    email: 'prof@test.com',
    firstName: 'Professor',
    roles: [{ id: '2', code: 'PROFESSOR', name: 'Professor' }],
  };

  const mockStudent = {
    id: 'student-1',
    email: 'student@test.com',
    firstName: 'Student',
    roles: [{ id: '3', code: 'STUDENT', name: 'Student' }],
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
  });

  describe('createEvent', () => {
    it('debe crear un evento exitosamente', async () => {
      evaluationRepository.findByIdWithCycle.mockResolvedValue(mockEvaluation as any);
      classEventRepository.findByEvaluationAndSessionNumber.mockResolvedValue(null);
      classEventRepository.create.mockResolvedValue(mockEvent as any);
      classEventRepository.findById.mockResolvedValue(mockEvent as any);

      const result = await service.createEvent(
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
      expect(classEventProfessorRepository.assignProfessor).toHaveBeenCalledWith(
        'event-1',
        'prof-1',
        expect.anything(),
      );
    });

    it('debe lanzar error si la evaluación no existe', async () => {
      evaluationRepository.findByIdWithCycle.mockResolvedValue(null);

      await expect(
        service.createEvent('eval-1', 1, 'Clase 1', 'Topic', new Date(), new Date(), 'link', mockProfessor as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getEventsByEvaluation', () => {
    it('debe retornar eventos si el usuario tiene acceso (Staff)', async () => {
      userRepository.findById.mockResolvedValue(mockProfessor as any);
      classEventRepository.findByEvaluationId.mockResolvedValue([mockEvent] as any);

      const result = await service.getEventsByEvaluation('eval-1', 'prof-1');

      expect(result).toEqual([mockEvent]);
      expect(classEventRepository.findByEvaluationId).toHaveBeenCalled();
    });

    it('debe retornar eventos si el usuario tiene acceso (Alumno con matrícula)', async () => {
      userRepository.findById.mockResolvedValue(mockStudent as any);
      enrollmentEvaluationRepository.checkAccess.mockResolvedValue(true);
      classEventRepository.findByEvaluationId.mockResolvedValue([mockEvent] as any);

      const result = await service.getEventsByEvaluation('eval-1', 'student-1');

      expect(result).toEqual([mockEvent]);
    });

    it('debe lanzar error si el usuario no tiene acceso', async () => {
      userRepository.findById.mockResolvedValue(mockStudent as any);
      enrollmentEvaluationRepository.checkAccess.mockResolvedValue(false);

      await expect(service.getEventsByEvaluation('eval-1', 'student-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getEventDetail', () => {
    it('debe retornar detalle del evento si tiene acceso', async () => {
      classEventRepository.findById.mockResolvedValue(mockEvent as any);
      userRepository.findById.mockResolvedValue(mockProfessor as any);

      const result = await service.getEventDetail('event-1', 'prof-1');

      expect(result).toEqual(mockEvent);
    });

    it('debe lanzar error si el evento no existe', async () => {
      classEventRepository.findById.mockResolvedValue(null);

      await expect(service.getEventDetail('event-1', 'prof-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateEvent', () => {
    it('debe actualizar un evento exitosamente (Admin bypass)', async () => {
      classEventRepository.findByIdSimple.mockResolvedValue(mockEvent as any);
      classEventRepository.update.mockResolvedValue({ ...mockEvent, title: 'Updated' } as any);

      const result = await service.updateEvent('event-1', mockAdmin as any, 'Updated');

      expect(result.title).toBe('Updated');
      expect(classEventRepository.update).toHaveBeenCalled();
    });

    it('debe lanzar error si no es el creador ni admin', async () => {
      classEventRepository.findByIdSimple.mockResolvedValue(mockEvent as any);

      await expect(
        service.updateEvent('event-1', mockStudent as any, 'Hack'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('cancelEvent', () => {
    it('debe cancelar un evento exitosamente', async () => {
      classEventRepository.findByIdSimple.mockResolvedValue(mockEvent as any);

      await service.cancelEvent('event-1', mockProfessor as any);

      expect(classEventRepository.cancelEvent).toHaveBeenCalledWith('event-1');
    });
  });

  describe('checkUserAuthorization', () => {
    it('debe conceder acceso a Profesores', async () => {
      userRepository.findById.mockResolvedValue(mockProfessor as any);
      const result = await service.checkUserAuthorization('prof-1', 'eval-1');
      expect(result).toBe(true);
    });

    it('debe conceder acceso a Alumnos matriculados', async () => {
      userRepository.findById.mockResolvedValue(mockStudent as any);
      enrollmentEvaluationRepository.checkAccess.mockResolvedValue(true);
      const result = await service.checkUserAuthorization('student-1', 'eval-1');
      expect(result).toBe(true);
    });

    it('debe denegar acceso a Alumnos NO matriculados', async () => {
      userRepository.findById.mockResolvedValue(mockStudent as any);
      enrollmentEvaluationRepository.checkAccess.mockResolvedValue(false);
      const result = await service.checkUserAuthorization('student-1', 'eval-1');
      expect(result).toBe(false);
    });
  });
});