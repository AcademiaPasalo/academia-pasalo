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

  async create(folder: Partial<MaterialFolder>): Promise<MaterialFolder> {
    const newFolder = this.ormRepository.create(folder);
    return await this.ormRepository.save(newFolder);
  }

  async findById(id: string): Promise<MaterialFolder | null> {
    return await this.ormRepository.findOne({
      where: { id },
      relations: {
        folderStatus: true,
        parentFolder: true,
      },
    });
  }

  async findRootsByEvaluation(evaluationId: string, statusId: string): Promise<MaterialFolder[]> {
    return await this.ormRepository.find({
      where: { 
        evaluationId, 
        parentFolderId: IsNull(),
        folderStatusId: statusId 
      },
      order: { name: 'ASC' },
    });
  }

  async findSubFolders(parentFolderId: string, statusId: string): Promise<MaterialFolder[]> {
    return await this.ormRepository.find({
      where: { 
        parentFolderId,
        folderStatusId: statusId 
      },
      order: { name: 'ASC' },
    });
  }
}