import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { FileResource } from '@modules/materials/domain/file-resource.entity';

@Injectable()
export class FileResourceRepository {
  constructor(
    @InjectRepository(FileResource)
    private readonly ormRepository: Repository<FileResource>,
  ) {}

  async create(data: Partial<FileResource>, manager?: EntityManager): Promise<FileResource> {
    const repo = manager ? manager.getRepository(FileResource) : this.ormRepository;
    const resource = repo.create({
      ...data,
      createdAt: new Date(),
    });
    return await repo.save(resource);
  }

  async findByHash(hash: string): Promise<FileResource | null> {
    return await this.ormRepository.findOne({ where: { checksumHash: hash } });
  }
}
