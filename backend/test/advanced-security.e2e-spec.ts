import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DataSource, EntityManager } from 'typeorm';
import { AuthService } from '../src/modules/auth/application/auth.service';
import { SessionService } from '../src/modules/auth/application/session.service';
import { SecurityEventService } from '../src/modules/auth/application/security-event.service';
import { SessionStatusService } from '../src/modules/auth/application/session-status.service';
import { AuthSettingsService } from '../src/modules/auth/application/auth-settings.service';
import { GeolocationService } from '../src/modules/auth/application/geolocation.service';
import { SessionAnomalyDetectorService } from '../src/modules/auth/application/session-anomaly-detector.service';
import { SessionValidatorService } from '../src/modules/auth/application/session-validator.service';
import { SessionConflictService } from '../src/modules/auth/application/session-conflict.service';
import { SessionSecurityService } from '../src/modules/auth/application/session-security.service';
import { UsersService } from '../src/modules/users/application/users.service';
import { UserSessionRepository } from '../src/modules/auth/infrastructure/user-session.repository';
import { SecurityEventRepository } from '../src/modules/auth/infrastructure/security-event.repository';
import { SecurityEventTypeRepository } from '../src/modules/auth/infrastructure/security-event-type.repository';
import { SessionStatusRepository } from '../src/modules/auth/infrastructure/session-status.repository';
import { SettingsService } from '../src/modules/settings/application/settings.service';
import { RequestMetadata } from '../src/modules/auth/interfaces/request-metadata.interface';
import { RedisCacheService } from '../src/infrastructure/cache/redis-cache.service';
import { TokenService } from '../src/modules/auth/application/token.service';
import { GoogleProviderService } from '../src/modules/auth/application/google-provider.service';
import { GeoProvider } from '../src/common/interfaces/geo-provider.interface';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../src/modules/auth/strategies/jwt.strategy';

describe('Advanced Security Scenarios (Offensive Testing)', () => {
  let authService: AuthService;

  const mockUser = {
    id: '100',
    email: 'victim@test.com',
    roles: [{ code: 'STUDENT' }],
    isActive: true,
  };

  const mockMetadataBase: RequestMetadata = {
    ipAddress: '200.200.200.1',
    userAgent: 'Mozilla/5.0',
    deviceId: 'device-original',
    latitude: 10.0,
    longitude: 10.0,
  };

  const mockDataSource = {
    transaction: jest.fn((cb: (manager: EntityManager) => Promise<unknown>) =>
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
    findByIdWithUser: jest.fn().mockResolvedValue({
      id: '100',
      isActive: true,
      sessionStatusId: '1',
      expiresAt: new Date(Date.now() + 1000000),
      user: mockUser,
    }),
    update: jest.fn(),
    deactivateSession: jest.fn(),
    existsByUserIdAndDeviceId: jest.fn().mockResolvedValue(true),
    findSessionsByUserAndStatus: jest.fn().mockResolvedValue([]),
  };

  const mockAnomalyDetector = {
    resolveCoordinates: jest.fn().mockImplementation((meta: RequestMetadata) =>
      Promise.resolve({
        metadata: meta,
        locationSource: meta.latitude && meta.longitude ? 'gps' : 'ip',
      }),
    ),
    detectLocationAnomaly: jest.fn().mockResolvedValue({
      isAnomalous: false,
      anomalyType: 'NONE',
    }),
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
          useValue: { create: jest.fn().mockResolvedValue({ id: '999' }) },
        },
        {
          provide: SecurityEventTypeRepository,
          useValue: { findByCode: jest.fn().mockResolvedValue({ id: 1 }) },
        },
        {
          provide: SessionStatusRepository,
          useValue: {
            findByCode: jest.fn((code: string) =>
              Promise.resolve({ id: code === 'ACTIVE' ? '1' : '2', code }),
            ),
          },
        },
        {
          provide: SessionAnomalyDetectorService,
          useValue: mockAnomalyDetector,
        },
        {
          provide: SettingsService,
          useValue: {
            getPositiveInt: jest.fn().mockResolvedValue(100),
            getString: jest.fn().mockResolvedValue('CYCLE_X'),
          },
        },
        { provide: GeoProvider, useValue: { resolve: jest.fn() } },
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
            generateRefreshToken: jest
              .fn()
              .mockResolvedValue({ token: 'new_rt', expiresAt: new Date() }),
            generateAccessToken: jest.fn().mockResolvedValue('new_at'),
            verifyRefreshToken: jest.fn((token: string) => {
              if (token === 'zombie_token')
                return { sub: '100', deviceId: 'device-zombie' };
              return { sub: '100', deviceId: 'device-original' };
            }),
          },
        },
        {
          provide: GoogleProviderService,
          useValue: {
            verifyCodeAndGetEmail: jest
              .fn()
              .mockResolvedValue({ email: 'victim@test.com' }),
          },
        },
      ],
    }).compile();

    authService = moduleFixture.get<AuthService>(AuthService);
  });

  describe('Scenario 1: The Roommate Attack (Same IP, Different Device)', () => {
    it('should DETECT CONCURRENCY even if IP and Location are identical', async () => {
      mockUserSessionRepository.findOtherActiveSession.mockResolvedValue({
        id: 'session-A',
        deviceId: 'device-original',
      });
      mockUserSessionRepository.create.mockResolvedValue({
        id: 'session-B',
        sessionStatusId: '2',
      });

      const attackMetadata: RequestMetadata = {
        ...mockMetadataBase,
        deviceId: 'device-roommate',
      };
      const result = await authService.loginWithGoogle(
        'auth-code',
        attackMetadata,
      );

      expect(result.sessionStatus).toBe('PENDING_CONCURRENT_RESOLUTION');
      expect(result.concurrentSessionId).toBe('session-A');
    });
  });

  describe('Scenario 2: The Zombie Token Attack', () => {
    it('should REJECT refresh attempt with a token from a revoked session', async () => {
      const zombieRefreshToken = 'zombie_token';

      mockUserSessionRepository.findByRefreshTokenHash = jest
        .fn()
        .mockResolvedValue(null);

      await expect(
        authService.refreshAccessToken(zombieRefreshToken, 'device-zombie'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Scenario 3: Ghost Location (Null GPS)', () => {
    it('should FALLBACK to IP-based check and allow login if IP is safe', async () => {
      mockUserSessionRepository.findOtherActiveSession.mockResolvedValue(null);
      mockUserSessionRepository.findLatestSessionByUserId.mockResolvedValue({
        id: 'prev-session',
        ipAddress: '200.200.200.1',
        createdAt: new Date(),
      });

      mockUserSessionRepository.create.mockResolvedValue({
        id: 'new-session',
        sessionStatusId: '1',
      });

      const ghostMetadata: RequestMetadata = {
        ...mockMetadataBase,
        latitude: null,
        longitude: null,
      };
      const result = await authService.loginWithGoogle(
        'auth-code',
        ghostMetadata,
      );

      expect(result.sessionStatus).toBe('ACTIVE');
    });
  });
});
