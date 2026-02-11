import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { SessionService } from './session.service';
import { UserSessionRepository } from '@modules/auth/infrastructure/user-session.repository';
import { SecurityEventService } from '@modules/auth/application/security-event.service';
import { SessionAnomalyDetectorService } from '@modules/auth/application/session-anomaly-detector.service';
import { SessionStatusService } from '@modules/auth/application/session-status.service';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import { RequestMetadata } from '@modules/auth/interfaces/request-metadata.interface';
import { ANOMALY_TYPES } from '@modules/auth/interfaces/security.constants';
import { technicalSettings } from '@config/technical-settings';

describe('SessionService', () => {
  let service: SessionService;
  let userSessionRepository: UserSessionRepository;
  let securityEventService: SecurityEventService;
  let anomalyDetector: SessionAnomalyDetectorService;
  let sessionStatusService: SessionStatusService;

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
            update: jest.fn(),
          },
        },
        {
          provide: SecurityEventService,
          useValue: { logEvent: jest.fn(), countEventsByCode: jest.fn() },
        },
        {
          provide: SessionAnomalyDetectorService,
          useValue: { resolveCoordinates: jest.fn(), detectLocationAnomaly: jest.fn() },
        },
        {
          provide: SessionStatusService,
          useValue: { getIdByCode: jest.fn() },
        },
        {
          provide: RedisCacheService,
          useValue: { get: jest.fn(), del: jest.fn() },
        },
      ],
    }).compile();

    service = moduleRef.get(SessionService);
    userSessionRepository = moduleRef.get(UserSessionRepository);
    securityEventService = moduleRef.get(SecurityEventService);
    anomalyDetector = moduleRef.get(SessionAnomalyDetectorService);
    sessionStatusService = moduleRef.get(SessionStatusService);
  });

  describe('createSession (Modo Pasivo)', () => {
    it('debe crear sesión ACTIVE incluso con anomalía (modo pasivo)', async () => {
      (anomalyDetector.resolveCoordinates as jest.Mock).mockResolvedValue({
        metadata,
        locationSource: 'gps',
      });
      (userSessionRepository.existsByUserIdAndDeviceId as jest.Mock).mockResolvedValue(true);
      (anomalyDetector.detectLocationAnomaly as jest.Mock).mockResolvedValue({
        isAnomalous: true,
        anomalyType: ANOMALY_TYPES.IMPOSSIBLE_TRAVEL,
      });
      (userSessionRepository.findOtherActiveSession as jest.Mock).mockResolvedValue(null);
      (sessionStatusService.getIdByCode as jest.Mock).mockResolvedValue('active-id');
      (userSessionRepository.create as jest.Mock).mockResolvedValue({ id: 's1' });

      const result = await service.createSession('u1', metadata, 'token', new Date());

      expect(result.sessionStatus).toBe('ACTIVE');
      expect(securityEventService.logEvent).toHaveBeenCalledWith(
        'u1',
        'ANOMALOUS_LOGIN_DETECTED',
        expect.anything(),
        expect.anything(),
      );
    });

    it('debe disparar lógica de strike al alcanzar el umbral', async () => {
      (anomalyDetector.resolveCoordinates as jest.Mock).mockResolvedValue({ metadata, locationSource: 'none' });
      (anomalyDetector.detectLocationAnomaly as jest.Mock).mockResolvedValue({ isAnomalous: true });
      (securityEventService.countEventsByCode as jest.Mock).mockResolvedValue(technicalSettings.auth.security.anomalyStrikeThreshold);
      (userSessionRepository.create as jest.Mock).mockResolvedValue({ id: 's1' });

      // @ts-ignore - Accediendo a método privado para verificar log
      const loggerSpy = jest.spyOn(service['logger'], 'log');

      await service.createSession('u1', metadata, 'token', new Date());

      expect(loggerSpy).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Umbral de strikes alcanzado'),
      }));
    });

    it('debe dar prioridad a Concurrencia (PENDING_CONCURRENT_RESOLUTION) sobre Anomalía', async () => {
      (anomalyDetector.resolveCoordinates as jest.Mock).mockResolvedValue({ metadata, locationSource: 'none' });
      (anomalyDetector.detectLocationAnomaly as jest.Mock).mockResolvedValue({ isAnomalous: true, anomalyType: ANOMALY_TYPES.IMPOSSIBLE_TRAVEL });
      (userSessionRepository.findOtherActiveSession as jest.Mock).mockResolvedValue({ id: 'existing' });
      (userSessionRepository.findSessionsByUserAndStatus as jest.Mock).mockResolvedValue([]);
      (sessionStatusService.getIdByCode as jest.Mock).mockImplementation((code) => {
        if (code === 'PENDING_CONCURRENT_RESOLUTION') return 'pending-id';
        return 'other';
      });
      (userSessionRepository.create as jest.Mock).mockResolvedValue({ id: 's-new' });

      const result = await service.createSession('u1', metadata, 'token', new Date());

      expect(result.sessionStatus).toBe('PENDING_CONCURRENT_RESOLUTION');
      expect(result.concurrentSessionId).toBe('existing');
      // Aun así debe registrar la anomalía en segundo plano
      expect(securityEventService.logEvent).toHaveBeenCalledWith(
        'u1',
        'ANOMALOUS_LOGIN_DETECTED',
        expect.anything(),
        expect.anything(),
      );
    });

    it('debe limpiar sesiones pendientes antiguas al alcanzar el límite (protección contra agotamiento)', async () => {
      (anomalyDetector.resolveCoordinates as jest.Mock).mockResolvedValue({ metadata, locationSource: 'none' });
      (anomalyDetector.detectLocationAnomaly as jest.Mock).mockResolvedValue({ isAnomalous: false, anomalyType: ANOMALY_TYPES.NONE });
      (userSessionRepository.findOtherActiveSession as jest.Mock).mockResolvedValue({ id: 'active' });
      
      const manyPending = Array(technicalSettings.auth.security.maxPendingSessionsPerUser).fill({ id: 'old' });
      (userSessionRepository.findSessionsByUserAndStatus as jest.Mock).mockResolvedValue(manyPending);
      (sessionStatusService.getIdByCode as jest.Mock).mockResolvedValue('status-id');
      (userSessionRepository.create as jest.Mock).mockResolvedValue({ id: 'new' });

      await service.createSession('u1', metadata, 'token', new Date());

      expect(userSessionRepository.update).toHaveBeenCalledWith(
        'old',
        expect.objectContaining({ isActive: false }),
        expect.anything()
      );
    });
  });
});
