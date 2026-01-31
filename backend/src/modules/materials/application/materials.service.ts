import { Injectable, Logger, NotFoundException, InternalServerErrorException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { StorageService } from '@infrastructure/storage/storage.service';
import { AccessEngineService } from '@modules/enrollments/application/access-engine.service';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import { MaterialFolderRepository } from '@modules/materials/infrastructure/material-folder.repository';
import { MaterialRepository } from '@modules/materials/infrastructure/material.repository';
import { FileResourceRepository } from '@modules/materials/infrastructure/file-resource.repository';
import { FileVersionRepository } from '@modules/materials/infrastructure/file-version.repository';
import { MaterialCatalogRepository } from '@modules/materials/infrastructure/material-catalog.repository';
import { DeletionRequestRepository } from '@modules/materials/infrastructure/deletion-request.repository';
import { CreateMaterialFolderDto } from '@modules/materials/dto/create-material-folder.dto';
import { UploadMaterialDto } from '@modules/materials/dto/upload-material.dto';
import { RequestDeletionDto } from '@modules/materials/dto/request-deletion.dto';
import { MaterialFolder } from '@modules/materials/domain/material-folder.entity';
import { Material } from '@modules/materials/domain/material.entity';
import { FileResource } from '@modules/materials/domain/file-resource.entity';
import { FileVersion } from '@modules/materials/domain/file-version.entity';
import { User } from '@modules/users/domain/user.entity';
import * as fs from 'fs';

@Injectable()
export class MaterialsService {
  private readonly logger = new Logger(MaterialsService.name);
  private readonly CACHE_TTL = 300;

  constructor(
    private readonly dataSource: DataSource,
    private readonly storageService: StorageService,
    private readonly accessEngine: AccessEngineService,
    private readonly cacheService: RedisCacheService,
    private readonly folderRepository: MaterialFolderRepository,
    private readonly materialRepository: MaterialRepository,
    private readonly fileResourceRepository: FileResourceRepository,
    private readonly fileVersionRepository: FileVersionRepository,
    private readonly catalogRepository: MaterialCatalogRepository,
    private readonly deletionRequestRepository: DeletionRequestRepository,
  ) {}

  async createFolder(userId: string, dto: CreateMaterialFolderDto): Promise<MaterialFolder> {
    const activeStatus = await this.getActiveFolderStatus();
    const now = new Date();

    if (dto.parentFolderId) {
      const parent = await this.validateParentFolder(dto.parentFolderId, dto.evaluationId);
      if (!parent) throw new NotFoundException('Carpeta padre no encontrada');
    }

    const folder = await this.folderRepository.create({
      evaluationId: dto.evaluationId,
      parentFolderId: dto.parentFolderId || null,
      folderStatusId: activeStatus.id,
      name: dto.name,
      visibleFrom: dto.visibleFrom ? new Date(dto.visibleFrom) : null,
      visibleUntil: dto.visibleUntil ? new Date(dto.visibleUntil) : null,
      createdById: userId,
      createdAt: now,
      updatedAt: now,
    });

    if (dto.parentFolderId) {
      await this.invalidateFolderCache(dto.parentFolderId);
    } else {
      await this.invalidateRootCache(dto.evaluationId);
    }

    return folder;
  }

  async uploadMaterial(userId: string, dto: UploadMaterialDto, file: Express.Multer.File): Promise<Material> {
    if (!file) throw new BadRequestException('Archivo requerido');

    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/zip',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      this.logger.warn({
        message: 'Intento de subir archivo con tipo no permitido',
        userId,
        mimetype: file.mimetype,
        originalName: file.originalname,
      });
      throw new BadRequestException(
        `Tipo de archivo no permitido. Solo se aceptan documentos educativos (PDF, imágenes, Office).`,
      );
    }

    if (file.mimetype === 'application/pdf') {
      const pdfMagic = file.buffer.slice(0, 4).toString('hex');
      if (pdfMagic !== '25504446') {
        throw new BadRequestException('El archivo no es un PDF válido');
      }
    }

    const activeStatus = await this.getActiveMaterialStatus();
    const folder = await this.folderRepository.findById(dto.materialFolderId);
    if (!folder) throw new NotFoundException('Carpeta destino no encontrada');

    const now = new Date();
    let storagePath = '';
    let isNewFile = false;

    try {
      const result = await this.dataSource.transaction(async (manager) => {
        const hash = await this.storageService.calculateHash(file.buffer);
        const existingResource = await this.fileResourceRepository.findByHash(hash);
        
        let finalResource: FileResource;
        let finalVersion: FileVersion;

        if (!existingResource) {
          const uniqueName = `${Date.now()}-${file.originalname}`;
          storagePath = await this.storageService.saveFile(uniqueName, file.buffer);
          isNewFile = true;
          
          const resourceEntity = manager.create(FileResource, {
            checksumHash: hash,
            originalName: file.originalname,
            mimeType: file.mimetype,
            sizeBytes: String(file.size),
            storageUrl: storagePath,
            createdAt: now,
          });
          finalResource = await manager.save(resourceEntity);

          const versionEntity = manager.create(FileVersion, {
            fileResourceId: finalResource.id,
            versionNumber: 1,
            storageUrl: finalResource.storageUrl,
            createdById: userId,
            createdAt: now,
          });
          finalVersion = await manager.save(versionEntity);
        } else {
          finalResource = existingResource;
          const version1 = await manager.findOne(FileVersion, { 
            where: { fileResourceId: finalResource.id, versionNumber: 1 } 
          });
          
          if (!version1) {
            const versionEntity = manager.create(FileVersion, {
              fileResourceId: finalResource.id,
              versionNumber: 1,
              storageUrl: finalResource.storageUrl,
              createdById: userId,
              createdAt: now,
            });
            finalVersion = await manager.save(versionEntity);
          } else {
            finalVersion = version1;
          }
        }

        const materialEntity = manager.create(Material, {
          materialFolderId: folder.id,
          fileResourceId: finalResource.id,
          fileVersion: finalVersion,
          materialStatusId: activeStatus.id,
          displayName: dto.displayName,
          visibleFrom: dto.visibleFrom ? new Date(dto.visibleFrom) : null,
          visibleUntil: dto.visibleUntil ? new Date(dto.visibleUntil) : null,
          createdById: userId,
          createdAt: now,
          updatedAt: now,
        });
        const savedMaterial = await manager.save(materialEntity);

        this.logSuccess('Material subido', { materialId: savedMaterial.id, userId });
        return savedMaterial;
      });

      await this.invalidateFolderCache(dto.materialFolderId);
      return result;
    } catch (error) {
      if (isNewFile && storagePath) await this.rollbackFile(storagePath);
      throw error;
    }
  }

  async addVersion(userId: string, materialId: string, file: Express.Multer.File): Promise<Material> {
    if (!file) throw new BadRequestException('Archivo requerido');

    const now = new Date();
    let storagePath = '';
    let isNewFile = false;

    try {
      const result = await this.dataSource.transaction(async (manager) => {
        const freshMaterial = await manager.findOne(Material, { 
            where: { id: materialId },
            lock: { mode: 'pessimistic_write' }
        });
        
        if (!freshMaterial) throw new NotFoundException('Material no encontrado');

        const hash = await this.storageService.calculateHash(file.buffer);
        const existingResource = await this.fileResourceRepository.findByHash(hash);
        
        let finalResource: FileResource;

        if (!existingResource) {
          const uniqueName = `${Date.now()}-${file.originalname}`;
          storagePath = await this.storageService.saveFile(uniqueName, file.buffer);
          isNewFile = true;
          
          const resourceEntity = manager.create(FileResource, {
            checksumHash: hash,
            originalName: file.originalname,
            mimeType: file.mimetype,
            sizeBytes: String(file.size),
            storageUrl: storagePath,
            createdAt: now,
          });
          finalResource = await manager.save(resourceEntity);
        } else {
          finalResource = existingResource;
        }

        const lastVersion = await manager.findOne(FileVersion, {
            where: { fileResourceId: finalResource.id },
            order: { versionNumber: 'DESC' }
        });

        const nextVersionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;

        const versionEntity = manager.create(FileVersion, {
          fileResourceId: finalResource.id,
          versionNumber: nextVersionNumber,
          storageUrl: finalResource.storageUrl,
          createdById: userId,
          createdAt: now,
        });
        const savedVersion = await manager.save(versionEntity);

        freshMaterial.fileResourceId = finalResource.id;
        freshMaterial.fileVersionId = savedVersion.id;
        freshMaterial.updatedAt = now;
        
        const updatedMaterial = await manager.save(freshMaterial);

        this.logSuccess('Nueva versión agregada', { materialId: updatedMaterial.id, version: nextVersionNumber, userId });
        return updatedMaterial;
      });

      await this.invalidateFolderCache(materialId);
      return result;
    } catch (error) {
      if (isNewFile && storagePath) await this.rollbackFile(storagePath);
      throw error;
    }
  }

  async getRootFolders(userId: string, evaluationId: string): Promise<MaterialFolder[]> {
    await this.checkAccess(userId, evaluationId);
    
    const cacheKey = `cache:materials:roots:eval:${evaluationId}`;
    const cached = await this.cacheService.get<MaterialFolder[]>(cacheKey);
    if (cached) return cached;

    const status = await this.getActiveFolderStatus();
    const roots = await this.folderRepository.findRootsByEvaluation(evaluationId, status.id);

    await this.cacheService.set(cacheKey, roots, this.CACHE_TTL);
    return roots;
  }

  async getFolderContents(user: User, folderId: string): Promise<{ folders: MaterialFolder[], materials: Material[] }> {
    const folder = await this.folderRepository.findById(folderId);
    if (!folder) throw new NotFoundException('Carpeta no encontrada');
    
    await this.checkAccess(user.id, folder.evaluationId);

    const cacheKey = `cache:materials:contents:folder:${folderId}`;
    const cached = await this.cacheService.get<{ folders: MaterialFolder[], materials: Material[] }>(cacheKey);
    if (cached) return cached;

    const status = await this.getActiveFolderStatus();
    const [folders, materials] = await Promise.all([
      this.folderRepository.findSubFolders(folderId, status.id),
      this.materialRepository.findByFolderId(folderId) 
    ]);

    const result = { folders, materials };
    await this.cacheService.set(cacheKey, result, this.CACHE_TTL);
    
    return result;
  }

  async download(user: User, materialId: string): Promise<{ stream: NodeJS.ReadableStream; fileName: string; mimeType: string }> {
    const material = await this.materialRepository.findById(materialId);
    if (!material) throw new NotFoundException('Material no encontrado');

    const folder = await this.folderRepository.findById(material.materialFolderId);
    if (!folder) throw new NotFoundException('Carpeta contenedora no encontrada');

    await this.checkAccess(user.id, folder.evaluationId);

    const resource = material.fileResource;
    if (!resource) throw new InternalServerErrorException('Integridad de datos corrupta: Material sin recurso físico');

    if (!fs.existsSync(resource.storageUrl)) {
        throw new NotFoundException('El archivo físico no existe en el servidor');
    }

    const stream = fs.createReadStream(resource.storageUrl);
    return {
        stream,
        fileName: material.displayName || resource.originalName,
        mimeType: resource.mimeType,
    };
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

    const now = new Date();

    await this.deletionRequestRepository.create({
      requestedById: userId,
      deletionRequestStatusId: pendingStatus.id,
      entityType: dto.entityType,
      entityId: dto.entityId,
      reason: dto.reason,
      createdAt: now,
      updatedAt: now,
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

  private async invalidateFolderCache(folderId: string) {
    await this.cacheService.del(`cache:materials:contents:folder:${folderId}`);
  }

  private async invalidateRootCache(evaluationId: string) {
    await this.cacheService.del(`cache:materials:roots:eval:${evaluationId}`);
  }
}