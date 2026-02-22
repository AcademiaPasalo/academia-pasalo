import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileResource } from '@modules/materials/domain/file-resource.entity';

@Injectable()
export class FileResourceRepository {
  constructor(
    @InjectRepository(FileResource)
    private readonly ormRepository: Repository<FileResource>,
  ) {}

  async create(resource: Partial<FileResource>): Promise<FileResource> {
    const newResource = this.ormRepository.create(resource);
    return await this.ormRepository.save(newResource);
  }

  async findByHashAndSize(
    hash: string,
    sizeBytes: string,
  ): Promise<FileResource | null> {
    return await this.ormRepository.findOne({
      where: { checksumHash: hash, sizeBytes },
    });
  }
}
