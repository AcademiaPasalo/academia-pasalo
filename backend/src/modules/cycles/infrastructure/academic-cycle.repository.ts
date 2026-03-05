import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AcademicCycle } from '@modules/cycles/domain/academic-cycle.entity';

@Injectable()
export class AcademicCycleRepository {
  constructor(
    @InjectRepository(AcademicCycle)
    private readonly ormRepository: Repository<AcademicCycle>,
  ) {}

  async findAll(): Promise<AcademicCycle[]> {
    return await this.ormRepository.find({
      order: { startDate: 'DESC' },
    });
  }

  async findById(
    id: string,
    manager?: EntityManager,
  ): Promise<AcademicCycle | null> {
    const repo = manager
      ? manager.getRepository(AcademicCycle)
      : this.ormRepository;
    return await repo.findOne({
      where: { id },
    });
  }
}
