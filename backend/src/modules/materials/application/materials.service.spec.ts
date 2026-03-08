import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, EntityManager } from 'typeorm';
import { MaterialsService } from '@modules/materials/application/materials.service';
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
import { AuditService } from '@modules/audit/application/audit.service';
import { AUDIT_ENTITY_TYPES } from '@modules/audit/interfaces/audit.constants';
import { ClassEventRepository } from '@modules/events/infrastructure/class-event.repository';
import { MaterialFolder } from '@modules/materials/domain/material-folder.entity';
import { UserWithSession } from '@modules/auth/strategies/jwt.strategy';
import { MaterialStatus } from '@modules/materials/domain/material-status.entity';
import { FolderStatus } from '@modules/materials/domain/folder-status.entity';
import { DeletionRequestStatus } from '@modules/materials/domain/deletion-request-status.entity';
import { Material } from '@modules/materials/domain/material.entity';
import { FileResource } from '@modules/materials/domain/file-resource.entity';
import { ROLE_CODES } from '@common/constants/role-codes.constants';
import { MATERIAL_CACHE_KEYS } from '@modules/materials/domain/material.constants';
import { ClassEvent } from '@modules/events/domain/class-event.entity';
import { NotificationsDispatchService } from '@modules/notifications/application/notifications-dispatch.service';
import { DriveAccessScopeService } from '@modules/media-access/application/drive-access-scope.service';
import {
  MEDIA_ACCESS_MODES,
  MEDIA_DOCUMENT_LINK_MODES,
} from '@modules/media-access/domain/media-access.constants';

const mockFolder = (
  id = '1',
  evaluationId = '100',
  parentId: string | null = null,
) =>
  ({
    id,
    evaluationId,
    parentFolderId: parentId,
    name: 'Test Folder',
  }) as MaterialFolder;

const mockFile = () =>
  ({
    originalname: 'test.pdf',
    mimetype: 'application/pdf',
    size: 1024,
    buffer: Buffer.from('%PDF-1.4 content'),
  }) as Express.Multer.File;

const mockStudent: UserWithSession = {
  id: 'user-1',
  activeRole: ROLE_CODES.STUDENT,
  roles: [{ code: ROLE_CODES.STUDENT }],
} as UserWithSession;

const mockProfessor: UserWithSession = {
  id: 'prof-1',
  activeRole: ROLE_CODES.PROFESSOR,
  roles: [{ code: ROLE_CODES.PROFESSOR }],
} as UserWithSession;

