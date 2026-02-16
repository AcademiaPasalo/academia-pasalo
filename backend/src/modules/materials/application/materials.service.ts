import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
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
import { UserRepository } from '@modules/users/infrastructure/user.repository';
import { CreateMaterialFolderDto } from '@modules/materials/dto/create-material-folder.dto';
import { UploadMaterialDto } from '@modules/materials/dto/upload-material.dto';
import { RequestDeletionDto } from '@modules/materials/dto/request-deletion.dto';
import { MaterialFolder } from '@modules/materials/domain/material-folder.entity';
import { Material } from '@modules/materials/domain/material.entity';
import { FileResource } from '@modules/materials/domain/file-resource.entity';
import { FileVersion } from '@modules/materials/domain/file-version.entity';
import { User } from '@modules/users/domain/user.entity';
import { AuditService } from '@modules/audit/application/audit.service';
import {
  AUDIT_ACTION_CODES,
  AUDIT_ENTITY_TYPES,
} from '@modules/audit/interfaces/audit.constants';
import { ClassEventRepository } from '@modules/events/infrastructure/class-event.repository';
import * as fs from 'fs';
import { technicalSettings } from '@config/technical-settings';
import {
  ADMIN_ROLE_CODES,
  ROLE_CODES,
} from '@common/constants/role-codes.constants';
import {
  DELETION_REQUEST_STATUS_CODES,
  FOLDER_STATUS_CODES,
  MATERIAL_CACHE_KEYS,
  MATERIAL_STATUS_CODES,
} from '@modules/materials/domain/material.constants';

