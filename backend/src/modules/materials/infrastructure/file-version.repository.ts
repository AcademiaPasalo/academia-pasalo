import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileVersion } from '@modules/materials/domain/file-version.entity';

@Injectable()
export class FileVersionRepository {
  constructor(
    @InjectRepository(FileVersion)
    private readonly ormRepository: Repository<FileVersion>,
  ) {}

  async create(version: Partial<FileVersion>): Promise<FileVersion> {
    const newVersion = this.ormRepository.create(version);
    return await this.ormRepository.save(newVersion);
  }

  async findLatestByResourceId(resourceId: string): Promise<FileVersion | null> {
    return await this.ormRepository.findOne({
      where: { fileResourceId: resourceId },
      order: { versionNumber: 'DESC' },
    });
  }
}