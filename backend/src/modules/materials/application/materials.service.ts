import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { StorageService } from '@infrastructure/storage/storage.service';
import { AccessEngineService } from '@modules/enrollments/application/access-engine.service';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import { MaterialFolderRepository } from '@modules/materials/infrastructure/material-folder.repository';
import { MaterialRepository } from '@modules/materials/infrastructure/material.repository';
import { FileResourceRepository } from '@modules/materials/infrastructure/file-resource.repository';
import { FileVersionRepository } from '@modules/materials/infrastructure/file-version.repository';
import { MaterialCatalogRepository } from '@modules/materials/infrastructure/material-catalog.repository';
import { DeletionRequestRepository } from '@modules/materials/infrastructure/deletion-request.repository';
import { CourseCycleProfessorRepository } from '@modules/courses/infrastructure/course-cycle-professor.repository';
import { ClassEventRepository } from '@modules/events/infrastructure/class-event.repository';
import { CreateMaterialFolderDto } from '@modules/materials/dto/create-material-folder.dto';
import { UploadMaterialDto } from '@modules/materials/dto/upload-material.dto';
import { RequestDeletionDto } from '@modules/materials/dto/request-deletion.dto';
import { MaterialFolder } from '@modules/materials/domain/material-folder.entity';
import { Material } from '@modules/materials/domain/material.entity';
import { FileResource } from '@modules/materials/domain/file-resource.entity';
import { FileVersion } from '@modules/materials/domain/file-version.entity';
import { User } from '@modules/users/domain/user.entity';
import type { UserWithSession } from '@modules/auth/strategies/jwt.strategy';
import { AuditService } from '@modules/audit/application/audit.service';
import {
  AUDIT_ACTION_CODES,
  AUDIT_ENTITY_TYPES,
} from '@modules/audit/interfaces/audit.constants';
import { getEpoch } from '@common/utils/date.util';
import { getErrnoFromDbError } from '@common/utils/mysql-error.util';
import { technicalSettings } from '@config/technical-settings';
import {
  ADMIN_ROLE_CODES,
  ROLE_CODES,
} from '@common/constants/role-codes.constants';
import { MySqlErrorCode } from '@common/interfaces/database-error.interface';
import {
  FOLDER_STATUS_CODES,
  MATERIAL_CACHE_KEYS,
  MATERIAL_STATUS_CODES,
  DELETION_REQUEST_STATUS_CODES,
  STORAGE_PROVIDER_CODES,
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
    private readonly courseCycleProfessorRepository: CourseCycleProfessorRepository,
    private readonly auditService: AuditService,
    private readonly classEventRepository: ClassEventRepository,
  ) {}

  async createFolder(
    user: UserWithSession,
    dto: CreateMaterialFolderDto,
  ): Promise<MaterialFolder> {
    await this.assertCanManageEvaluation(user, dto.evaluationId);

    const activeStatus = await this.getActiveFolderStatus();
    const now = new Date();
    const { visibleFrom, visibleUntil } = this.parseVisibilityRange(
      dto.visibleFrom,
      dto.visibleUntil,
    );

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
      visibleFrom,
      visibleUntil,
      createdById: user.id,
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
    user: UserWithSession,
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
    await this.assertCanManageEvaluation(user, folder.evaluationId);
    const { visibleFrom, visibleUntil } = this.parseVisibilityRange(
      dto.visibleFrom,
      dto.visibleUntil,
    );

    const now = new Date();
    let savedResource: {
      storageProvider: (typeof STORAGE_PROVIDER_CODES)[keyof typeof STORAGE_PROVIDER_CODES];
      storageKey: string;
      storageUrl: string | null;
    } | null = null;
    let isNewFile = false;

    try {
      const result = await this.dataSource.transaction(async (manager) => {
        if (dto.classEventId) {
          await this.validateClassEventAssociation(
            dto.classEventId,
            folder.evaluationId,
            manager,
          );
        }

        const hash = await this.storageService.calculateHash(file.buffer);
        const existingResource =
          await this.fileResourceRepository.findByHashAndSize(
            hash,
            String(file.size),
          );

        let finalResource: FileResource;
        let finalVersion: FileVersion;

        if (!existingResource) {
          const sanitizedOriginalName = file.originalname.replace(
            /[^a-zA-Z0-9.-]/g,
            '_',
          );
          const uniqueName = `${Date.now()}-${sanitizedOriginalName}`;
          savedResource = await this.storageService.saveFile(
            uniqueName,
            file.buffer,
            file.mimetype,
          );
          isNewFile = true;

          const resourceEntity = manager.create(FileResource, {
            checksumHash: hash,
            originalName: file.originalname,
            mimeType: file.mimetype,
            sizeBytes: String(file.size),
            storageProvider: savedResource.storageProvider,
            storageKey: savedResource.storageKey,
            storageUrl: savedResource.storageUrl,
            createdAt: now,
          });
          try {
            finalResource = await manager.save(resourceEntity);
          } catch (error) {
            const dbErrno = getErrnoFromDbError(error);
            if (dbErrno !== MySqlErrorCode.DUPLICATE_ENTRY) {
              throw error;
            }

            const dedupResource =
              await this.fileResourceRepository.findByHashAndSize(
                hash,
                String(file.size),
              );
            if (!dedupResource) {
              throw error;
            }

            finalResource = dedupResource;
            if (savedResource) {
              try {
                await this.rollbackFile(savedResource);
              } catch (cleanupError) {
                this.logger.warn({
                  message:
                    'No se pudo limpiar archivo huÃ©rfano tras colisiÃ³n de deduplicaciÃ³n',
                  storageKey: savedResource.storageKey,
                  error:
                    cleanupError instanceof Error
                      ? cleanupError.message
                      : String(cleanupError),
                });
              }
              savedResource = null;
              isNewFile = false;
            }
          }

          const version1 = await manager.findOne(FileVersion, {
            where: { fileResourceId: finalResource.id, versionNumber: 1 },
          });
          if (!version1) {
            const versionEntity = manager.create(FileVersion, {
              fileResourceId: finalResource.id,
              versionNumber: 1,
              storageUrl: finalResource.storageUrl,
              createdById: user.id,
              createdAt: now,
            });
            finalVersion = await manager.save(versionEntity);
          } else {
            finalVersion = version1;
          }
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
              createdById: user.id,
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
          fileVersionId: finalVersion.id,
          materialStatusId: activeStatus.id,
          displayName: dto.displayName,
          visibleFrom,
          visibleUntil,
          createdById: user.id,
          createdAt: now,
          updatedAt: now,
        });
        const savedMaterial = await manager.save(materialEntity);

        await this.auditService.logAction(
          user.id,
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
      if (isNewFile && savedResource) await this.rollbackFile(savedResource);
      throw error;
    }
  }

  async addVersion(
    user: UserWithSession,
    materialId: string,
    file: Express.Multer.File,
  ): Promise<Material> {
    if (!file) throw new BadRequestException('Archivo requerido');
    const allowedMimeTypes: readonly string[] =
      technicalSettings.uploads.materials.allowedMimeTypes;

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido. Solo se aceptan documentos educativos (PDF, imÃ¡genes, Office).`,
      );
    }

    if (file.mimetype === 'application/pdf') {
      const pdfMagic = file.buffer.subarray(0, 4).toString('hex');
      if (pdfMagic !== technicalSettings.uploads.materials.pdfMagicHeaderHex) {
        throw new BadRequestException('El archivo no es un PDF vÃ¡lido');
      }
    }

    const now = new Date();
    let savedResource: {
      storageProvider: (typeof STORAGE_PROVIDER_CODES)[keyof typeof STORAGE_PROVIDER_CODES];
      storageKey: string;
      storageUrl: string | null;
    } | null = null;
    let isNewFile = false;

    try {
      const result = await this.dataSource.transaction(async (manager) => {
        const freshMaterial = await manager.findOne(Material, {
          where: { id: materialId },
          relations: { materialFolder: true },
          lock: { mode: 'pessimistic_write' },
        });

        if (!freshMaterial)
          throw new NotFoundException('Material no encontrado');
        if (!freshMaterial.materialFolder) {
          throw new InternalServerErrorException(
            'Integridad de datos corrupta: Material sin carpeta contenedora',
          );
        }
        await this.assertCanManageEvaluation(
          user,
          freshMaterial.materialFolder.evaluationId,
          manager,
        );

        const hash = await this.storageService.calculateHash(file.buffer);
        const existingResource =
          await this.fileResourceRepository.findByHashAndSize(
            hash,
            String(file.size),
          );

        let finalResource: FileResource;

        if (!existingResource) {
          const sanitizedOriginalName = file.originalname.replace(
            /[^a-zA-Z0-9.-]/g,
            '_',
          );
          const uniqueName = `${Date.now()}-${sanitizedOriginalName}`;
          savedResource = await this.storageService.saveFile(
            uniqueName,
            file.buffer,
            file.mimetype,
          );
          isNewFile = true;

          const resourceEntity = manager.create(FileResource, {
            checksumHash: hash,
            originalName: file.originalname,
            mimeType: file.mimetype,
            sizeBytes: String(file.size),
            storageProvider: savedResource.storageProvider,
            storageKey: savedResource.storageKey,
            storageUrl: savedResource.storageUrl,
            createdAt: now,
          });
          try {
            finalResource = await manager.save(resourceEntity);
          } catch (error) {
            const dbErrno = getErrnoFromDbError(error);
            if (dbErrno !== MySqlErrorCode.DUPLICATE_ENTRY) {
              throw error;
            }

            const dedupResource =
              await this.fileResourceRepository.findByHashAndSize(
                hash,
                String(file.size),
              );
            if (!dedupResource) {
              throw error;
            }

            finalResource = dedupResource;
            if (savedResource) {
              try {
                await this.rollbackFile(savedResource);
              } catch (cleanupError) {
                this.logger.warn({
                  message:
                    'No se pudo limpiar archivo huÃ©rfano tras colisiÃ³n de deduplicaciÃ³n',
                  storageKey: savedResource.storageKey,
                  error:
                    cleanupError instanceof Error
                      ? cleanupError.message
                      : String(cleanupError),
                });
              }
              savedResource = null;
              isNewFile = false;
            }
          }
        } else {
          finalResource = existingResource;
        }

        const lockedResource = await manager.findOne(FileResource, {
          where: { id: finalResource.id },
          lock: { mode: 'pessimistic_write' },
        });
        if (!lockedResource) {
          throw new InternalServerErrorException(
            'Integridad de datos corrupta: recurso de archivo no encontrado',
          );
        }

        const currentMaterialVersion = await manager.findOne(FileVersion, {
          where: { id: freshMaterial.fileVersionId },
        });
        const nextMaterialVersionNumber =
          (currentMaterialVersion?.versionNumber || 0) + 1;

        let savedVersion: FileVersion | null = null;
        const maxAttempts = 3;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          const latestVersion = await manager.findOne(FileVersion, {
            where: { fileResourceId: finalResource.id },
            order: { versionNumber: 'DESC' },
          });
          const nextResourceVersionNumber =
            (latestVersion?.versionNumber || 0) + 1;
          const nextVersionNumber = Math.max(
            nextMaterialVersionNumber,
            nextResourceVersionNumber,
          );

          const versionEntity = manager.create(FileVersion, {
            fileResourceId: finalResource.id,
            versionNumber: nextVersionNumber,
            storageUrl: finalResource.storageUrl,
            createdById: user.id,
            createdAt: now,
          });

          try {
            savedVersion = await manager.save(versionEntity);
            break;
          } catch (error) {
            const dbErrno = getErrnoFromDbError(error);
            const isLastAttempt = attempt === maxAttempts - 1;
            if (dbErrno !== MySqlErrorCode.DUPLICATE_ENTRY || isLastAttempt) {
              throw error;
            }
          }
        }

        if (!savedVersion) {
          throw new InternalServerErrorException(
            'No se pudo crear una nueva version del material',
          );
        }

        freshMaterial.fileResourceId = finalResource.id;
        freshMaterial.fileVersionId = savedVersion.id;
        freshMaterial.updatedAt = now;

        const updatedMaterial = await manager.save(freshMaterial);

        await this.auditService.logAction(
          user.id,
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
      if (isNewFile && savedResource) await this.rollbackFile(savedResource);
      throw error;
    }
  }

  async getRootFolders(
    user: UserWithSession,
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
    user: UserWithSession,
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
      const materialStatus = await this.getActiveMaterialStatus();
      const [folders, materials] = await Promise.all([
        this.folderRepository.findSubFolders(folderId, status.id),
        this.materialRepository.findByFolderId(folderId, materialStatus.id),
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
    user: UserWithSession,
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

    const materialStatus = await this.getActiveMaterialStatus();
    const materials = await this.materialRepository.findByClassEventId(
      classEventId,
      materialStatus.id,
    );
    await this.cacheService.set(cacheKey, materials, this.CACHE_TTL);

    return this.applyVisibilityFilter(user, [], materials).materials;
  }

  async download(
    user: UserWithSession,
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

    await this.checkAuthorizedAccess(
      user,
      folder.evaluationId,
      folder,
      material,
    );

    const resource = material.fileResource;
    if (!resource)
      throw new InternalServerErrorException(
        'Integridad de datos corrupta: Material sin recurso físico',
      );
    const stream = await this.storageService.getFileStream(
      resource.storageKey,
      resource.storageProvider,
      resource.storageUrl,
    );
    return {
      stream,
      fileName: material.displayName || resource.originalName,
      mimeType: resource.mimeType,
    };
  }

  async requestDeletion(
    user: UserWithSession,
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
      const folder = await this.folderRepository.findById(
        exists.materialFolderId,
      );
      if (!folder)
        throw new InternalServerErrorException(
          'Integridad de datos corrupta: Material sin carpeta contenedora',
        );
      await this.assertCanManageEvaluation(user, folder.evaluationId);
    } else {
      const exists = await this.folderRepository.findById(dto.entityId);
      if (!exists) throw new NotFoundException('Carpeta no encontrada');
      await this.assertCanManageEvaluation(user, exists.evaluationId);
    }

    const now = new Date();

    await this.deletionRequestRepository.create({
      requestedById: user.id,
      deletionRequestStatusId: pendingStatus.id,
      entityType: dto.entityType,
      entityId: dto.entityId,
      reason: dto.reason,
      createdAt: now,
      updatedAt: now,
    });
  }

  private parseVisibilityRange(
    visibleFrom?: string,
    visibleUntil?: string,
  ): { visibleFrom: Date | null; visibleUntil: Date | null } {
    const startDate = visibleFrom ? new Date(visibleFrom) : null;
    const endDate = visibleUntil ? new Date(visibleUntil) : null;

    if (startDate && endDate && getEpoch(startDate) > getEpoch(endDate)) {
      throw new BadRequestException(
        'Rango de visibilidad invÃ¡lido: visibleFrom no puede ser mayor que visibleUntil',
      );
    }

    return {
      visibleFrom: startDate,
      visibleUntil: endDate,
    };
  }

  private async assertCanManageEvaluation(
    user: UserWithSession,
    evaluationId: string,
    manager?: EntityManager,
  ): Promise<void> {
    const activeRole = user.activeRole;
    const roleCodes = (user.roles || []).map((r) => r.code);

    if (
      activeRole === ROLE_CODES.ADMIN ||
      roleCodes.some((r) => ADMIN_ROLE_CODES.includes(r))
    ) {
      return;
    }

    if (activeRole !== ROLE_CODES.PROFESSOR) {
      throw new ForbiddenException(
        'No tienes permiso para gestionar materiales de este curso',
      );
    }

    const isAssigned =
      await this.courseCycleProfessorRepository.isProfessorAssignedToEvaluation(
        evaluationId,
        user.id,
        manager,
      );

    if (!isAssigned) {
      throw new ForbiddenException(
        'No tienes permiso para gestionar materiales de este curso',
      );
    }
  }

  private applyVisibilityFilter(
    user: User | UserWithSession,
    folders: MaterialFolder[],
    materials: Material[],
  ) {
    const activeRole = (user as UserWithSession).activeRole;
    const roleCodes = (user.roles || []).map((r) => r.code);

    const isStaff =
      activeRole === ROLE_CODES.ADMIN ||
      roleCodes.some((r) => ADMIN_ROLE_CODES.includes(r));
    const isProfessor = activeRole === ROLE_CODES.PROFESSOR;

    if (isStaff || isProfessor) {
      return { folders, materials };
    }

    const nowTime = getEpoch(new Date());

    const visibleFolders = folders.filter((f) => {
      const startOk = !f.visibleFrom || getEpoch(f.visibleFrom) <= nowTime;
      const endOk = !f.visibleUntil || getEpoch(f.visibleUntil) >= nowTime;
      return startOk && endOk;
    });

    const visibleMaterials = materials.filter((m) => {
      const startOk = !m.visibleFrom || getEpoch(m.visibleFrom) <= nowTime;
      const endOk = !m.visibleUntil || getEpoch(m.visibleUntil) >= nowTime;
      return startOk && endOk;
    });

    return { folders: visibleFolders, materials: visibleMaterials };
  }

  private async checkAuthorizedAccess(
    user: UserWithSession,
    evaluationId: string,
    folder?: MaterialFolder,
    material?: Material,
  ): Promise<void> {
    const activeRole = user.activeRole;
    const roleCodes = (user.roles || []).map((r) => r.code);

    if (
      activeRole === ROLE_CODES.ADMIN ||
      roleCodes.some((r) => ADMIN_ROLE_CODES.includes(r))
    ) {
      return;
    }

    if (activeRole === ROLE_CODES.PROFESSOR) {
      const isAssigned =
        await this.courseCycleProfessorRepository.isProfessorAssignedToEvaluation(
          evaluationId,
          user.id,
        );

      if (!isAssigned) {
        throw new ForbiddenException(
          'No tienes permiso para ver materiales de este curso',
        );
      }
      return;
    }

    const hasEnrollment = await this.accessEngine.hasAccess(
      user.id,
      evaluationId,
    );
    if (!hasEnrollment) {
      throw new ForbiddenException(
        'No tienes acceso a este contenido educativo',
      );
    }

    const now = new Date();

    if (folder) {
      if (folder.visibleFrom && now < new Date(folder.visibleFrom)) {
        throw new ForbiddenException('Este contenido aún no está disponible');
      }
      if (folder.visibleUntil && now > new Date(folder.visibleUntil)) {
        throw new ForbiddenException('Este contenido ya no está disponible');
      }
    }

    if (material) {
      if (material.visibleFrom && now < new Date(material.visibleFrom)) {
        throw new ForbiddenException('Este material aún no está disponible');
      }
      if (material.visibleUntil && now > new Date(material.visibleUntil)) {
        throw new ForbiddenException('Este material ya no está disponible');
      }
    }
  }

  private async getActiveFolderStatus() {
    const status = await this.catalogRepository.findFolderStatusByCode(
      FOLDER_STATUS_CODES.ACTIVE,
    );
    if (!status) {
      throw new InternalServerErrorException(
        `Error de configuración: Estado ${FOLDER_STATUS_CODES.ACTIVE} de carpeta faltante`,
      );
    }
    return status;
  }

  private async getActiveMaterialStatus() {
    const status = await this.catalogRepository.findMaterialStatusByCode(
      MATERIAL_STATUS_CODES.ACTIVE,
    );
    if (!status) {
      throw new InternalServerErrorException(
        `Error de configuración: Estado ${MATERIAL_STATUS_CODES.ACTIVE} de material faltante`,
      );
    }
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
    manager?: EntityManager,
  ) {
    const classEvent = await this.classEventRepository.findByIdSimple(
      classEventId,
      manager,
    );
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

  private async rollbackFile(resource: {
    storageProvider: (typeof STORAGE_PROVIDER_CODES)[keyof typeof STORAGE_PROVIDER_CODES];
    storageKey: string;
    storageUrl: string | null;
  }) {
    await this.storageService.deleteFile(
      resource.storageKey,
      resource.storageProvider,
      resource.storageUrl,
    );
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
