import { Repository } from 'typeorm';
import { EvaluationDriveAccessRepository } from '@modules/media-access/infrastructure/evaluation-drive-access.repository';
import { EvaluationDriveAccess } from '@modules/media-access/domain/evaluation-drive-access.entity';

describe('EvaluationDriveAccessRepository', () => {
  let repository: EvaluationDriveAccessRepository;
  let ormRepository: jest.Mocked<Repository<EvaluationDriveAccess>>;

  beforeEach(() => {
    ormRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<Repository<EvaluationDriveAccess>>;

    repository = new EvaluationDriveAccessRepository(ormRepository);
  });

  it('should update existing mapping on upsert', async () => {
    const existing = {
      id: '10',
      evaluationId: '552',
      scopeKey: 'old',
      viewerGroupEmail: 'old@academiapasalo.com',
      driveScopeFolderId: null,
      driveVideosFolderId: null,
      driveDocumentsFolderId: null,
      driveArchivedFolderId: null,
      viewerGroupId: null,
      isActive: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: null,
    } as EvaluationDriveAccess;
    ormRepository.findOne.mockResolvedValue(existing);
    ormRepository.save.mockResolvedValue(existing);

    const result = await repository.upsertByEvaluationId({
      evaluationId: '552',
      scopeKey: 'ev_552',
      viewerGroupEmail: 'ev-552-viewers@academiapasalo.com',
      driveScopeFolderId: 'scope-id',
      driveVideosFolderId: 'videos-id',
      driveDocumentsFolderId: 'docs-id',
      driveArchivedFolderId: 'archived-id',
      viewerGroupId: 'group-id',
      isActive: true,
    });

    expect(ormRepository.findOne).toHaveBeenCalledWith({
      where: { evaluationId: '552' },
    });
    expect(result.scopeKey).toBe('ev_552');
    expect(result.driveArchivedFolderId).toBe('archived-id');
    expect(result.viewerGroupEmail).toBe('ev-552-viewers@academiapasalo.com');
    expect(ormRepository.save).toHaveBeenCalledTimes(1);
    expect(ormRepository.create).not.toHaveBeenCalled();
  });

  it('should create mapping when it does not exist', async () => {
    ormRepository.findOne.mockResolvedValue(null);
    ormRepository.create.mockImplementation(
      (entity) => entity as unknown as EvaluationDriveAccess,
    );
    ormRepository.save.mockImplementation(
      async (entity) => entity as unknown as EvaluationDriveAccess,
    );

    const result = await repository.upsertByEvaluationId({
      evaluationId: '90',
      scopeKey: 'ev_90',
      viewerGroupEmail: 'ev-90-viewers@academiapasalo.com',
    });

    expect(ormRepository.create).toHaveBeenCalledTimes(1);
    expect(result.evaluationId).toBe('90');
    expect(result.driveScopeFolderId).toBeNull();
    expect(result.driveArchivedFolderId).toBeNull();
  });

  it('should recover from duplicate key race and return updated concurrent row', async () => {
    ormRepository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: '12',
      evaluationId: '552',
      scopeKey: 'old_scope',
      viewerGroupEmail: 'old@academiapasalo.com',
      driveScopeFolderId: null,
      driveVideosFolderId: null,
      driveDocumentsFolderId: null,
      driveArchivedFolderId: null,
      viewerGroupId: null,
      isActive: false,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: null,
    } as EvaluationDriveAccess);

    ormRepository.create.mockImplementation(
      (entity) => entity as unknown as EvaluationDriveAccess,
    );
    ormRepository.save
      .mockRejectedValueOnce({
        driverError: { code: 'ER_DUP_ENTRY', errno: 1062 },
      })
      .mockImplementationOnce(
        async (entity) => entity as unknown as EvaluationDriveAccess,
      );

    const result = await repository.upsertByEvaluationId({
      evaluationId: '552',
      scopeKey: 'ev_552',
      viewerGroupEmail: 'ev-552-viewers@academiapasalo.com',
      driveScopeFolderId: 'scope-id',
      driveVideosFolderId: 'videos-id',
      driveDocumentsFolderId: 'docs-id',
      driveArchivedFolderId: 'archived-id',
      viewerGroupId: 'group-id',
      isActive: true,
    });

    expect(result.evaluationId).toBe('552');
    expect(result.scopeKey).toBe('ev_552');
    expect(result.viewerGroupEmail).toBe('ev-552-viewers@academiapasalo.com');
    expect(result.isActive).toBe(true);
  });
});