describe('MaterialsService', () => {
  let service: MaterialsService;
  let dataSource: jest.Mocked<DataSource>;
  let storageService: jest.Mocked<StorageService>;
  let folderRepo: jest.Mocked<MaterialFolderRepository>;
  let materialRepo: jest.Mocked<MaterialRepository>;
  let resourceRepo: jest.Mocked<FileResourceRepository>;
  let catalogRepo: jest.Mocked<MaterialCatalogRepository>;
  let deletionRepo: jest.Mocked<DeletionRequestRepository>;
  let courseCycleProfessorRepo: jest.Mocked<CourseCycleProfessorRepository>;
  let accessEngine: jest.Mocked<AccessEngineService>;
  let auditService: jest.Mocked<AuditService>;
  let cacheService: jest.Mocked<RedisCacheService>;
  let classEventRepo: jest.Mocked<ClassEventRepository>;
  let driveAccessScopeService: jest.Mocked<DriveAccessScopeService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaterialsService,
        {
          provide: DataSource,
          useValue: { transaction: jest.fn(), query: jest.fn() },
        },
        {
          provide: StorageService,
          useValue: {
            calculateHash: jest.fn(),
            saveFile: jest.fn(),
            deleteFile: jest.fn(),
            getFileStream: jest.fn(),
            isDriveFileDirectlyInFolder: jest.fn(),
            isGoogleDriveStorageEnabled: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: AccessEngineService,
          useValue: { hasAccess: jest.fn() },
        },
        {
          provide: RedisCacheService,
          useValue: {
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue(null),
            del: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: MaterialFolderRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findRootsByEvaluation: jest.fn(),
            findSubFolders: jest.fn(),
          },
        },
        {
          provide: MaterialRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findByFolderId: jest.fn(),
            findByClassEventId: jest.fn(),
            countByFolderIds: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: FileResourceRepository,
          useValue: {
            create: jest.fn(),
            findByHashAndSizeWithinEvaluation: jest.fn(),
          },
        },
        {
          provide: FileVersionRepository,
          useValue: { create: jest.fn() },
        },
        {
          provide: MaterialCatalogRepository,
          useValue: {
            findFolderStatusByCode: jest.fn(),
            findMaterialStatusByCode: jest.fn(),
            findDeletionRequestStatusByCode: jest.fn(),
          },
        },
        {
          provide: DeletionRequestRepository,
          useValue: {
            create: jest.fn(),
            findPendingByMaterialId: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: CourseCycleProfessorRepository,
          useValue: {
            isProfessorAssigned: jest.fn(),
            isProfessorAssignedToEvaluation: jest.fn(),
          },
        },
        {
          provide: AuditService,
          useValue: { logAction: jest.fn() },
        },
        {
          provide: ClassEventRepository,
          useValue: { findByIdSimple: jest.fn() },
        },
        {
          provide: NotificationsDispatchService,
          useValue: {
            dispatchNewMaterial: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: DriveAccessScopeService,
          useValue: {
            resolveForEvaluation: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MaterialsService>(MaterialsService);
    dataSource = module.get(DataSource);
    storageService = module.get(StorageService);
    folderRepo = module.get(MaterialFolderRepository);
    materialRepo = module.get(MaterialRepository);
    resourceRepo = module.get(FileResourceRepository);
    catalogRepo = module.get(MaterialCatalogRepository);
    deletionRepo = module.get(DeletionRequestRepository);
    courseCycleProfessorRepo = module.get(CourseCycleProfessorRepository);
    accessEngine = module.get(AccessEngineService);
    auditService = module.get(AuditService);
    cacheService = module.get(RedisCacheService);
    classEventRepo = module.get(ClassEventRepository);
    driveAccessScopeService = module.get(DriveAccessScopeService);
    (
      courseCycleProfessorRepo.isProfessorAssignedToEvaluation as jest.Mock
    ).mockResolvedValue(true);
    driveAccessScopeService.resolveForEvaluation.mockResolvedValue({
      persisted: {
        driveDocumentsFolderId: 'docs-folder-100',
      },
    } as any);
    storageService.isDriveFileDirectlyInFolder.mockResolvedValue(true);

    dataSource.transaction.mockImplementation(
      (arg1: unknown, arg2?: unknown) => {
        const runInTransaction = (typeof arg1 === 'function' ? arg1 : arg2) as (
          manager: EntityManager,
        ) => Promise<unknown>;
        if (!runInTransaction) return Promise.resolve();

        const mockManager = {
          save: jest.fn((entity: unknown) =>
            Promise.resolve({ ...(entity as object), id: 'saved-id' }),
          ),
          create: jest.fn((entity: unknown, data: object) => ({
            ...data,
            id: 'created-id',
          })),
          findOne: jest.fn().mockResolvedValue({ id: 'default-id' }),
          query: jest.fn().mockResolvedValue([{ id: 'mat1' }]),
          getRepository: jest.fn(),
        } as unknown as EntityManager;

        return runInTransaction(mockManager);
      },
    );
  });

  describe('createFolder', () => {
    it('should create a root folder successfully', async () => {
      catalogRepo.findFolderStatusByCode.mockResolvedValue({
        id: '1',
      } as FolderStatus);
      folderRepo.create.mockResolvedValue(mockFolder('1'));

      const result = await service.createFolder(mockProfessor, {
        evaluationId: '100',
        name: 'Root Folder',
      });

      expect(result).toBeDefined();
      expect(folderRepo.create).toHaveBeenCalled();
    });

    it('should reject folder creation when visibility range is invalid', async () => {
      catalogRepo.findFolderStatusByCode.mockResolvedValue({
        id: '1',
      } as FolderStatus);
      await expect(
        service.createFolder(mockProfessor, {
          evaluationId: '100',
          name: 'Invalid',
          visibleFrom: '2026-12-31T00:00:00.000Z',
          visibleUntil: '2026-01-01T00:00:00.000Z',
        }),
      ).rejects.toThrow('Rango de visibilidad inv');
    });

    it('should allow creating a third-level folder (depth = 3)', async () => {
      catalogRepo.findFolderStatusByCode.mockResolvedValue({
        id: '1',
      } as FolderStatus);
      folderRepo.findById
        .mockResolvedValueOnce(mockFolder('child-1', '100', 'root-1'))
        .mockResolvedValueOnce(mockFolder('root-1', '100', null));
      folderRepo.create.mockResolvedValue(
        mockFolder('grandchild-1', '100', 'child-1'),
      );

      const result = await service.createFolder(mockProfessor, {
        evaluationId: '100',
        parentFolderId: 'child-1',
        name: 'Grandchild Folder',
      });

      expect(result.id).toBe('grandchild-1');
      expect(folderRepo.create).toHaveBeenCalled();
    });

    it('should reject creating a fourth-level folder (depth > 3)', async () => {
      catalogRepo.findFolderStatusByCode.mockResolvedValue({
        id: '1',
      } as FolderStatus);
      folderRepo.findById
        .mockResolvedValueOnce(mockFolder('level-3', '100', 'level-2'))
        .mockResolvedValueOnce(mockFolder('level-2', '100', 'level-1'))
        .mockResolvedValueOnce(mockFolder('level-1', '100', 'root-1'))
        .mockResolvedValueOnce(mockFolder('root-1', '100', null));

      await expect(
        service.createFolder(mockProfessor, {
          evaluationId: '100',
          parentFolderId: 'level-3',
          name: 'Depth 4 Folder',
        }),
      ).rejects.toThrow('profundidad maxima');
    });
  });

  describe('createFolderTemplate', () => {
    it('should create root and first-level subfolders successfully', async () => {
      catalogRepo.findFolderStatusByCode.mockResolvedValue({
        id: '1',
      } as FolderStatus);

      const result = await service.createFolderTemplate(mockProfessor, {
        evaluationId: '100',
        rootName: 'Curso 2026-1',
        subfolderNames: ['PC1', 'PC2', 'EX1'],
      });

      expect(result.rootFolder).toBeDefined();
      expect(result.subFolders).toHaveLength(3);
      expect(cacheService.del).toHaveBeenCalledWith(
        MATERIAL_CACHE_KEYS.ROOTS('100'),
      );
    });

    it('should reject template creation when subfolder names are duplicated', async () => {
      catalogRepo.findFolderStatusByCode.mockResolvedValue({
        id: '1',
      } as FolderStatus);

      await expect(
        service.createFolderTemplate(mockProfessor, {
          evaluationId: '100',
          rootName: 'Curso 2026-1',
          subfolderNames: ['PC1', 'pc1'],
        }),
      ).rejects.toThrow('no pueden repetirse');
    });

    it('should reject template creation when any subfolder name is empty', async () => {
      catalogRepo.findFolderStatusByCode.mockResolvedValue({
        id: '1',
      } as FolderStatus);

      await expect(
        service.createFolderTemplate(mockProfessor, {
          evaluationId: '100',
          rootName: 'Curso 2026-1',
          subfolderNames: ['PC1', '   '],
        }),
      ).rejects.toThrow('deben tener contenido');
    });
  });

  describe('uploadMaterial', () => {
    it('should upload a new file successfully', async () => {
      const file = mockFile();

      catalogRepo.findMaterialStatusByCode.mockResolvedValue({
        id: '1',
      } as MaterialStatus);
      folderRepo.findById.mockResolvedValue(mockFolder());

      storageService.calculateHash.mockResolvedValue('hash123');
      resourceRepo.findByHashAndSizeWithinEvaluation.mockResolvedValue(null);
      storageService.saveFile.mockResolvedValue({
        storageProvider: 'LOCAL',
        storageKey: 'test.pdf',
        storageUrl: '/path/to/file',
      });

      const result = await service.uploadMaterial(
        mockProfessor,
        { materialFolderId: '1', displayName: 'Doc' },
        file,
      );

      expect(storageService.saveFile).toHaveBeenCalledWith(
        file.originalname,
        file.buffer,
        file.mimetype,
        { targetDriveFolderId: 'docs-folder-100' },
      );
      expect(result).toBeDefined();
    });

    it('should reject upload when classEvent does not belong to folder evaluation', async () => {
      const file = mockFile();
      catalogRepo.findMaterialStatusByCode.mockResolvedValue({
        id: '1',
      } as MaterialStatus);
      folderRepo.findById.mockResolvedValue(mockFolder('1', '100'));
      classEventRepo.findByIdSimple.mockResolvedValue({
        id: '55',
        evaluationId: '999',
      } as ClassEvent);

      await expect(
        service.uploadMaterial(
          mockProfessor,
          {
            materialFolderId: '1',
            displayName: 'Doc',
            classEventId: '55',
          },
          file,
        ),
      ).rejects.toThrow(
        'Inconsistencia: La sesión no pertenece a la misma evaluación de la carpeta',
      );
    });

    it('should deduplicate when resource already exists and avoid physical upload', async () => {
      const file = mockFile();
      catalogRepo.findMaterialStatusByCode.mockResolvedValue({
        id: '1',
      } as MaterialStatus);
      folderRepo.findById.mockResolvedValue(mockFolder());
      storageService.calculateHash.mockResolvedValue('hash-existing');
      resourceRepo.findByHashAndSizeWithinEvaluation.mockResolvedValue({
        id: 'res-existing',
        storageProvider: 'GDRIVE',
        storageKey: 'drive-key',
        storageUrl: null,
      } as unknown as FileResource);

      await service.uploadMaterial(
        mockProfessor,
        { materialFolderId: '1', displayName: 'Doc' },
        file,
      );

      expect(storageService.saveFile).not.toHaveBeenCalled();
    });

    it('should rollback uploaded file when transaction fails after save', async () => {
      const file = mockFile();

      catalogRepo.findMaterialStatusByCode.mockResolvedValue({
        id: '1',
      } as MaterialStatus);
      folderRepo.findById.mockResolvedValue(mockFolder());
      storageService.calculateHash.mockResolvedValue('hash123');
      resourceRepo.findByHashAndSizeWithinEvaluation.mockResolvedValue(null);
      storageService.saveFile.mockResolvedValue({
        storageProvider: 'LOCAL',
        storageKey: 'rollback.pdf',
        storageUrl: '/path/rollback.pdf',
      });
      dataSource.transaction.mockImplementation(async (cb: any) => {
        const manager = {
          save: jest.fn((entity: unknown) =>
            Promise.resolve({ ...(entity as object), id: 'saved-id' }),
          ),
          create: jest.fn((_: unknown, data: object) => data),
          findOne: jest.fn().mockResolvedValue({ id: 'default-id' }),
        } as any;
        await cb(manager);
        throw new Error('db-failure');
      });

      await expect(
        service.uploadMaterial(
          mockProfessor,
          { materialFolderId: '1', displayName: 'Doc' },
          file,
        ),
      ).rejects.toThrow('db-failure');

      expect(storageService.deleteFile).toHaveBeenCalledWith(
        'rollback.pdf',
        'LOCAL',
        '/path/rollback.pdf',
      );
    });

    it('should recover from concurrent dedup collision on file_resource and clean orphan physical file', async () => {
      const file = mockFile();
      catalogRepo.findMaterialStatusByCode.mockResolvedValue({
        id: '1',
      } as MaterialStatus);
      folderRepo.findById.mockResolvedValue(mockFolder());
      storageService.calculateHash.mockResolvedValue('hash-collision');
      resourceRepo.findByHashAndSizeWithinEvaluation
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: 'res-dedup',
          storageProvider: 'GDRIVE',
          storageKey: 'drive-key',
          storageUrl: null,
        } as unknown as FileResource);
      storageService.saveFile.mockResolvedValue({
        storageProvider: 'LOCAL',
        storageKey: 'collision.pdf',
        storageUrl: '/tmp/collision.pdf',
      });

      dataSource.transaction.mockImplementation(async (cb: any) => {
        const duplicateErr = { errno: 1062 };
        const manager = {
          create: jest.fn((_: unknown, data: object) => data),
          findOne: jest
            .fn()
            .mockResolvedValue({ id: 'ver-1', versionNumber: 1 }),
          save: jest
            .fn()
            .mockRejectedValueOnce(duplicateErr)
            .mockResolvedValueOnce({ id: 'saved-id', materialFolderId: '1' }),
        } as any;
        return await cb(manager);
      });

      const result = await service.uploadMaterial(
        mockProfessor,
        { materialFolderId: '1', displayName: 'Doc' },
        file,
      );

      expect(result).toBeDefined();
      expect(storageService.deleteFile).toHaveBeenCalledWith(
        'collision.pdf',
        'LOCAL',
        '/tmp/collision.pdf',
      );
    });
  });

  describe('addVersion', () => {
    it('should reject addVersion when mime type is not allowed', async () => {
      const file = {
        ...mockFile(),
        mimetype: 'application/x-msdownload',
      } as Express.Multer.File;

      await expect(
        service.addVersion(mockProfessor, 'mat-1', file),
      ).rejects.toThrow('Tipo de archivo no permitido');
    });

    it('should reject addVersion when pdf magic header is invalid', async () => {
      const file = {
        ...mockFile(),
        buffer: Buffer.from('NOTPDF'),
      } as Express.Multer.File;

      await expect(
        service.addVersion(mockProfessor, 'mat-1', file),
      ).rejects.toThrow('El archivo no es un PDF');
    });

    it('should invalidate folder cache using materialFolderId', async () => {
      const file = mockFile();
      const persistedMaterial = {
        id: 'mat-1',
        materialFolderId: 'folder-77',
        fileVersionId: 'ver-1',
        materialFolder: { evaluationId: '100' },
      } as Material;

      dataSource.transaction.mockImplementation(
        (arg1: unknown, arg2?: unknown) => {
          const runInTransaction = (
            typeof arg1 === 'function' ? arg1 : arg2
          ) as (manager: EntityManager) => Promise<unknown>;

          const mockManager = {
            findOne: jest
              .fn()
              .mockResolvedValueOnce(persistedMaterial)
              .mockResolvedValueOnce({ id: 'resource-1' })
              .mockResolvedValueOnce({ id: 'ver-1', versionNumber: 1 })
              .mockResolvedValueOnce({ id: 'ver-1', versionNumber: 1 }),
            create: jest.fn((_: unknown, data: object) => data),
            save: jest
              .fn()
              .mockResolvedValueOnce({ id: 'ver-2', versionNumber: 2 })
              .mockResolvedValueOnce(persistedMaterial),
          } as unknown as EntityManager;

          return runInTransaction
            ? runInTransaction(mockManager)
            : Promise.resolve();
        },
      );

      storageService.calculateHash.mockResolvedValue('hash-v2');
      resourceRepo.findByHashAndSizeWithinEvaluation.mockResolvedValue({
        id: 'resource-1',
        storageUrl: '/path/file.pdf',
      } as FileResource);

      await service.addVersion(mockProfessor, 'mat-1', file);

      expect(cacheService.del).toHaveBeenCalledWith(
        MATERIAL_CACHE_KEYS.CONTENTS('folder-77'),
      );
    });

    it('should deduplicate on addVersion when resource already exists', async () => {
      const file = mockFile();
      const persistedMaterial = {
        id: 'mat-1',
        materialFolderId: 'folder-77',
        fileVersionId: 'ver-1',
        materialFolder: { evaluationId: '100' },
      } as Material;

      dataSource.transaction.mockImplementation(
        (arg1: unknown, arg2?: unknown) => {
          const runInTransaction = (
            typeof arg1 === 'function' ? arg1 : arg2
          ) as (manager: EntityManager) => Promise<unknown>;
          const mockManager = {
            findOne: jest
              .fn()
              .mockResolvedValueOnce(persistedMaterial)
              .mockResolvedValueOnce({ id: 'res-existing' })
              .mockResolvedValueOnce({ id: 'ver-2', versionNumber: 2 })
              .mockResolvedValueOnce({ id: 'ver-2', versionNumber: 2 }),
            create: jest.fn((_: unknown, data: object) => data),
            save: jest
              .fn()
              .mockResolvedValueOnce({ id: 'ver-3', versionNumber: 3 })
              .mockResolvedValueOnce(persistedMaterial),
          } as unknown as EntityManager;
          return runInTransaction
            ? runInTransaction(mockManager)
            : Promise.resolve();
        },
      );

      storageService.calculateHash.mockResolvedValue('hash-existing-v3');
      resourceRepo.findByHashAndSizeWithinEvaluation.mockResolvedValue({
        id: 'res-existing',
        storageProvider: 'GDRIVE',
        storageKey: 'drive-key',
        storageUrl: null,
      } as unknown as FileResource);

      await service.addVersion(mockProfessor, 'mat-1', file);

      expect(storageService.saveFile).not.toHaveBeenCalled();
    });

    it('should recover from concurrent dedup collision on addVersion and clean orphan physical file', async () => {
      const file = mockFile();
      const persistedMaterial = {
        id: 'mat-1',
        materialFolderId: 'folder-77',
        fileVersionId: 'ver-1',
        materialFolder: { evaluationId: '100' },
      } as Material;

      storageService.calculateHash.mockResolvedValue('hash-collision-v2');
      resourceRepo.findByHashAndSizeWithinEvaluation
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: 'res-dedup-v2',
          storageProvider: 'GDRIVE',
          storageKey: 'drive-key-v2',
          storageUrl: null,
        } as unknown as FileResource);
      storageService.saveFile.mockResolvedValue({
        storageProvider: 'LOCAL',
        storageKey: 'collision-v2.pdf',
        storageUrl: '/tmp/collision-v2.pdf',
      });

      dataSource.transaction.mockImplementation(async (cb: any) => {
        const duplicateErr = { errno: 1062 };
        const manager = {
          create: jest.fn((_: unknown, data: object) => data),
          findOne: jest
            .fn()
            .mockResolvedValueOnce(persistedMaterial)
            .mockResolvedValueOnce({ id: 'res-dedup-v2' })
            .mockResolvedValueOnce({ id: 'ver-1', versionNumber: 1 })
            .mockResolvedValueOnce({ id: 'ver-1', versionNumber: 1 }),
          save: jest
            .fn()
            .mockRejectedValueOnce(duplicateErr)
            .mockResolvedValueOnce({ id: 'ver-2', versionNumber: 2 })
            .mockResolvedValueOnce(persistedMaterial),
        } as any;
        return await cb(manager);
      });

      const result = await service.addVersion(mockProfessor, 'mat-1', file);

      expect(result).toBeDefined();
      expect(storageService.deleteFile).toHaveBeenCalledWith(
        'collision-v2.pdf',
        'LOCAL',
        '/tmp/collision-v2.pdf',
      );
    });

    it('should retry when file_version collides concurrently and use next available version', async () => {
      const file = mockFile();
      const persistedMaterial = {
        id: 'mat-1',
        materialFolderId: 'folder-77',
        fileVersionId: 'ver-1',
        materialFolder: { evaluationId: '100' },
      } as Material;

      storageService.calculateHash.mockResolvedValue('hash-existing-v3');
      resourceRepo.findByHashAndSizeWithinEvaluation.mockResolvedValue({
        id: 'res-existing',
        storageProvider: 'GDRIVE',
        storageKey: 'drive-key',
        storageUrl: null,
      } as unknown as FileResource);

      dataSource.transaction.mockImplementation(async (cb: any) => {
        const duplicateErr = { errno: 1062 };
        const manager = {
          create: jest.fn((_: unknown, data: object) => data),
          findOne: jest
            .fn()
            .mockResolvedValueOnce(persistedMaterial)
            .mockResolvedValueOnce({ id: 'res-existing' })
            .mockResolvedValueOnce({ id: 'ver-2', versionNumber: 2 })
            .mockResolvedValueOnce({ id: 'ver-2', versionNumber: 2 })
            .mockResolvedValueOnce({ id: 'ver-3', versionNumber: 3 }),
          save: jest
            .fn()
            .mockRejectedValueOnce(duplicateErr)
            .mockResolvedValueOnce({ id: 'ver-4', versionNumber: 4 })
            .mockResolvedValueOnce(persistedMaterial),
        } as any;
        return await cb(manager);
      });

      const result = await service.addVersion(mockProfessor, 'mat-1', file);

      expect(result).toBeDefined();
      expect(storageService.saveFile).not.toHaveBeenCalled();
    });
  });

  describe('Access Control', () => {
    it('getRootFolders should check access and return folders', async () => {
      accessEngine.hasAccess.mockResolvedValue(true);
      catalogRepo.findFolderStatusByCode.mockResolvedValue({
        id: '1',
      } as FolderStatus);
      folderRepo.findRootsByEvaluation.mockResolvedValue([mockFolder()]);

      const result = await service.getRootFolders(mockStudent, '100');

      expect(result).toHaveLength(1);
    });

    it('should deny access to professor if assignment is revoked', async () => {
      folderRepo.findById.mockResolvedValue(mockFolder('folder-1', '100'));
      (
        courseCycleProfessorRepo.isProfessorAssignedToEvaluation as jest.Mock
      ).mockResolvedValue(false);

      await expect(
        service.getFolderContents(mockProfessor, 'folder-1'),
      ).rejects.toThrow('No tienes permiso para ver materiales de este curso');

      expect(
        courseCycleProfessorRepo.isProfessorAssignedToEvaluation,
      ).toHaveBeenCalledWith('100', 'prof-1');
    });

    it('should allow access to professor if assignment is active', async () => {
      folderRepo.findById.mockResolvedValue(mockFolder('folder-1', '100'));
      catalogRepo.findFolderStatusByCode.mockResolvedValue({
        id: '1',
      } as FolderStatus);
      catalogRepo.findMaterialStatusByCode.mockResolvedValue({
        id: '1',
      } as MaterialStatus);
      folderRepo.findSubFolders.mockResolvedValue([]);
      materialRepo.findByFolderId.mockResolvedValue([]);

      (
        courseCycleProfessorRepo.isProfessorAssignedToEvaluation as jest.Mock
      ).mockResolvedValue(true);

      const result = await service.getFolderContents(mockProfessor, 'folder-1');

      expect(result).toBeDefined();
      expect(materialRepo.findByFolderId).toHaveBeenCalledWith('folder-1', '1');
    });

    it('should return subfolder material count with explicit zeros', async () => {
      folderRepo.findById.mockResolvedValue(mockFolder('folder-1', '100'));
      catalogRepo.findFolderStatusByCode.mockResolvedValue({
        id: '1',
      } as FolderStatus);
      catalogRepo.findMaterialStatusByCode.mockResolvedValue({
        id: '1',
      } as MaterialStatus);
      folderRepo.findSubFolders.mockResolvedValue([
        mockFolder('child-a', '100', 'folder-1'),
        mockFolder('child-b', '100', 'folder-1'),
      ]);
      materialRepo.findByFolderId.mockResolvedValue([]);
      (materialRepo.countByFolderIds as jest.Mock).mockResolvedValue({
        'child-a': 2,
      });
      (
        courseCycleProfessorRepo.isProfessorAssignedToEvaluation as jest.Mock
      ).mockResolvedValue(true);

      const result = await service.getFolderContents(mockProfessor, 'folder-1');

      expect(result.subfolderMaterialCount).toEqual({
        'child-a': 2,
        'child-b': 0,
      });
    });
  });

  describe('requestDeletion', () => {
    it('should create deletion request for material', async () => {
      catalogRepo.findDeletionRequestStatusByCode.mockResolvedValue({
        id: '1',
      } as DeletionRequestStatus);
      materialRepo.findById.mockResolvedValue({
        id: 'mat1',
        materialFolderId: 'folder-1',
      } as Material);
      folderRepo.findById.mockResolvedValue(mockFolder('folder-1', '100'));

      await service.requestDeletion(mockProfessor, {
        entityType: AUDIT_ENTITY_TYPES.MATERIAL,
        entityId: 'mat1',
        reason: 'bad',
      });

      expect(deletionRepo.create).toHaveBeenCalled();
      expect(auditService.logAction).toHaveBeenCalled();
    });

    it('should reject non-material deletion requests', async () => {
      catalogRepo.findDeletionRequestStatusByCode.mockResolvedValue({
        id: '1',
      } as DeletionRequestStatus);

      await expect(
        service.requestDeletion(mockProfessor, {
          entityType: 'material_folder' as any,
          entityId: 'folder-1',
          reason: 'cleanup',
        }),
      ).rejects.toThrow(/Solo se admiten solicitudes de eliminacion/);
    });

    it('should reject when material already has a pending deletion request', async () => {
      catalogRepo.findDeletionRequestStatusByCode.mockResolvedValue({
        id: 'status-pending',
      } as DeletionRequestStatus);
      materialRepo.findById.mockResolvedValue({
        id: 'mat1',
        materialFolderId: 'folder-1',
      } as Material);
      folderRepo.findById.mockResolvedValue(mockFolder('folder-1', '100'));
      deletionRepo.findPendingByMaterialId.mockResolvedValue({
        id: 'req-pending',
      } as any);

      await expect(
        service.requestDeletion(mockProfessor, {
          entityType: AUDIT_ENTITY_TYPES.MATERIAL,
          entityId: 'mat1',
          reason: 'duplicated',
        }),
      ).rejects.toThrow(
        /Ya existe una solicitud de eliminacion pendiente para este material/,
      );

      expect(deletionRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('getClassEventMaterials', () => {
    it('should return class event materials with access control', async () => {
      classEventRepo.findByIdSimple.mockResolvedValue({
        id: '55',
        evaluationId: '100',
      } as ClassEvent);
      catalogRepo.findMaterialStatusByCode.mockResolvedValue({
        id: '1',
      } as MaterialStatus);
      accessEngine.hasAccess.mockResolvedValue(true);
      materialRepo.findByClassEventId.mockResolvedValue([
        { id: 'mat-1', displayName: 'Sesion 1' } as Material,
      ]);

      const result = await service.getClassEventMaterials(mockStudent, '55');

      expect(result).toHaveLength(1);
      expect(materialRepo.findByClassEventId).toHaveBeenCalledWith('55', '1');
    });

    it('should throw NotFound when class event does not exist', async () => {
      classEventRepo.findByIdSimple.mockResolvedValue(null);

      await expect(
        service.getClassEventMaterials(mockStudent, '999'),
      ).rejects.toThrow('Sesión de clase no encontrada');
    });
  });

  describe('download', () => {
    it('should stream resource using storage provider metadata', async () => {
      const mockStream = { on: jest.fn() } as any;
      materialRepo.findById.mockResolvedValue({
        id: 'mat-1',
        materialFolderId: 'folder-1',
        displayName: 'Documento',
        fileResource: {
          originalName: 'original.pdf',
          mimeType: 'application/pdf',
          storageProvider: 'GDRIVE',
          storageKey: 'drive-123',
          storageUrl: null,
        },
      } as unknown as Material);
      folderRepo.findById.mockResolvedValue(mockFolder('folder-1', '100'));
      accessEngine.hasAccess.mockResolvedValue(true);
      storageService.getFileStream.mockResolvedValue(mockStream);

      const result = await service.download(mockStudent, 'mat-1');

      expect(storageService.getFileStream).toHaveBeenCalledWith(
        'drive-123',
        'GDRIVE',
        null,
      );
      expect(result.stream).toBe(mockStream);
      expect(result.fileName).toBe('Documento');
      expect(result.mimeType).toBe('application/pdf');
    });

    it('should throw when material has no physical resource relation', async () => {
      materialRepo.findById.mockResolvedValue({
        id: 'mat-1',
        materialFolderId: 'folder-1',
        fileResource: null,
      } as unknown as Material);
      folderRepo.findById.mockResolvedValue(mockFolder('folder-1', '100'));
      accessEngine.hasAccess.mockResolvedValue(true);

      await expect(service.download(mockStudent, 'mat-1')).rejects.toThrow(
        'Integridad de datos corrupta: Material sin recurso',
      );
    });
  });

  describe('getMaterialLastModified', () => {
    it('should return updatedAt when present', async () => {
      const updatedAt = new Date('2026-03-02T12:00:00.000Z');
      const createdAt = new Date('2026-03-01T12:00:00.000Z');
      materialRepo.findById.mockResolvedValue({
        id: 'mat-1',
        materialFolderId: 'folder-1',
        createdAt,
        updatedAt,
      } as Material);
      folderRepo.findById.mockResolvedValue(mockFolder('folder-1', '100'));
      accessEngine.hasAccess.mockResolvedValue(true);

      const result = await service.getMaterialLastModified(
        mockProfessor,
        'mat-1',
      );

      expect(result.materialId).toBe('mat-1');
      expect(result.lastModifiedAt).toEqual(updatedAt);
    });

    it('should fallback to createdAt when updatedAt is null', async () => {
      const createdAt = new Date('2026-03-01T12:00:00.000Z');
      materialRepo.findById.mockResolvedValue({
        id: 'mat-1',
        materialFolderId: 'folder-1',
        createdAt,
        updatedAt: null,
      } as Material);
      folderRepo.findById.mockResolvedValue(mockFolder('folder-1', '100'));
      accessEngine.hasAccess.mockResolvedValue(true);

      const result = await service.getMaterialLastModified(
        mockProfessor,
        'mat-1',
      );

      expect(result.materialId).toBe('mat-1');
      expect(result.lastModifiedAt).toEqual(createdAt);
    });
  });

  describe('getAuthorizedDocumentLink', () => {
    it('should return a direct Drive preview URL when resource provider is GDRIVE', async () => {
      materialRepo.findById.mockResolvedValue({
        id: 'mat-1',
        materialFolderId: 'folder-1',
        displayName: 'Guia 1',
        fileResource: {
          originalName: 'guia-1.pdf',
          mimeType: 'application/pdf',
          storageProvider: 'GDRIVE',
          storageKey: 'drive-file-1',
          storageUrl: null,
        },
      } as unknown as Material);
      folderRepo.findById.mockResolvedValue(mockFolder('folder-1', '100'));
      accessEngine.hasAccess.mockResolvedValue(true);

      const result = await service.getAuthorizedDocumentLink(
        mockStudent,
        'mat-1',
        MEDIA_DOCUMENT_LINK_MODES.VIEW,
      );

      expect(result.accessMode).toBe(MEDIA_ACCESS_MODES.DIRECT_URL);
      expect(result.driveFileId).toBe('drive-file-1');
      expect(result.url).toContain('/preview');
      expect(result.requestedMode).toBe(MEDIA_DOCUMENT_LINK_MODES.VIEW);
      expect(auditService.logAction).not.toHaveBeenCalled();
    });

    it('should return backend proxy URL when resource provider is LOCAL', async () => {
      materialRepo.findById.mockResolvedValue({
        id: 'mat-7',
        materialFolderId: 'folder-1',
        displayName: 'Guia local',
        fileResource: {
          originalName: 'guia-local.pdf',
          mimeType: 'application/pdf',
          storageProvider: 'LOCAL',
          storageKey: 'local-key',
          storageUrl: '/tmp/local-key',
        },
      } as unknown as Material);
      folderRepo.findById.mockResolvedValue(mockFolder('folder-1', '100'));
      accessEngine.hasAccess.mockResolvedValue(true);

      const result = await service.getAuthorizedDocumentLink(
        mockStudent,
        'mat-7',
        MEDIA_DOCUMENT_LINK_MODES.DOWNLOAD,
      );

      expect(result.accessMode).toBe(MEDIA_ACCESS_MODES.BACKEND_PROXY);
      expect(result.driveFileId).toBeNull();
      expect(result.url).toBe('/materials/mat-7/download');
      expect(result.requestedMode).toBe(MEDIA_DOCUMENT_LINK_MODES.DOWNLOAD);
    });

    it('should deny when student no longer has enrollment access', async () => {
      materialRepo.findById.mockResolvedValue({
        id: 'mat-1',
        materialFolderId: 'folder-1',
        fileResource: {
          originalName: 'guia-1.pdf',
          mimeType: 'application/pdf',
          storageProvider: 'GDRIVE',
          storageKey: 'drive-file-1',
          storageUrl: null,
        },
      } as unknown as Material);
      folderRepo.findById.mockResolvedValue(mockFolder('folder-1', '100'));
      accessEngine.hasAccess.mockResolvedValue(false);

      await expect(
        service.getAuthorizedDocumentLink(mockStudent, 'mat-1'),
      ).rejects.toThrow('No tienes acceso a este contenido educativo');
    });

    it('should reject drive document when evaluation scope has no documents folder provisioned', async () => {
      materialRepo.findById.mockResolvedValue({
        id: 'mat-1',
        materialFolderId: 'folder-1',
        displayName: 'Guia 1',
        fileResource: {
          originalName: 'guia-1.pdf',
          mimeType: 'application/pdf',
          storageProvider: 'GDRIVE',
          storageKey: 'drive-file-1',
          storageUrl: null,
        },
      } as unknown as Material);
      folderRepo.findById.mockResolvedValue(mockFolder('folder-1', '100'));
      accessEngine.hasAccess.mockResolvedValue(true);
      driveAccessScopeService.resolveForEvaluation.mockResolvedValueOnce({
        persisted: {
          driveDocumentsFolderId: null,
        },
      } as any);

      await expect(
        service.getAuthorizedDocumentLink(mockStudent, 'mat-1'),
      ).rejects.toThrow(
        'El scope Drive de la evaluacion no esta provisionado para documentos',
      );
    });

    it('should reject drive document when file parent folder does not match evaluation documents folder', async () => {
      materialRepo.findById.mockResolvedValue({
        id: 'mat-1',
        materialFolderId: 'folder-1',
        displayName: 'Guia 1',
        fileResource: {
          originalName: 'guia-1.pdf',
          mimeType: 'application/pdf',
          storageProvider: 'GDRIVE',
          storageKey: 'drive-file-1',
          storageUrl: null,
        },
      } as unknown as Material);
      folderRepo.findById.mockResolvedValue(mockFolder('folder-1', '100'));
      accessEngine.hasAccess.mockResolvedValue(true);
      storageService.isDriveFileDirectlyInFolder.mockResolvedValueOnce(false);

      await expect(
        service.getAuthorizedDocumentLink(mockStudent, 'mat-1'),
      ).rejects.toThrow(
        'El documento no pertenece al scope Drive autorizado para esta evaluacion',
      );
    });
  });

  describe('Concurrencia en addVersion', () => {
    it('debe manejar múltiples subidas concurrentes manteniendo la integridad del bloqueo pesimista', async () => {
      const file = mockFile();
      const persistedMaterial = {
        id: 'mat-concurrent',
        materialFolderId: 'folder-1',
        fileVersionId: 'ver-1',
        materialFolder: { evaluationId: '100' },
      } as Material;

      dataSource.transaction.mockImplementation(
        async (arg1: unknown, arg2?: unknown) => {
          const runInTransaction = (
            typeof arg1 === 'function' ? arg1 : arg2
          ) as (manager: EntityManager) => Promise<unknown>;
          const mockManager = {
            findOne: jest.fn().mockResolvedValue(persistedMaterial),
            create: jest.fn((_: unknown, data: object) => data),
            save: jest
              .fn()
              .mockImplementation((entity: object) =>
                Promise.resolve({ ...entity, id: 'new-ver' }),
              ),
          } as unknown as EntityManager;
          return await runInTransaction(mockManager);
        },
      );

      storageService.calculateHash.mockResolvedValue('hash-concurrent');
      resourceRepo.findByHashAndSizeWithinEvaluation.mockResolvedValue(null);
      storageService.saveFile.mockResolvedValue({
        storageProvider: 'LOCAL',
        storageKey: 'concurrent.pdf',
        storageUrl: '/path/concurrent.pdf',
      });

      const promise1 = service.addVersion(
        mockProfessor,
        'mat-concurrent',
        file,
      );
      const promise2 = service.addVersion(
        mockProfessor,
        'mat-concurrent',
        file,
      );

      const [res1, res2] = await Promise.all([promise1, promise2]);

      expect(res1).toBeDefined();
      expect(res2).toBeDefined();
      expect(dataSource.transaction).toHaveBeenCalledTimes(2);
    });
  });
});
