import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { SessionService } from './session.service';
import { UserSessionRepository } from '@modules/auth/infrastructure/user-session.repository';
import { SessionAnomalyDetectorService } from '@modules/auth/application/session-anomaly-detector.service';
import { SessionStatusService } from '@modules/auth/application/session-status.service';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import { SessionValidatorService } from '@modules/auth/application/session-validator.service';
import { SessionConflictService } from '@modules/auth/application/session-conflict.service';
import { SessionSecurityService } from '@modules/auth/application/session-security.service';
import { RequestMetadata } from '@modules/auth/interfaces/request-metadata.interface';
import { ANOMALY_TYPES } from '@modules/auth/interfaces/security.constants';

describe('SessionService', () => {
  let service: SessionService;
  let userSessionRepository: UserSessionRepository;
  let anomalyDetector: SessionAnomalyDetectorService;
  let sessionStatusService: SessionStatusService;
  let sessionConflictService: SessionConflictService;
  let sessionSecurityService: SessionSecurityService;

  const metadata: RequestMetadata = {
    ipAddress: '127.0.0.1',
    userAgent: 'test',
    deviceId: 'd1',
  };

  const dataSourceMock = {
    transaction: jest.fn((cb) => cb({ getRepository: jest.fn() })),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        SessionService,
        { provide: DataSource, useValue: dataSourceMock },
        {
          provide: UserSessionRepository,
          useValue: {
            create: jest.fn(),
            existsByUserIdAndDeviceId: jest.fn(),
            findOtherActiveSession: jest.fn(),
            findSessionsByUserAndStatus: jest.fn(),
            findActiveSessionsByUserId: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: SessionSecurityService,
          useValue: { logSessionCreationEvents: jest.fn() },
        },
        {
          provide: SessionAnomalyDetectorService,
          useValue: {
            resolveCoordinates: jest.fn(),
            detectLocationAnomaly: jest.fn(),
          },
        },
        {
          provide: SessionStatusService,
          useValue: { getIdByCode: jest.fn() },
        },
        {
          provide: SessionValidatorService,
          useValue: { hashRefreshToken: jest.fn((t) => t) },
        },
        {
          provide: SessionConflictService,
          useValue: {
            resolveConcurrentSession: jest.fn(),
            cleanupExcessPendingSessions: jest.fn(),
          },
        },
        {
          provide: RedisCacheService,
          useValue: { get: jest.fn(), del: jest.fn() },
        },
      ],
    }).compile();

    service = moduleRef.get(SessionService);
    userSessionRepository = moduleRef.get(UserSessionRepository);
    anomalyDetector = moduleRef.get(SessionAnomalyDetectorService);
    sessionStatusService = moduleRef.get(SessionStatusService);
    sessionConflictService = moduleRef.get(SessionConflictService);
    sessionSecurityService = moduleRef.get(SessionSecurityService);
  });

  describe('createSession (Modo Pasivo)', () => {
    it('debe crear sesión ACTIVE incluso con anomalía (modo pasivo)', async () => {
      (anomalyDetector.resolveCoordinates as jest.Mock).mockResolvedValue({
        metadata,
        locationSource: 'gps',
      });
      (
        userSessionRepository.existsByUserIdAndDeviceId as jest.Mock
      ).mockResolvedValue(true);
      (anomalyDetector.detectLocationAnomaly as jest.Mock).mockResolvedValue({
        isAnomalous: true,
        anomalyType: ANOMALY_TYPES.IMPOSSIBLE_TRAVEL,
      });
      (
        userSessionRepository.findOtherActiveSession as jest.Mock
      ).mockResolvedValue(null);
      (sessionStatusService.getIdByCode as jest.Mock).mockResolvedValue(
        'active-id',
      );
      (userSessionRepository.create as jest.Mock).mockResolvedValue({
        id: 's1',
      });

      const result = await service.createSession(
        'u1',
        metadata,
        'token',
        new Date(),
      );

      expect(result.sessionStatus).toBe('ACTIVE');
      expect(
        sessionSecurityService.logSessionCreationEvents,
      ).toHaveBeenCalled();
    });

    it('debe dar prioridad a Concurrencia (PENDING_CONCURRENT_RESOLUTION) sobre Anomalía', async () => {
      (anomalyDetector.resolveCoordinates as jest.Mock).mockResolvedValue({
        metadata,
        locationSource: 'none',
      });
      (anomalyDetector.detectLocationAnomaly as jest.Mock).mockResolvedValue({
        isAnomalous: true,
        anomalyType: ANOMALY_TYPES.IMPOSSIBLE_TRAVEL,
      });
      (
        userSessionRepository.findOtherActiveSession as jest.Mock
      ).mockResolvedValue({ id: 'existing' });
      (sessionStatusService.getIdByCode as jest.Mock).mockImplementation(
        (code) => {
          if (code === 'PENDING_CONCURRENT_RESOLUTION') return 'pending-id';
          return 'other';
        },
      );
      (userSessionRepository.create as jest.Mock).mockResolvedValue({
        id: 's-new',
      });

      const result = await service.createSession(
        'u1',
        metadata,
        'token',
        new Date(),
      );

      expect(result.sessionStatus).toBe('PENDING_CONCURRENT_RESOLUTION');
      expect(result.concurrentSessionId).toBe('existing');
      expect(
        sessionSecurityService.logSessionCreationEvents,
      ).toHaveBeenCalled();
    });

    it('debe limpiar sesiones pendientes antiguas al alcanzar el límite (protección contra agotamiento)', async () => {
      (anomalyDetector.resolveCoordinates as jest.Mock).mockResolvedValue({
        metadata,
        locationSource: 'none',
      });
      (anomalyDetector.detectLocationAnomaly as jest.Mock).mockResolvedValue({
        isAnomalous: false,
        anomalyType: ANOMALY_TYPES.NONE,
      });
      (
        userSessionRepository.findOtherActiveSession as jest.Mock
      ).mockResolvedValue({ id: 'active' });

      (sessionStatusService.getIdByCode as jest.Mock).mockResolvedValue(
        'status-id',
      );
      (userSessionRepository.create as jest.Mock).mockResolvedValue({
        id: 'new',
      });

      await service.createSession('u1', metadata, 'token', new Date());

      expect(
        sessionConflictService.cleanupExcessPendingSessions,
      ).toHaveBeenCalledWith('u1', expect.anything());
    });
  });

  describe('deactivateAllUserSessions', () => {
    it('debe desactivar todas las sesiones y ponerlas en estado REVOKED', async () => {
      const activeSessions = [{ id: 's1' }, { id: 's2' }];
      (
        userSessionRepository.findActiveSessionsByUserId as jest.Mock
      ).mockResolvedValue(activeSessions);
      (sessionStatusService.getIdByCode as jest.Mock).mockResolvedValue(
        'revoked-id',
      );

      await service.deactivateAllUserSessions('u1');

      expect(userSessionRepository.update).toHaveBeenCalledTimes(2);
      expect(userSessionRepository.update).toHaveBeenCalledWith('s1', {
        sessionStatusId: 'revoked-id',
        isActive: false,
      });
    });
  });
});
