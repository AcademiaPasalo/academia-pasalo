import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, EntityManager } from 'typeorm';
import { MaterialFolder } from '@modules/materials/domain/material-folder.entity';

@Injectable()
export class MaterialFolderRepository {
  constructor(
    @InjectRepository(MaterialFolder)
    private readonly ormRepository: Repository<MaterialFolder>,
  ) {}

  async create(data: Partial<MaterialFolder>, manager?: EntityManager): Promise<MaterialFolder> {
    const repo = manager ? manager.getRepository(MaterialFolder) : this.ormRepository;
    const folder = repo.create(data);
    return await repo.save(folder);
  }

  async findById(id: string): Promise<MaterialFolder | null> {
    return await this.ormRepository.findOne({
      where: { id },
      relations: { subfolders: true }, 
    });
  }

  async findRootsByEvaluation(evaluationId: string): Promise<MaterialFolder[]> {
    return await this.ormRepository.find({
      where: {
        evaluationId,
        parentFolderId: IsNull(),
      },
      relations: { status: true },
    });
  }
}