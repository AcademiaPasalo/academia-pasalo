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

  async findLatestVersionNumber(fileResourceId: string, manager?: EntityManager): Promise<number> {
    const repo = manager ? manager.getRepository(FileVersion) : this.ormRepository;
    const latest = await repo.findOne({
      where: { fileResourceId },
      order: { versionNumber: 'DESC' },
    });
    return latest ? latest.versionNumber : 0;
  }

  async create(data: Partial<FileVersion>, manager?: EntityManager): Promise<FileVersion> {
    const repo = manager ? manager.getRepository(FileVersion) : this.ormRepository;
    const version = repo.create(data);
    return await repo.save(version);
  }
}