import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { EnrollmentStatus } from '@modules/enrollments/domain/enrollment-status.entity';

@Injectable()
export class EnrollmentStatusRepository {
  constructor(
    @InjectRepository(EnrollmentStatus)
    private readonly ormRepository: Repository<EnrollmentStatus>,
  ) {}

  async findByCode(
    code: string,
    manager?: EntityManager,
  ): Promise<EnrollmentStatus | null> {
    const repo = manager
      ? manager.getRepository(EnrollmentStatus)
      : this.ormRepository;
    return await repo.findOne({ where: { code } });
  }
}
