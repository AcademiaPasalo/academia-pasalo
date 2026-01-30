import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { EnrollmentType } from '@modules/enrollments/domain/enrollment-type.entity';

@Injectable()
export class EnrollmentTypeRepository {
  constructor(
    @InjectRepository(EnrollmentType)
    private readonly ormRepository: Repository<EnrollmentType>,
  ) {}

  async findByCode(code: string, manager?: EntityManager): Promise<EnrollmentType | null> {
    const repo = manager ? manager.getRepository(EnrollmentType) : this.ormRepository;
    return await repo.findOne({ where: { code } });
  }
}
