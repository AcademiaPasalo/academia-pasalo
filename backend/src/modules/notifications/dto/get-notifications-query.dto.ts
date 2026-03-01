import { Expose, Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';
import { technicalSettings } from '@config/technical-settings';

export class GetNotificationsQueryDto {
  @Expose()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined) return undefined;
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean({ message: 'onlyUnread debe ser "true" o "false"' })
  onlyUnread?: boolean;

  @Expose()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string' && typeof value !== 'number') {
      return technicalSettings.notifications.defaultPageLimit;
    }
    const parsed = parseInt(String(value), 10);
    return Number.isFinite(parsed)
      ? parsed
      : technicalSettings.notifications.defaultPageLimit;
  })
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = technicalSettings.notifications.defaultPageLimit;

  @Expose()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string' && typeof value !== 'number') {
      return 0;
    }
    const parsed = parseInt(String(value), 10);
    return Number.isFinite(parsed) ? parsed : 0;
  })
  @IsInt()
  @Min(0)
  offset: number = 0;
}
