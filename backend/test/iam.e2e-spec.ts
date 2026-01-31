import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
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
import { UsersController } from './../src/modules/users/presentation/users.controller';
import { UsersService } from './../src/modules/users/application/users.service';
import { PhotoSource } from './../src/modules/users/domain/user.entity';
import { RedisCacheService } from '../src/infrastructure/cache/redis-cache.service';

const JWT_SECRET = 'test-jwt-secret';

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
    roles: [{ id: '1', code: 'ADMIN', name: 'Admin' }],
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: null as Date | null,
  };

  const normalUser = {
    id: '2',
    email: 'user@test.com',
    firstName: 'User',
    lastName1: null as string | null,
    lastName2: null as string | null,
    phone: null as string | null,
    career: null as string | null,
    profilePhotoUrl: null as string | null,
    photoSource: PhotoSource.NONE,
    roles: [{ id: '2', code: 'STUDENT', name: 'Student' }],
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: null as Date | null,
  };

  const usersServiceMock = {
    findOne: jest.fn(async (id: string) => {
      if (String(id) === adminUser.id) return adminUser;
      if (String(id) === normalUser.id) return normalUser;
      return null;
    }),
    findAll: jest.fn(async () => [adminUser, normalUser]),
    create: jest.fn(async () => adminUser),
    update: jest.fn(async () => adminUser),
    remove: jest.fn(async () => undefined),
    assignRole: jest.fn(async () => adminUser),
    removeRole: jest.fn(async () => adminUser),
    findByEmail: jest.fn(async () => null),
  };

  const authServiceMock = {
    loginWithGoogle: jest.fn(async () => ({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: adminUser,
      sessionStatus: 'ACTIVE',
      concurrentSessionId: null,
    })),
    refreshAccessToken: jest.fn(async () => ({
      accessToken: 'new-access-token',
      refreshToken: 'refresh-token',
    })),
    logout: jest.fn(async () => undefined),
  };

  const userSessionRepositoryMock = {
    findById: jest.fn(),
    findByIdWithUser: jest.fn(async (id: string) => {
      // Sesión '99' es Admin, sesión '10' es Normal
      const user = id === '99' ? adminUser : normalUser;
      return {
        id,
        isActive: true,
        sessionStatusId: '1',
        expiresAt: new Date('2099-01-01T00:00:00.000Z'),
        user,
      };
    }),
  };

  class MockJwtAuthGuard extends JwtAuthGuard {
    async canActivate(context: any): Promise<boolean> {
      const req = context.switchToHttp().getRequest();
      if (req.url.includes('/auth/google')) return true;
      return super.canActivate(context) as Promise<boolean>;
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
        { provide: SessionStatusService, useValue: { getIdByCode: jest.fn().mockResolvedValue('1') } },
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
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

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

  function signAccessToken(userId: string, sessionId: string): string {
    const user = userId === adminUser.id ? adminUser : normalUser;
    return jwtService.sign({
      sub: userId,
      email: user.email,
      roles: user.roles.map(r => r.code),
      sessionId,
    });
  }

  it('POST /api/v1/auth/google retorna tokens dentro de data', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/google')
      .send({ code: 't', deviceId: 'device-1' })
      .expect(200);

    expect(response.body.data).toMatchObject({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
  });

  it('POST /api/v1/auth/logout con token válido -> 200 y ejecuta logout', async () => {
    const token = signAccessToken(adminUser.id, '99');
    await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(authServiceMock.logout).toHaveBeenCalledWith('99', adminUser.id);
  });

  it('GET /api/v1/users sin token -> 401', async () => {
    await request(app.getHttpServer()).get('/api/v1/users').expect(401);
  });

  it('GET /api/v1/users con token sin rol ADMIN/SUPER_ADMIN -> 403', async () => {
    // Usamos sesión '10' que el mock mapea a normalUser (STUDENT)
    const token = signAccessToken(normalUser.id, '10');
    await request(app.getHttpServer())
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('GET /api/v1/users con token ADMIN -> 200', async () => {
    // Usamos sesión '99' que el mock mapea a adminUser (ADMIN)
    const token = signAccessToken(adminUser.id, '99');
    const response = await request(app.getHttpServer())
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('GET /api/v1/users/:id requiere JWT pero no rol (200 con token sin rol)', async () => {
    const token = signAccessToken(normalUser.id, '10');
    const response = await request(app.getHttpServer())
      .get(`/api/v1/users/${normalUser.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(response.body.statusCode).toBe(200);
  });
});