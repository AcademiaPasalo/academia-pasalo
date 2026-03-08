import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileResource } from '@modules/materials/domain/file-resource.entity';
import { Material } from '@modules/materials/domain/material.entity';
import { MaterialFolder } from '@modules/materials/domain/material-folder.entity';

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

  async findByHashAndSizeWithinEvaluation(
    hash: string,
    sizeBytes: string,
    evaluationId: string,
  ): Promise<FileResource | null> {
    return await this.ormRepository
      .createQueryBuilder('fr')
      .innerJoin(Material, 'm', 'm.file_resource_id = fr.id')
      .innerJoin(MaterialFolder, 'mf', 'mf.id = m.material_folder_id')
      .where('fr.checksum_hash = :hash', { hash })
      .andWhere('fr.size_bytes = :sizeBytes', { sizeBytes })
      .andWhere('mf.evaluation_id = :evaluationId', { evaluationId })
      .orderBy('fr.id', 'ASC')
      .getOne();
  }
}
