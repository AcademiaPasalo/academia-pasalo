import { Test } from '@nestjs/testing';
import { SessionAnomalyDetectorService } from './session-anomaly-detector.service';
import { GeolocationService } from './geolocation.service';
import { AuthSettingsService } from './auth-settings.service';
import { GeoProvider } from '@common/interfaces/geo-provider.interface';
import { UserSessionRepository } from '@modules/auth/infrastructure/user-session.repository';
import { RequestMetadata } from '@modules/auth/interfaces/request-metadata.interface';
import { ANOMALY_TYPES } from '@modules/auth/interfaces/security.constants';
import { UserSession } from '@modules/auth/domain/user-session.entity';

describe('SessionAnomalyDetectorService', () => {
  let detector: SessionAnomalyDetectorService;
  let geolocationService: GeolocationService;
  let authSettingsService: AuthSettingsService;
  let userSessionRepository: UserSessionRepository;
  let geoProvider: GeoProvider;

  const metadata: RequestMetadata = {
    ipAddress: '190.235.1.1',
    userAgent: 'test-ua',
    deviceId: 'new-device',
    latitude: -12.046374,
    longitude: -77.042793,
  };

  const lastSession = {
    id: 'last-session-id',
    latitude: -12.046374,
    longitude: -77.042793,
    lastActivityAt: new Date(Date.now() - 10 * 60 * 1000), // Hace 10 min
  } as UserSession;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        SessionAnomalyDetectorService,
        {
          provide: GeolocationService,
          useValue: { calculateDistance: jest.fn() },
        },
        {
          provide: AuthSettingsService,
          useValue: {
            getGeoGpsTimeWindowMinutes: jest.fn().mockResolvedValue(30),
            getGeoIpTimeWindowMinutes: jest.fn().mockResolvedValue(60),
            getGeoGpsDistanceKm: jest.fn().mockResolvedValue(10),
            getGeoIpDistanceKm: jest.fn().mockResolvedValue(300),
          },
        },
        {
          provide: GeoProvider,
          useValue: { resolve: jest.fn() },
        },
        {
          provide: UserSessionRepository,
          useValue: { findLatestSessionByUserId: jest.fn() },
        },
      ],
    }).compile();

    detector = moduleRef.get(SessionAnomalyDetectorService);
    geolocationService = moduleRef.get(GeolocationService);
    authSettingsService = moduleRef.get(AuthSettingsService);
    userSessionRepository = moduleRef.get(UserSessionRepository);
    geoProvider = moduleRef.get(GeoProvider);
  });

  describe('detectLocationAnomaly', () => {
    it('debe retornar NONE si no hay sesión previa', async () => {
      (
        userSessionRepository.findLatestSessionByUserId as jest.Mock
      ).mockResolvedValue(null);

      const result = await detector.detectLocationAnomaly(
        'u1',
        metadata,
        'gps',
        true,
      );

      expect(result.isAnomalous).toBe(false);
      expect(result.anomalyType).toBe(ANOMALY_TYPES.NONE);
    });

    it('debe detectar NEW_DEVICE_QUICK_CHANGE si el dispositivo es nuevo y el tiempo < ventana', async () => {
      (
        userSessionRepository.findLatestSessionByUserId as jest.Mock
      ).mockResolvedValue(lastSession);

      const result = await detector.detectLocationAnomaly(
        'u1',
        metadata,
        'gps',
        true,
      );

      expect(result.isAnomalous).toBe(true);
      expect(result.anomalyType).toBe(ANOMALY_TYPES.NEW_DEVICE_QUICK_CHANGE);
      expect(result.timeDifferenceMinutes).toBeLessThan(30);
    });

    it('debe retornar NONE si el dispositivo es nuevo pero el tiempo > ventana', async () => {
      const oldLastSession = {
        ...lastSession,
        lastActivityAt: new Date(Date.now() - 40 * 60 * 1000),
      } as UserSession;
      (
        userSessionRepository.findLatestSessionByUserId as jest.Mock
      ).mockResolvedValue(oldLastSession);
      (geolocationService.calculateDistance as jest.Mock).mockReturnValue(2); // 2km

      const result = await detector.detectLocationAnomaly(
        'u1',
        metadata,
        'gps',
        true,
      );

      expect(result.isAnomalous).toBe(false);
      expect(result.anomalyType).toBe(ANOMALY_TYPES.NONE);
    });

    it('debe detectar IMPOSSIBLE_TRAVEL si la distancia supera el umbral en la ventana de tiempo', async () => {
      (
        userSessionRepository.findLatestSessionByUserId as jest.Mock
      ).mockResolvedValue(lastSession);
      (geolocationService.calculateDistance as jest.Mock).mockReturnValue(50); // 50km en 10 min

      const result = await detector.detectLocationAnomaly(
        'u1',
        metadata,
        'gps',
        false,
      );

      expect(result.isAnomalous).toBe(true);
      expect(result.anomalyType).toBe(ANOMALY_TYPES.IMPOSSIBLE_TRAVEL);
      expect(result.distanceKm).toBe(50);
    });

    it('debe retornar NONE si es dispositivo conocido y distancia dentro del umbral', async () => {
      (
        userSessionRepository.findLatestSessionByUserId as jest.Mock
      ).mockResolvedValue(lastSession);
      (geolocationService.calculateDistance as jest.Mock).mockReturnValue(2); // 2km

      const result = await detector.detectLocationAnomaly(
        'u1',
        metadata,
        'gps',
        false,
      );

      expect(result.isAnomalous).toBe(false);
      expect(result.anomalyType).toBe(ANOMALY_TYPES.NONE);
    });

    it('debe retornar NONE si las coordenadas son inválidas (sanitización)', async () => {
      (
        userSessionRepository.findLatestSessionByUserId as jest.Mock
      ).mockResolvedValue(lastSession);
      const badMeta = { ...metadata, latitude: 999 }; // Latitud inválida

      const result = await detector.detectLocationAnomaly(
        'u1',
        badMeta,
        'gps',
        false,
      );

      expect(result.isAnomalous).toBe(false);
      expect(result.anomalyType).toBe(ANOMALY_TYPES.NONE);
      expect(geolocationService.calculateDistance).not.toHaveBeenCalled();
    });
  });

  describe('resolveCoordinates', () => {
    it('debe usar GPS si la metadata tiene coordenadas', async () => {
      const result = await detector.resolveCoordinates(metadata);
      expect(result.locationSource).toBe('gps');
      expect(result.metadata.latitude).toBe(metadata.latitude);
    });

    it('debe usar IP si no hay GPS y el proveedor resuelve', async () => {
      const metaNoGps = {
        ...metadata,
        latitude: undefined,
        longitude: undefined,
      };
      (geoProvider.resolve as jest.Mock).mockReturnValue({
        latitude: -12,
        longitude: -77,
        city: 'Lima',
        country: 'PE',
      });

      const result = await detector.resolveCoordinates(metaNoGps);
      expect(result.locationSource).toBe('ip');
      expect(result.metadata.latitude).toBe(-12);
      expect(result.metadata.city).toBe('Lima');
    });

    it('debe retornar source none si no hay coordenadas ni resolución por IP', async () => {
      const metaNoGps = {
        ...metadata,
        latitude: undefined,
        longitude: undefined,
      };
      (geoProvider.resolve as jest.Mock).mockReturnValue(null);

      const result = await detector.resolveCoordinates(metaNoGps);
      expect(result.locationSource).toBe('none');
    });
  });
});
