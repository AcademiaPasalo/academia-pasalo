import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpAdapterHost, Reflector, APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DataSource, EntityManager } from 'typeorm';
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
    lastName1: null,
    lastName2: null,
    phone: null,
    career: null,
    profilePhotoUrl: null,
    photoSource: PhotoSource.NONE,
    roles: [mockRoleStudent, mockRoleTeacher],
    lastActiveRoleId: mockRoleStudent.id,
    createdAt: new Date(),
    updatedAt: null,
  };

  const singleRoleUser = {
    id: '2',
    email: 'single@test.com',
    firstName: 'Single',
    lastName1: null,
    lastName2: null,
    phone: null,
    career: null,
    profilePhotoUrl: null,
    photoSource: PhotoSource.NONE,
    roles: [mockRoleStudent],
    lastActiveRoleId: mockRoleStudent.id,
    createdAt: new Date(),
    updatedAt: null,
  };

  const usersServiceMock = {
    findOne: jest.fn(async (id: string) => {
      if (id === multiRoleUser.id) return multiRoleUser;
      if (id === singleRoleUser.id) return singleRoleUser;
      return null;
    }),
  };

  const dataSourceMock = {
    transaction: jest.fn(
      async (cb: (manager: Partial<EntityManager>) => Promise<unknown>) => {
        const manager = {
          getRepository: jest.fn().mockReturnValue({
            update: jest.fn(),
          }),
        };
        return await cb(manager);
      },
    ),
  };

  const authServiceMock = {
    switchProfile: jest.fn(
      async (userId: string, sessionId: string, roleId: string) => {
        if (userId === multiRoleUser.id && roleId === mockRoleTeacher.id) {
          return {
            accessToken: 'new-access-token-teacher',
            refreshToken: 'new-refresh-token',
          };
        }
        if (userId === singleRoleUser.id && roleId === mockRoleTeacher.id) {
          throw new Error('Unauthorized');
        }
        return { accessToken: 'token', refreshToken: 'token' };
      },
    ),
    logout: jest.fn(),
  };

  const userSessionRepositoryMock = {
    findByIdWithUser: jest.fn(async (sessionId: string) => {
      let user = multiRoleUser;
      if (sessionId.includes('single')) user = singleRoleUser;

      let activeRoleId = user.lastActiveRoleId;
      if (sessionId.includes('teacher')) activeRoleId = mockRoleTeacher.id;

      return {
        id: sessionId,
        isActive: true,
        sessionStatusId: '1',
        activeRoleId: activeRoleId,
        expiresAt: new Date(Date.now() + 3600000),
        user: user,
      };
    }),
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
          useValue: { getIdByCode: jest.fn().mockResolvedValue('1') },
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

    await app.init();
    jwtService = app.get(JwtService);
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  function signToken(
    user: Partial<User>,
    activeRoleCode: string,
    sessionId: string,
  ): string {
    const payload: JwtPayload = {
      sub: user.id || '',
      email: user.email || '',
      roles: user.roles ? user.roles.map((r) => r.code) : [],
      activeRole: activeRoleCode,
      sessionId,
    };
    return jwtService.sign(payload);
  }

  describe('POST /auth/switch-profile', () => {
    it('should successfully switch profile when user has the role', async () => {
      const token = signToken(
        multiRoleUser as unknown as User,
        'STUDENT',
        'session-1',
      );

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/switch-profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          roleId: mockRoleTeacher.id,
          deviceId: 'device-123',
        })
        .expect(200);

      const body = response.body as SwitchProfileResponse;
      expect(body.data).toHaveProperty('accessToken');
      expect(body.data.accessToken).toBe('new-access-token-teacher');
      expect(authServiceMock.switchProfile).toHaveBeenCalledWith(
        multiRoleUser.id,
        'session-1',
        mockRoleTeacher.id,
        expect.objectContaining({ deviceId: 'device-123' }),
      );
    });

    it('should fail with 401/403 if token is invalid', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/switch-profile')
        .set('Authorization', `Bearer invalid-token`)
        .send({
          roleId: mockRoleTeacher.id,
          deviceId: 'device-123',
        })
        .expect(401);
    });

    it('should be protected by Guard (requires valid login)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/switch-profile')
        .send({ roleId: '1', deviceId: '1' })
        .expect(401);
    });
  });
});
