import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { randomUUID } from 'crypto';
import * as path from 'path';
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
import { CreateFolderTemplateDto } from '@modules/materials/dto/create-folder-template.dto';
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
import { ACCESS_MESSAGES } from '@common/constants/access-messages.constants';
import { MySqlErrorCode } from '@common/interfaces/database-error.interface';
import {
  FOLDER_STATUS_CODES,
  MATERIAL_CACHE_KEYS,
  MATERIAL_STATUS_CODES,
  DELETION_REQUEST_STATUS_CODES,
  STORAGE_PROVIDER_CODES,
} from '@modules/materials/domain/material.constants';
import { NotificationsDispatchService } from '@modules/notifications/application/notifications-dispatch.service';
import { AuthorizedMediaLinkDto } from '@modules/media-access/dto/authorized-media-link.dto';
import {
  MEDIA_ACCESS_MODES,
  MEDIA_CONTENT_KINDS,
  MEDIA_DOCUMENT_LINK_MODES,
} from '@modules/media-access/domain/media-access.constants';
import type { MediaDocumentLinkMode } from '@modules/media-access/domain/media-access.constants';
import {
  buildDriveDownloadUrl,
  buildDrivePreviewUrl,
} from '@modules/media-access/domain/media-access-url.util';
import { DriveAccessScopeService } from '@modules/media-access/application/drive-access-scope.service';

@Injectable()
export class MaterialsService {
  private readonly logger = new Logger(MaterialsService.name);
  private readonly CACHE_TTL =
    technicalSettings.cache.materials.materialsExplorerCacheTtlSeconds;
  private readonly maxFolderDepth = technicalSettings.materials.maxFolderDepth;

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
    private readonly notificationsDispatchService: NotificationsDispatchService,
    private readonly driveAccessScopeService: DriveAccessScopeService,
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

  async createFolderTemplate(
    user: UserWithSession,
    dto: CreateFolderTemplateDto,
  ): Promise<{ rootFolder: MaterialFolder; subFolders: MaterialFolder[] }> {
    await this.assertCanManageEvaluation(user, dto.evaluationId);

    const activeStatus = await this.getActiveFolderStatus();
    const now = new Date();
    const { visibleFrom, visibleUntil } = this.parseVisibilityRange(
      dto.visibleFrom,
      dto.visibleUntil,
    );

    const rootName = dto.rootName.trim();
    if (!rootName) {
      throw new BadRequestException(
        ACCESS_MESSAGES.MATERIAL_TEMPLATE_EMPTY_ROOT_NAME,
      );
    }

    const normalizedSubfolderNames = dto.subfolderNames.map((name) =>
      name.trim(),
    );
    if (normalizedSubfolderNames.some((name) => !name)) {
      throw new BadRequestException(
        ACCESS_MESSAGES.MATERIAL_TEMPLATE_EMPTY_CHILD_NAME,
      );
    }

    const uniqueSubfolderNames = new Set(
      normalizedSubfolderNames.map((name) => name.toLowerCase()),
    );
    if (uniqueSubfolderNames.size !== normalizedSubfolderNames.length) {
      throw new BadRequestException(
        ACCESS_MESSAGES.MATERIAL_TEMPLATE_DUPLICATE_CHILD_NAME,
      );
    }

    const result = await this.dataSource.transaction(async (manager) => {
      const rootFolder = manager.create(MaterialFolder, {
        evaluationId: dto.evaluationId,
        parentFolderId: null,
        folderStatusId: activeStatus.id,
        name: rootName,
        visibleFrom,
        visibleUntil,
        createdById: user.id,
        createdAt: now,
        updatedAt: now,
      });
      const savedRootFolder = await manager.save(rootFolder);

      const subFolders: MaterialFolder[] = [];
      for (const subfolderName of normalizedSubfolderNames) {
        const subFolder = manager.create(MaterialFolder, {
          evaluationId: dto.evaluationId,
          parentFolderId: savedRootFolder.id,
          folderStatusId: activeStatus.id,
          name: subfolderName,
          visibleFrom,
          visibleUntil,
          createdById: user.id,
          createdAt: now,
          updatedAt: now,
        });
        subFolders.push(await manager.save(subFolder));
      }

      return {
        rootFolder: savedRootFolder,
        subFolders,
      };
    });

    await this.invalidateRootCache(dto.evaluationId);
    await this.invalidateFolderCache(result.rootFolder.id);

    return result;
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
    const documentsFolderId = this.storageService.isGoogleDriveStorageEnabled()
      ? await this.resolveDocumentsFolderIdForEvaluation(folder.evaluationId)
      : null;
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
          await this.fileResourceRepository.findByHashAndSizeWithinEvaluation(
            hash,
            String(file.size),
            folder.evaluationId,
          );

        let finalResource: FileResource;
        let finalVersion: FileVersion;

        if (!existingResource) {
          const uniqueName = this.buildStorageObjectName(file.originalname);
          savedResource = await this.storageService.saveFile(
            uniqueName,
            file.buffer,
            file.mimetype,
            documentsFolderId
              ? { targetDriveFolderId: documentsFolderId }
              : undefined,
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
              await this.fileResourceRepository.findByHashAndSizeWithinEvaluation(
                hash,
                String(file.size),
                folder.evaluationId,
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
                    'No se pudo limpiar archivo huérfano tras colisión de deduplicación',
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

        return savedMaterial;
      });

      await this.invalidateFolderCache(dto.materialFolderId);
      if (dto.classEventId) {
        await this.invalidateClassEventMaterialsCache(dto.classEventId);
      }

      void this.notificationsDispatchService.dispatchNewMaterial(
        result.id,
        dto.materialFolderId,
      );

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
        `Tipo de archivo no permitido. Solo se aceptan documentos educativos (PDF, imágenes, Office).`,
      );
    }

