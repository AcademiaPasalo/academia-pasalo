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
import { AuthController } from './../src/modules/auth/presentation/auth.controller';
import { AuthService } from './../src/modules/auth/application/auth.service';
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
import { UsersController } from './../src/modules/users/presentation/users.controller';
import { UsersService } from './../src/modules/users/application/users.service';
import { PhotoSource, User } from './../src/modules/users/domain/user.entity';
import { RedisCacheService } from '../src/infrastructure/cache/redis-cache.service';

const JWT_SECRET = 'test-jwt-secret';

interface StandardResponse {
  statusCode: number;
  message: string;
  data: unknown;
}

interface RequestWithUrl {
  url: string;
}

describe('IAM (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const adminUser = {
    id: '1',
    email: 'admin@test.com',
    firstName: 'Admin',
    lastName1: null as string | null,
    lastName2: null as string | null,
    phone: null as string | null,
    career: null as string | null,
    profilePhotoUrl: null as string | null,
    photoSource: PhotoSource.NONE,
    isActive: true,
    createdAt: new Date(),
    roles: [{ id: '1', code: 'ADMIN', name: 'Administrador' }],
  };

  const studentUser = {
    id: '2',
    email: 'student@test.com',
    firstName: 'Student',
    lastName1: null as string | null,
    lastName2: null as string | null,
    phone: null as string | null,
    career: null as string | null,
    profilePhotoUrl: null as string | null,
    photoSource: PhotoSource.NONE,
    isActive: true,
    createdAt: new Date(),
    roles: [{ id: '2', code: 'STUDENT', name: 'Alumno' }],
  };

  const authServiceMock = {
    loginWithGoogle: jest.fn(),
    logout: jest.fn(),
  };

  const usersServiceMock = {
    findOne: jest.fn((id) => {
      if (id === '1') return Promise.resolve(adminUser);
      if (id === '2') return Promise.resolve(studentUser);
      return Promise.resolve(null);
    }),
    findAll: jest.fn().mockResolvedValue([adminUser, studentUser]),
  };

  const userSessionRepositoryMock = {
    findByIdWithUser: jest.fn((id) => {
      if (id === 'session-admin')
        return Promise.resolve({
          id,
          isActive: true,
          expiresAt: new Date(Date.now() + 100000),
          user: adminUser,
          sessionStatusId: '1',
          deviceId: 'device-1',
          userId: adminUser.id,
        });
      if (id === 'session-student')
        return Promise.resolve({
          id,
          isActive: true,
          expiresAt: new Date(Date.now() + 100000),
          user: studentUser,
          sessionStatusId: '1',
          deviceId: 'device-1',
          userId: studentUser.id,
        });
      return Promise.resolve(null);
    }),
    update: jest.fn(),
    findActiveById: jest.fn((id) => {
      if (id === 'session-admin')
        return Promise.resolve({
          id,
          isActive: true,
          userId: adminUser.id,
          deviceId: 'device-1',
        });
      if (id === 'session-student')
        return Promise.resolve({
          id,
          isActive: true,
          userId: studentUser.id,
          deviceId: 'device-1',
        });
      return Promise.resolve(null);
    }),
  };

  class MockJwtAuthGuard extends JwtAuthGuard {
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const req = context.switchToHttp().getRequest<RequestWithUrl>();
      if (req.url.includes('/auth/google')) return true;
      return (await super.canActivate(context)) as boolean;
    }
  }

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({ secret: JWT_SECRET }),
      ],
      controllers: [AuthController, UsersController],
      providers: [
        JwtStrategy,
        Reflector,
        {
          provide: APP_GUARD,
          useClass: MockJwtAuthGuard,
        },
        {
          provide: APP_GUARD,
          useClass: RolesGuard,
        },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'JWT_SECRET') return JWT_SECRET;
              return undefined;
            },
          },
        },
        { provide: UsersService, useValue: usersServiceMock },
        { provide: AuthService, useValue: authServiceMock },
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
        { provide: DataSource, useValue: {} },
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
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const getAdminToken = () =>
    jwtService.sign({
      sub: '1',
      email: adminUser.email,
      roles: ['ADMIN'],
      activeRole: 'ADMIN',
      sessionId: 'session-admin',
      deviceId: 'device-1',
    });

  const getStudentToken = () =>
    jwtService.sign({
      sub: '2',
      email: studentUser.email,
      roles: ['STUDENT'],
      activeRole: 'STUDENT',
      sessionId: 'session-student',
      deviceId: 'device-1',
    });

  describe('POST /api/v1/auth/google', () => {
    it('retorna tokens dentro de data', async () => {
      authServiceMock.loginWithGoogle.mockResolvedValue({
        accessToken: 'mock-access',
        refreshToken: 'mock-refresh',
        user: adminUser,
        sessionStatus: 'ACTIVE',
        concurrentSessionId: null,
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/google')
        .send({ code: 'valid-code', deviceId: 'device-1' })
        .expect(200); // Antes esperábamos 201, pero AuthService.loginWithGoogle devuelve un objeto plano envuelto en interceptor -> 200

      const body = response.body as StandardResponse;
      expect(body.statusCode).toBe(200);
      expect(body.data).toHaveProperty('accessToken');
      expect(body.data).toHaveProperty('user');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('con token válido -> 200 y ejecuta logout', async () => {
      const token = getAdminToken();

      await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(authServiceMock.logout).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/users', () => {
    it('sin token -> 401', async () => {
      await request(app.getHttpServer()).get('/api/v1/users').expect(401);
    });

    it('con token sin rol ADMIN/SUPER_ADMIN -> 403', async () => {
      const token = getStudentToken();
      await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('con token ADMIN -> 200', async () => {
      const token = getAdminToken();
      const response = await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = response.body as StandardResponse;
      expect(body.statusCode).toBe(200);
      expect(Array.isArray(body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('requiere JWT pero no rol (200 con token sin rol)', async () => {
      const token = getStudentToken();
      await request(app.getHttpServer())
        .get('/api/v1/users/2')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });
});
