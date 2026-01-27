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

  async findByHash(hash: string, manager?: EntityManager): Promise<FileResource | null> {
    const repo = manager ? manager.getRepository(FileResource) : this.ormRepository;
    return await repo.findOne({ where: { checksumHash: hash } });
  }

  async create(data: Partial<FileResource>, manager?: EntityManager): Promise<FileResource> {
    const repo = manager ? manager.getRepository(FileResource) : this.ormRepository;
    const resource = repo.create(data);
    return await repo.save(resource);
  }
}