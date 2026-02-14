import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, EntityManager } from 'typeorm';
import { MaterialsAdminService } from './materials-admin.service';
import { DeletionRequestRepository } from '../infrastructure/deletion-request.repository';
import { MaterialRepository } from '../infrastructure/material.repository';
import { MaterialCatalogRepository } from '../infrastructure/material-catalog.repository';
import { StorageService } from '@infrastructure/storage/storage.service';
import { AuditService } from '@modules/audit/application/audit.service';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import { Material } from '../domain/material.entity';
import { DeletionReviewAction } from '../dto/review-deletion-request.dto';
import { DeletionRequest } from '../domain/deletion-request.entity';
import {
  DELETION_REQUEST_STATUS_CODES,
  MATERIAL_STATUS_CODES,
} from '../domain/material.constants';

describe('MaterialsAdminService', () => {
  let service: MaterialsAdminService;
  let dataSource: jest.Mocked<DataSource>;
  let materialRepo: jest.Mocked<MaterialRepository>;
  let requestRepo: jest.Mocked<DeletionRequestRepository>;
  let catalogRepo: jest.Mocked<MaterialCatalogRepository>;
  let cacheService: jest.Mocked<RedisCacheService>;

  const mockMaterial = {
    id: 'mat-1',
    materialFolderId: 'folder-1',
    classEventId: 'event-1',
    materialStatusId: 'status-active',
  } as Material;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaterialsAdminService,
        {
          provide: DataSource,
          useValue: { transaction: jest.fn() },
        },
        {
          provide: DeletionRequestRepository,
          useValue: { findById: jest.fn() },
        },
        {
          provide: MaterialRepository,
          useValue: { findById: jest.fn() },
        },
        {
          provide: MaterialCatalogRepository,
          useValue: {
            findDeletionRequestStatusByCode: jest.fn(),
            findMaterialStatusByCode: jest.fn(),
          },
        },
        {
          provide: StorageService,
          useValue: { deleteFile: jest.fn() },
        },
        {
          provide: AuditService,
          useValue: { logAction: jest.fn() },
        },
        {
          provide: RedisCacheService,
          useValue: { del: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<MaterialsAdminService>(MaterialsAdminService);
    dataSource = module.get(DataSource);
    materialRepo = module.get(MaterialRepository);
    requestRepo = module.get(DeletionRequestRepository);
    catalogRepo = module.get(MaterialCatalogRepository);
    cacheService = module.get(RedisCacheService);
  });

  describe('reviewRequest - Approval', () => {
    it('should invalidate cache when approving a deletion request (archiving)', async () => {
      const mockRequest = {
        id: 'req-1',
        entityId: 'mat-1',
        deletionRequestStatusId: 'status-pending',
      } as DeletionRequest;

      requestRepo.findById.mockResolvedValue(mockRequest);
      materialRepo.findById.mockResolvedValue(mockMaterial);
      catalogRepo.findDeletionRequestStatusByCode.mockImplementation(async (code) => {
        if (code === DELETION_REQUEST_STATUS_CODES.PENDING) return { id: 'status-pending' } as any;
        if (code === DELETION_REQUEST_STATUS_CODES.APPROVED) return { id: 'status-approved' } as any;
        return null;
      });
      catalogRepo.findMaterialStatusByCode.mockResolvedValue({ id: 'status-archived' } as any);

      dataSource.transaction.mockImplementation(async (cb: any) => {
        const manager = {
          update: jest.fn().mockResolvedValue({}),
        } as any;
        return cb(manager);
      });

      await service.reviewRequest('admin-1', 'req-1', {
        action: DeletionReviewAction.APPROVE,
        reason: 'ok',
      });

      expect(cacheService.del).toHaveBeenCalledWith('cache:materials:contents:folder:folder-1');
      expect(cacheService.del).toHaveBeenCalledWith('cache:materials:class-event:event-1');
    });
  });

  describe('hardDeleteMaterial', () => {
    it('should invalidate cache after physical deletion', async () => {
      materialRepo.findById.mockResolvedValue({ ...mockMaterial, materialStatusId: 'status-archived' } as Material);
      catalogRepo.findMaterialStatusByCode.mockResolvedValue({ id: 'status-archived' } as any);

      dataSource.transaction.mockImplementation(async (cb: any) => {
        const manager = {
          findOne: jest.fn().mockResolvedValue({
            ...mockMaterial,
            fileVersion: { fileResourceId: 'res-1' },
          }),
          delete: jest.fn().mockResolvedValue({}),
          count: jest.fn().mockResolvedValue(0),
        } as any;
        return cb(manager);
      });

      await service.hardDeleteMaterial('admin-1', 'mat-1');

      expect(cacheService.del).toHaveBeenCalledWith('cache:materials:contents:folder:folder-1');
      expect(cacheService.del).toHaveBeenCalledWith('cache:materials:class-event:event-1');
    });
  });
});
