import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AuthService } from '@modules/auth/application/auth.service';
import { AuthSettingsService } from '@modules/auth/application/auth-settings.service';
import { SecurityEventService } from '@modules/auth/application/security-event.service';
import { SessionService } from '@modules/auth/application/session.service';
import { SessionStatusService } from '@modules/auth/application/session-status.service';
import { GoogleProviderService } from '@modules/auth/application/google-provider.service';
import { TokenService } from '@modules/auth/application/token.service';
import { RequestMetadata } from '@modules/auth/interfaces/request-metadata.interface';
import { UsersService } from '@modules/users/application/users.service';
import { PhotoSource } from '@modules/users/domain/user.entity';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';

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
    set: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(null),
    invalidateGroup: jest.fn().mockResolvedValue(null),
  };

  const usersServiceMock = {
    findByEmail: jest.fn(),
    findOne: jest.fn(),
  };

  const sessionServiceMock = {
    createSession: jest.fn(),
    validateRefreshTokenSession: jest.fn(),
    rotateRefreshToken: jest.fn(),
    findSessionByRefreshToken: jest.fn(),
    findSessionByRefreshTokenForUpdate: jest.fn(),
    resolveConcurrentSession: jest.fn(),
    activateBlockedSession: jest.fn(),
    deactivateSession: jest.fn(),
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
    lastName1: null,
    lastName2: null,
    phone: null,
    career: null,
    profilePhotoUrl: null,
    photoSource: PhotoSource.NONE,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: null,
    roles: [{ id: '1', code: 'STUDENT', name: 'Student' }],
  };

  const dataSourceMock = {
    transaction: jest.fn((cb) => cb({})),
  };

  let verifyIdTokenMock: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();
    verifyIdTokenMock = jest.fn();

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
        if (payload.type !== 'refresh' || !payload.sub || !payload.deviceId) {
          throw new UnauthorizedException('Refresh token inválido');
        }
        return payload;
      } catch {
        throw new UnauthorizedException('Refresh token inválido o expirado');
      }
    });

    tokenServiceMock.generateAccessToken.mockImplementation((payload: any) => {
      return Promise.resolve(jwtService.sign(payload));
    });

    tokenServiceMock.generateRefreshToken.mockImplementation((userId: string, deviceId: string) => {
      const token = jwtService.sign({
        sub: userId,
        deviceId,
        type: 'refresh',
        iat: Date.now(), // Force unique token
      });
      return Promise.resolve({
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    });
  });

  it('loginWithGoogle: éxito -> retorna tokens', async () => {
    googleProviderServiceMock.verifyCodeAndGetEmail.mockResolvedValue(baseUser.email);
    usersServiceMock.findByEmail.mockResolvedValue(baseUser);
    sessionServiceMock.createSession.mockResolvedValue({
      session: { id: '777' },
      sessionStatus: 'ACTIVE',
      concurrentSessionId: null,
    });

    const result = await authService.loginWithGoogle('google-auth-code', metadata);

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
    expect(createSessionArgs[3]).toBeInstanceOf(Date);

    expect(securityEventServiceMock.logEvent).not.toHaveBeenCalled();

    const decodedAccess = jwtService.verify(result.accessToken) as {
      sub: string;
      email: string;
      roles: string[];
      sessionId: string;
    };
    expect(decodedAccess.sub).toBe(baseUser.id);
    expect(decodedAccess.email).toBe(baseUser.email);
    expect(decodedAccess.roles).toEqual(['STUDENT']);
    expect(decodedAccess.sessionId).toBe('777');

    const decodedRefresh = jwtService.verify(result.refreshToken) as {
      sub: string;
      deviceId: string;
      type: string;
    };
    expect(decodedRefresh.sub).toBe(baseUser.id);
    expect(decodedRefresh.deviceId).toBe(metadata.deviceId);
    expect(decodedRefresh.type).toBe('refresh');
  });

  it('loginWithGoogle: correo no registrado -> 401', async () => {
    googleProviderServiceMock.verifyCodeAndGetEmail.mockResolvedValue('nope@test.com');
    usersServiceMock.findByEmail.mockResolvedValue(null);

    await expect(
      authService.loginWithGoogle('google-auth-code', metadata),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(sessionServiceMock.createSession).not.toHaveBeenCalled();
    expect(securityEventServiceMock.logEvent).not.toHaveBeenCalled();
  });

  it('loginWithGoogle: token inválido/verificación falla -> 401', async () => {
    googleProviderServiceMock.verifyCodeAndGetEmail.mockRejectedValue(new UnauthorizedException());

    await expect(
      authService.loginWithGoogle('bad-code', metadata),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refreshAccessToken: deviceId mismatch -> 401', async () => {
    const refreshToken = jwtService.sign({
      sub: baseUser.id,
      deviceId: 'device-a',
      type: 'refresh',
    });

    await expect(
      authService.refreshAccessToken(refreshToken, 'device-b'),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(sessionServiceMock.validateRefreshTokenSession).not.toHaveBeenCalled();
  });

  it('refreshAccessToken: éxito -> genera nuevo accessToken', async () => {
    const refreshToken = jwtService.sign({
      sub: baseUser.id,
      deviceId: metadata.deviceId,
      type: 'refresh',
    });

    sessionServiceMock.validateRefreshTokenSession.mockResolvedValue({ id: '123' });
    sessionServiceMock.rotateRefreshToken.mockResolvedValue({ id: '123' });
    usersServiceMock.findOne.mockResolvedValue(baseUser);

    const result = await authService.refreshAccessToken(refreshToken, metadata.deviceId);

    expect(result.refreshToken).not.toBe(refreshToken);
    expect(typeof result.accessToken).toBe('string');
    expect(sessionServiceMock.rotateRefreshToken).toHaveBeenCalledTimes(1);

    const decodedAccess = jwtService.verify(result.accessToken) as {
      sub: string;
      email: string;
      roles: string[];
      sessionId: string;
    };
    expect(decodedAccess.sub).toBe(baseUser.id);
    expect(decodedAccess.sessionId).toBe('123');
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

  it('reauthAnomalousSession: éxito -> activa sesión y retorna tokens', async () => {
    const refreshToken = jwtService.sign({
      sub: baseUser.id,
      deviceId: metadata.deviceId,
      type: 'refresh',
    });

    const blockedSession = {
      id: '555',
      userId: baseUser.id,
      deviceId: metadata.deviceId,
      sessionStatusId: '9',
    };

    sessionServiceMock.findSessionByRefreshToken.mockResolvedValue(blockedSession);
    sessionServiceMock.findSessionByRefreshTokenForUpdate.mockResolvedValue(blockedSession);

    sessionStatusServiceMock.getIdByCode.mockResolvedValue('9');
    googleProviderServiceMock.verifyCodeAndGetEmail.mockResolvedValue(baseUser.email);

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
    expect(sessionServiceMock.activateBlockedSession).toHaveBeenCalledWith('555', expect.anything());
    expect(sessionServiceMock.rotateRefreshToken).toHaveBeenCalledTimes(1);

    const rotateArgs = sessionServiceMock.rotateRefreshToken.mock.calls[0];
    expect(rotateArgs[0]).toBe('555');
    expect(typeof rotateArgs[1]).toBe('string');
    expect(rotateArgs[2]).toBeInstanceOf(Date);
    expect(rotateArgs[3]).toEqual(expect.anything());
  });
});

