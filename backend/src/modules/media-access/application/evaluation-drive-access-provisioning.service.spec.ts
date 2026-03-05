import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Evaluation } from '@modules/evaluations/domain/evaluation.entity';
import { DriveScopeNamingService } from '@modules/media-access/application/drive-scope-naming.service';
import { WorkspaceGroupsService } from '@modules/media-access/application/workspace-groups.service';
import { DriveScopeProvisioningService } from '@modules/media-access/application/drive-scope-provisioning.service';
import { EvaluationDriveAccessRepository } from '@modules/media-access/infrastructure/evaluation-drive-access.repository';
import { EvaluationDriveAccessProvisioningService } from '@modules/media-access/application/evaluation-drive-access-provisioning.service';
import { EvaluationDriveAccess } from '@modules/media-access/domain/evaluation-drive-access.entity';

describe('EvaluationDriveAccessProvisioningService', () => {
  let service: EvaluationDriveAccessProvisioningService;
  let evaluationRepo: jest.Mocked<Repository<Evaluation>>;
  let namingService: jest.Mocked<DriveScopeNamingService>;
  let workspaceGroupsService: jest.Mocked<WorkspaceGroupsService>;
  let driveScopeProvisioningService: jest.Mocked<DriveScopeProvisioningService>;
  let driveAccessRepo: jest.Mocked<EvaluationDriveAccessRepository>;

  beforeEach(() => {
    evaluationRepo = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<Evaluation>>;

    namingService = {
      buildForEvaluation: jest.fn(),
    } as unknown as jest.Mocked<DriveScopeNamingService>;

    workspaceGroupsService = {
      findOrCreateGroup: jest.fn(),
    } as unknown as jest.Mocked<WorkspaceGroupsService>;

    driveScopeProvisioningService = {
      provisionFolders: jest.fn(),
      ensureGroupReaderPermission: jest.fn(),
    } as unknown as jest.Mocked<DriveScopeProvisioningService>;

    driveAccessRepo = {
      findByEvaluationId: jest.fn(),
      upsertByEvaluationId: jest.fn(),
    } as unknown as jest.Mocked<EvaluationDriveAccessRepository>;

    service = new EvaluationDriveAccessProvisioningService(
      evaluationRepo,
      namingService,
      workspaceGroupsService,
      driveScopeProvisioningService,
      driveAccessRepo,
    );
  });

  it('should throw when evaluation does not exist', async () => {
    evaluationRepo.findOne.mockResolvedValue(null);

    await expect(service.provisionByEvaluationId('552')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('should provision group, folders and persist mapping', async () => {
    evaluationRepo.findOne.mockResolvedValue({ id: '552' } as Evaluation);
    namingService.buildForEvaluation.mockReturnValue({
      evaluationId: '552',
      scopeKey: 'ev_552',
      baseFolderName: 'ev_552',
      videosFolderName: 'videos',
      documentsFolderName: 'documentos',
      archivedFolderName: 'archivado',
      viewerGroupEmail: 'ev-552-viewers@academiapasalo.com',
    });
    workspaceGroupsService.findOrCreateGroup.mockResolvedValue({
      id: 'group-id-1',
      email: 'ev-552-viewers@academiapasalo.com',
    });
    driveScopeProvisioningService.provisionFolders.mockResolvedValue({
      scopeFolderId: 'scope-folder-id',
      videosFolderId: 'videos-folder-id',
      documentsFolderId: 'docs-folder-id',
      archivedFolderId: 'archived-folder-id',
    });
    driveAccessRepo.upsertByEvaluationId
      .mockResolvedValueOnce({
        id: '150',
        evaluationId: '552',
      } as unknown as EvaluationDriveAccess)
      .mockResolvedValueOnce({
        id: '200',
        evaluationId: '552',
      } as unknown as EvaluationDriveAccess);

    const result = await service.provisionByEvaluationId('552');

    expect(workspaceGroupsService.findOrCreateGroup).toHaveBeenCalledWith({
      email: 'ev-552-viewers@academiapasalo.com',
      name: 'Evaluacion 552 viewers',
      description: 'Acceso viewer para contenido de evaluacion 552',
    });
    expect(driveScopeProvisioningService.ensureGroupReaderPermission).toHaveBeenCalledWith(
      'scope-folder-id',
      'ev-552-viewers@academiapasalo.com',
    );
    expect(driveAccessRepo.upsertByEvaluationId).toHaveBeenNthCalledWith(1, {
      evaluationId: '552',
      scopeKey: 'ev_552',
      viewerGroupEmail: 'ev-552-viewers@academiapasalo.com',
      driveScopeFolderId: null,
      driveVideosFolderId: null,
      driveDocumentsFolderId: null,
      driveArchivedFolderId: null,
      viewerGroupId: null,
      isActive: false,
    });
    expect(driveAccessRepo.upsertByEvaluationId).toHaveBeenNthCalledWith(2, {
      evaluationId: '552',
      scopeKey: 'ev_552',
      driveScopeFolderId: 'scope-folder-id',
      driveVideosFolderId: 'videos-folder-id',
      driveDocumentsFolderId: 'docs-folder-id',
      driveArchivedFolderId: 'archived-folder-id',
      viewerGroupEmail: 'ev-552-viewers@academiapasalo.com',
      viewerGroupId: 'group-id-1',
      isActive: true,
    });
    expect(result.id).toBe('200');
  });
});
