import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FolderStatus } from '@modules/materials/domain/folder-status.entity';
import { MaterialStatus } from '@modules/materials/domain/material-status.entity';
import { DeletionRequestStatus } from '@modules/materials/domain/deletion-request-status.entity';

@Injectable()
export class MaterialCatalogRepository {
  constructor(
    @InjectRepository(FolderStatus)
    private readonly folderStatusRepo: Repository<FolderStatus>,
    @InjectRepository(MaterialStatus)
    private readonly materialStatusRepo: Repository<MaterialStatus>,
    @InjectRepository(DeletionRequestStatus)
    private readonly deletionRequestStatusRepo: Repository<DeletionRequestStatus>,
  ) {}

  async findFolderStatusByCode(code: string): Promise<FolderStatus | null> {
    return await this.folderStatusRepo.findOne({ where: { code } });
  }

  async findMaterialStatusByCode(code: string): Promise<MaterialStatus | null> {
    return await this.materialStatusRepo.findOne({ where: { code } });
  }

  async findDeletionRequestStatusByCode(code: string): Promise<DeletionRequestStatus | null> {
    return await this.deletionRequestStatusRepo.findOne({ where: { code } });
  }
}
