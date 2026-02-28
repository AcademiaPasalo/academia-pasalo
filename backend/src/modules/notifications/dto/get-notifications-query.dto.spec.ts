import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { GetNotificationsQueryDto } from './get-notifications-query.dto';
import { technicalSettings } from '@config/technical-settings';

async function transform(
  plain: Record<string, unknown>,
): Promise<GetNotificationsQueryDto> {
  return plainToInstance(GetNotificationsQueryDto, plain, {
    excludeExtraneousValues: false,
    enableImplicitConversion: false,
  });
}

describe('GetNotificationsQueryDto', () => {
  describe('limit', () => {
    it('usa el valor por defecto cuando no se provee', async () => {
      const dto = await transform({});
      expect(dto.limit).toBe(technicalSettings.notifications.defaultPageLimit);
    });

    it('parsea string numérico válido', async () => {
      const dto = await transform({ limit: '50' });
      expect(dto.limit).toBe(50);
    });

    it('parsea número directamente', async () => {
      const dto = await transform({ limit: 30 });
      expect(dto.limit).toBe(30);
    });

    it('usa valor por defecto cuando el string no es numérico', async () => {
      const dto = await transform({ limit: 'abc' });
      expect(dto.limit).toBe(technicalSettings.notifications.defaultPageLimit);
    });

    it('usa valor por defecto cuando el tipo no es string ni number', async () => {
      const dto = await transform({ limit: true });
      expect(dto.limit).toBe(technicalSettings.notifications.defaultPageLimit);
    });

    it('usa valor por defecto cuando limit es null', async () => {
      const dto = await transform({ limit: null });
      expect(dto.limit).toBe(technicalSettings.notifications.defaultPageLimit);
    });

    it('falla validación si limit es menor que 1', async () => {
      const dto = await transform({ limit: '0' });
      const errors = await validate(dto);
      const limitError = errors.find((e) => e.property === 'limit');
      expect(limitError).toBeDefined();
    });

    it('falla validación si limit es mayor que 100', async () => {
      const dto = await transform({ limit: '101' });
      const errors = await validate(dto);
      const limitError = errors.find((e) => e.property === 'limit');
      expect(limitError).toBeDefined();
    });
  });

  describe('offset', () => {
    it('usa 0 cuando no se provee', async () => {
      const dto = await transform({});
      expect(dto.offset).toBe(0);
    });

    it('parsea string numérico válido', async () => {
      const dto = await transform({ offset: '40' });
      expect(dto.offset).toBe(40);
    });

    it('parsea número directamente', async () => {
      const dto = await transform({ offset: 20 });
      expect(dto.offset).toBe(20);
    });

    it('usa 0 cuando el string no es numérico', async () => {
      const dto = await transform({ offset: 'xyz' });
      expect(dto.offset).toBe(0);
    });

    it('usa 0 cuando el tipo no es string ni number', async () => {
      const dto = await transform({ offset: {} });
      expect(dto.offset).toBe(0);
    });

    it('falla validación si offset es negativo', async () => {
      const dto = await transform({ offset: '-1' });
      const errors = await validate(dto);
      const offsetError = errors.find((e) => e.property === 'offset');
      expect(offsetError).toBeDefined();
    });
  });

  describe('onlyUnread', () => {
    it('es undefined cuando no se provee', async () => {
      const dto = await transform({});
      expect(dto.onlyUnread).toBeUndefined();
    });

    it('transforma "true" a booleano true', async () => {
      const dto = await transform({ onlyUnread: 'true' });
      expect(dto.onlyUnread).toBe(true);
    });

    it('transforma "false" a booleano false', async () => {
      const dto = await transform({ onlyUnread: 'false' });
      expect(dto.onlyUnread).toBe(false);
    });

    it('deja undefined para valores no reconocidos', async () => {
      const dto = await transform({ onlyUnread: '1' });
      expect(dto.onlyUnread).toBeUndefined();
    });

    it('no falla validación cuando el valor no reconocido produce undefined (IsOptional lo acepta)', async () => {
      const dto = await transform({ onlyUnread: '1' });
      const errors = await validate(dto);
      const unreadError = errors.find((e) => e.property === 'onlyUnread');
      expect(unreadError).toBeUndefined();
    });
  });
});
