import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, QueryRunner } from 'typeorm';
import { BadRequestException, ForbiddenException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { StorageService } from '@infrastructure/storage/storage.service';
import { AccessEngineService } from '@modules/enrollments/application/access-engine.service';
import { MaterialFolderRepository } from '../infrastructure/material-folder.repository';
import { MaterialRepository } from '../infrastructure/material.repository';
import { FileResourceRepository } from '../infrastructure/file-resource.repository';
import { FileVersionRepository } from '../infrastructure/file-version.repository';
import { MaterialCatalogRepository } from '../infrastructure/material-catalog.repository';
import { DeletionRequestRepository } from '../infrastructure/deletion-request.repository';

// Mock Data Factories
const mockFolder = (id = '1', evaluationId = '100', parentId = null) => ({
  id,
  evaluationId,
  parentFolderId: parentId,
  name: 'Test Folder',
} as any);

const mockFile = () => ({
  originalname: 'test.pdf',
  mimetype: 'application/pdf',
  size: 1024,
  buffer: Buffer.from('test'),
} as Express.Multer.File);

describe('MaterialsService', () => {
  let service: MaterialsService;
  let dataSource: DataSource;
  let storageService: StorageService;
  let folderRepo: MaterialFolderRepository;
  let materialRepo: MaterialRepository;
  let resourceRepo: FileResourceRepository;
  let versionRepo: FileVersionRepository;
  let catalogRepo: MaterialCatalogRepository;
  let deletionRepo: DeletionRequestRepository;
  let accessEngine: AccessEngineService;

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
    versionRepo = module.get<FileVersionRepository>(FileVersionRepository);
    catalogRepo = module.get<MaterialCatalogRepository>(MaterialCatalogRepository);
    deletionRepo = module.get<DeletionRequestRepository>(DeletionRequestRepository);
    accessEngine = module.get<AccessEngineService>(AccessEngineService);
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
      expect(folderRepo.create).toHaveBeenCalledWith(expect.objectContaining({ parentFolderId: null }));
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
    });

    it('should fail if parent folder does not exist', async () => {
      jest.spyOn(catalogRepo, 'findFolderStatusByCode').mockResolvedValue({ id: '1' } as any);
      jest.spyOn(folderRepo, 'findById').mockResolvedValue(null);

      await expect(
        service.createFolder('user1', { evaluationId: '100', parentFolderId: '999', name: 'Fail' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should fail if parent folder belongs to different evaluation', async () => {
      jest.spyOn(catalogRepo, 'findFolderStatusByCode').mockResolvedValue({ id: '1' } as any);
      jest.spyOn(folderRepo, 'findById').mockResolvedValue(mockFolder('1', '200')); // Parent eval 200

      await expect(
        service.createFolder('user1', { evaluationId: '100', parentFolderId: '1', name: 'Fail' }), // Target eval 100
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('uploadMaterial', () => {
    it('should upload a new file successfully', async () => {
      // Setup
      const file = mockFile();
      const mockManager = { save: jest.fn((entity) => Promise.resolve({ ...entity, id: 'saved-id' })) };
      
      jest.spyOn(catalogRepo, 'findMaterialStatusByCode').mockResolvedValue({ id: '1' } as any);
      jest.spyOn(folderRepo, 'findById').mockResolvedValue(mockFolder());
      jest.spyOn(dataSource, 'transaction').mockImplementation(async (cb) => await cb(mockManager as any));
      jest.spyOn(storageService, 'calculateHash').mockResolvedValue('hash123');
      jest.spyOn(resourceRepo, 'findByHash').mockResolvedValue(null); // New file
      jest.spyOn(storageService, 'saveFile').mockResolvedValue('/path/to/file');

      const result = await service.uploadMaterial('user1', { materialFolderId: '1', displayName: 'Doc' }, file);

      expect(storageService.saveFile).toHaveBeenCalled();
      expect(mockManager.save).toHaveBeenCalledTimes(3); // Resource, Version, Material
      expect(result).toBeDefined();
    });

    it('should deduplicate existing file', async () => {
      const file = mockFile();
      const mockManager = { save: jest.fn((entity) => Promise.resolve({ ...entity, id: 'saved-id' })) };
      const existingResource = { id: 'res1', storageUrl: '/existing/path' } as any;

      jest.spyOn(catalogRepo, 'findMaterialStatusByCode').mockResolvedValue({ id: '1' } as any);
      jest.spyOn(folderRepo, 'findById').mockResolvedValue(mockFolder());
      jest.spyOn(dataSource, 'transaction').mockImplementation(async (cb) => await cb(mockManager as any));
      jest.spyOn(storageService, 'calculateHash').mockResolvedValue('hash123');
      jest.spyOn(resourceRepo, 'findByHash').mockResolvedValue(existingResource); // Exists

      await service.uploadMaterial('user1', { materialFolderId: '1', displayName: 'Doc' }, file);

      expect(storageService.saveFile).not.toHaveBeenCalled(); // Should NOT save physical file
      expect(mockManager.save).toHaveBeenCalledTimes(2); // Only Version and Material
    });

    it('should rollback physical file if DB transaction fails', async () => {
      const file = mockFile();
      const mockManager = { 
        save: jest.fn().mockImplementationOnce(() => Promise.resolve({ id: 'res1' })) // Resource ok
                       .mockImplementationOnce(() => Promise.reject(new Error('DB Error'))) // Version fails
      };

      jest.spyOn(catalogRepo, 'findMaterialStatusByCode').mockResolvedValue({ id: '1' } as any);
      jest.spyOn(folderRepo, 'findById').mockResolvedValue(mockFolder());
      jest.spyOn(dataSource, 'transaction').mockImplementation(async (cb) => await cb(mockManager as any));
      jest.spyOn(resourceRepo, 'findByHash').mockResolvedValue(null);
      jest.spyOn(storageService, 'saveFile').mockResolvedValue('/temp/path');

      await expect(
        service.uploadMaterial('user1', { materialFolderId: '1', displayName: 'Doc' }, file)
      ).rejects.toThrow('DB Error');

      expect(storageService.deleteFile).toHaveBeenCalledWith('path'); // Expect rollback
    });
  });

  describe('Access Control (Roots & Contents)', () => {
    it('getRootFolders should check access and return folders', async () => {
      jest.spyOn(accessEngine, 'hasAccess').mockResolvedValue(true);
      jest.spyOn(catalogRepo, 'findFolderStatusByCode').mockResolvedValue({ id: '1' } as any);
      jest.spyOn(folderRepo, 'findRootsByEvaluation').mockResolvedValue([mockFolder()]);

      const result = await service.getRootFolders('user1', '100');

      expect(accessEngine.hasAccess).toHaveBeenCalledWith('user1', '100');
      expect(result).toHaveLength(1);
    });

    it('getRootFolders should throw Forbidden if no access', async () => {
      jest.spyOn(accessEngine, 'hasAccess').mockResolvedValue(false);

      await expect(service.getRootFolders('user1', '100')).rejects.toThrow(ForbiddenException);
    });

    it('getFolderContents should throw Forbidden if no access', async () => {
      jest.spyOn(folderRepo, 'findById').mockResolvedValue(mockFolder('1', '100'));
      jest.spyOn(accessEngine, 'hasAccess').mockResolvedValue(false); // No access

      await expect(service.getFolderContents('user1', '1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('requestDeletion', () => {
    it('should create deletion request for material', async () => {
      jest.spyOn(catalogRepo, 'findDeletionRequestStatusByCode').mockResolvedValue({ id: '1' } as any);
      jest.spyOn(materialRepo, 'findById').mockResolvedValue({ id: 'mat1' } as any);

      await service.requestDeletion('user1', { entityType: 'material', entityId: 'mat1', reason: 'bad' });

      expect(deletionRepo.create).toHaveBeenCalled();
    });

    it('should throw NotFound if material does not exist', async () => {
      jest.spyOn(catalogRepo, 'findDeletionRequestStatusByCode').mockResolvedValue({ id: '1' } as any);
      jest.spyOn(materialRepo, 'findById').mockResolvedValue(null);

      await expect(
        service.requestDeletion('user1', { entityType: 'material', entityId: '999', reason: 'bad' })
      ).rejects.toThrow(NotFoundException);
    });
  });
});
