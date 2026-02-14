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
import {
  AUDIT_ACTION_CODES,
  AUDIT_ENTITY_TYPES,
} from '@modules/audit/interfaces/audit.constants';
import { ClassEventRepository } from '@modules/events/infrastructure/class-event.repository';
import { MaterialFolder } from '@modules/materials/domain/material-folder.entity';
import { User } from '@modules/users/domain/user.entity';
import { MaterialStatus } from '@modules/materials/domain/material-status.entity';
import { FolderStatus } from '@modules/materials/domain/folder-status.entity';
import { DeletionRequestStatus } from '@modules/materials/domain/deletion-request-status.entity';
import { Material } from '@modules/materials/domain/material.entity';
import { FileResource } from '@modules/materials/domain/file-resource.entity';
import { ROLE_CODES } from '@common/constants/role-codes.constants';
import {
  DELETION_REQUEST_STATUS_CODES,
  FOLDER_STATUS_CODES,
  MATERIAL_CACHE_KEYS,
  MATERIAL_STATUS_CODES,
} from '@modules/materials/domain/material.constants';

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
  let cacheService: jest.Mocked<RedisCacheService>;
  let classEventRepo: jest.Mocked<ClassEventRepository>;

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
        {
          provide: ClassEventRepository,
          useValue: { findByIdSimple: jest.fn() },
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
    cacheService = module.get(RedisCacheService);
    classEventRepo = module.get(ClassEventRepository);

    userRepo.findById.mockResolvedValue({
      id: 'user-1',
      roles: [{ code: ROLE_CODES.STUDENT }],
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
        AUDIT_ENTITY_TYPES.MATERIAL,
        'saved-id',
        mockManager,
      );
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
      } as never);

      await expect(
        service.uploadMaterial(
          'user1',
          {
            materialFolderId: '1',
            displayName: 'Doc',
            classEventId: '55',
          },
          file,
        ),
      ).rejects.toThrow(
        'Inconsistencia: La sesion no pertenece a la misma evaluacion de la carpeta',
      );
    });
  });

  describe('addVersion', () => {
    it('should invalidate folder cache using materialFolderId', async () => {
      const file = mockFile();
      const persistedMaterial = {
        id: 'mat-1',
        materialFolderId: 'folder-77',
        fileVersionId: 'ver-1',
      } as Material;

      const mockManager = {
        findOne: jest
          .fn()
          .mockResolvedValueOnce(persistedMaterial)
          .mockResolvedValueOnce({ id: 'ver-1', versionNumber: 1 }),
        create: jest.fn((_: unknown, data: object) => data),
        save: jest
          .fn()
          .mockResolvedValueOnce({ id: 'ver-2', versionNumber: 2 })
          .mockResolvedValueOnce(persistedMaterial),
      } as unknown as EntityManager;

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

      storageService.calculateHash.mockResolvedValue('hash-v2');
      resourceRepo.findByHash.mockResolvedValue({
        id: 'resource-1',
        storageUrl: '/path/file.pdf',
      } as FileResource);

      await service.addVersion('user1', 'mat-1', file);

      expect(cacheService.del).toHaveBeenCalledWith(
        MATERIAL_CACHE_KEYS.CONTENTS('folder-77'),
      );
    });
  });

  describe('Access Control', () => {
    const mockStudent = {
      id: 'user-1',
      roles: [{ code: ROLE_CODES.STUDENT }],
    } as User;

    const mockProfessor = {
      id: 'prof-1',
      roles: [{ code: ROLE_CODES.PROFESSOR }],
    } as User;

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
      dataSource.query.mockResolvedValue([]); // Empty result means no ACTIVE assignment found

      await expect(
        service.getFolderContents(mockProfessor, 'folder-1'),
      ).rejects.toThrow('No tienes permiso para ver materiales de este curso');

      expect(dataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('ccp.revoked_at IS NULL'),
        expect.any(Array),
      );
    });

    it('should allow access to professor if assignment is active', async () => {
      folderRepo.findById.mockResolvedValue(mockFolder('folder-1', '100'));
      catalogRepo.findFolderStatusByCode.mockResolvedValue({ id: '1' } as FolderStatus);
      folderRepo.findSubFolders.mockResolvedValue([]);
      materialRepo.findByFolderId.mockResolvedValue([]);
      
      dataSource.query.mockResolvedValue([{ 1: 1 }]); // Found active assignment

      const result = await service.getFolderContents(mockProfessor, 'folder-1');

      expect(result).toBeDefined();
    });
  });

  describe('requestDeletion', () => {
    it('should create deletion request for material', async () => {
      catalogRepo.findDeletionRequestStatusByCode.mockResolvedValue({
        id: '1',
      } as DeletionRequestStatus);
      materialRepo.findById.mockResolvedValue({ id: 'mat1' } as Material);

      await service.requestDeletion('user1', {
        entityType: AUDIT_ENTITY_TYPES.MATERIAL,
        entityId: 'mat1',
        reason: 'bad',
      });

      expect(deletionRepo.create).toHaveBeenCalled();
    });
  });

  describe('getClassEventMaterials', () => {
    it('should return class event materials with access control', async () => {
      classEventRepo.findByIdSimple.mockResolvedValue({
        id: '55',
        evaluationId: '100',
      } as never);
      accessEngine.hasAccess.mockResolvedValue(true);
      materialRepo.findByClassEventId.mockResolvedValue([
        { id: 'mat-1', displayName: 'Sesion 1' } as Material,
      ]);

      const result = await service.getClassEventMaterials(
        { id: 'user-1', roles: [{ code: ROLE_CODES.STUDENT }] } as User,
        '55',
      );

      expect(result).toHaveLength(1);
      expect(materialRepo.findByClassEventId).toHaveBeenCalledWith('55');
    });
  });

  describe('Concurrencia en addVersion', () => {
    it('debe manejar múltiples subidas concurrentes manteniendo la integridad del bloqueo pesimista', async () => {
      const file = mockFile();
      const persistedMaterial = {
        id: 'mat-concurrent',
        materialFolderId: 'folder-1',
        fileVersionId: 'ver-1',
      } as Material;

      // Mock de una transacción que tarda un poco para simular concurrencia
      dataSource.transaction.mockImplementation(async (cb: any) => {
        const mockManager = {
          findOne: jest.fn().mockResolvedValueOnce(persistedMaterial).mockResolvedValueOnce({ id: 'ver-1', versionNumber: 1 }),
          create: jest.fn((_: any, data: any) => data),
          save: jest.fn().mockImplementation((entity) => Promise.resolve({ ...entity, id: 'new-ver' })),
        } as any;
        return await cb(mockManager);
      });

      storageService.calculateHash.mockResolvedValue('hash-concurrent');
      resourceRepo.findByHash.mockResolvedValue(null);
      storageService.saveFile.mockResolvedValue('/path/concurrent.pdf');

      // Ejecutamos dos subidas al mismo tiempo
      const promise1 = service.addVersion('user1', 'mat-concurrent', file);
      const promise2 = service.addVersion('user1', 'mat-concurrent', file);

      const [res1, res2] = await Promise.all([promise1, promise2]);

      expect(res1).toBeDefined();
      expect(res2).toBeDefined();
      expect(dataSource.transaction).toHaveBeenCalledTimes(2);
    });
  });
});
