import { Injectable, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { MaterialRepository } from '@modules/materials/infrastructure/material.repository';
import { MaterialFolderRepository } from '@modules/materials/infrastructure/material-folder.repository';
import { FileResourceRepository } from '@modules/materials/infrastructure/file-resource.repository';
import { FileVersionRepository } from '@modules/materials/infrastructure/file-version.repository';
import { MaterialStatusRepository } from '@modules/materials/infrastructure/material-status.repository';
import { DeletionRequestRepository } from '@modules/materials/infrastructure/deletion-request.repository';
import { DeletionRequestStatusRepository } from '@modules/materials/infrastructure/deletion-request-status.repository';
import { AccessEngineService } from '@modules/enrollments/application/access-engine.service';
import { StorageService } from '@infrastructure/storage/storage.service';
import { CreateMaterialDto } from '@modules/materials/dto/create-material.dto';
import { Material } from '@modules/materials/domain/material.entity';
import { FileResource } from '@modules/materials/domain/file-resource.entity';
import { createReadStream } from 'fs';
import { StreamableFile, ForbiddenException } from '@nestjs/common';

@Injectable()
export class MaterialsService {
  private readonly logger = new Logger(MaterialsService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly materialRepository: MaterialRepository,
    private readonly folderRepository: MaterialFolderRepository,
    private readonly fileResourceRepository: FileResourceRepository,
    private readonly fileVersionRepository: FileVersionRepository,
    private readonly materialStatusRepository: MaterialStatusRepository,
    private readonly deletionRequestRepository: DeletionRequestRepository,
    private readonly deletionStatusRepository: DeletionRequestStatusRepository,
    private readonly accessEngine: AccessEngineService,
    private readonly storageService: StorageService,
  ) {}

  async create(userId: string, dto: CreateMaterialDto, file: Express.Multer.File): Promise<Material> {
    const folder = await this.folderRepository.findById(dto.materialFolderId);
    if (!folder) throw new NotFoundException('La carpeta destino no existe.');

    const activeStatus = await this.materialStatusRepository.findByCode('ACTIVE');
    if (!activeStatus) throw new InternalServerErrorException('Estado ACTIVE no encontrado.');

    const fileHash = await this.storageService.calculateHash(file.buffer);
    const existingResource = await this.fileResourceRepository.findByHash(fileHash);
    
    let storageUrl: string | null = null;
    let fileResourceId: string;

    if (existingResource) {
      this.logger.log(`Deduplicación: Reutilizando recurso ${existingResource.id}`);
      fileResourceId = existingResource.id;
      storageUrl = existingResource.storageUrl;
    } else {
      const fileName = `${Date.now()}-${file.originalname}`;
      storageUrl = await this.storageService.saveFile(fileName, file.buffer);
    }

    try {
      return await this.dataSource.transaction(async (manager) => {
        if (!existingResource) {
          const res = await this.fileResourceRepository.create({
            originalName: file.originalname,
            mimeType: file.mimetype,
            sizeBytes: String(file.size),
            checksumHash: fileHash,
            storageUrl: storageUrl!,
            createdAt: new Date(),
          }, manager);
          fileResourceId = res.id;
        }

        const version = await this.fileVersionRepository.create({
          fileResourceId,
          versionNumber: 1,
          storageUrl: storageUrl!,
          createdBy: userId,
          createdAt: new Date(),
        }, manager);

        const material = await this.materialRepository.create({
          materialFolderId: folder.id,
          fileResourceId,
          fileVersionId: version.id,
          materialStatusId: activeStatus.id,
          displayName: dto.displayName,
          visibleFrom: dto.visibleFrom ? new Date(dto.visibleFrom) : null,
          visibleUntil: dto.visibleUntil ? new Date(dto.visibleUntil) : null,
          createdBy: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }, manager);

        return material;
      });
    } catch (error) {
      await this.rollbackStorage(existingResource, storageUrl, error);
      throw error;
    }
  }

  async addVersion(userId: string, materialId: string, file: Express.Multer.File): Promise<Material> {
    const material = await this.materialRepository.findById(materialId);
    if (!material) throw new NotFoundException('Material no encontrado');

    const fileHash = await this.storageService.calculateHash(file.buffer);
    const existingResource = await this.fileResourceRepository.findByHash(fileHash);
    
    let storageUrl: string | null = null;
    let fileResourceId: string;

    if (existingResource) {
      fileResourceId = existingResource.id;
      storageUrl = existingResource.storageUrl;
    } else {
      const fileName = `${Date.now()}-v-${file.originalname}`;
      storageUrl = await this.storageService.saveFile(fileName, file.buffer);
    }

    try {
      return await this.dataSource.transaction(async (manager) => {
        if (!existingResource) {
          const res = await this.fileResourceRepository.create({
            originalName: file.originalname,
            mimeType: file.mimetype,
            sizeBytes: String(file.size),
            checksumHash: fileHash,
            storageUrl: storageUrl!,
            createdAt: new Date(),
          }, manager);
          fileResourceId = res.id;
        }

        const currentVersion = await this.fileVersionRepository.findById(material.fileVersionId);
        const nextVerNum = currentVersion ? currentVersion.versionNumber + 1 : 1;

        const newVersion = await this.fileVersionRepository.create({
          fileResourceId,
          versionNumber: nextVerNum,
          storageUrl: storageUrl!,
          createdBy: userId,
          createdAt: new Date(),
        }, manager);

        await manager.getRepository(Material).update(material.id, {
          fileVersionId: newVersion.id,
          fileResourceId: fileResourceId,
          updatedAt: new Date(),
        });

        const updated = await this.materialRepository.findById(material.id);
        
        this.logger.log({
            message: 'Nueva versión agregada',
            materialId,
            version: nextVerNum,
            deduplicated: !!existingResource
        });

        return updated!;
      });
    } catch (error) {
      await this.rollbackStorage(existingResource, storageUrl, error);
      throw error;
    }
  }

  async download(userId: string, materialId: string): Promise<{ stream: StreamableFile; fileName: string; mimeType: string }> {
    const material = await this.materialRepository.findById(materialId);
    if (!material) throw new NotFoundException('Material no encontrado.');

    const folder = await this.folderRepository.findById(material.materialFolderId);
    if (!folder) throw new InternalServerErrorException('Inconsistencia: Material huérfano.');

    const hasAccess = await this.accessEngine.hasAccess(userId, folder.evaluationId);
    if (!hasAccess) throw new ForbiddenException('No tienes permiso para descargar este material.');

    const currentVersion = await this.fileVersionRepository.findById(material.fileVersionId);
    if (!currentVersion) throw new NotFoundException('Versión de archivo no encontrada.');

    const fileStream = createReadStream(currentVersion.storageUrl);
    
    return {
      stream: new StreamableFile(fileStream),
      fileName: material.fileResource.originalName,
      mimeType: material.fileResource.mimeType,
    };
  }

  async requestDeletion(userId: string, materialId: string, reason: string): Promise<void> {
    const material = await this.materialRepository.findById(materialId);
    if (!material) throw new NotFoundException('Material no encontrado.');

    const pendingStatus = await this.deletionStatusRepository.findByCode('PENDING');
    if (!pendingStatus) throw new InternalServerErrorException('Error config: Estado PENDING no existe.');

    await this.deletionRequestRepository.create({
      requestedById: userId,
      deletionRequestStatusId: pendingStatus.id,
      entityType: 'MATERIAL',
      entityId: material.id,
      reason: reason,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.logger.log({
      message: 'Solicitud de eliminación creada',
      materialId,
      requestedBy: userId,
      reason,
    });
  }

  private async rollbackStorage(existingResource: FileResource | null, storageUrl: string | null, error: unknown) {
    if (!existingResource && storageUrl) {
      const fileName = storageUrl.split(/[\\/]/).pop();
      if (fileName) {
        await this.storageService.deleteFile(fileName);
        this.logger.warn({
          message: 'Rollback: Archivo físico eliminado tras fallo en BD',
          fileName,
          originalError: error instanceof Error ? error.message : 'Unknown',
        });
      }
    }
  }
}