    if (file.mimetype === 'application/pdf') {
      const pdfMagic = file.buffer.subarray(0, 4).toString('hex');
      if (pdfMagic !== technicalSettings.uploads.materials.pdfMagicHeaderHex) {
        throw new BadRequestException('El archivo no es un PDF válido');
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
        const documentsFolderId =
          this.storageService.isGoogleDriveStorageEnabled()
            ? await this.resolveDocumentsFolderIdForEvaluation(
                freshMaterial.materialFolder.evaluationId,
              )
            : null;

        const hash = await this.storageService.calculateHash(file.buffer);
        const existingResource =
          await this.fileResourceRepository.findByHashAndSizeWithinEvaluation(
            hash,
            String(file.size),
            freshMaterial.materialFolder.evaluationId,
          );

        let finalResource: FileResource;

        if (!existingResource) {
          const uniqueName = this.buildStorageObjectName(file.originalname);
          savedResource = await this.storageService.saveFile(
            uniqueName,
            file.buffer,
            file.mimetype,
            documentsFolderId
              ? { targetDriveFolderId: documentsFolderId }
              : undefined,
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
              await this.fileResourceRepository.findByHashAndSizeWithinEvaluation(
                hash,
                String(file.size),
                freshMaterial.materialFolder.evaluationId,
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
                    'No se pudo limpiar archivo huérfano tras colisión de deduplicación',
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
            'No se pudo crear una nueva versión del material',
          );
        }

        freshMaterial.fileResourceId = finalResource.id;
        freshMaterial.fileVersionId = savedVersion.id;
        freshMaterial.updatedAt = now;

        const updatedMaterial = await manager.save(freshMaterial);

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
  ): Promise<{
    folders: MaterialFolder[];
    materials: Material[];
    totalMaterials: number;
    subfolderMaterialCount: Record<string, number>;
  }> {
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

    const visibleContents = this.applyVisibilityFilter(
      user,
      contents.folders,
      contents.materials,
    );

    const materialStatus = await this.getActiveMaterialStatus();
    const isStudent = user.activeRole === ROLE_CODES.STUDENT;
    const now = isStudent ? new Date() : undefined;

    const subfolderMaterialCountRaw =
      await this.materialRepository.countByFolderIds(
        visibleContents.folders.map((f) => f.id),
        materialStatus.id,
        now,
      );
    const subfolderMaterialCount = visibleContents.folders.reduce<
      Record<string, number>
    >((acc, folderItem) => {
      acc[folderItem.id] = subfolderMaterialCountRaw[folderItem.id] ?? 0;
      return acc;
    }, {});

    return {
      folders: visibleContents.folders,
      materials: visibleContents.materials,
      totalMaterials: visibleContents.materials.length,
      subfolderMaterialCount,
    };
  }

  async getClassEventMaterials(
    user: UserWithSession,
    classEventId: string,
  ): Promise<Material[]> {
    const classEvent =
      await this.classEventRepository.findByIdSimple(classEventId);
    if (!classEvent) {
      throw new NotFoundException('Sesión de clase no encontrada');
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

  async getAuthorizedDocumentLink(
    user: UserWithSession,
    materialId: string,
    mode: MediaDocumentLinkMode = MEDIA_DOCUMENT_LINK_MODES.VIEW,
  ): Promise<AuthorizedMediaLinkDto> {
    const material = await this.materialRepository.findById(materialId);
    if (!material) {
      throw new NotFoundException('Material no encontrado');
    }

    const folder = await this.folderRepository.findById(
      material.materialFolderId,
    );
    if (!folder) {
      throw new NotFoundException('Carpeta contenedora no encontrada');
    }

    await this.checkAuthorizedAccess(
      user,
      folder.evaluationId,
      folder,
      material,
    );

    const resource = material.fileResource;
    if (!resource) {
      throw new InternalServerErrorException(
        'Integridad de datos corrupta: Material sin recurso fisico',
      );
    }

    const isDriveResource =
      resource.storageProvider === STORAGE_PROVIDER_CODES.GDRIVE;
    const driveFileId = isDriveResource ? resource.storageKey : null;
    if (isDriveResource && driveFileId) {
      const scope = await this.driveAccessScopeService.resolveForEvaluation(
        folder.evaluationId,
      );
      const expectedDocumentsFolderId = scope.persisted?.driveDocumentsFolderId;
      if (!expectedDocumentsFolderId) {
        throw new ForbiddenException(
          'El scope Drive de la evaluacion no esta provisionado para documentos',
        );
      }

      const isInExpectedFolder =
        await this.storageService.isDriveFileDirectlyInFolder(
          driveFileId,
          expectedDocumentsFolderId,
        );
      if (!isInExpectedFolder) {
        throw new ForbiddenException(
          'El documento no pertenece al scope Drive autorizado para esta evaluacion',
        );
      }
    }

    const url =
      isDriveResource && driveFileId
        ? mode === MEDIA_DOCUMENT_LINK_MODES.DOWNLOAD
          ? buildDriveDownloadUrl(driveFileId)
          : buildDrivePreviewUrl(driveFileId)
        : this.buildMaterialDownloadProxyPath(material.id);

    const accessMode = isDriveResource
      ? MEDIA_ACCESS_MODES.DIRECT_URL
      : MEDIA_ACCESS_MODES.BACKEND_PROXY;

    return {
      contentKind: MEDIA_CONTENT_KINDS.DOCUMENT,
      accessMode,
      evaluationId: folder.evaluationId,
      driveFileId,
      url,
      expiresAt: null,
      requestedMode: mode,
      fileName: material.displayName || resource.originalName,
      mimeType: resource.mimeType,
      storageProvider: resource.storageProvider,
    };
  }

  async getMaterialLastModified(
    user: UserWithSession,
    materialId: string,
  ): Promise<{
    materialId: string;
    lastModifiedAt: Date;
  }> {
    const material = await this.materialRepository.findById(materialId);
    if (!material) {
      throw new NotFoundException('Material no encontrado');
    }

    const folder = await this.folderRepository.findById(
      material.materialFolderId,
    );
    if (!folder) {
      throw new NotFoundException('Carpeta contenedora no encontrada');
    }

    await this.checkAuthorizedAccess(
      user,
      folder.evaluationId,
      folder,
      material,
    );

    return {
      materialId: material.id,
      lastModifiedAt: material.updatedAt ?? material.createdAt,
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

    if (dto.entityType !== AUDIT_ENTITY_TYPES.MATERIAL) {
      throw new BadRequestException(
        'Solo se admiten solicitudes de eliminacion para materiales',
      );
    }

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

    const now = new Date();

    await this.dataSource.transaction(async (manager) => {
      const lockRowsRaw: unknown = await manager.query(
        'SELECT id FROM material WHERE id = ? FOR UPDATE',
        [dto.entityId],
      );
      if (!Array.isArray(lockRowsRaw) || lockRowsRaw.length === 0) {
        throw new NotFoundException('Material no encontrado');
      }

      const pendingRequest =
        await this.deletionRequestRepository.findPendingByMaterialId(
          dto.entityId,
          pendingStatus.id,
          manager,
        );
      if (pendingRequest) {
        throw new BadRequestException(
          'Ya existe una solicitud de eliminacion pendiente para este material',
        );
      }

      await this.deletionRequestRepository.create(
        {
          requestedById: user.id,
          deletionRequestStatusId: pendingStatus.id,
          entityType: dto.entityType,
          entityId: dto.entityId,
          reason: dto.reason,
          createdAt: now,
          updatedAt: now,
        },
        manager,
      );

      await this.auditService.logAction(
        user.id,
        AUDIT_ACTION_CODES.FILE_DELETE_REQUEST,
        AUDIT_ENTITY_TYPES.MATERIAL,
        dto.entityId,
        manager,
      );
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
        'Rango de visibilidad inválido: visibleFrom no puede ser mayor que visibleUntil',
      );
    }

    return {
      visibleFrom: startDate,
      visibleUntil: endDate,
    };
  }

  private buildMaterialDownloadProxyPath(materialId: string): string {
    return `/materials/${encodeURIComponent(materialId)}/download`;
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
    if (parent) {
      const parentDepth = await this.resolveFolderDepth(parent);
      if (parentDepth >= this.maxFolderDepth) {
        throw new BadRequestException(
          `${ACCESS_MESSAGES.MATERIAL_FOLDER_DEPTH_EXCEEDED} (max=${this.maxFolderDepth})`,
        );
      }
    }
    return parent;
  }

  private async resolveFolderDepth(folder: MaterialFolder): Promise<number> {
    let depth = 1;
    let current = folder;
    const maxTraversalHops = this.maxFolderDepth + 10;

    for (let hop = 0; hop < maxTraversalHops; hop += 1) {
      const parentId = current.parentFolderId;
      if (!parentId) {
        return depth;
      }

      const parent = await this.folderRepository.findById(parentId);
      if (!parent) {
        throw new InternalServerErrorException(
          'Integridad de datos corrupta: cadena de carpetas incompleta',
        );
      }

      depth += 1;
      current = parent;
    }

    throw new InternalServerErrorException(
      'Integridad de datos corrupta: profundidad de carpetas invalida',
    );
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
      throw new NotFoundException('Sesión de clase no encontrada');
    }

    if (classEvent.evaluationId !== evaluationId) {
      throw new BadRequestException(
        'Inconsistencia: La sesión no pertenece a la misma evaluación de la carpeta',
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

  private async resolveDocumentsFolderIdForEvaluation(
    evaluationId: string,
  ): Promise<string> {
    const scope =
      await this.driveAccessScopeService.resolveForEvaluation(evaluationId);
    const documentsFolderId = String(
      scope.persisted?.driveDocumentsFolderId || '',
    ).trim();
    if (!documentsFolderId) {
      throw new ForbiddenException(
        'El scope Drive de la evaluacion no esta provisionado para documentos',
      );
    }
    return documentsFolderId;
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

  private buildStorageObjectName(originalName: string): string {
    const normalizedOriginalName = String(originalName || '')
      .replace(/[\r\n\t]/g, ' ')
      .trim();
    if (!normalizedOriginalName) {
      return randomUUID();
    }

    if (this.storageService.isGoogleDriveStorageEnabled()) {
      // For Drive, keep original file name so operators and teachers see expected names.
      return normalizedOriginalName;
    }

    // For local storage, keep technical uniqueness to prevent overwrite collisions.
    const extension = path.extname(normalizedOriginalName).trim();
    return extension ? `${randomUUID()}${extension}` : randomUUID();
  }
}
