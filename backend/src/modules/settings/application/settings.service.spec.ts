import { Test, TestingModule } from '@nestjs/testing';
import { SettingsService } from './settings.service';
import { SystemSettingRepository } from '@modules/settings/infrastructure/system-setting.repository';
import { SystemSetting } from '@modules/settings/domain/system-setting.entity';
import { InternalServerErrorException } from '@nestjs/common';

describe('SettingsService', () => {
  let service: SettingsService;
  let repository: jest.Mocked<SystemSettingRepository>;

  const mockSetting = (key: string, value: string): SystemSetting => ({
    id: '1',
    settingKey: key,
    settingValue: value,
    description: null,
    createdAt: new Date(),
    updatedAt: null,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        {
          provide: SystemSettingRepository,
          useValue: {
            findByKey: jest.fn(),
            updateByKey: jest.fn(),
            invalidateKey: jest.fn(),
            invalidateAllCache: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
    repository = module.get(SystemSettingRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getString', () => {
    it('debe retornar valor de setting en primera consulta', async () => {
      const setting = mockSetting('ACTIVE_CYCLE_ID', 'CYCLE_2024_1');
      repository.findByKey.mockResolvedValue(setting);

      const result = await service.getString('ACTIVE_CYCLE_ID');

      expect(result).toBe('CYCLE_2024_1');
      expect(repository.findByKey).toHaveBeenCalledWith('ACTIVE_CYCLE_ID');
      expect(repository.findByKey).toHaveBeenCalledTimes(1);
    });

    it('debe cachear el valor y no volver a consultar BD', async () => {
      const setting = mockSetting('ACTIVE_CYCLE_ID', 'CYCLE_2024_1');
      repository.findByKey.mockResolvedValue(setting);

      await service.getString('ACTIVE_CYCLE_ID');
      const result = await service.getString('ACTIVE_CYCLE_ID');

      expect(result).toBe('CYCLE_2024_1');
      expect(repository.findByKey).toHaveBeenCalledTimes(1);
    });

    it('debe lanzar error si setting no existe', async () => {
      repository.findByKey.mockResolvedValue(null);

      await expect(service.getString('NONEXISTENT_KEY')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('debe cachear múltiples settings diferentes', async () => {
      repository.findByKey
        .mockResolvedValueOnce(mockSetting('KEY_1', 'value1'))
        .mockResolvedValueOnce(mockSetting('KEY_2', 'value2'));

      const result1 = await service.getString('KEY_1');
      const result2 = await service.getString('KEY_2');

      expect(result1).toBe('value1');
      expect(result2).toBe('value2');
      expect(repository.findByKey).toHaveBeenCalledTimes(2);

      await service.getString('KEY_1');
      await service.getString('KEY_2');

      expect(repository.findByKey).toHaveBeenCalledTimes(2);
    });
  });

  describe('getPositiveInt', () => {
    it('debe parsear y retornar número entero positivo', async () => {
      const setting = mockSetting('TTL_DAYS', '7');
      repository.findByKey.mockResolvedValue(setting);

      const result = await service.getPositiveInt('TTL_DAYS');

      expect(result).toBe(7);
      expect(typeof result).toBe('number');
    });

    it('debe cachear el parsing', async () => {
      const setting = mockSetting('TTL_DAYS', '7');
      repository.findByKey.mockResolvedValue(setting);

      await service.getPositiveInt('TTL_DAYS');
      const result = await service.getPositiveInt('TTL_DAYS');

      expect(result).toBe(7);
      expect(repository.findByKey).toHaveBeenCalledTimes(1);
    });

    it('debe lanzar error si el valor no es un número', async () => {
      const setting = mockSetting('TTL_DAYS', 'invalid');
      repository.findByKey.mockResolvedValue(setting);

      await expect(service.getPositiveInt('TTL_DAYS')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('debe lanzar error si el valor es cero', async () => {
      const setting = mockSetting('TTL_DAYS', '0');
      repository.findByKey.mockResolvedValue(setting);

      await expect(service.getPositiveInt('TTL_DAYS')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('debe lanzar error si el valor es negativo', async () => {
      const setting = mockSetting('TTL_DAYS', '-5');
      repository.findByKey.mockResolvedValue(setting);

      await expect(service.getPositiveInt('TTL_DAYS')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('debe lanzar error si el valor es decimal', async () => {
      const setting = mockSetting('TTL_DAYS', '7.5');
      repository.findByKey.mockResolvedValue(setting);

      const result = await service.getPositiveInt('TTL_DAYS');

      expect(result).toBe(7);
    });

    it('debe lanzar error si el valor es Infinity', async () => {
      const setting = mockSetting('TTL_DAYS', 'Infinity');
      repository.findByKey.mockResolvedValue(setting);

      await expect(service.getPositiveInt('TTL_DAYS')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('debe lanzar error si el valor es NaN', async () => {
      const setting = mockSetting('TTL_DAYS', 'NaN');
      repository.findByKey.mockResolvedValue(setting);

      await expect(service.getPositiveInt('TTL_DAYS')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('invalidateCache', () => {
    it('debe invalidar un setting específico', async () => {
      const setting = mockSetting('KEY_1', 'value1');
      repository.findByKey.mockResolvedValue(setting);

      await service.getString('KEY_1');
      expect(repository.findByKey).toHaveBeenCalledTimes(1);

      await service.invalidateCache('KEY_1');

      await service.getString('KEY_1');
      expect(repository.findByKey).toHaveBeenCalledTimes(2);
    });

    it('no debe afectar otros settings cacheados', async () => {
      const setting1 = mockSetting('KEY_1', 'value1');
      const setting2 = mockSetting('KEY_2', 'value2');

      repository.findByKey
        .mockResolvedValueOnce(setting1)
        .mockResolvedValueOnce(setting2)
        .mockResolvedValueOnce(setting1);

      await service.getString('KEY_1');
      await service.getString('KEY_2');

      await service.invalidateCache('KEY_1');

      await service.getString('KEY_1');
      await service.getString('KEY_2');

      expect(repository.findByKey).toHaveBeenCalledTimes(3);
    });
  });

  describe('invalidateAllCache', () => {
    it('debe invalidar todos los settings cacheados', async () => {
      const setting1 = mockSetting('KEY_1', 'value1');
      const setting2 = mockSetting('KEY_2', 'value2');
      const setting3 = mockSetting('KEY_3', 'value3');

      repository.findByKey
        .mockResolvedValueOnce(setting1)
        .mockResolvedValueOnce(setting2)
        .mockResolvedValueOnce(setting3)
        .mockResolvedValueOnce(setting1)
        .mockResolvedValueOnce(setting2)
        .mockResolvedValueOnce(setting3);

      await service.getString('KEY_1');
      await service.getString('KEY_2');
      await service.getString('KEY_3');
      expect(repository.findByKey).toHaveBeenCalledTimes(3);

      await service.invalidateAllCache();

      await service.getString('KEY_1');
      await service.getString('KEY_2');
      await service.getString('KEY_3');
      expect(repository.findByKey).toHaveBeenCalledTimes(6);
    });
  });

  describe('Edge Cases', () => {
    it('debe manejar strings vacíos', async () => {
      const setting = mockSetting('EMPTY_KEY', '');
      repository.findByKey.mockResolvedValue(setting);

      const result = await service.getString('EMPTY_KEY');

      expect(result).toBe('');
    });

    it('debe manejar números con espacios', async () => {
      const setting = mockSetting('NUMBER_KEY', '  42  ');
      repository.findByKey.mockResolvedValue(setting);

      const result = await service.getPositiveInt('NUMBER_KEY');

      expect(result).toBe(42);
    });

    it('debe manejar concurrencia en primera carga', async () => {
      const setting = mockSetting('CONCURRENT_KEY', 'value');
      repository.findByKey.mockResolvedValue(setting);

      const [result1, result2, result3] = await Promise.all([
        service.getString('CONCURRENT_KEY'),
        service.getString('CONCURRENT_KEY'),
        service.getString('CONCURRENT_KEY'),
      ]);

      expect(result1).toBe('value');
      expect(result2).toBe('value');
      expect(result3).toBe('value');
      expect(repository.findByKey).toHaveBeenCalledTimes(3);
    });
  });
});
