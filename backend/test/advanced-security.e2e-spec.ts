import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { AuthService } from '../src/modules/auth/application/auth.service';
import { SessionService } from '../src/modules/auth/application/session.service';
import { SecurityEventService } from '../src/modules/auth/application/security-event.service';
import { SessionStatusService } from '../src/modules/auth/application/session-status.service';
import { AuthSettingsService } from '../src/modules/auth/application/auth-settings.service';
import { GeolocationService } from '../src/modules/auth/application/geolocation.service';
import { SessionAnomalyDetectorService } from '../src/modules/auth/application/session-anomaly-detector.service';
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
  let app: INestApplication;
  let authService: AuthService;
  let jwtService: JwtService;

  // Mock Data
  const mockUser = {
    id: '100',
    email: 'victim@test.com',
    roles: [{ code: 'STUDENT' }],
  };

  const mockMetadataBase: RequestMetadata = {
    ipAddress: '200.200.200.1',
    userAgent: 'Mozilla/5.0',
    deviceId: 'device-original',
    latitude: 10.0,
    longitude: 10.0,
  };

  // Mocks
  const mockDataSource = {
    transaction: jest.fn((cb) => cb(mockDataSource.manager)),
    manager: {},
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
  };

  // ... (otros mocks)

  const mockAnomalyDetector = {
    resolveCoordinates: jest.fn().mockImplementation((meta) => Promise.resolve({
      metadata: meta,
      locationSource: (meta.latitude && meta.longitude) ? 'gps' : 'ip'
    })),
    detectLocationAnomaly: jest.fn().mockResolvedValue({ isAnomalous: false })
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
        { provide: SecurityEventRepository, useValue: { create: jest.fn().mockResolvedValue({ id: '999' }) } },
        { provide: SecurityEventTypeRepository, useValue: { findByCode: jest.fn().mockResolvedValue({ id: 1 }) } },
        { provide: SessionStatusRepository, useValue: { findByCode: jest.fn((code) => Promise.resolve({ id: code === 'ACTIVE' ? '1' : '2', code })) } },
        { provide: SessionAnomalyDetectorService, useValue: mockAnomalyDetector },
        { provide: SettingsService, useValue: {
          getPositiveInt: jest.fn().mockResolvedValue(100),
          getString: jest.fn().mockResolvedValue('CYCLE_X'),
        } },
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
            generateRefreshToken: jest.fn().mockResolvedValue({ token: 'new_rt', expiresAt: new Date() }),
            generateAccessToken: jest.fn().mockResolvedValue('new_at'),
            verifyRefreshToken: jest.fn((token) => {
                if (token === 'zombie_token') return { sub: '100', deviceId: 'device-zombie' };
                return { sub: '100', deviceId: 'device-original' };
            }),
          },
        },
        {
          provide: GoogleProviderService,
          useValue: { verifyCodeAndGetEmail: jest.fn().mockResolvedValue('victim@test.com') },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    authService = moduleFixture.get<AuthService>(AuthService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  describe('Scenario 1: The Roommate Attack (Same IP, Different Device)', () => {
    it('should DETECT CONCURRENCY even if IP and Location are identical', async () => {
      // Setup: Existing active session on Device A
      mockUserSessionRepository.findOtherActiveSession.mockResolvedValue({
        id: 'session-A',
        deviceId: 'device-original',
      });
      mockUserSessionRepository.create.mockResolvedValue({ id: 'session-B', sessionStatusId: '2' }); // 2 = PENDING

      // Action: Login attempt from Device B (Roommate/Attacker) with SAME metadata
      const attackMetadata = { ...mockMetadataBase, deviceId: 'device-roommate' };
      const result = await authService.loginWithGoogle('auth-code', attackMetadata);

      // Assert: Must prompt for resolution, NOT block as anomalous travel
      expect(result.sessionStatus).toBe('PENDING_CONCURRENT_RESOLUTION');
      expect(result.concurrentSessionId).toBe('session-A');
      // Ensure we didn't trigger anomaly logic implies we didn't get BLOCKED status
    });
  });

  describe('Scenario 2: The Zombie Token Attack', () => {
    it('should REJECT refresh attempt with a token from a revoked session', async () => {
        // Setup: A session that was valid but revoked in DB (e.g. by concurrency resolution)
        const zombieRefreshToken = 'zombie_token';
        
        // Mock Session Service logic manually since we are testing AuthService flow interacting with it
        // Or better, mock the `SessionService.validateRefreshTokenSession` to fail
        // Since AuthService calls SessionService, let's look at how AuthService is built.
        // It injects SessionService. We are using the REAL SessionService in this test module (unless overridden).
        // Real SessionService calls UserSessionRepository.findByRefreshTokenHash.
        
        // Simulate DB returning NO session for this token (or is_active = false)
        mockUserSessionRepository.findByRefreshTokenHash = jest.fn().mockResolvedValue(null); 
        
        // Assert
        await expect(authService.refreshAccessToken(zombieRefreshToken, 'device-zombie'))
            .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Scenario 3: Ghost Location (Null GPS)', () => {
    it('should FALLBACK to IP-based check and allow login if IP is safe', async () => {
      // Setup: No other active session
      mockUserSessionRepository.findOtherActiveSession.mockResolvedValue(null);
      // Setup: Previous session was close (simulated by finding latest session)
      mockUserSessionRepository.findLatestSessionByUserId.mockResolvedValue({
         id: 'prev-session',
         ipAddress: '200.200.200.1', // Same IP
         createdAt: new Date(),
      });
      
      mockUserSessionRepository.create.mockResolvedValue({ id: 'new-session', sessionStatusId: '1' });

      // Action: Login with NULL coordinates
      const ghostMetadata = { ...mockMetadataBase, latitude: null, longitude: null };
      const result = await authService.loginWithGoogle('auth-code', ghostMetadata);

      // Assert: Should proceed to ACTIVE (not crashed, not blocked)
      expect(result.sessionStatus).toBe('ACTIVE');
    });
  });
});
