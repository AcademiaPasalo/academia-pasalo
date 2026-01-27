import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async findById(id: string): Promise<AcademicCycle | null> {
    return await this.ormRepository.findOne({
      where: { id },
    });
  }
}
