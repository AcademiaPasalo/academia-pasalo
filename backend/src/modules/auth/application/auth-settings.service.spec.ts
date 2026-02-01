import { Test, TestingModule } from '@nestjs/testing';
import { AuthSettingsService } from './auth-settings.service';
import { SettingsService } from '@modules/settings/application/settings.service';
import { InternalServerErrorException } from '@nestjs/common';

describe('AuthSettingsService', () => {
  let service: AuthSettingsService;
  let settingsService: jest.Mocked<SettingsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthSettingsService,
        {
          provide: SettingsService,
          useValue: {
            getString: jest.fn(),
            getPositiveInt: jest.fn(),
            invalidateCache: jest.fn(),
            invalidateAllCache: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthSettingsService>(AuthSettingsService);
    settingsService = module.get(SettingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getActiveCycleId', () => {
    it('debe retornar el ID del ciclo activo', async () => {
      settingsService.getString.mockResolvedValue('CYCLE_2024_1');

      const result = await service.getActiveCycleId();

      expect(result).toBe('CYCLE_2024_1');
      expect(settingsService.getString).toHaveBeenCalledWith('ACTIVE_CYCLE_ID');
    });

    it('debe propagar error si el setting no existe', async () => {
      settingsService.getString.mockRejectedValue(
        new InternalServerErrorException('Configuración del sistema incompleta'),
      );

      await expect(service.getActiveCycleId()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getRefreshTokenTtlDays', () => {
    it('debe retornar el TTL de refresh token en días', async () => {
      const result = await service.getRefreshTokenTtlDays();

      expect(result).toBe(7);
      expect(settingsService.getPositiveInt).not.toHaveBeenCalled();
    });
  });

  describe('getAccessTokenTtlMinutes', () => {
    it('debe retornar el TTL de access token en minutos', async () => {
      const result = await service.getAccessTokenTtlMinutes();

      expect(result).toBe(180);
      expect(settingsService.getPositiveInt).not.toHaveBeenCalled();
    });
  });

  describe('getSessionExpirationWarningMinutes', () => {
    it('debe retornar los minutos de advertencia de expiración', async () => {
      const result = await service.getSessionExpirationWarningMinutes();

      expect(result).toBe(10);
      expect(settingsService.getPositiveInt).not.toHaveBeenCalled();
    });
  });

  describe('getGeoGpsTimeWindowMinutes', () => {
    it('debe retornar la ventana de tiempo para GPS', async () => {
      settingsService.getPositiveInt.mockResolvedValue(10);

      const result = await service.getGeoGpsTimeWindowMinutes();

      expect(result).toBe(10);
      expect(settingsService.getPositiveInt).toHaveBeenCalledWith(
        'GEO_GPS_ANOMALY_TIME_WINDOW_MINUTES',
      );
    });
  });

  describe('getGeoGpsDistanceKm', () => {
    it('debe retornar la distancia umbral para GPS', async () => {
      settingsService.getPositiveInt.mockResolvedValue(5);

      const result = await service.getGeoGpsDistanceKm();

      expect(result).toBe(5);
      expect(settingsService.getPositiveInt).toHaveBeenCalledWith(
        'GEO_GPS_ANOMALY_DISTANCE_KM',
      );
    });
  });

  describe('getGeoIpTimeWindowMinutes', () => {
    it('debe retornar la ventana de tiempo para IP', async () => {
      settingsService.getPositiveInt.mockResolvedValue(30);

      const result = await service.getGeoIpTimeWindowMinutes();

      expect(result).toBe(30);
      expect(settingsService.getPositiveInt).toHaveBeenCalledWith(
        'GEO_IP_ANOMALY_TIME_WINDOW_MINUTES',
      );
    });
  });

  describe('getGeoIpDistanceKm', () => {
    it('debe retornar la distancia umbral para IP', async () => {
      settingsService.getPositiveInt.mockResolvedValue(100);

      const result = await service.getGeoIpDistanceKm();

      expect(result).toBe(100);
      expect(settingsService.getPositiveInt).toHaveBeenCalledWith(
        'GEO_IP_ANOMALY_DISTANCE_KM',
      );
    });
  });

  describe('invalidateCache', () => {
    it('debe invalidar un setting específico', () => {
      service.invalidateCache('ACTIVE_CYCLE_ID');

      expect(settingsService.invalidateCache).toHaveBeenCalledWith(
        'ACTIVE_CYCLE_ID',
      );
    });
  });

  describe('invalidateAllCache', () => {
    it('debe invalidar todo el caché', () => {
      service.invalidateAllCache();

      expect(settingsService.invalidateAllCache).toHaveBeenCalled();
    });
  });
});
