import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FolderStatus } from '@modules/materials/domain/folder-status.entity';

@Injectable()
export class FolderStatusRepository {
  constructor(
    @InjectRepository(FolderStatus)
    private readonly ormRepository: Repository<FolderStatus>,
  ) {}

  async findByCode(code: string): Promise<FolderStatus | null> {
    return await this.ormRepository.findOne({ where: { code } });
  }
}
