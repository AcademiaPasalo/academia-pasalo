import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { DeletionRequest } from '@modules/materials/domain/deletion-request.entity';

@Injectable()
export class DeletionRequestRepository {
  constructor(
    @InjectRepository(DeletionRequest)
    private readonly ormRepository: Repository<DeletionRequest>,
  ) {}

  async create(data: Partial<DeletionRequest>, manager?: EntityManager): Promise<DeletionRequest> {
    const repo = manager ? manager.getRepository(DeletionRequest) : this.ormRepository;
    const request = repo.create(data);
    return await repo.save(request);
  }

  async findById(id: string): Promise<DeletionRequest | null> {
    return await this.ormRepository.findOne({
      where: { id },
      relations: { status: true, requestedBy: true },
    });
  }
}
