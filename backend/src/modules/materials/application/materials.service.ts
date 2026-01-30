import { Injectable, Logger, NotFoundException, InternalServerErrorException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { StorageService } from '@infrastructure/storage/storage.service';
import { AccessEngineService } from '@modules/enrollments/application/access-engine.service';
import { MaterialFolderRepository } from '../infrastructure/material-folder.repository';
import { MaterialRepository } from '../infrastructure/material.repository';
import { FileResourceRepository } from '../infrastructure/file-resource.repository';
import { FileVersionRepository } from '../infrastructure/file-version.repository';
import { MaterialCatalogRepository } from '../infrastructure/material-catalog.repository';
import { DeletionRequestRepository } from '../infrastructure/deletion-request.repository';
import { CreateMaterialFolderDto } from '../dto/create-material-folder.dto';
import { UploadMaterialDto } from '../dto/upload-material.dto';
import { RequestDeletionDto } from '../dto/request-deletion.dto';
import { MaterialFolder } from '../domain/material-folder.entity';
import { Material } from '../domain/material.entity';

@Injectable()
export class MaterialsService {
  private readonly logger = new Logger(MaterialsService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly storageService: StorageService,
    private readonly accessEngine: AccessEngineService,
    private readonly folderRepository: MaterialFolderRepository,
    private readonly materialRepository: MaterialRepository,
    private readonly fileResourceRepository: FileResourceRepository,
    private readonly fileVersionRepository: FileVersionRepository,
    private readonly catalogRepository: MaterialCatalogRepository,
    private readonly deletionRequestRepository: DeletionRequestRepository,
  ) {}

  async createFolder(userId: string, dto: CreateMaterialFolderDto): Promise<MaterialFolder> {
    const activeStatus = await this.getActiveFolderStatus();

    if (dto.parentFolderId) {
      const parent = await this.validateParentFolder(dto.parentFolderId, dto.evaluationId);
      if (!parent) throw new NotFoundException('Carpeta padre no encontrada');
    }

    return await this.folderRepository.create({
      evaluationId: dto.evaluationId,
      parentFolderId: dto.parentFolderId || null,
      folderStatusId: activeStatus.id,
      name: dto.name,
      visibleFrom: dto.visibleFrom ? new Date(dto.visibleFrom) : null,
      visibleUntil: dto.visibleUntil ? new Date(dto.visibleUntil) : null,
      createdById: userId,
    });
  }

  async uploadMaterial(userId: string, dto: UploadMaterialDto, file: Express.Multer.File): Promise<Material> {
    if (!file) throw new BadRequestException('Archivo requerido');

    const activeStatus = await this.getActiveMaterialStatus();
    const folder = await this.folderRepository.findById(dto.materialFolderId);
    if (!folder) throw new NotFoundException('Carpeta destino no encontrada');

    return await this.dataSource.transaction(async (manager) => {
      const hash = await this.storageService.calculateHash(file.buffer);
      let fileResource = await this.fileResourceRepository.findByHash(hash);
      let storagePath = '';
      let isNewFile = false;

      if (!fileResource) {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        storagePath = await this.storageService.saveFile(uniqueName, file.buffer);
        isNewFile = true;
        fileResource = await manager.save(this.fileResourceRepository.create({
          checksumHash: hash,
          originalName: file.originalname,
          mimeType: file.mimetype,
          sizeBytes: String(file.size),
          storageUrl: storagePath,
        }));
      }

      try {
        const savedVersion = await manager.save(this.fileVersionRepository.create({
          fileResourceId: fileResource.id,
          versionNumber: 1,
          storageUrl: fileResource.storageUrl,
          createdById: userId,
        }));

        const savedMaterial = await manager.save(this.materialRepository.create({
          materialFolderId: folder.id,
          fileResourceId: fileResource.id,
          fileVersionId: savedVersion.id,
          materialStatusId: activeStatus.id,
          displayName: dto.displayName,
          visibleFrom: dto.visibleFrom ? new Date(dto.visibleFrom) : null,
          visibleUntil: dto.visibleUntil ? new Date(dto.visibleUntil) : null,
          createdById: userId,
        }));

        this.logSuccess('Material subido', { materialId: savedMaterial.id, userId });
        return savedMaterial;
      } catch (error) {
        if (isNewFile && storagePath) await this.rollbackFile(storagePath);
        throw error;
      }
    });
  }

  async getRootFolders(userId: string, evaluationId: string): Promise<MaterialFolder[]> {
    await this.checkAccess(userId, evaluationId);
    const status = await this.getActiveFolderStatus();
    return await this.folderRepository.findRootsByEvaluation(evaluationId, status.id);
  }

  async getFolderContents(userId: string, folderId: string): Promise<{ folders: MaterialFolder[], materials: Material[] }> {
    const folder = await this.folderRepository.findById(folderId);
    if (!folder) throw new NotFoundException('Carpeta no encontrada');
    
    await this.checkAccess(userId, folder.evaluationId);
    const status = await this.getActiveFolderStatus();
    const mStatus = await this.getActiveMaterialStatus();

    const [folders, materials] = await Promise.all([
      this.folderRepository.findSubFolders(folderId, status.id),
      this.materialRepository.findByFolderId(folderId) // Ajustar repositorio para filtrar por status si es necesario
    ]);

    return { folders, materials };
  }

  async requestDeletion(userId: string, dto: RequestDeletionDto): Promise<void> {
    const pendingStatus = await this.catalogRepository.findDeletionRequestStatusByCode('PENDING');
    if (!pendingStatus) throw new InternalServerErrorException('Error configuración: Status PENDING');

    if (dto.entityType === 'material') {
      const exists = await this.materialRepository.findById(dto.entityId);
      if (!exists) throw new NotFoundException('Material no encontrado');
    } else {
      const exists = await this.folderRepository.findById(dto.entityId);
      if (!exists) throw new NotFoundException('Carpeta no encontrada');
    }

    await this.deletionRequestRepository.create({
      requestedById: userId,
      deletionRequestStatusId: pendingStatus.id,
      entityType: dto.entityType,
      entityId: dto.entityId,
      reason: dto.reason,
    });
  }

  private async checkAccess(userId: string, evaluationId: string): Promise<void> {
    const hasAccess = await this.accessEngine.hasAccess(userId, evaluationId);
    if (!hasAccess) throw new ForbiddenException('No tienes acceso a este contenido educativo');
  }

  private async getActiveFolderStatus() {
    const status = await this.catalogRepository.findFolderStatusByCode('ACTIVE');
    if (!status) throw new InternalServerErrorException('Error configuración: Folder Status ACTIVE');
    return status;
  }

  private async getActiveMaterialStatus() {
    const status = await this.catalogRepository.findMaterialStatusByCode('ACTIVE');
    if (!status) throw new InternalServerErrorException('Error configuración: Material Status ACTIVE');
    return status;
  }

  private async validateParentFolder(parentId: string, evaluationId: string) {
    const parent = await this.folderRepository.findById(parentId);
    if (parent && parent.evaluationId !== evaluationId) {
      throw new BadRequestException('Inconsistencia: La carpeta padre no pertenece a la misma evaluación');
    }
    return parent;
  }

  private async rollbackFile(path: string) {
    const fileName = path.split(/[\/]/).pop();
    if (fileName) await this.storageService.deleteFile(fileName);
  }

  private logSuccess(message: string, meta: object) {
    this.logger.log(JSON.stringify({ message, ...meta, timestamp: new Date().toISOString() }));
  }
}
