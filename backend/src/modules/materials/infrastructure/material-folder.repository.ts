import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { MaterialFolder } from '@modules/materials/domain/material-folder.entity';

@Injectable()
export class MaterialFolderRepository {
  constructor(
    @InjectRepository(MaterialFolder)
    private readonly ormRepository: Repository<MaterialFolder>,
  ) {}

  async findById(id: string): Promise<MaterialFolder | null> {
    return await this.ormRepository.findOne({
      where: { id },
      relations: {
        status: true,
        subfolders: true,
      },
    });
  }

  async findByEvaluation(evaluationId: string): Promise<MaterialFolder[]> {
    return await this.ormRepository.find({
      where: {
        evaluationId,
        parentFolderId: IsNull(),
      },
      relations: {
        status: true,
        subfolders: true,
      },
      order: { createdAt: 'ASC' },
    });
  }

  async create(data: Partial<MaterialFolder>): Promise<MaterialFolder> {
    const folder = this.ormRepository.create(data);
    return await this.ormRepository.save(folder);
  }
}
