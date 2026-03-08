import { DataSource } from 'typeorm';
import { MediaAccessReconciliationService } from '@modules/media-access/application/media-access-reconciliation.service';
import { EvaluationDriveAccessRepository } from '@modules/media-access/infrastructure/evaluation-drive-access.repository';
import { WorkspaceGroupsService } from '@modules/media-access/application/workspace-groups.service';
import { technicalSettings } from '@config/technical-settings';
import { DriveScopeProvisioningService } from '@modules/media-access/application/drive-scope-provisioning.service';

describe('MediaAccessReconciliationService', () => {
  let service: MediaAccessReconciliationService;
  let dataSource: jest.Mocked<Partial<DataSource>>;
  let evaluationDriveAccessRepository: jest.Mocked<EvaluationDriveAccessRepository>;
  let workspaceGroupsService: jest.Mocked<WorkspaceGroupsService>;
  let driveScopeProvisioningService: jest.Mocked<DriveScopeProvisioningService>;

  beforeEach(() => {
    (technicalSettings as any).mediaAccess.staffViewersGroupEmail = '';

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
    driveScopeProvisioningService = {
      ensureGroupReaderPermission: jest.fn(),
    } as unknown as jest.Mocked<DriveScopeProvisioningService>;

    service = new MediaAccessReconciliationService(
      dataSource as DataSource,
      evaluationDriveAccessRepository,
      workspaceGroupsService,
      driveScopeProvisioningService,
    );
  });

  it('no registra scheduler al iniciar (cron deshabilitado)', () => {
    expect(service.onApplicationBootstrap()).toBeUndefined();
  });

  it('aplica delta add/remove y no remueve owners', async () => {
    evaluationDriveAccessRepository.findActiveByIdCursor
      .mockResolvedValueOnce([
        {
          id: '10',
          evaluationId: '200',
          viewerGroupEmail: 'ev-200-viewers@academiapasalo.com',
          driveScopeFolderId: 'scope-folder-200',
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
    expect(
      workspaceGroupsService.removeMemberFromGroup,
    ).not.toHaveBeenCalledWith(
      expect.objectContaining({
        memberEmail: 'owner@academiapasalo.com',
      }),
    );
    expect(summary.scopesProcessed).toBe(1);
    expect(summary.scopesWithDrift).toBe(1);
    expect(summary.addedMembersTotal).toBe(1);
    expect(summary.removedMembersTotal).toBe(1);
    expect(
      driveScopeProvisioningService.ensureGroupReaderPermission,
    ).not.toHaveBeenCalled();
  });

  it('sincroniza el grupo global de staff cuando esta configurado', async () => {
    (technicalSettings as any).mediaAccess.staffViewersGroupEmail =
      'staff-viewers@academiapasalo.com';
    evaluationDriveAccessRepository.findActiveByIdCursor.mockResolvedValueOnce(
      [],
    );
    workspaceGroupsService.findOrCreateGroup.mockResolvedValueOnce({
      id: 'staff-group-1',
      email: 'staff-viewers@academiapasalo.com',
    } as never);
    (dataSource.query as jest.Mock)
      .mockResolvedValueOnce([
        { email: 'admin1@academiapasalo.com' },
        { email: 'super1@academiapasalo.com' },
      ])
      .mockResolvedValueOnce([]);
    workspaceGroupsService.listGroupMembers.mockResolvedValueOnce([
      { email: 'admin1@academiapasalo.com', role: 'MEMBER' },
      { email: 'legacy@academiapasalo.com', role: 'MEMBER' },
      { email: 'owner@academiapasalo.com', role: 'OWNER' },
    ] as never);

    const summary = await service.reconcileActiveScopes();

    expect(workspaceGroupsService.ensureMemberInGroup).toHaveBeenCalledWith({
      groupEmail: 'staff-viewers@academiapasalo.com',
      memberEmail: 'super1@academiapasalo.com',
    });
    expect(workspaceGroupsService.removeMemberFromGroup).toHaveBeenCalledWith({
      groupEmail: 'staff-viewers@academiapasalo.com',
      memberEmail: 'legacy@academiapasalo.com',
    });
    expect(
      workspaceGroupsService.removeMemberFromGroup,
    ).not.toHaveBeenCalledWith(
      expect.objectContaining({
        memberEmail: 'owner@academiapasalo.com',
      }),
    );
    expect(summary.staffExpectedMembersTotal).toBe(2);
    expect(summary.staffAddedMembersTotal).toBe(1);
    expect(summary.staffRemovedMembersTotal).toBe(1);
  });

  it('asegura permiso reader del grupo staff en scopes existentes cuando staff esta configurado', async () => {
    (technicalSettings as any).mediaAccess.staffViewersGroupEmail =
      'staff-viewers@academiapasalo.com';
    evaluationDriveAccessRepository.findActiveByIdCursor
      .mockResolvedValueOnce([
        {
          id: '10',
          evaluationId: '200',
          viewerGroupEmail: 'ev-200-viewers@academiapasalo.com',
          driveScopeFolderId: 'scope-folder-200',
          isActive: true,
        } as never,
      ])
      .mockResolvedValueOnce([]);
    workspaceGroupsService.findOrCreateGroup.mockResolvedValueOnce({
      id: 'staff-group-1',
      email: 'staff-viewers@academiapasalo.com',
    } as never);
    (dataSource.query as jest.Mock)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    workspaceGroupsService.listGroupMembers
      .mockResolvedValueOnce([] as never)
      .mockResolvedValueOnce([] as never);

    await service.reconcileActiveScopes();

    expect(
      driveScopeProvisioningService.ensureGroupReaderPermission,
    ).toHaveBeenCalledWith(
      'scope-folder-200',
      'staff-viewers@academiapasalo.com',
    );
  });
});
