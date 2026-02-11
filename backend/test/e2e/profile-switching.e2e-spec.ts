import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpAdapterHost, Reflector, APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DataSource } from 'typeorm';
import request from 'supertest';

import { AllExceptionsFilter } from '../../src/common/filters/all-exceptions.filter';
import { TransformInterceptor } from '../../src/common/interceptors/transform.interceptor';
import { AuthController } from '../../src/modules/auth/presentation/auth.controller';
import { AuthService } from '../../src/modules/auth/application/auth.service';
import { JwtStrategy } from '../../src/modules/auth/strategies/jwt.strategy';
import { JwtAuthGuard } from '../../src/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../src/common/guards/roles.guard';
import { UserSessionRepository } from '../../src/modules/auth/infrastructure/user-session.repository';
import { SessionStatusService } from '../../src/modules/auth/application/session-status.service';
import { SessionValidatorService } from '../../src/modules/auth/application/session-validator.service';
import { SessionConflictService } from '../../src/modules/auth/application/session-conflict.service';
import { SessionSecurityService } from '../../src/modules/auth/application/session-security.service';
import { SecurityEventService } from '../../src/modules/auth/application/security-event.service';
import { SecurityEventTypeRepository } from '../../src/modules/auth/infrastructure/security-event-type.repository';
import { SecurityEventRepository } from '../../src/modules/auth/infrastructure/security-event.repository';
import { UsersService } from '../../src/modules/users/application/users.service';
import { PhotoSource, User } from '../../src/modules/users/domain/user.entity';
import { RedisCacheService } from '../../src/infrastructure/cache/redis-cache.service';

const JWT_SECRET = 'test-jwt-secret';

interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  activeRole: string;
  sessionId: string;
}

interface SwitchProfileResponse {
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

describe('Profile Switching (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const mockRoleStudent = { id: '10', code: 'STUDENT', name: 'Student' };
  const mockRoleTeacher = { id: '20', code: 'TEACHER', name: 'Teacher' };

  const multiRoleUser = {
    id: '1',
    email: 'multi@test.com',
    firstName: 'Multi',
    lastName1: 'User',
    lastName2: null,
    roles: [mockRoleStudent, mockRoleTeacher],
    lastActiveRoleId: '10',
    photoSource: PhotoSource.NONE,
    createdAt: new Date(),
  } as User;

  const authServiceMock = {
    switchProfile: jest.fn(),
  };

  const usersServiceMock = {
    findOne: jest.fn().mockResolvedValue(multiRoleUser),
  };

  const userSessionRepositoryMock = {
    findByIdWithUser: jest.fn().mockResolvedValue({
      id: 'session-123',
      isActive: true,
      expiresAt: new Date(Date.now() + 100000),
      user: multiRoleUser,
      sessionStatusId: '1',
    }),
    update: jest.fn(),
    findActiveById: jest.fn().mockResolvedValue({
      id: 'session-123',
      isActive: true,
      userId: multiRoleUser.id,
      deviceId: 'device-abc',
    }),
  };

  const dataSourceMock = {
    transaction: jest.fn((cb) => cb({})),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({ secret: JWT_SECRET }),
      ],
      controllers: [AuthController],
      providers: [
        JwtStrategy,
        Reflector,
        {
          provide: APP_GUARD,
          useClass: JwtAuthGuard,
        },
        {
          provide: APP_GUARD,
          useClass: RolesGuard,
        },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              key === 'JWT_SECRET' ? JWT_SECRET : undefined,
          },
        },
        { provide: UsersService, useValue: usersServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: DataSource, useValue: dataSourceMock },
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
    if (app) await app.close();
  });

  it('should successfully switch profile when user has the role', async () => {
    const originalToken = jwtService.sign({
      sub: '1',
      email: multiRoleUser.email,
      roles: ['STUDENT', 'TEACHER'],
      activeRole: 'STUDENT',
      sessionId: 'session-123',
      deviceId: 'device-abc',
    });

    authServiceMock.switchProfile.mockResolvedValue({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/switch-profile')
      .set('Authorization', `Bearer ${originalToken}`)
      .send({ roleId: '20', deviceId: 'device-abc' })
      .expect(200);

    const body = response.body as SwitchProfileResponse;
    expect(body.data.accessToken).toBe('new-access-token');
  });

  it('should fail with 401/403 if token is invalid', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/switch-profile')
      .send({ roleId: '20', deviceId: 'device-abc' })
      .expect(401);
  });

  it('should be protected by Guard (requires valid login)', async () => {
    const invalidToken = 'invalid-token';
    await request(app.getHttpServer())
      .post('/api/v1/auth/switch-profile')
      .set('Authorization', `Bearer ${invalidToken}`)
      .expect(401);
  });
});
