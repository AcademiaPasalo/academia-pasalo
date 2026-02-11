import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { DataSource, EntityManager } from 'typeorm';
import { AuthService } from '../src/modules/auth/application/auth.service';
import { SessionService } from '../src/modules/auth/application/session.service';
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

describe('Security Scenarios (Integration)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let jwtService: JwtService;
  let securityEventService: SecurityEventService;

  const mockUser = {
    id: '1',
    email: 'hacker@test.com',
    roles: [{ code: 'STUDENT' }],
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
  };

  const mockUserSessionRepository = {
    create: jest.fn(),
    findOtherActiveSession: jest.fn(),
    findLatestSessionByUserId: jest.fn(),
    findByRefreshTokenHash: jest.fn(),
    findByRefreshTokenHashForUpdate: jest.fn(),
    findById: jest.fn(),
    findActiveById: jest.fn().mockResolvedValue({
      id: '1',
      userId: mockUser.id,
      deviceId: mockMetadata.deviceId,
      isActive: true,
      sessionStatusId: '100',
      expiresAt: new Date(Date.now() + 1000000),
      user: mockUser,
      activeRoleId: '10',
    }),
    findByIdWithUser: jest.fn().mockResolvedValue({
      id: '1',
      isActive: true,
      sessionStatusId: '100',
      expiresAt: new Date(Date.now() + 1000000),
      user: mockUser,
      activeRoleId: '10',
    }),
    findByIdForUpdate: jest.fn(),
    update: jest.fn(),
    deactivateSession: jest.fn(),
    existsByUserIdAndDeviceId: jest.fn().mockResolvedValue(true),
  };

  const mockSecurityEventRepository = {
    create: jest.fn().mockResolvedValue({ id: '999' }),
    countByUserIdAndTypeCode: jest.fn().mockResolvedValue(0),
  };

  const mockSecurityEventTypeRepository = {
    findByCode: jest.fn().mockResolvedValue({ id: '1', code: 'LOGIN_SUCCESS' }),
  };

  const mockSessionStatusRepository = {
    findByCode: jest.fn((code: string) => Promise.resolve({ id: '100', code })),
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
      previousSessionId: null,
      distanceKm: null,
      timeDifferenceMinutes: null,
    }),
  };

  const mockGeoProvider = {
    resolve: jest.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'secret' })],
      providers: [
        AuthService,
        SessionService,
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
          useValue: {
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue(undefined),
            del: jest.fn().mockResolvedValue(undefined),
            invalidateGroup: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: TokenService,
          useValue: {
            generatePair: jest
              .fn()
              .mockResolvedValue({ accessToken: 'a', refreshToken: 'b' }),
            generateAccessToken: jest
              .fn()
              .mockResolvedValue('new_access_token'),
            generateRefreshToken: jest.fn().mockResolvedValue({
              token: 'new_refresh',
              expiresAt: new Date(),
            }),
            verifyAccessToken: jest.fn().mockResolvedValue({ sub: '1' }),
            verifyRefreshToken: jest
              .fn()
              .mockReturnValue({ deviceId: 'device-A', sub: '1' }),
          },
        },
        {
          provide: GoogleProviderService,
          useValue: {
            verify: jest.fn().mockResolvedValue({ email: 'hacker@test.com' }),
            verifyCodeAndGetEmail: jest
              .fn()
              .mockResolvedValue('hacker@test.com'),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    authService = moduleFixture.get<AuthService>(AuthService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
    securityEventService =
      moduleFixture.get<SecurityEventService>(SecurityEventService);
    jest.spyOn(securityEventService, 'logEvent');

    mockAnomalyDetector.detectLocationAnomaly.mockImplementation(
      (userId: string, metadata: RequestMetadata, locationSource: string, isNewDevice: boolean) => {
        if (metadata && metadata.ipAddress === '8.8.8.8') {
          return Promise.resolve({
            isAnomalous: true,
            anomalyType: 'IMPOSSIBLE_TRAVEL',
            previousSessionId: '50',
            distanceKm: 10000,
            timeDifferenceMinutes: 5,
          });
        }
        return Promise.resolve({
          isAnomalous: false,
          anomalyType: 'NONE',
          previousSessionId: null,
          distanceKm: null,
          timeDifferenceMinutes: null,
        });
      },
    );
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
      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(mockUserSessionRepository.create).toHaveBeenCalled();
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

    it('should return ACTIVE if no other session exists', async () => {
      mockUserSessionRepository.findOtherActiveSession.mockResolvedValue(null);
      mockUserSessionRepository.create.mockResolvedValue({
        id: '123',
        sessionStatusId: '1',
      });

      const result = await authService.loginWithGoogle('token', mockMetadata);
      expect(result.sessionStatus).toBe('ACTIVE');
    });
  });

  describe('ANOMALY DETECTION (Passive Mode)', () => {
    it('should NOT block session if user moves too fast (Passive Mode), but log it', async () => {
      mockUserSessionRepository.create.mockResolvedValue({
        id: '123',
        sessionStatusId: '1',
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

  describe('SESSION RESOLUTION FLOWS', () => {
    it('should RESOLVE concurrent session by keeping NEW and revoking OLD', async () => {
      const refreshToken = jwtService.sign({
        sub: mockUser.id,
        deviceId: mockMetadata.deviceId,
        type: 'refresh',
      });

      mockUserSessionRepository.findByRefreshTokenHashForUpdate.mockResolvedValue(
        {
          id: '200',
          userId: mockUser.id,
          deviceId: mockMetadata.deviceId,
          sessionStatusId: '100',
        },
      );

      mockUserSessionRepository.findOtherActiveSession.mockResolvedValue({
        id: '100',
        deviceId: 'device-B',
      });
      mockUserSessionRepository.findByIdForUpdate.mockResolvedValue({
        id: '100',
      });
      mockUserSessionRepository.update.mockResolvedValue({});

      const result = await authService.resolveConcurrentSession(
        refreshToken,
        mockMetadata.deviceId,
        'KEEP_NEW',
        mockMetadata,
      );

      expect(result.keptSessionId).toBe('200');
      expect(mockUserSessionRepository.update).toHaveBeenCalled();
    });

    it('should RE-AUTHENTICATE anomalous session successfully', async () => {
      const refreshToken = jwtService.sign({
        sub: mockUser.id,
        deviceId: mockMetadata.deviceId,
        type: 'refresh',
      });

      mockUserSessionRepository.findByRefreshTokenHash.mockResolvedValue({
        id: '300',
        userId: mockUser.id,
        deviceId: mockMetadata.deviceId,
        sessionStatusId: '100',
      });

      mockUserSessionRepository.update.mockResolvedValue({});

      const result = await authService.reauthAnomalousSession(
        'google-token',
        refreshToken,
        mockMetadata.deviceId,
        mockMetadata,
      );

      expect(result.accessToken).toBeDefined();
      expect(mockUserSessionRepository.update).toHaveBeenCalled();
    });
  });

  describe('JWT STRATEGY & ACCESS CONTROL', () => {
    it('should REJECT access if session is BLOCKED in database', async () => {
      const strategy = new JwtStrategy(
        { get: () => 'secret' } as unknown as ConfigService,
        {} as unknown as TokenService,
        mockUserSessionRepository as unknown as UserSessionRepository,
        {
          getIdByCode: () => Promise.resolve('1'),
        } as unknown as SessionStatusService,
        {
          get: jest.fn().mockResolvedValue(null),
          set: jest.fn(),
        } as unknown as RedisCacheService,
      );

      const payload = {
        sub: '1',
        email: 'h@t.com',
        roles: [] as string[],
        activeRole: 'STUDENT',
        sessionId: '500',
      };

      mockUserSessionRepository.findByIdWithUser.mockResolvedValue({
        id: '500',
        isActive: false,
        sessionStatusId: '99',
        expiresAt: new Date(Date.now() + 10000),
      });

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
