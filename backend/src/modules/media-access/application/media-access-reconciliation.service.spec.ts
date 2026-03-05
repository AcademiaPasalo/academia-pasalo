import { Queue } from 'bullmq';
import { DataSource } from 'typeorm';
import { MediaAccessReconciliationService } from '@modules/media-access/application/media-access-reconciliation.service';
import { EvaluationDriveAccessRepository } from '@modules/media-access/infrastructure/evaluation-drive-access.repository';
import { WorkspaceGroupsService } from '@modules/media-access/application/workspace-groups.service';
import { MEDIA_ACCESS_JOB_NAMES } from '@modules/media-access/domain/media-access.constants';

describe('MediaAccessReconciliationService', () => {
  let service: MediaAccessReconciliationService;
  let mediaAccessQueue: jest.Mocked<Partial<Queue>>;
  let dataSource: jest.Mocked<Partial<DataSource>>;
  let evaluationDriveAccessRepository: jest.Mocked<EvaluationDriveAccessRepository>;
  let workspaceGroupsService: jest.Mocked<WorkspaceGroupsService>;

  beforeEach(() => {
    mediaAccessQueue = {
      getJobSchedulers: jest.fn().mockResolvedValue([]),
      add: jest.fn().mockResolvedValue({}),
      removeJobScheduler: jest.fn().mockResolvedValue(undefined),
    };
    dataSource = {
      query: jest.fn(),
    };
    evaluationDriveAccessRepository = {
      findByEvaluationId: jest.fn(),
      upsertByEvaluationId: jest.fn(),
      findActiveByIdCursor: jest.fn(),
    } as unknown as jest.Mocked<EvaluationDriveAccessRepository>;
    workspaceGroupsService = {
      findOrCreateGroup: jest.fn(),
      ensureMemberInGroup: jest.fn(),
      removeMemberFromGroup: jest.fn(),
      listGroupMembers: jest.fn(),
    } as unknown as jest.Mocked<WorkspaceGroupsService>;

    service = new MediaAccessReconciliationService(
      mediaAccessQueue as Queue,
      dataSource as DataSource,
      evaluationDriveAccessRepository,
      workspaceGroupsService,
    );
  });

  it('registra scheduler de reconciliacion al iniciar', async () => {
    await service.onApplicationBootstrap();

    expect(mediaAccessQueue.add).toHaveBeenCalledWith(
      MEDIA_ACCESS_JOB_NAMES.RECONCILE_SCOPES,
      {},
      expect.objectContaining({
        repeat: expect.any(Object),
      }),
    );
  });

  it('aplica delta add/remove y no remueve owners', async () => {
    evaluationDriveAccessRepository.findActiveByIdCursor
      .mockResolvedValueOnce([
        {
          id: '10',
          evaluationId: '200',
          viewerGroupEmail: 'ev-200-viewers@academiapasalo.com',
          isActive: true,
        } as never,
      ])
      .mockResolvedValueOnce([]);
    (dataSource.query as jest.Mock).mockResolvedValueOnce([
      { email: 'student1@academiapasalo.com' },
      { email: 'student3@academiapasalo.com' },
    ]);
    workspaceGroupsService.listGroupMembers.mockResolvedValueOnce([
      { email: 'student1@academiapasalo.com', role: 'MEMBER' },
      { email: 'student2@academiapasalo.com', role: 'MEMBER' },
      { email: 'owner@academiapasalo.com', role: 'OWNER' },
    ] as never);

    const summary = await service.reconcileActiveScopes();

    expect(workspaceGroupsService.ensureMemberInGroup).toHaveBeenCalledWith({
      groupEmail: 'ev-200-viewers@academiapasalo.com',
      memberEmail: 'student3@academiapasalo.com',
    });
    expect(workspaceGroupsService.removeMemberFromGroup).toHaveBeenCalledWith({
      groupEmail: 'ev-200-viewers@academiapasalo.com',
      memberEmail: 'student2@academiapasalo.com',
    });
    expect(workspaceGroupsService.removeMemberFromGroup).not.toHaveBeenCalledWith(
      expect.objectContaining({
        memberEmail: 'owner@academiapasalo.com',
      }),
    );
    expect(summary.scopesProcessed).toBe(1);
    expect(summary.scopesWithDrift).toBe(1);
    expect(summary.addedMembersTotal).toBe(1);
    expect(summary.removedMembersTotal).toBe(1);
  });
});
