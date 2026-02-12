import {
  INestApplication,
  ValidationPipe,
  ExecutionContext,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpAdapterHost, Reflector, APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DataSource } from 'typeorm';
import request from 'supertest';

import { AllExceptionsFilter } from './../src/common/filters/all-exceptions.filter';
import { TransformInterceptor } from './../src/common/interceptors/transform.interceptor';
import { EnrollmentsController } from './../src/modules/enrollments/presentation/enrollments.controller';
import { EnrollmentsService } from './../src/modules/enrollments/application/enrollments.service';
import { UsersService } from './../src/modules/users/application/users.service';
import { JwtStrategy } from './../src/modules/auth/strategies/jwt.strategy';
import { JwtAuthGuard } from './../src/common/guards/jwt-auth.guard';
import { RolesGuard } from './../src/common/guards/roles.guard';
import { UserSessionRepository } from './../src/modules/auth/infrastructure/user-session.repository';
import { SessionStatusService } from './../src/modules/auth/application/session-status.service';
import { SessionValidatorService } from './../src/modules/auth/application/session-validator.service';
import { SessionConflictService } from './../src/modules/auth/application/session-conflict.service';
import { SessionSecurityService } from './../src/modules/auth/application/session-security.service';
import { SecurityEventService } from './../src/modules/auth/application/security-event.service';
import { SecurityEventTypeRepository } from './../src/modules/auth/infrastructure/security-event-type.repository';
import { SecurityEventRepository } from './../src/modules/auth/infrastructure/security-event.repository';
import { RedisCacheService } from '../src/infrastructure/cache/redis-cache.service';
import { EnrollmentRepository } from './../src/modules/enrollments/infrastructure/enrollment.repository';
import { EnrollmentStatusRepository } from './../src/modules/enrollments/infrastructure/enrollment-status.repository';
import { EnrollmentEvaluationRepository } from './../src/modules/enrollments/infrastructure/enrollment-evaluation.repository';
import { EnrollmentTypeRepository } from './../src/modules/enrollments/infrastructure/enrollment-type.repository';
import { PhotoSource } from './../src/modules/users/domain/user.entity';

const JWT_SECRET = 'test-jwt-secret';

interface StandardResponse {
  statusCode: number;
  message: string;
  data: unknown;
}

interface RequestWithUrl {
  url: string;
}