@Injectable()
export class MaterialsService {
  private readonly logger = new Logger(MaterialsService.name);
  private readonly CACHE_TTL =
    technicalSettings.cache.materials.materialsExplorerCacheTtlSeconds;

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
    private readonly userRepository: UserRepository,
    private readonly auditService: AuditService,
    private readonly classEventRepository: ClassEventRepository,
  ) {}

  async createFolder(
    userId: string,
    dto: CreateMaterialFolderDto,
  ): Promise<MaterialFolder> {
    const activeStatus = await this.getActiveFolderStatus();
    const now = new Date();

    if (dto.parentFolderId) {
      const parent = await this.validateParentFolder(
        dto.parentFolderId,
        dto.evaluationId,
      );
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

  async uploadMaterial(
    userId: string,
    dto: UploadMaterialDto,
    file: Express.Multer.File,
  ): Promise<Material> {
    if (!file) throw new BadRequestException('Archivo requerido');

    const allowedMimeTypes: readonly string[] =
      technicalSettings.uploads.materials.allowedMimeTypes;

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido. Solo se aceptan documentos educativos (PDF, imágenes, Office).`,
      );
    }

    if (file.mimetype === 'application/pdf') {
      const pdfMagic = file.buffer.subarray(0, 4).toString('hex');
      if (pdfMagic !== technicalSettings.uploads.materials.pdfMagicHeaderHex) {
        throw new BadRequestException('El archivo no es un PDF válido');
      }
    }

    const activeStatus = await this.getActiveMaterialStatus();
    const folder = await this.folderRepository.findById(dto.materialFolderId);
    if (!folder) throw new NotFoundException('Carpeta destino no encontrada');

    if (dto.classEventId) {
      await this.validateClassEventAssociation(
        dto.classEventId,
        folder.evaluationId,
      );
    }

    const now = new Date();
    let storagePath = '';
    let isNewFile = false;

    try {
      const result = await this.dataSource.transaction(async (manager) => {
        const hash = await this.storageService.calculateHash(file.buffer);
        const existingResource =
          await this.fileResourceRepository.findByHash(hash);

        let finalResource: FileResource;
        let finalVersion: FileVersion;

        if (!existingResource) {
          const sanitizedOriginalName = file.originalname.replace(
            /[^a-zA-Z0-9.-]/g,
            '_',
          );
          const uniqueName = `${Date.now()}-${sanitizedOriginalName}`;
          storagePath = await this.storageService.saveFile(
            uniqueName,
            file.buffer,
          );
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
            where: { fileResourceId: finalResource.id, versionNumber: 1 },
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
          classEventId: dto.classEventId || null,
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

        await this.auditService.logAction(
          userId,
          AUDIT_ACTION_CODES.FILE_UPLOAD,
          AUDIT_ENTITY_TYPES.MATERIAL,
          savedMaterial.id,
          manager,
        );

        return savedMaterial;
      });

      await this.invalidateFolderCache(dto.materialFolderId);
      if (dto.classEventId) {
        await this.invalidateClassEventMaterialsCache(dto.classEventId);
      }
      return result;
    } catch (error) {
      if (isNewFile && storagePath) await this.rollbackFile(storagePath);
      throw error;
    }
  }

  async addVersion(
    userId: string,
    materialId: string,
    file: Express.Multer.File,
  ): Promise<Material> {
    if (!file) throw new BadRequestException('Archivo requerido');

    const now = new Date();
    let storagePath = '';
    let isNewFile = false;

    try {
      const result = await this.dataSource.transaction(async (manager) => {
        const freshMaterial = await manager.findOne(Material, {
          where: { id: materialId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!freshMaterial)
          throw new NotFoundException('Material no encontrado');

        const hash = await this.storageService.calculateHash(file.buffer);
        const existingResource =
          await this.fileResourceRepository.findByHash(hash);

        let finalResource: FileResource;

        if (!existingResource) {
          const sanitizedOriginalName = file.originalname.replace(
            /[^a-zA-Z0-9.-]/g,
            '_',
          );
          const uniqueName = `${Date.now()}-${sanitizedOriginalName}`;
          storagePath = await this.storageService.saveFile(
            uniqueName,
            file.buffer,
          );
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

        const currentVersion = await manager.findOne(FileVersion, {
          where: { id: freshMaterial.fileVersionId },
        });

        const nextVersionNumber = (currentVersion?.versionNumber || 0) + 1;

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

        await this.auditService.logAction(
          userId,
          AUDIT_ACTION_CODES.FILE_EDIT,
          AUDIT_ENTITY_TYPES.MATERIAL,
          updatedMaterial.id,
          manager,
        );

        return updatedMaterial;
      });

      await this.invalidateFolderCache(result.materialFolderId);
      if (result.classEventId) {
        await this.invalidateClassEventMaterialsCache(result.classEventId);
      }
      return result;
    } catch (error) {
      if (isNewFile && storagePath) await this.rollbackFile(storagePath);
      throw error;
    }
  }

  async getRootFolders(
    user: User,
    evaluationId: string,
  ): Promise<MaterialFolder[]> {
    await this.checkAuthorizedAccess(user, evaluationId);

    const cacheKey = MATERIAL_CACHE_KEYS.ROOTS(evaluationId);
    let roots = await this.cacheService.get<MaterialFolder[]>(cacheKey);

    if (!roots) {
      const status = await this.getActiveFolderStatus();
      roots = await this.folderRepository.findRootsByEvaluation(
        evaluationId,
        status.id,
      );
      await this.cacheService.set(cacheKey, roots, this.CACHE_TTL);
    }

    return this.applyVisibilityFilter(user, roots, []).folders;
  }

  async getFolderContents(
    user: User,
    folderId: string,
  ): Promise<{ folders: MaterialFolder[]; materials: Material[] }> {
    const folder = await this.folderRepository.findById(folderId);
    if (!folder) throw new NotFoundException('Carpeta no encontrada');

    await this.checkAuthorizedAccess(user, folder.evaluationId, folder);

    const cacheKey = MATERIAL_CACHE_KEYS.CONTENTS(folderId);
    let contents = await this.cacheService.get<{
      folders: MaterialFolder[];
      materials: Material[];
    }>(cacheKey);

    if (!contents) {
      const status = await this.getActiveFolderStatus();
      const [folders, materials] = await Promise.all([
        this.folderRepository.findSubFolders(folderId, status.id),
        this.materialRepository.findByFolderId(folderId),
      ]);
      contents = { folders, materials };
      await this.cacheService.set(cacheKey, contents, this.CACHE_TTL);
    }

    return this.applyVisibilityFilter(
      user,
      contents.folders,
      contents.materials,
    );
  }

  async getClassEventMaterials(
    user: User,
    classEventId: string,
  ): Promise<Material[]> {
    const classEvent =
      await this.classEventRepository.findByIdSimple(classEventId);
    if (!classEvent) {
      throw new NotFoundException('Sesion de clase no encontrada');
    }

    await this.checkAuthorizedAccess(user, classEvent.evaluationId);

    const cacheKey = MATERIAL_CACHE_KEYS.CLASS_EVENT(classEventId);
    const cached = await this.cacheService.get<Material[]>(cacheKey);
    if (cached) {
      return this.applyVisibilityFilter(user, [], cached).materials;
    }

    const materials =
      await this.materialRepository.findByClassEventId(classEventId);
    await this.cacheService.set(cacheKey, materials, this.CACHE_TTL);

    return this.applyVisibilityFilter(user, [], materials).materials;
  }

  async download(
    user: User,
    materialId: string,
  ): Promise<{
    stream: NodeJS.ReadableStream;
    fileName: string;
    mimeType: string;
  }> {
    const material = await this.materialRepository.findById(materialId);
    if (!material) throw new NotFoundException('Material no encontrado');

    const folder = await this.folderRepository.findById(
      material.materialFolderId,
    );
    if (!folder)
      throw new NotFoundException('Carpeta contenedora no encontrada');

    await this.checkAuthorizedAccess(user, folder.evaluationId, folder);

    const resource = material.fileResource;
    if (!resource)
      throw new InternalServerErrorException(
        'Integridad de datos corrupta: Material sin recurso físico',
      );

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

  async requestDeletion(
    userId: string,
    dto: RequestDeletionDto,
  ): Promise<void> {
    const pendingStatus =
      await this.catalogRepository.findDeletionRequestStatusByCode(
        DELETION_REQUEST_STATUS_CODES.PENDING,
      );
    if (!pendingStatus)
      throw new InternalServerErrorException(
        `Error de configuración: Estado ${DELETION_REQUEST_STATUS_CODES.PENDING} faltante`,
      );

    if (dto.entityType === AUDIT_ENTITY_TYPES.MATERIAL) {
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

  private applyVisibilityFilter(
    user: User,
    folders: MaterialFolder[],
    materials: Material[],
  ) {
    const roleCodes = (user.roles || []).map((r) => r.code);
    const hasPrivilegedAccess =
      roleCodes.some((r) => ADMIN_ROLE_CODES.includes(r)) ||
      roleCodes.includes(ROLE_CODES.PROFESSOR);

    if (hasPrivilegedAccess) {
      return { folders, materials };
    }

    const now = new Date();

    const visibleFolders = folders.filter((f) => {
      const startOk = !f.visibleFrom || new Date(f.visibleFrom) <= now;
      const endOk = !f.visibleUntil || new Date(f.visibleUntil) >= now;
      return startOk && endOk;
    });

    const visibleMaterials = materials.filter((m) => {
      const startOk = !m.visibleFrom || new Date(m.visibleFrom) <= now;
      const endOk = !m.visibleUntil || new Date(m.visibleUntil) >= now;
      
      return startOk && endOk;
    });

    return { folders: visibleFolders, materials: visibleMaterials };
  }

  private async checkAuthorizedAccess(
    user: User,
    evaluationId: string,
    folder?: MaterialFolder,
  ): Promise<void> {
    const roleCodes = (user.roles || []).map((r) => r.code);

    if (roleCodes.some((r) => ADMIN_ROLE_CODES.includes(r))) {
      return;
    }

    if (roleCodes.includes(ROLE_CODES.PROFESSOR)) {
      const isAssigned = await this.dataSource.query(
        `SELECT 1 FROM course_cycle_professor ccp
         INNER JOIN evaluation e ON e.course_cycle_id = ccp.course_cycle_id
         WHERE e.id = ? AND ccp.professor_user_id = ? AND ccp.revoked_at IS NULL LIMIT 1`,
        [evaluationId, user.id],
      );
      if (isAssigned.length === 0)
        throw new ForbiddenException(
          'No tienes permiso para ver materiales de este curso',
        );
      return;
    }

    const hasEnrollment = await this.accessEngine.hasAccess(
      user.id,
      evaluationId,
    );
    if (!hasEnrollment)
      throw new ForbiddenException(
        'No tienes acceso a este contenido educativo',
      );

    if (folder?.visibleFrom && new Date() < new Date(folder.visibleFrom)) {
      throw new ForbiddenException('Este contenido aún no está disponible');
    }
  }

  private async getActiveFolderStatus() {
    const status = await this.catalogRepository.findFolderStatusByCode(
      FOLDER_STATUS_CODES.ACTIVE,
    );
    if (!status)
      throw new InternalServerErrorException(
        `Error de configuración: Estado ${FOLDER_STATUS_CODES.ACTIVE} de carpeta faltante`,
      );
    return status;
  }

  private async getActiveMaterialStatus() {
    const status = await this.catalogRepository.findMaterialStatusByCode(
      MATERIAL_STATUS_CODES.ACTIVE,
    );
    if (!status)
      throw new InternalServerErrorException(
        `Error de configuración: Estado ${MATERIAL_STATUS_CODES.ACTIVE} de material faltante`,
      );
    return status;
  }

  private async validateParentFolder(parentId: string, evaluationId: string) {
    const parent = await this.folderRepository.findById(parentId);
    if (parent && parent.evaluationId !== evaluationId) {
      throw new BadRequestException(
        'Inconsistencia: La carpeta padre no pertenece a la misma evaluación',
      );
    }
    return parent;
  }

  private async validateClassEventAssociation(
    classEventId: string,
    evaluationId: string,
  ) {
    const classEvent =
      await this.classEventRepository.findByIdSimple(classEventId);
    if (!classEvent) {
      throw new NotFoundException('Sesion de clase no encontrada');
    }

    if (classEvent.evaluationId !== evaluationId) {
      throw new BadRequestException(
        'Inconsistencia: La sesion no pertenece a la misma evaluacion de la carpeta',
      );
    }

    return classEvent;
  }

  private async rollbackFile(path: string) {
    const fileName = path.split(/[\/]/).pop();
    if (fileName) await this.storageService.deleteFile(fileName);
  }

  private async invalidateFolderCache(folderId: string) {
    await this.cacheService.del(MATERIAL_CACHE_KEYS.CONTENTS(folderId));
  }

  private async invalidateRootCache(evaluationId: string) {
    await this.cacheService.del(MATERIAL_CACHE_KEYS.ROOTS(evaluationId));
  }

  private async invalidateClassEventMaterialsCache(classEventId: string) {
    await this.cacheService.del(MATERIAL_CACHE_KEYS.CLASS_EVENT(classEventId));
  }
}
