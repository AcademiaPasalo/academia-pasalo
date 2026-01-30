import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeletionRequest } from '@modules/materials/domain/deletion-request.entity';

@Injectable()
export class DeletionRequestRepository {
  constructor(
    @InjectRepository(DeletionRequest)
    private readonly ormRepository: Repository<DeletionRequest>,
  ) {}

  async create(request: Partial<DeletionRequest>): Promise<DeletionRequest> {
    const newRequest = this.ormRepository.create(request);
    return await this.ormRepository.save(newRequest);
  }

  async findById(id: string): Promise<DeletionRequest | null> {
    return await this.ormRepository.findOne({
      where: { id },
      relations: {
        requestedBy: true,
        deletionRequestStatus: true,
      },
    });
  }

  async findByStatusId(statusId: string): Promise<DeletionRequest[]> {
    return await this.ormRepository.find({
      where: { deletionRequestStatusId: statusId },
      relations: { 
        requestedBy: true,
        deletionRequestStatus: true 
      },
      order: { createdAt: 'ASC' },
    });
  }
}