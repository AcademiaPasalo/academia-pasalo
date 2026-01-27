import { Injectable, NotFoundException, BadRequestException, Logger, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { MaterialFolderRepository } from '@modules/materials/infrastructure/material-folder.repository';
import { FolderStatusRepository } from '@modules/materials/infrastructure/folder-status.repository';
import { EvaluationRepository } from '@modules/evaluations/infrastructure/evaluation.repository';
import { MaterialRepository } from '@modules/materials/infrastructure/material.repository';
import { MaterialStatusRepository } from '@modules/materials/infrastructure/material-status.repository';
import { FileResourceRepository } from '@modules/materials/infrastructure/file-resource.repository';
import { FileVersionRepository } from '@modules/materials/infrastructure/file-version.repository';
import { StorageService } from '@infrastructure/storage/storage.service';
import { CreateFolderDto } from '@modules/materials/dto/create-folder.dto';
import { CreateMaterialDto } from '@modules/materials/dto/create-material.dto';
import { MaterialFolder } from '@modules/materials/domain/material-folder.entity';
import { Material } from '@modules/materials/domain/material.entity';
import { FileResource } from '@modules/materials/domain/file-resource.entity';
import { FileVersion } from '@modules/materials/domain/file-version.entity';

@Injectable()
export class MaterialsService {
  private readonly logger = new Logger(MaterialsService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly folderRepository: MaterialFolderRepository,
    private readonly statusRepository: FolderStatusRepository,
    private readonly evaluationRepository: EvaluationRepository,
    private readonly materialRepository: MaterialRepository,
    private readonly materialStatusRepository: MaterialStatusRepository,
    private readonly fileResourceRepository: FileResourceRepository,
    private readonly fileVersionRepository: FileVersionRepository,
    private readonly storageService: StorageService,
  ) {}

  async createFolder(dto: CreateFolderDto, userId: string): Promise<MaterialFolder> {
    const evaluation = await this.evaluationRepository.findByIds([dto.evaluationId]);
    if (evaluation.length === 0) {
      throw new NotFoundException('La evaluación solicitada no existe.');
    }

    if (dto.parentFolderId) {
      const parent = await this.folderRepository.findById(dto.parentFolderId);
      if (!parent) {
        throw new NotFoundException('La carpeta superior no existe.');
      }
      if (parent.evaluationId !== dto.evaluationId) {
        throw new BadRequestException('La subcarpeta debe pertenecer a la misma evaluación que la carpeta padre.');
      }
    }

    const status = await this.statusRepository.findByCode('ACTIVE');
    if (!status) {
      throw new BadRequestException('Estado de carpeta no configurado.');
    }

    return await this.folderRepository.create({
      evaluationId: dto.evaluationId,
      parentFolderId: dto.parentFolderId || null,
      folderStatusId: status.id,
      name: dto.name,
      visibleFrom: dto.visibleFrom ? new Date(dto.visibleFrom) : null,
      visibleUntil: dto.visibleUntil ? new Date(dto.visibleUntil) : null,
      createdBy: userId,
    });
  }

  async getFoldersByEvaluation(evaluationId: string): Promise<MaterialFolder[]> {
    return await this.folderRepository.findByEvaluation(evaluationId);
  }

  async uploadMaterial(
    dto: CreateMaterialDto,
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    userId: string,
  ): Promise<Material> {
    const folder = await this.folderRepository.findById(dto.materialFolderId);
    if (!folder) {
      throw new NotFoundException('La carpeta de destino no existe.');
    }

    const status = await this.materialStatusRepository.findByCode('PUBLISHED');
    if (!status) {
      throw new InternalServerErrorException('Estado de material no configurado.');
    }

    const hash = await this.storageService.calculateHash(file.buffer);

    return await this.dataSource.transaction(async (manager) => {
      let fileResource = await this.fileResourceRepository.findByHash(hash, manager);

      if (!fileResource) {
        const fileName = `${Date.now()}-${file.originalname}`;
        const storageUrl = await this.storageService.saveFile(fileName, file.buffer);

        fileResource = await this.fileResourceRepository.create({
          checksumHash: hash,
          originalName: file.originalname,
          mimeType: file.mimetype,
          sizeBytes: file.size.toString(),
          storageUrl,
        }, manager);
      }

      const latestVersion = await this.fileVersionRepository.findLatestVersionNumber(fileResource.id, manager);
      
      const fileVersion = await this.fileVersionRepository.create({
        fileResourceId: fileResource.id,
        versionNumber: latestVersion + 1,
        storageUrl: fileResource.storageUrl,
        createdBy: userId,
      }, manager);

      const material = await this.materialRepository.create({
        materialFolderId: dto.materialFolderId,
        fileResourceId: fileResource.id,
        fileVersionId: fileVersion.id,
        materialStatusId: status.id,
        displayName: dto.displayName,
        visibleFrom: dto.visibleFrom ? new Date(dto.visibleFrom) : null,
        visibleUntil: dto.visibleUntil ? new Date(dto.visibleUntil) : null,
        createdBy: userId,
      }, manager);

      this.logger.log({
        message: 'Material subido y versionado exitosamente',
        materialId: material.id,
        hash,
        timestamp: new Date().toISOString(),
      });

      return material;
    });
  }
}
