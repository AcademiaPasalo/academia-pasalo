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
import { UserRepository } from '@modules/users/infrastructure/user.repository';
import { AuditService } from '@modules/audit/application/audit.service';
import { MaterialFolder } from '@modules/materials/domain/material-folder.entity';
import { User } from '@modules/users/domain/user.entity';
import { MaterialStatus } from '@modules/materials/domain/material-status.entity';
import { FolderStatus } from '@modules/materials/domain/folder-status.entity';
import { DeletionRequestStatus } from '@modules/materials/domain/deletion-request-status.entity';
import { Material } from '@modules/materials/domain/material.entity';

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

describe('MaterialsService', () => {
  let service: MaterialsService;
  let dataSource: jest.Mocked<DataSource>;
  let storageService: jest.Mocked<StorageService>;
  let folderRepo: jest.Mocked<MaterialFolderRepository>;
  let materialRepo: jest.Mocked<MaterialRepository>;
  let resourceRepo: jest.Mocked<FileResourceRepository>;
  let catalogRepo: jest.Mocked<MaterialCatalogRepository>;
  let deletionRepo: jest.Mocked<DeletionRequestRepository>;
  let accessEngine: jest.Mocked<AccessEngineService>;
  let userRepo: jest.Mocked<UserRepository>;
  let auditService: jest.Mocked<AuditService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaterialsService,
        {
          provide: DataSource,
          useValue: { transaction: jest.fn() },
        },
        {
          provide: StorageService,
          useValue: {
            calculateHash: jest.fn(),
            saveFile: jest.fn(),
            deleteFile: jest.fn(),
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
          },
        },
        {
          provide: FileResourceRepository,
          useValue: { create: jest.fn(), findByHash: jest.fn() },
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
          useValue: { create: jest.fn() },
        },
        {
          provide: UserRepository,
          useValue: { findById: jest.fn() },
        },
        {
          provide: AuditService,
          useValue: { logAction: jest.fn() },
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
    accessEngine = module.get(AccessEngineService);
    userRepo = module.get(UserRepository);
    auditService = module.get(AuditService);

    userRepo.findById.mockResolvedValue({
      id: 'user-1',
      roles: [{ code: 'STUDENT' }],
    } as User);
  });

  describe('createFolder', () => {
    it('should create a root folder successfully', async () => {
      catalogRepo.findFolderStatusByCode.mockResolvedValue({
        id: '1',
      } as FolderStatus);
      folderRepo.create.mockResolvedValue(mockFolder('1'));

      const result = await service.createFolder('user1', {
        evaluationId: '100',
        name: 'Root Folder',
      });

      expect(result).toBeDefined();
      expect(folderRepo.create).toHaveBeenCalled();
    });
  });

  describe('uploadMaterial', () => {
    it('should upload a new file successfully', async () => {
      const file = mockFile();
      const mockManager = {
        save: jest.fn((entity: unknown) =>
          Promise.resolve({ ...(entity as object), id: 'saved-id' }),
        ),
        create: jest.fn((entity: unknown, data: object) => ({
          ...data,
          id: 'created-id',
        })),
        findOne: jest.fn(),
        getRepository: jest.fn(),
      } as unknown as EntityManager;

      catalogRepo.findMaterialStatusByCode.mockResolvedValue({
        id: '1',
      } as MaterialStatus);
      folderRepo.findById.mockResolvedValue(mockFolder());

      dataSource.transaction.mockImplementation(
        (
          cbOrIsolation:
            | string
            | ((manager: EntityManager) => Promise<unknown>),
          cb?: (manager: EntityManager) => Promise<unknown>,
        ) => {
          if (typeof cbOrIsolation === 'function') {
            return cbOrIsolation(mockManager);
          }
          if (cb) {
            return cb(mockManager);
          }
          return Promise.resolve();
        },
      );

      storageService.calculateHash.mockResolvedValue('hash123');
      resourceRepo.findByHash.mockResolvedValue(null);
      storageService.saveFile.mockResolvedValue('/path/to/file');

      const result = await service.uploadMaterial(
        'user1',
        { materialFolderId: '1', displayName: 'Doc' },
        file,
      );

      expect(storageService.saveFile).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(auditService.logAction).toHaveBeenCalledWith(
        'user1',
        'FILE_UPLOAD',
        'material',
        'saved-id',
        mockManager,
      );
    });
  });

  describe('Access Control', () => {
    it('getRootFolders should check access and return folders', async () => {
      accessEngine.hasAccess.mockResolvedValue(true);
      catalogRepo.findFolderStatusByCode.mockResolvedValue({
        id: '1',
      } as FolderStatus);
      folderRepo.findRootsByEvaluation.mockResolvedValue([mockFolder()]);

      const result = await service.getRootFolders('user1', '100');

      expect(result).toHaveLength(1);
    });
  });

  describe('requestDeletion', () => {
    it('should create deletion request for material', async () => {
      catalogRepo.findDeletionRequestStatusByCode.mockResolvedValue({
        id: '1',
      } as DeletionRequestStatus);
      materialRepo.findById.mockResolvedValue({ id: 'mat1' } as Material);

      await service.requestDeletion('user1', {
        entityType: 'material',
        entityId: 'mat1',
        reason: 'bad',
      });

      expect(deletionRepo.create).toHaveBeenCalled();
    });
  });
});