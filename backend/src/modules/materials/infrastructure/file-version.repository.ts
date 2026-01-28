import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { FileVersion } from '@modules/materials/domain/file-version.entity';

@Injectable()
export class FileVersionRepository {
  constructor(
    @InjectRepository(FileVersion)
    private readonly ormRepository: Repository<FileVersion>,
  ) {}

  async create(data: Partial<FileVersion>, manager?: EntityManager): Promise<FileVersion> {
    const repo = manager ? manager.getRepository(FileVersion) : this.ormRepository;
    const version = repo.create(data);
    return await repo.save(version);
  }

  async findById(id: string): Promise<FileVersion | null> {
    return await this.ormRepository.findOne({ where: { id } });
  }
}
