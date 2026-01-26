import { Expose } from 'class-transformer';

export class AcademicCycleResponseDto {
  @Expose()
  id: string;

  @Expose()
  code: string;

  @Expose()
  startDate: Date;

  @Expose()
  endDate: Date;

  @Expose()
  createdAt: Date;
}
