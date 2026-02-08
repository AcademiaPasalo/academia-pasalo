import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeletionRequestStatus } from '@modules/materials/domain/deletion-request-status.entity';

@Injectable()
export class DeletionRequestStatusRepository {
  constructor(
    @InjectRepository(DeletionRequestStatus)
    private readonly ormRepository: Repository<DeletionRequestStatus>,
  ) {}

  async findByCode(code: string): Promise<DeletionRequestStatus | null> {
    return await this.ormRepository.findOne({ where: { code } });
  }
}
