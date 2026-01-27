import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaterialStatus } from '@modules/materials/domain/material-status.entity';

@Injectable()
export class MaterialStatusRepository {
  constructor(
    @InjectRepository(MaterialStatus)
    private readonly ormRepository: Repository<MaterialStatus>,
  ) {}

  async findByCode(code: string): Promise<MaterialStatus | null> {
    return await this.ormRepository.findOne({ where: { code } });
  }
}
