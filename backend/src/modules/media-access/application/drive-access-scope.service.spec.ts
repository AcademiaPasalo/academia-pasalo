import { DriveAccessScopeService } from '@modules/media-access/application/drive-access-scope.service';
import { DriveScopeNamingService } from '@modules/media-access/application/drive-scope-naming.service';
import { EvaluationDriveAccessRepository } from '@modules/media-access/infrastructure/evaluation-drive-access.repository';
import { EvaluationDriveAccess } from '@modules/media-access/domain/evaluation-drive-access.entity';

describe('DriveAccessScopeService', () => {
  let service: DriveAccessScopeService;
  let namingService: jest.Mocked<DriveScopeNamingService>;
  let repository: jest.Mocked<EvaluationDriveAccessRepository>;

  beforeEach(() => {
    namingService = {
      buildForEvaluation: jest.fn(),
    } as unknown as jest.Mocked<DriveScopeNamingService>;

    repository = {
      findByEvaluationId: jest.fn(),
      upsertByEvaluationId: jest.fn(),
    } as unknown as jest.Mocked<EvaluationDriveAccessRepository>;

    service = new DriveAccessScopeService(namingService, repository);
  });

  it('should return naming data and persisted mapping when it exists', async () => {
    namingService.buildForEvaluation.mockReturnValue({
      evaluationId: '552',
      scopeKey: 'ev_552',
      parentFolderNames: ['evaluations'],
      baseFolderName: 'ev_552',
      videosFolderName: 'videos',
      documentsFolderName: 'documentos',
      archivedFolderName: 'archivado',
      viewerGroupEmail: 'ev-552-viewers@academiapasalo.com',
    });
    const persisted = {
      id: '10',
      evaluationId: '552',
      scopeKey: 'ev_552',
      driveScopeFolderId: 'scope-folder-id',
      driveVideosFolderId: 'videos-folder-id',
      driveDocumentsFolderId: 'docs-folder-id',
      driveArchivedFolderId: 'archived-folder-id',
      viewerGroupEmail: 'ev-552-viewers@academiapasalo.com',
      viewerGroupId: 'group-id',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as EvaluationDriveAccess;
    repository.findByEvaluationId.mockResolvedValue(persisted);

    const result = await service.resolveForEvaluation('552');

    expect(namingService.buildForEvaluation).toHaveBeenCalledWith('552');
    expect(repository.findByEvaluationId).toHaveBeenCalledWith('552');
    expect(result.names.scopeKey).toBe('ev_552');
    expect(result.persisted?.id).toBe('10');
  });

  it('should return naming data and null persisted mapping when not provisioned yet', async () => {
    namingService.buildForEvaluation.mockReturnValue({
      evaluationId: '81',
      scopeKey: 'ev_81',
      parentFolderNames: ['evaluations'],
      baseFolderName: 'ev_81',
      videosFolderName: 'videos',
      documentsFolderName: 'documentos',
      archivedFolderName: 'archivado',
      viewerGroupEmail: 'ev-81-viewers@academiapasalo.com',
    });
    repository.findByEvaluationId.mockResolvedValue(null);

    const result = await service.resolveForEvaluation('81');

    expect(result.names.viewerGroupEmail).toBe(
      'ev-81-viewers@academiapasalo.com',
    );
    expect(result.persisted).toBeNull();
  });
});
