import { Test, TestingModule } from '@nestjs/testing';
import {
  ForbiddenException,
  INestApplication,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { DataSource, EntityManager } from 'typeorm';
import { AuthService } from '../src/modules/auth/application/auth.service';
import { SessionService } from '../src/modules/auth/application/session.service';
import { SessionValidatorService } from '../src/modules/auth/application/session-validator.service';
import { SessionConflictService } from '../src/modules/auth/application/session-conflict.service';
import { SessionSecurityService } from '../src/modules/auth/application/session-security.service';
import { SecurityEventService } from '../src/modules/auth/application/security-event.service';
import { SessionStatusService } from '../src/modules/auth/application/session-status.service';
import { AuthSettingsService } from '../src/modules/auth/application/auth-settings.service';
import { GeolocationService } from '../src/modules/auth/application/geolocation.service';
import { SessionAnomalyDetectorService } from '../src/modules/auth/application/session-anomaly-detector.service';
import { GeoProvider } from '../src/common/interfaces/geo-provider.interface';
import { UsersService } from '../src/modules/users/application/users.service';
import { UserSessionRepository } from '../src/modules/auth/infrastructure/user-session.repository';
import { SecurityEventRepository } from '../src/modules/auth/infrastructure/security-event.repository';
import { SecurityEventTypeRepository } from '../src/modules/auth/infrastructure/security-event-type.repository';
import { SessionStatusRepository } from '../src/modules/auth/infrastructure/session-status.repository';
import { SettingsService } from '../src/modules/settings/application/settings.service';
import { RequestMetadata } from '../src/modules/auth/interfaces/request-metadata.interface';
import { JwtStrategy } from '../src/modules/auth/strategies/jwt.strategy';
import { RedisCacheService } from '../src/infrastructure/cache/redis-cache.service';
import { TokenService } from '../src/modules/auth/application/token.service';
import { GoogleProviderService } from '../src/modules/auth/application/google-provider.service';
import {
  IDENTITY_DENY_REASONS,
  IDENTITY_SOURCE_FLOWS,
  SECURITY_EVENT_CODES,
} from '../src/modules/auth/interfaces/security.constants';

describe('Security Scenarios (Integration)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let jwtService: JwtService;
  let tokenService: TokenService;
  let securityEventService: SecurityEventService;
  let sessionValidatorService: SessionValidatorService;

  const mockUser = {
    id: '1',
    email: 'hacker@test.com',
    roles: [{ code: 'STUDENT' }],
    isActive: true,
  };

  const mockMetadata: RequestMetadata = {
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    deviceId: 'device-A',
    latitude: 40.416775,
    longitude: -3.70379,
  };

  const mockDataSource = {
    transaction: jest.fn(
      (cb: (manager: EntityManager) => Promise<unknown>): Promise<unknown> =>
        cb(mockDataSource.manager as EntityManager),
    ),
    manager: {} as Partial<EntityManager>,
  };

  const mockUsersService = {
    findByEmail: jest.fn().mockResolvedValue(mockUser),
    findOne: jest.fn().mockResolvedValue(mockUser),
    update: jest.fn().mockResolvedValue(mockUser),
  };

  const mockUserSessionRepository = {
    create: jest.fn(),
    findOtherActiveSession: jest.fn().mockResolvedValue(null),
    findLatestSessionByUserId: jest.fn().mockResolvedValue(null),
    findByRefreshTokenHash: jest.fn(),
    findByRefreshTokenHashForUpdate: jest.fn(),
    findByRefreshTokenJti: jest.fn(),
    findByRefreshTokenJtiForUpdate: jest.fn(),
    findById: jest.fn(),
    findActiveById: jest.fn(),
    findByIdWithUser: jest.fn(),
    findByIdForUpdate: jest.fn(),
    update: jest.fn(),
    deactivateSession: jest.fn(),
    existsByUserIdAndDeviceId: jest.fn().mockResolvedValue(true),
    findSessionsByUserAndStatus: jest.fn().mockResolvedValue([]),
  };

  const mockSecurityEventRepository = {
    create: jest.fn().mockResolvedValue({ id: '999' }),
    countByUserIdAndTypeCode: jest.fn().mockResolvedValue(0),
  };

  const mockSecurityEventTypeRepository = {
    findByCode: jest.fn().mockResolvedValue({ id: '1', code: 'LOGIN_SUCCESS' }),
    findAll: jest.fn().mockResolvedValue([]),
  };

  const mockSessionStatusRepository = {
    findByCode: jest.fn((code: string) => Promise.resolve({ id: '100', code })),
    findAll: jest.fn().mockResolvedValue([]),
  };

  const mockAnomalyDetector = {
    resolveCoordinates: jest.fn().mockImplementation((meta: RequestMetadata) =>
      Promise.resolve({
        metadata: meta,
        locationSource: 'gps',
      }),
    ),
    detectLocationAnomaly: jest.fn().mockResolvedValue({
      isAnomalous: false,
      anomalyType: 'NONE',
      previousSessionId: null,
      distanceKm: null,
      timeDifferenceMinutes: null,
    }),
  };

  const mockGeoProvider = {
    resolve: jest.fn().mockResolvedValue(null),
  };

  const mockRedisService = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    del: jest.fn().mockResolvedValue(undefined),
    invalidateGroup: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'secret' })],
      providers: [
        AuthService,
        SessionService,
        SessionValidatorService,
        SessionConflictService,
        SessionSecurityService,
        SecurityEventService,
        SessionStatusService,
        AuthSettingsService,
        GeolocationService,
        JwtStrategy,
        { provide: DataSource, useValue: mockDataSource },
        { provide: ConfigService, useValue: { get: () => 'secret' } },
        { provide: UsersService, useValue: mockUsersService },
        { provide: UserSessionRepository, useValue: mockUserSessionRepository },
        {
          provide: SecurityEventRepository,
          useValue: mockSecurityEventRepository,
        },
        {
          provide: SecurityEventTypeRepository,
          useValue: mockSecurityEventTypeRepository,
        },
        {
          provide: SessionStatusRepository,
          useValue: mockSessionStatusRepository,
        },
        {
          provide: SessionAnomalyDetectorService,
          useValue: mockAnomalyDetector,
        },
        {
          provide: SettingsService,
          useValue: {
            getPositiveInt: jest.fn().mockResolvedValue(30),
            getString: jest.fn().mockResolvedValue('CYCLE_2024_1'),
          },
        },
        { provide: GeoProvider, useValue: mockGeoProvider },
        {
          provide: RedisCacheService,
          useValue: mockRedisService,
        },
        {
          provide: TokenService,
          useValue: {
            generateAccessToken: jest.fn().mockResolvedValue('at'),
            generateRefreshToken: jest
              .fn()
              .mockResolvedValue({
                token: 'rt',
                refreshTokenJti: 'jti-rt',
                expiresAt: new Date(),
              }),
            verifyRefreshToken: jest
              .fn()
              .mockReturnValue({
                deviceId: 'device-A',
                sub: '1',
                jti: 'jti-rt',
                type: 'refresh',
              }),
          },
        },
        {
          provide: GoogleProviderService,
          useValue: {
            verifyCodeAndGetEmail: jest
              .fn()
              .mockResolvedValue({ email: 'hacker@test.com' }),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    authService = moduleFixture.get<AuthService>(AuthService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
    securityEventService =
      moduleFixture.get<SecurityEventService>(SecurityEventService);
    sessionValidatorService = moduleFixture.get<SessionValidatorService>(
      SessionValidatorService,
    );
    tokenService = moduleFixture.get<TokenService>(TokenService);

    jest.spyOn(securityEventService, 'logEvent');
  });

  describe('ATOMICITY & TRANSACTIONS', () => {
    it('should fail login atomically if concurrent-session audit logging fails', async () => {
      mockUserSessionRepository.findOtherActiveSession.mockResolvedValue({
        id: '55',
        deviceId: 'device-B-existing',
      });
      mockUserSessionRepository.create.mockResolvedValue({ id: '123' });
      jest
        .spyOn(securityEventService, 'logEvent')
        .mockRejectedValue(new Error('DB Error'));

      await expect(
        authService.loginWithGoogle('token', mockMetadata),
      ).rejects.toThrow('DB Error');
    });
  });

  describe('CONCURRENT SESSIONS (Anti-Hijacking)', () => {
    it('should return PENDING_CONCURRENT_RESOLUTION if another active session exists', async () => {
      mockUserSessionRepository.findOtherActiveSession.mockResolvedValue({
        id: '55',
        deviceId: 'device-B-existing',
      });
      mockUserSessionRepository.create.mockResolvedValue({
        id: '123',
        sessionStatusId: '2',
      });

      const result = await authService.loginWithGoogle('token', mockMetadata);
      expect(result.sessionStatus).toBe('PENDING_CONCURRENT_RESOLUTION');
      expect(result.concurrentSessionId).toBe('55');
    });
  });

  describe('ANOMALY DETECTION (Passive Mode)', () => {
    it('should NOT block session if user moves too fast (Passive Mode), but log it', async () => {
      mockUserSessionRepository.findOtherActiveSession.mockResolvedValue(null);
      mockUserSessionRepository.create.mockResolvedValue({ id: '123' });

      mockAnomalyDetector.detectLocationAnomaly.mockResolvedValue({
        isAnomalous: true,
        anomalyType: 'IMPOSSIBLE_TRAVEL',
        previousSessionId: '50',
        distanceKm: 10000,
        timeDifferenceMinutes: 5,
      });

      const result = await authService.loginWithGoogle('token', {
        ...mockMetadata,
        ipAddress: '8.8.8.8',
      });

      expect(result.sessionStatus).toBe('ACTIVE');
      expect(securityEventService.logEvent).toHaveBeenCalledWith(
        mockUser.id,
        'ANOMALOUS_LOGIN_DETECTED',
        expect.anything(),
        expect.anything(),
      );
    });
  });

  describe('JWT STRATEGY & ACCESS CONTROL', () => {
    it('should REJECT access if session is BLOCKED in database', async () => {
      // Mock UsersService for this test
      const usersService = { findOne: jest.fn().mockResolvedValue(mockUser) };

      const strategy = new JwtStrategy(
        { get: () => 'secret' } as any,
        sessionValidatorService,
        mockRedisService as any,
      );

      const payload = {
        sub: '1',
        email: 'h@t.com',
        roles: [],
        activeRole: 'STUDENT',
        sessionId: '500',
        deviceId: 'A',
      };
      jest
        .spyOn(sessionValidatorService, 'validateSession')
        .mockRejectedValue(new UnauthorizedException());

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('INACTIVE IDENTITY (Policy)', () => {
    it('should block login with 403 when account is inactive', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await expect(
        authService.loginWithGoogle('token', mockMetadata),
      ).rejects.toThrow(ForbiddenException);

      expect(securityEventService.logEvent).toHaveBeenCalledWith(
        mockUser.id,
        SECURITY_EVENT_CODES.ACCESS_DENIED,
        expect.objectContaining({
          reason: IDENTITY_DENY_REASONS.INACTIVE_ACCOUNT,
          sourceFlow: IDENTITY_SOURCE_FLOWS.LOGIN_GOOGLE,
        }),
      );
    });

    it('should block refresh with 403 when account is inactive', async () => {
      const refreshToken = 'rt-inactive';
      jest.spyOn(tokenService, 'verifyRefreshToken').mockReturnValue({
        sub: mockUser.id,
        deviceId: mockMetadata.deviceId,
        jti: 'jti-inactive',
        type: 'refresh',
      });
      mockUsersService.findOne.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });
      mockUserSessionRepository.findByRefreshTokenJtiForUpdate.mockResolvedValue({
        id: 'session-r1',
        userId: mockUser.id,
        deviceId: mockMetadata.deviceId,
        isActive: true,
        expiresAt: new Date(Date.now() + 60_000),
        sessionStatusId: '100',
      });

      await expect(
        authService.refreshAccessToken(refreshToken, mockMetadata.deviceId),
      ).rejects.toThrow(ForbiddenException);

      expect(securityEventService.logEvent).toHaveBeenCalledWith(
        mockUser.id,
        SECURITY_EVENT_CODES.ACCESS_DENIED,
        expect.objectContaining({
          reason: IDENTITY_DENY_REASONS.INACTIVE_ACCOUNT,
          sourceFlow: IDENTITY_SOURCE_FLOWS.REFRESH_TOKEN,
        }),
      );
    });
  });
});
