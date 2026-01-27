import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnrollmentStatus } from '@modules/enrollments/domain/enrollment-status.entity';

@Injectable()
export class EnrollmentStatusRepository {
  constructor(
    @InjectRepository(EnrollmentStatus)
    private readonly ormRepository: Repository<EnrollmentStatus>,
  ) {}

  async findByCode(code: string): Promise<EnrollmentStatus | null> {
    return await this.ormRepository.findOne({ where: { code } });
  }
}
