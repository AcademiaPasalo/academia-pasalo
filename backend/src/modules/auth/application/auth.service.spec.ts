import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AuthService } from '@modules/auth/application/auth.service';
import { AuthSettingsService } from '@modules/auth/application/auth-settings.service';
import { SecurityEventService } from '@modules/auth/application/security-event.service';
import { SessionService } from '@modules/auth/application/session.service';
import { SessionStatusService } from '@modules/auth/application/session-status.service';
import { SessionValidatorService } from '@modules/auth/application/session-validator.service';
import { GoogleProviderService } from '@modules/auth/application/google-provider.service';
import { TokenService } from '@modules/auth/application/token.service';
import { RequestMetadata } from '@modules/auth/interfaces/request-metadata.interface';
import {
  IDENTITY_DENY_REASONS,
  IDENTITY_SOURCE_FLOWS,
  SECURITY_EVENT_CODES,
} from '@modules/auth/interfaces/security.constants';
import { UsersService } from '@modules/users/application/users.service';
import { PhotoSource, User } from '@modules/users/domain/user.entity';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import { UserSession } from '@modules/auth/domain/user-session.entity';

interface TokenPayload {
  sub: string;
  email?: string;
  roles?: string[];
  sessionId?: string;
  deviceId?: string;
  type?: string;
  iat?: number;
}

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;

  const configServiceMock = {
    get: (key: string) => {
      if (key === 'GOOGLE_CLIENT_ID') return 'test-google-client-id';
      if (key === 'GOOGLE_CLIENT_SECRET') return 'test-google-client-secret';
      if (key === 'GOOGLE_REDIRECT_URI') return 'postmessage';
      return undefined;
    },
  };

  const googleProviderServiceMock = {
    verifyCodeAndGetEmail: jest.fn(),
  };

  let tokenServiceMock: {
    generateAccessToken: jest.Mock;
    generateRefreshToken: jest.Mock;
    verifyRefreshToken: jest.Mock;
  };

  const redisCacheServiceMock = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    del: jest.fn().mockResolvedValue(undefined),
    invalidateGroup: jest.fn().mockResolvedValue(undefined),
  };

  const usersServiceMock = {
    findByEmail: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const sessionServiceMock = {
    createSession: jest.fn(),
    rotateRefreshToken: jest.fn(),
    findSessionByRefreshToken: jest.fn(),
    findSessionByRefreshTokenForUpdate: jest.fn(),
    resolveConcurrentSession: jest.fn(),
    activateBlockedSession: jest.fn(),
    deactivateSession: jest.fn(),
  };

  const sessionValidatorServiceMock = {
    validateRefreshTokenSession: jest.fn(),
    validateSession: jest.fn(),
    hashRefreshToken: jest.fn((t) => t),
    findSessionByRefreshToken: jest.fn(),
  };

  const securityEventServiceMock = {
    logEvent: jest.fn(),
  };

  const sessionStatusServiceMock = {
    getIdByCode: jest.fn(),
  };

  const authSettingsServiceMock = {
    getRefreshTokenTtlDays: jest.fn(async () => 7),
    getAccessTokenTtlMinutes: jest.fn(async () => 15),
  };

  const metadata: RequestMetadata = {
    ipAddress: '127.0.0.1',
    userAgent: 'jest',
    deviceId: 'device-1',
  };

  const baseUser = {
    id: '10',
    email: 'user@test.com',
    firstName: 'User',
    lastName1: null as string | null,
    lastName2: null as string | null,
    phone: null as string | null,
    career: null as string | null,
    profilePhotoUrl: null as string | null,
    photoSource: PhotoSource.NONE,
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: null as Date | null,
    roles: [{ id: '1', code: 'STUDENT', name: 'Student' }],
  };

  const dataSourceMock = {
    transaction: jest.fn((cb: (manager: unknown) => Promise<unknown>) =>
      cb({}),
    ),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    tokenServiceMock = {
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'unit-test-jwt-secret' })],
      providers: [
        AuthService,
        { provide: ConfigService, useValue: configServiceMock },
        { provide: DataSource, useValue: dataSourceMock },
        { provide: UsersService, useValue: usersServiceMock },
        { provide: SessionService, useValue: sessionServiceMock },
        {
          provide: SessionValidatorService,
          useValue: sessionValidatorServiceMock,
        },
        { provide: SecurityEventService, useValue: securityEventServiceMock },
        { provide: SessionStatusService, useValue: sessionStatusServiceMock },
        { provide: AuthSettingsService, useValue: authSettingsServiceMock },
        { provide: GoogleProviderService, useValue: googleProviderServiceMock },
        { provide: TokenService, useValue: tokenServiceMock },
        { provide: RedisCacheService, useValue: redisCacheServiceMock },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
    jwtService = moduleRef.get(JwtService);

    tokenServiceMock.verifyRefreshToken.mockImplementation((token: string) => {
      try {
        const payload = jwtService.verify(token);
        if (payload.type !== 'refresh' || !payload.sub || !payload.deviceId || !payload.jti) {
          throw new UnauthorizedException('Refresh token inválido');
        }
        return payload;
      } catch {
        throw new UnauthorizedException('Refresh token inválido o expirado');
      }
    });

    tokenServiceMock.generateAccessToken.mockImplementation(
      (payload: TokenPayload) => {
        return Promise.resolve(jwtService.sign(payload));
      },
    );

    tokenServiceMock.generateRefreshToken.mockImplementation(
      (userId: string, deviceId: string) => {
        const token = jwtService.sign({
          sub: userId,
          deviceId,
          type: 'refresh',
          jti: "jti-mock",
          iat: Date.now(),
        });
        return Promise.resolve({
          token,
          refreshTokenJti: 'jti-mock',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
      },
    );
  });

  it('loginWithGoogle: éxito -> retorna tokens', async () => {
    googleProviderServiceMock.verifyCodeAndGetEmail.mockResolvedValue({
      email: baseUser.email,
      picture: 'https://example.com/photo.jpg',
    });
    usersServiceMock.update.mockResolvedValue(baseUser);
    usersServiceMock.findByEmail.mockResolvedValue(baseUser);
    sessionServiceMock.createSession.mockResolvedValue({
      session: { id: '777' },
      sessionStatus: 'ACTIVE',
      concurrentSessionId: null,
    });

    const result = await authService.loginWithGoogle(
      'google-auth-code',
      metadata,
    );

    expect(result.user.email).toBe(baseUser.email);
    expect(typeof result.accessToken).toBe('string');
    expect(typeof result.refreshToken).toBe('string');
    expect(result.sessionStatus).toBe('ACTIVE');
    expect(result.concurrentSessionId).toBeNull();

    expect(sessionServiceMock.createSession).toHaveBeenCalledTimes(1);
    const createSessionArgs = sessionServiceMock.createSession.mock.calls[0];
    expect(createSessionArgs[0]).toBe(baseUser.id);
    expect(createSessionArgs[1]).toEqual(metadata);
    expect(typeof createSessionArgs[2]).toBe('string');
    expect(typeof createSessionArgs[3]).toBe('string');
    expect(createSessionArgs[4]).toBeInstanceOf(Date);

    expect(securityEventServiceMock.logEvent).not.toHaveBeenCalled();

    const decodedAccess = jwtService.verify(result.accessToken);
    expect(decodedAccess.sub).toBe(baseUser.id);
    expect(decodedAccess.email).toBe(baseUser.email);
    expect(decodedAccess.roles).toEqual(['STUDENT']);
    expect(decodedAccess.sessionId).toBe('777');

    const decodedRefresh = jwtService.verify(result.refreshToken);
    expect(decodedRefresh.sub).toBe(baseUser.id);
    expect(decodedRefresh.deviceId).toBe(metadata.deviceId);
    expect(decodedRefresh.type).toBe('refresh');
  });

  it('loginWithGoogle: correo no registrado -> 401', async () => {
    googleProviderServiceMock.verifyCodeAndGetEmail.mockResolvedValue({
      email: 'nope@test.com',
    });
    usersServiceMock.findByEmail.mockResolvedValue(null);

    await expect(
      authService.loginWithGoogle('google-auth-code', metadata),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(sessionServiceMock.createSession).not.toHaveBeenCalled();
    expect(securityEventServiceMock.logEvent).not.toHaveBeenCalled();
  });

  it('loginWithGoogle: usuario inactivo -> 403', async () => {
    googleProviderServiceMock.verifyCodeAndGetEmail.mockResolvedValue({
      email: baseUser.email,
    });
    usersServiceMock.findByEmail.mockResolvedValue({
      ...baseUser,
      isActive: false,
    });

    await expect(
      authService.loginWithGoogle('google-auth-code', metadata),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(sessionServiceMock.createSession).not.toHaveBeenCalled();
    expect(securityEventServiceMock.logEvent).toHaveBeenCalledWith(
      baseUser.id,
      SECURITY_EVENT_CODES.ACCESS_DENIED,
      expect.objectContaining({
        reason: IDENTITY_DENY_REASONS.INACTIVE_ACCOUNT,
        sourceFlow: IDENTITY_SOURCE_FLOWS.LOGIN_GOOGLE,
      }),
    );
  });

  it('loginWithGoogle: token inválido/verificación falla -> 401', async () => {
    googleProviderServiceMock.verifyCodeAndGetEmail.mockRejectedValue(
      new UnauthorizedException(),
    );

    await expect(
      authService.loginWithGoogle('bad-code', metadata),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refreshAccessToken: deviceId mismatch -> 401', async () => {
    const refreshToken = jwtService.sign({
      sub: baseUser.id,
      deviceId: 'device-a',
      type: 'refresh',
          jti: "jti-mock",
    });

    await expect(
      authService.refreshAccessToken(refreshToken, 'device-b'),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(
      sessionServiceMock.findSessionByRefreshTokenForUpdate,
    ).not.toHaveBeenCalled();
  });

  it('refreshAccessToken: éxito -> genera nuevo accessToken', async () => {
    const refreshToken = jwtService.sign({
      sub: baseUser.id,
      deviceId: metadata.deviceId,
      type: 'refresh',
          jti: "jti-mock",
    });

    sessionStatusServiceMock.getIdByCode.mockResolvedValue('active-status-id');
    sessionServiceMock.findSessionByRefreshTokenForUpdate.mockResolvedValue({
      id: '123',
      userId: baseUser.id,
      deviceId: metadata.deviceId,
      isActive: true,
      sessionStatusId: 'active-status-id',
      expiresAt: new Date(Date.now() + 60_000),
      activeRoleId: baseUser.roles[0].id,
    });
    sessionServiceMock.rotateRefreshToken.mockResolvedValue({ id: '123' });
    usersServiceMock.findOne.mockResolvedValue(baseUser);

    const result = await authService.refreshAccessToken(
      refreshToken,
      metadata.deviceId,
    );

    expect(result.refreshToken).not.toBe(refreshToken);
    expect(typeof result.accessToken).toBe('string');
    expect(sessionServiceMock.rotateRefreshToken).toHaveBeenCalledTimes(1);

    expect(redisCacheServiceMock.del).toHaveBeenCalledWith(
      'cache:session:123:user',
    );

    expect(redisCacheServiceMock.set).toHaveBeenCalledWith(
      expect.stringMatching(/^blacklist:refresh:/),
      expect.objectContaining({ reason: 'TOKEN_ROTATED' }),
      604800,
    );

    const decodedAccess = jwtService.verify(result.accessToken);
    expect(decodedAccess.sub).toBe(baseUser.id);
    expect(decodedAccess.sessionId).toBe('123');
  });

  it('refreshAccessToken: usuario inactivo -> 403', async () => {
    const refreshToken = jwtService.sign({
      sub: baseUser.id,
      deviceId: metadata.deviceId,
      type: 'refresh',
          jti: "jti-mock",
    });

    usersServiceMock.findOne.mockResolvedValue({
      ...baseUser,
      isActive: false,
    });

    await expect(
      authService.refreshAccessToken(refreshToken, metadata.deviceId),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(sessionServiceMock.rotateRefreshToken).not.toHaveBeenCalled();
    expect(securityEventServiceMock.logEvent).toHaveBeenCalledWith(
      baseUser.id,
      SECURITY_EVENT_CODES.ACCESS_DENIED,
      expect.objectContaining({
        reason: IDENTITY_DENY_REASONS.INACTIVE_ACCOUNT,
        sourceFlow: IDENTITY_SOURCE_FLOWS.REFRESH_TOKEN,
      }),
    );
  });

  it('refreshAccessToken: refresh token inválido -> 401', async () => {
    await expect(
      authService.refreshAccessToken('not-a-jwt', metadata.deviceId),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refreshAccessToken: payload tipo incorrecto -> 401', async () => {
    const badToken = jwtService.sign({
      sub: baseUser.id,
      deviceId: metadata.deviceId,
      type: 'access',
    });

    await expect(
      authService.refreshAccessToken(badToken, metadata.deviceId),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('resolveConcurrentSession: KEEP_EXISTING -> retorna keptSessionId null', async () => {
    const refreshToken = jwtService.sign({
      sub: baseUser.id,
      deviceId: metadata.deviceId,
      type: 'refresh',
          jti: "jti-mock",
    });

    sessionServiceMock.resolveConcurrentSession.mockResolvedValue({
      keptSessionId: null,
    });

    const result = await authService.resolveConcurrentSession(
      refreshToken,
      metadata.deviceId,
      'KEEP_EXISTING',
      metadata,
    );

    expect(result.keptSessionId).toBeNull();
  });

  it('resolveConcurrentSession: usuario inactivo -> 403', async () => {
    const refreshToken = jwtService.sign({
      sub: baseUser.id,
      deviceId: metadata.deviceId,
      type: 'refresh',
          jti: "jti-mock",
    });

    sessionServiceMock.resolveConcurrentSession.mockResolvedValue({
      keptSessionId: '555',
    });
    usersServiceMock.findOne.mockResolvedValue({
      ...baseUser,
      isActive: false,
    });

    await expect(
      authService.resolveConcurrentSession(
        refreshToken,
        metadata.deviceId,
        'KEEP_NEW',
        metadata,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(sessionValidatorServiceMock.validateSession).not.toHaveBeenCalled();
    expect(securityEventServiceMock.logEvent).toHaveBeenCalledWith(
      baseUser.id,
      SECURITY_EVENT_CODES.ACCESS_DENIED,
      expect.objectContaining({
        reason: IDENTITY_DENY_REASONS.INACTIVE_ACCOUNT,
        sourceFlow: IDENTITY_SOURCE_FLOWS.CONCURRENT_RESOLUTION,
      }),
    );
  });

  it('reauthAnomalousSession: usuario inactivo -> 403', async () => {
    const refreshToken = jwtService.sign({
      sub: baseUser.id,
      deviceId: metadata.deviceId,
      type: 'refresh',
          jti: "jti-mock",
    });

    const blockedSession = {
      id: '555',
      userId: baseUser.id,
      deviceId: metadata.deviceId,
      sessionStatusId: '9',
    } as unknown as UserSession;

    sessionServiceMock.findSessionByRefreshToken.mockResolvedValue(
      blockedSession,
    );
    sessionStatusServiceMock.getIdByCode.mockResolvedValue('9');
    usersServiceMock.findOne.mockResolvedValue({
      ...baseUser,
      isActive: false,
    });

    await expect(
      authService.reauthAnomalousSession(
        'google-auth-code',
        refreshToken,
        metadata.deviceId,
        metadata,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(googleProviderServiceMock.verifyCodeAndGetEmail).not.toHaveBeenCalled();
    expect(sessionServiceMock.activateBlockedSession).not.toHaveBeenCalled();
    expect(securityEventServiceMock.logEvent).toHaveBeenCalledWith(
      baseUser.id,
      SECURITY_EVENT_CODES.ACCESS_DENIED,
      expect.objectContaining({
        reason: IDENTITY_DENY_REASONS.INACTIVE_ACCOUNT,
        sourceFlow: IDENTITY_SOURCE_FLOWS.ANOMALOUS_REAUTH,
      }),
    );
  });

  it('reauthAnomalousSession: éxito -> activa sesión y retorna tokens', async () => {
    const refreshToken = jwtService.sign({
      sub: baseUser.id,
      deviceId: metadata.deviceId,
      type: 'refresh',
          jti: "jti-mock",
    });

    const blockedSession = {
      id: '555',
      userId: baseUser.id,
      deviceId: metadata.deviceId,
      sessionStatusId: '9',
    } as unknown as UserSession;

    sessionServiceMock.findSessionByRefreshToken.mockResolvedValue(
      blockedSession,
    );
    sessionServiceMock.findSessionByRefreshTokenForUpdate.mockResolvedValue(
      blockedSession,
    );

    sessionStatusServiceMock.getIdByCode.mockResolvedValue('9');
    googleProviderServiceMock.verifyCodeAndGetEmail.mockResolvedValue({
      email: baseUser.email,
    });

    usersServiceMock.findOne.mockResolvedValue(baseUser);
    usersServiceMock.findByEmail.mockResolvedValue(baseUser);
    sessionServiceMock.activateBlockedSession.mockResolvedValue(undefined);
    sessionServiceMock.rotateRefreshToken.mockResolvedValue({ id: '555' });

    const result = await authService.reauthAnomalousSession(
      'google-auth-code',
      refreshToken,
      metadata.deviceId,
      metadata,
    );

    expect(typeof result.accessToken).toBe('string');
    expect(typeof result.refreshToken).toBe('string');
    expect(result.expiresIn).toBeDefined();
    expect(sessionServiceMock.activateBlockedSession).toHaveBeenCalledWith(
      '555',
      expect.anything(),
    );
    expect(sessionServiceMock.rotateRefreshToken).toHaveBeenCalledTimes(1);

    const rotateArgs = sessionServiceMock.rotateRefreshToken.mock.calls[0];
    expect(rotateArgs[0]).toBe('555');
    expect(typeof rotateArgs[1]).toBe('string');
    expect(typeof rotateArgs[2]).toBe('string');
    expect(rotateArgs[3]).toBeInstanceOf(Date);
    expect(rotateArgs[4]).toEqual(expect.anything());
  });

  it('switchProfile: intento de escalada de privilegios (rol no poseído) -> 401', async () => {
    usersServiceMock.findOne.mockResolvedValue(baseUser);

    await expect(
      authService.switchProfile('10', '777', '999', metadata), // 999 no es un rol de baseUser
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(sessionServiceMock.rotateRefreshToken).not.toHaveBeenCalled();
  });
});


