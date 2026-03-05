import { Job, UnrecoverableError } from 'bullmq';
import { DataSource, Repository } from 'typeorm';
import { User } from '@modules/users/domain/user.entity';
import { MediaAccessMembershipProcessor } from '@modules/media-access/infrastructure/processors/media-access-membership.processor';
import { WorkspaceGroupsService } from '@modules/media-access/application/workspace-groups.service';
import { EvaluationDriveAccessProvisioningService } from '@modules/media-access/application/evaluation-drive-access-provisioning.service';
import { EvaluationDriveAccessRepository } from '@modules/media-access/infrastructure/evaluation-drive-access.repository';
import { MediaAccessReconciliationService } from '@modules/media-access/application/media-access-reconciliation.service';
import {
  MEDIA_ACCESS_JOB_NAMES,
  MEDIA_ACCESS_MEMBERSHIP_ACTIONS,
} from '@modules/media-access/domain/media-access.constants';

describe('MediaAccessMembershipProcessor', () => {
  let processor: MediaAccessMembershipProcessor;
  let dataSource: jest.Mocked<Partial<DataSource>>;
  let userRepository: jest.Mocked<Partial<Repository<User>>>;
  let workspaceGroupsService: jest.Mocked<WorkspaceGroupsService>;
  let provisioningService: jest.Mocked<EvaluationDriveAccessProvisioningService>;
  let evaluationDriveAccessRepository: jest.Mocked<EvaluationDriveAccessRepository>;
  let reconciliationService: jest.Mocked<MediaAccessReconciliationService>;

  beforeEach(() => {
    dataSource = {
      query: jest.fn().mockResolvedValue([{ hasAccess: 0 }]),
    };
    userRepository = {
      findOne: jest.fn(),
    };
    workspaceGroupsService = {
      findOrCreateGroup: jest.fn(),
      ensureMemberInGroup: jest.fn(),
      removeMemberFromGroup: jest.fn(),
    } as unknown as jest.Mocked<WorkspaceGroupsService>;
    provisioningService = {
      provisionByEvaluationId: jest.fn(),
    } as unknown as jest.Mocked<EvaluationDriveAccessProvisioningService>;
    evaluationDriveAccessRepository = {
      findByEvaluationId: jest.fn(),
      upsertByEvaluationId: jest.fn(),
    } as unknown as jest.Mocked<EvaluationDriveAccessRepository>;
    reconciliationService = {
      onApplicationBootstrap: jest.fn(),
      runReconciliation: jest.fn().mockResolvedValue(undefined),
      reconcileActiveScopes: jest.fn(),
    } as unknown as jest.Mocked<MediaAccessReconciliationService>;

    processor = new MediaAccessMembershipProcessor(
      dataSource as DataSource,
      userRepository as Repository<User>,
      workspaceGroupsService,
      provisioningService,
      evaluationDriveAccessRepository,
      reconciliationService,
    );
  });

  it('otorga membresia y provisiona si no existe scope activo', async () => {
    (dataSource.query as jest.Mock).mockResolvedValueOnce([{ hasAccess: 1 }]);
    (userRepository.findOne as jest.Mock).mockResolvedValue({
      id: '10',
      email: 'student@test.com',
    } as User);
    evaluationDriveAccessRepository.findByEvaluationId.mockResolvedValue(null);
    provisioningService.provisionByEvaluationId.mockResolvedValue({
      id: '1',
      evaluationId: '20',
      viewerGroupEmail: 'ev-20-viewers@academiapasalo.com',
      isActive: true,
    } as never);

    await processor.process({
      id: 'job-1',
      name: MEDIA_ACCESS_JOB_NAMES.SYNC_MEMBERSHIP,
      data: {
        action: MEDIA_ACCESS_MEMBERSHIP_ACTIONS.GRANT,
        userId: '10',
        evaluationId: '20',
        source: 'ENROLLMENT_CREATED',
      },
    } as unknown as Job);

    expect(provisioningService.provisionByEvaluationId).toHaveBeenCalledWith(
      '20',
    );
    expect(workspaceGroupsService.ensureMemberInGroup).toHaveBeenCalledWith({
      groupEmail: 'ev-20-viewers@academiapasalo.com',
      memberEmail: 'student@test.com',
    });
  });

  it('omite grant cuando no hay acceso efectivo vigente', async () => {
    (dataSource.query as jest.Mock).mockResolvedValueOnce([{ hasAccess: 0 }]);
    (userRepository.findOne as jest.Mock).mockResolvedValue({
      id: '10',
      email: 'student@test.com',
    } as User);

    await processor.process({
      id: 'job-1b',
      name: MEDIA_ACCESS_JOB_NAMES.SYNC_MEMBERSHIP,
      data: {
        action: MEDIA_ACCESS_MEMBERSHIP_ACTIONS.GRANT,
        userId: '10',
        evaluationId: '20',
        source: 'ENROLLMENT_CREATED',
      },
    } as unknown as Job);

    expect(workspaceGroupsService.ensureMemberInGroup).not.toHaveBeenCalled();
    expect(provisioningService.provisionByEvaluationId).not.toHaveBeenCalled();
  });

  it('revoca membresia cuando existe scope activo', async () => {
    (userRepository.findOne as jest.Mock).mockResolvedValue({
      id: '10',
      email: 'student@test.com',
    } as User);
    evaluationDriveAccessRepository.findByEvaluationId.mockResolvedValue({
      id: '1',
      evaluationId: '20',
      viewerGroupEmail: 'ev-20-viewers@academiapasalo.com',
      isActive: true,
    } as never);

    await processor.process({
      id: 'job-2',
      name: MEDIA_ACCESS_JOB_NAMES.SYNC_MEMBERSHIP,
      data: {
        action: MEDIA_ACCESS_MEMBERSHIP_ACTIONS.REVOKE,
        userId: '10',
        evaluationId: '20',
        source: 'ENROLLMENT_CANCELLED',
      },
    } as unknown as Job);

    expect(dataSource.query).toHaveBeenCalled();
    expect(workspaceGroupsService.removeMemberFromGroup).toHaveBeenCalledWith({
      groupEmail: 'ev-20-viewers@academiapasalo.com',
      memberEmail: 'student@test.com',
    });
  });

  it('omite revocacion cuando aun tiene acceso efectivo', async () => {
    (userRepository.findOne as jest.Mock).mockResolvedValue({
      id: '10',
      email: 'student@test.com',
    } as User);
    evaluationDriveAccessRepository.findByEvaluationId.mockResolvedValue({
      id: '1',
      evaluationId: '20',
      viewerGroupEmail: 'ev-20-viewers@academiapasalo.com',
      isActive: true,
    } as never);
    (dataSource.query as jest.Mock).mockResolvedValueOnce([{ hasAccess: 1 }]);

    await processor.process({
      id: 'job-2b',
      name: MEDIA_ACCESS_JOB_NAMES.SYNC_MEMBERSHIP,
      data: {
        action: MEDIA_ACCESS_MEMBERSHIP_ACTIONS.REVOKE,
        userId: '10',
        evaluationId: '20',
        source: 'ENROLLMENT_CANCELLED',
      },
    } as unknown as Job);

    expect(workspaceGroupsService.removeMemberFromGroup).not.toHaveBeenCalled();
  });

  it('lanza error no recuperable para accion invalida', async () => {
    await expect(
      processor.process({
        id: 'job-3',
        name: MEDIA_ACCESS_JOB_NAMES.SYNC_MEMBERSHIP,
        data: {
          action: 'INVALID',
          userId: '10',
          evaluationId: '20',
          source: 'TEST',
        },
      } as unknown as Job),
    ).rejects.toBeInstanceOf(UnrecoverableError);
  });

  it('ejecuta reconciliacion para job de reconciliacion', async () => {
    await processor.process({
      id: 'job-reconcile',
      name: MEDIA_ACCESS_JOB_NAMES.RECONCILE_SCOPES,
      data: {},
    } as unknown as Job);

    expect(reconciliationService.runReconciliation).toHaveBeenCalledTimes(1);
  });

  it('lanza error no recuperable para job desconocido', async () => {
    await expect(
      processor.process({
        id: 'job-unknown',
        name: 'UNKNOWN_MEDIA_ACCESS_JOB',
        data: {},
      } as unknown as Job),
    ).rejects.toBeInstanceOf(UnrecoverableError);
  });
});
