import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CycleLevel } from '@modules/courses/domain/cycle-level.entity';

@Injectable()
export class CycleLevelRepository {
  constructor(
    @InjectRepository(CycleLevel)
    private readonly ormRepository: Repository<CycleLevel>,
  ) {}

  async findAll(): Promise<CycleLevel[]> {
    return await this.ormRepository.find({
      order: { levelNumber: 'ASC' },
    });
  }
}