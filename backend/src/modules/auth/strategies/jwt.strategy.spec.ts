import {
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from '@modules/auth/strategies/jwt.strategy';
import { SessionValidatorService } from '@modules/auth/application/session-validator.service';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import { JwtPayload } from '@modules/auth/interfaces/jwt-payload.interface';
import { PhotoSource, User } from '@modules/users/domain/user.entity';
import { technicalSettings } from '@config/technical-settings';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  const configServiceMock = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') {
        return 'unit-test-secret';
      }
      return undefined;
    }),
  };

  const sessionValidatorServiceMock = {
    validateSession: jest.fn(),
  };

  const cacheServiceMock = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  const payload: JwtPayload = {
    sub: '10',
    email: 'user@test.com',
    roles: ['STUDENT'],
    activeRole: 'STUDENT',
    sessionId: '777',
    deviceId: 'device-1',
  };

  const buildUser = (overrides?: Partial<User>): User => {
    return {
      id: '10',
      email: 'user@test.com',
      firstName: 'User',
      lastName1: null,
      lastName2: null,
      phone: null,
      career: null,
      profilePhotoUrl: null,
      photoSource: PhotoSource.NONE,
      lastActiveRoleId: '1',
      lastActiveRole: null,
      isActive: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: null,
      roles: [],
      ...overrides,
    };
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    cacheServiceMock.get.mockResolvedValue(null);
    cacheServiceMock.set.mockResolvedValue(undefined);
    cacheServiceMock.del.mockResolvedValue(undefined);

    const moduleRef = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: ConfigService, useValue: configServiceMock },
        {
          provide: SessionValidatorService,
          useValue: sessionValidatorServiceMock,
        },
        { provide: RedisCacheService, useValue: cacheServiceMock },
      ],
    }).compile();

    strategy = moduleRef.get(JwtStrategy);
  });

  it('valida sesión contra BD antes de confiar en caché', async () => {
    const activeUser = buildUser();
    sessionValidatorServiceMock.validateSession.mockResolvedValue({
      user: activeUser,
    });
    cacheServiceMock.get.mockResolvedValue({
      ...activeUser,
      sessionId: 'stale',
      activeRole: 'OLD_ROLE',
    });

    const result = await strategy.validate(payload);

    expect(sessionValidatorServiceMock.validateSession).toHaveBeenCalledWith(
      payload.sessionId,
      payload.sub,
      payload.deviceId,
    );
    expect(result.sessionId).toBe(payload.sessionId);
    expect(result.activeRole).toBe(payload.activeRole);
    expect(cacheServiceMock.set).not.toHaveBeenCalled();
  });

  it('bloquea inmediatamente cuando el usuario está inactivo, aunque exista caché', async () => {
    const inactiveUser = buildUser({ isActive: false });
    sessionValidatorServiceMock.validateSession.mockResolvedValue({
      user: inactiveUser,
    });
    cacheServiceMock.get.mockResolvedValue({
      ...buildUser(),
      sessionId: payload.sessionId,
      activeRole: payload.activeRole,
    });

    await expect(strategy.validate(payload)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(cacheServiceMock.del).toHaveBeenCalledWith(
      `cache:session:${payload.sessionId}:user`,
    );
    expect(cacheServiceMock.set).not.toHaveBeenCalled();
  });

  it('en cache miss guarda usuario activo en caché y retorna user con contexto de sesión', async () => {
    const activeUser = buildUser();
    sessionValidatorServiceMock.validateSession.mockResolvedValue({
      user: activeUser,
    });
    cacheServiceMock.get.mockResolvedValueOnce(null);

    const result = await strategy.validate(payload);

    expect(result.id).toBe(activeUser.id);
    expect(result.sessionId).toBe(payload.sessionId);
    expect(result.activeRole).toBe(payload.activeRole);
    expect(cacheServiceMock.set).toHaveBeenCalledWith(
      `cache:session:${payload.sessionId}:user`,
      expect.objectContaining({ id: activeUser.id }),
      technicalSettings.auth.session.sessionUserCacheTtlSeconds,
    );
  });

  it('si la sesión no tiene usuario asociado, deniega y limpia caché', async () => {
    sessionValidatorServiceMock.validateSession.mockResolvedValue({
      user: null,
    });

    await expect(strategy.validate(payload)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(cacheServiceMock.del).toHaveBeenCalledWith(
      `cache:session:${payload.sessionId}:user`,
    );
  });
});