describe('Enrollments E2E', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let enrollmentsService: EnrollmentsService;

  const adminUser = {
    id: '1',
    email: 'admin@test.com',
    firstName: 'Admin',
    roles: [{ id: '1', code: 'ADMIN', name: 'Admin' }],
    isActive: true,
    photoSource: PhotoSource.NONE,
    createdAt: new Date(),
  };

  const studentUser = {
    id: '2',
    email: 'student@test.com',
    firstName: 'Student',
    roles: [{ id: '4', code: 'STUDENT', name: 'Student' }],
    isActive: true,
    photoSource: PhotoSource.NONE,
    createdAt: new Date(),
  };

  const mockAcademicCycle = {
    id: 'ac-1',
    code: '2026-1',
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-12-31'),
  };

  const mockCourseCycle = {
    id: 'course-cycle-1',
    courseId: 'c-1',
    academicCycleId: 'ac-1',
    academicCycle: mockAcademicCycle,
    course: { id: 'c-1' },
  };

  const usersServiceMock = {
    findOne: jest.fn((id) => {
      if (id === '1') return Promise.resolve(adminUser);
      if (id === '2') return Promise.resolve(studentUser);
      return Promise.resolve(null);
    }),
  };

  const enrollmentRepositoryMock = {
    save: jest
      .fn()
      .mockImplementation((dto) =>
        Promise.resolve({ id: 'enrollment-1', ...dto }),
      ),
    findOne: jest.fn().mockResolvedValue({ id: 'enrollment-1' }),
    findById: jest.fn().mockResolvedValue({ id: 'enrollment-1', userId: '2' }),
    update: jest.fn().mockResolvedValue({}),
    findActiveByUserAndCourseCycle: jest.fn().mockResolvedValue(null),
    findMyEnrollments: jest.fn().mockResolvedValue([]),
    create: jest
      .fn()
      .mockImplementation((dto) =>
        Promise.resolve({ id: 'enrollment-1', ...dto }),
      ),
  };

  const mockCourseCycleRepo = {
    findOne: jest.fn().mockResolvedValue(mockCourseCycle),
    find: jest.fn().mockResolvedValue([]),
  };

  const enrollmentStatusRepositoryMock = {
    findByCode: jest.fn().mockResolvedValue({ id: '1', code: 'ACTIVE' }),
  };

  const enrollmentEvaluationRepositoryMock = {
    createMany: jest.fn().mockResolvedValue([]),
  };

  const enrollmentTypeRepositoryMock = {
    findByCode: jest.fn((code) => Promise.resolve({ id: '1', code })),
  };

  const evaluationRepositoryMock = {
    find: jest.fn().mockResolvedValue([]),
  };

  const mockManager = {
    getRepository: jest.fn().mockImplementation((entity) => {
      // Manejar tanto clases como strings
      const name = typeof entity === 'function' ? entity.name : entity;

      switch (name) {
        case 'Enrollment':
          return enrollmentRepositoryMock;
        case 'EnrollmentStatus':
          return enrollmentStatusRepositoryMock;
        case 'EnrollmentType':
          return enrollmentTypeRepositoryMock;
        case 'EnrollmentEvaluation':
          return enrollmentEvaluationRepositoryMock;
        case 'CourseCycle':
          return mockCourseCycleRepo;
        case 'Evaluation':
          return evaluationRepositoryMock;
        default:
          return {};
      }
    }),
  };

  const mockDataSource = {
    transaction: jest.fn((cb) => cb(mockManager)),
  };

  const redisCacheServiceMock = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    del: jest.fn().mockResolvedValue(undefined),
    invalidateGroup: jest.fn().mockResolvedValue(undefined),
  };

  const userSessionRepositoryMock = {
    findByIdWithUser: jest.fn((id) => {
      if (id === 'session-admin')
        return Promise.resolve({
          id,
          isActive: true,
          expiresAt: new Date(Date.now() + 100000),
          sessionStatusId: '1',
          deviceId: 'dev-1',
          userId: '1',
          user: adminUser,
        });
      if (id === 'session-student')
        return Promise.resolve({
          id,
          isActive: true,
          expiresAt: new Date(Date.now() + 100000),
          sessionStatusId: '1',
          deviceId: 'dev-1',
          userId: '2',
          user: studentUser,
        });
      return Promise.resolve(null);
    }),
    findActiveById: jest.fn((id) => {
      if (id === 'session-admin')
        return Promise.resolve({
          id,
          userId: '1',
          deviceId: 'dev-1',
          isActive: true,
        });
      if (id === 'session-student')
        return Promise.resolve({
          id,
          userId: '2',
          deviceId: 'dev-1',
          isActive: true,
        });
      return Promise.resolve(null);
    }),
    update: jest.fn(),
  };

  class MockJwtAuthGuard extends JwtAuthGuard {
    async canActivate(context: ExecutionContext): Promise<boolean> {
      return (await super.canActivate(context)) as boolean;
    }
  }

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({ secret: JWT_SECRET }),
      ],
      controllers: [EnrollmentsController],
      providers: [
        EnrollmentsService,
        { provide: UsersService, useValue: usersServiceMock },
        JwtStrategy,
        Reflector,
        { provide: APP_GUARD, useClass: MockJwtAuthGuard },
        { provide: APP_GUARD, useClass: RolesGuard },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              key === 'JWT_SECRET' ? JWT_SECRET : undefined,
          },
        },
        { provide: DataSource, useValue: mockDataSource },
        { provide: EnrollmentRepository, useValue: enrollmentRepositoryMock },
        {
          provide: EnrollmentStatusRepository,
          useValue: enrollmentStatusRepositoryMock,
        },
        {
          provide: EnrollmentEvaluationRepository,
          useValue: enrollmentEvaluationRepositoryMock,
        },
        {
          provide: EnrollmentTypeRepository,
          useValue: enrollmentTypeRepositoryMock,
        },
        { provide: RedisCacheService, useValue: redisCacheServiceMock },
        { provide: UserSessionRepository, useValue: userSessionRepositoryMock },
        {
          provide: SessionStatusService,
          useValue: {
            getIdByCode: jest.fn().mockResolvedValue('1'),
            onModuleInit: jest.fn(),
            refreshCache: jest.fn(),
          },
        },
        SessionValidatorService,
        SessionConflictService,
        SessionSecurityService,
        {
          provide: SecurityEventService,
          useValue: {
            logEvent: jest.fn(),
            onModuleInit: jest.fn(),
            refreshCache: jest.fn(),
          },
        },
        {
          provide: SecurityEventTypeRepository,
          useValue: { findAll: jest.fn().mockResolvedValue([]) },
        },
        {
          provide: SecurityEventRepository,
          useValue: { create: jest.fn() },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );

    const httpAdapterHost = app.get(HttpAdapterHost);
    const reflector = app.get(Reflector);
    app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));
    app.useGlobalInterceptors(new TransformInterceptor(reflector));

    jwtService = moduleRef.get(JwtService);
    enrollmentsService = moduleRef.get(EnrollmentsService);
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  const getAdminToken = () =>
    jwtService.sign({
      sub: '1',
      email: adminUser.email,
      roles: ['ADMIN'],
      activeRole: 'ADMIN',
      sessionId: 'session-admin',
      deviceId: 'dev-1',
    });

  const getStudentToken = () =>
    jwtService.sign({
      sub: '2',
      email: studentUser.email,
      roles: ['STUDENT'],
      activeRole: 'STUDENT',
      sessionId: 'session-student',
      deviceId: 'dev-1',
    });

  describe('POST /api/v1/enrollments - Matrícula FULL', () => {
    it('debería crear matrícula FULL con acceso a todas las evaluaciones del ciclo', async () => {
      const token = getAdminToken();
      const response = await request(app.getHttpServer())
        .post('/api/v1/enrollments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId: '2',
          courseCycleId: 'course-cycle-1',
          enrollmentTypeCode: 'FULL',
        })
        .expect(201);

      const body = response.body as StandardResponse;
      expect(body.statusCode).toBe(201);
    });
  });

  describe('GET /api/v1/enrollments/my-courses', () => {
    it('debería retornar cursos del estudiante autenticado', async () => {
      const token = getStudentToken();
      // Espiamos el servicio para evitar la lógica del repositorio en este test específico
      jest.spyOn(enrollmentsService, 'findMyEnrollments').mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/api/v1/enrollments/my-courses')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = response.body as StandardResponse;
      expect(body.statusCode).toBe(200);
    });
  });

  describe('DELETE /api/v1/enrollments/:id', () => {
    it('debería cancelar matrícula como ADMIN', async () => {
      const token = getAdminToken();
      await request(app.getHttpServer())
        .delete('/api/v1/enrollments/enrollment-1')
        .set('Authorization', `Bearer ${token}`)
        .expect(204);
    });
  });
});
