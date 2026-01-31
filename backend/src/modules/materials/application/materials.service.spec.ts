import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
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

const mockFolder = (id = '1', evaluationId = '100', parentId: string | null = null) => ({
  id,
  evaluationId,
  parentFolderId: parentId,
  name: 'Test Folder',
} as any);

const mockFile = () => ({
  originalname: 'test.pdf',
  mimetype: 'application/pdf',
  size: 1024,
  buffer: Buffer.from('%PDF-1.4 content'),
} as Express.Multer.File);

describe('MaterialsService', () => {
  let service: MaterialsService;
  let dataSource: DataSource;
  let storageService: StorageService;
  let folderRepo: MaterialFolderRepository;
  let materialRepo: MaterialRepository;
  let resourceRepo: FileResourceRepository;
  let catalogRepo: MaterialCatalogRepository;
  let deletionRepo: DeletionRequestRepository;
  let accessEngine: AccessEngineService;
  let cacheService: RedisCacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaterialsService,
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn(),
          },
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
          useValue: {
            hasAccess: jest.fn(),
          },
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
          useValue: {
            create: jest.fn(),
            findByHash: jest.fn(),
          },
        },
        {
          provide: FileVersionRepository,
          useValue: {
            create: jest.fn(),
          },
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
          },
        },
      ],
    }).compile();

    service = module.get<MaterialsService>(MaterialsService);
    dataSource = module.get<DataSource>(DataSource);
    storageService = module.get<StorageService>(StorageService);
    folderRepo = module.get<MaterialFolderRepository>(MaterialFolderRepository);
    materialRepo = module.get<MaterialRepository>(MaterialRepository);
    resourceRepo = module.get<FileResourceRepository>(FileResourceRepository);
    catalogRepo = module.get<MaterialCatalogRepository>(MaterialCatalogRepository);
    deletionRepo = module.get<DeletionRequestRepository>(DeletionRequestRepository);
    accessEngine = module.get<AccessEngineService>(AccessEngineService);
    cacheService = module.get<RedisCacheService>(RedisCacheService);
  });

  describe('createFolder', () => {
    it('should create a root folder successfully', async () => {
      jest.spyOn(catalogRepo, 'findFolderStatusByCode').mockResolvedValue({ id: '1' } as any);
      jest.spyOn(folderRepo, 'create').mockResolvedValue(mockFolder('1'));

      const result = await service.createFolder('user1', {
        evaluationId: '100',
        name: 'Root Folder',
      });

      expect(result).toBeDefined();
      expect(folderRepo.create).toHaveBeenCalled();
      expect(cacheService.del).toHaveBeenCalled();
    });

    it('should create a subfolder successfully', async () => {
      jest.spyOn(catalogRepo, 'findFolderStatusByCode').mockResolvedValue({ id: '1' } as any);
      jest.spyOn(folderRepo, 'findById').mockResolvedValue(mockFolder('1', '100'));
      jest.spyOn(folderRepo, 'create').mockResolvedValue(mockFolder('2', '100', '1'));

      const result = await service.createFolder('user1', {
        evaluationId: '100',
        parentFolderId: '1',
        name: 'Sub Folder',
      });

      expect(result).toBeDefined();
      expect(cacheService.del).toHaveBeenCalled();
    });

    it('should fail if parent folder does not exist', async () => {
      jest.spyOn(catalogRepo, 'findFolderStatusByCode').mockResolvedValue({ id: '1' } as any);
      jest.spyOn(folderRepo, 'findById').mockResolvedValue(null);

      await expect(
        service.createFolder('user1', { evaluationId: '100', parentFolderId: '999', name: 'Fail' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('uploadMaterial', () => {
    it('should upload a new file successfully', async () => {
      const file = mockFile();
      const mockManager = { 
        save: jest.fn((entity) => Promise.resolve({ ...entity, id: 'saved-id' })),
        create: jest.fn((entity, data) => ({ ...data, id: 'created-id' })),
        findOne: jest.fn(),
        getRepository: jest.fn()
      };
      
      jest.spyOn(catalogRepo, 'findMaterialStatusByCode').mockResolvedValue({ id: '1' } as any);
      jest.spyOn(folderRepo, 'findById').mockResolvedValue(mockFolder());
      
      jest.spyOn(dataSource, 'transaction' as any).mockImplementation(async (cb: any) => {
        return await cb(mockManager);
      });

      jest.spyOn(storageService, 'calculateHash').mockResolvedValue('hash123');
      jest.spyOn(resourceRepo, 'findByHash').mockResolvedValue(null);
      jest.spyOn(storageService, 'saveFile').mockResolvedValue('/path/to/file');

      const result = await service.uploadMaterial('user1', { materialFolderId: '1', displayName: 'Doc' }, file);

      expect(storageService.saveFile).toHaveBeenCalled();
      expect(mockManager.save).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(cacheService.del).toHaveBeenCalled();
    });

    it('should rollback physical file if DB transaction fails', async () => {
      const file = mockFile();
      const mockManager = { 
        save: jest.fn().mockImplementationOnce(() => Promise.resolve({ id: 'res1' }))
                       .mockImplementationOnce(() => Promise.reject(new Error('DB Error'))),
        create: jest.fn((entity, data) => ({ ...data, id: 'created-id' })),
        findOne: jest.fn(),
        getRepository: jest.fn()
      };

      jest.spyOn(catalogRepo, 'findMaterialStatusByCode').mockResolvedValue({ id: '1' } as any);
      jest.spyOn(folderRepo, 'findById').mockResolvedValue(mockFolder());
      
      jest.spyOn(dataSource, 'transaction' as any).mockImplementation(async (cb: any) => {
        return await cb(mockManager);
      });

      jest.spyOn(resourceRepo, 'findByHash').mockResolvedValue(null); // Obligatorio para entrar al rollback
      jest.spyOn(storageService, 'saveFile').mockResolvedValue('/temp/path');

      await expect(
        service.uploadMaterial('user1', { materialFolderId: '1', displayName: 'Doc' }, file)
      ).rejects.toThrow('DB Error');

      expect(storageService.deleteFile).toHaveBeenCalled();
    });
  });

  describe('Access Control', () => {
    it('getRootFolders should check access and return folders', async () => {
      jest.spyOn(accessEngine, 'hasAccess').mockResolvedValue(true);
      jest.spyOn(catalogRepo, 'findFolderStatusByCode').mockResolvedValue({ id: '1' } as any);
      jest.spyOn(folderRepo, 'findRootsByEvaluation').mockResolvedValue([mockFolder()]);

      const result = await service.getRootFolders('user1', '100');

      expect(accessEngine.hasAccess).toHaveBeenCalledWith('user1', '100');
      expect(result).toHaveLength(1);
      expect(cacheService.get).toHaveBeenCalled();
    });
  });

  describe('requestDeletion', () => {
    it('should create deletion request for material', async () => {
      jest.spyOn(catalogRepo, 'findDeletionRequestStatusByCode').mockResolvedValue({ id: '1' } as any);
      jest.spyOn(materialRepo, 'findById').mockResolvedValue({ id: 'mat1' } as any);

      await service.requestDeletion('user1', { entityType: 'material', entityId: 'mat1', reason: 'bad' });

      expect(deletionRepo.create).toHaveBeenCalled();
    });
  });
});