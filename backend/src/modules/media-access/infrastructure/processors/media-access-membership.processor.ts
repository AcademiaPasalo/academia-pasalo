import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job, UnrecoverableError } from 'bullmq';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { QUEUES } from '@infrastructure/queue/queue.constants';
import { User } from '@modules/users/domain/user.entity';
import { EvaluationDriveAccess } from '@modules/media-access/domain/evaluation-drive-access.entity';
import {
  MEDIA_ACCESS_JOB_NAMES,
  MEDIA_ACCESS_MEMBERSHIP_ACTIONS,
} from '@modules/media-access/domain/media-access.constants';
import { WorkspaceGroupsService } from '@modules/media-access/application/workspace-groups.service';
import { EvaluationDriveAccessProvisioningService } from '@modules/media-access/application/evaluation-drive-access-provisioning.service';
import { EvaluationDriveAccessRepository } from '@modules/media-access/infrastructure/evaluation-drive-access.repository';
import { MediaAccessMembershipSyncJobPayload } from '@modules/media-access/application/media-access-membership-dispatch.service';
import { MediaAccessReconciliationService } from '@modules/media-access/application/media-access-reconciliation.service';

@Injectable()
@Processor(QUEUES.MEDIA_ACCESS)
export class MediaAccessMembershipProcessor extends WorkerHost {
  private readonly logger = new Logger(MediaAccessMembershipProcessor.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly workspaceGroupsService: WorkspaceGroupsService,
    private readonly provisioningService: EvaluationDriveAccessProvisioningService,
    private readonly evaluationDriveAccessRepository: EvaluationDriveAccessRepository,
    private readonly reconciliationService: MediaAccessReconciliationService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    if (job.name === MEDIA_ACCESS_JOB_NAMES.RECONCILE_SCOPES) {
      await this.reconciliationService.runReconciliation();
      return;
    }
    if (job.name === MEDIA_ACCESS_JOB_NAMES.SYNC_MEMBERSHIP) {
      await this.handleSyncMembership(
        job as Job<MediaAccessMembershipSyncJobPayload>,
      );
      return;
    }
    this.logger.warn({
      context: MediaAccessMembershipProcessor.name,
      message: 'Job de media-access desconocido, ignorado',
      jobId: job.id,
      jobName: job.name,
    });
    throw new UnrecoverableError(
      `Job media-access no soportado: ${String(job.name)}`,
    );
  }

  private async handleSyncMembership(
    job: Job<MediaAccessMembershipSyncJobPayload>,
  ): Promise<void> {
    const { action, userId, evaluationId, source } = job.data || {};
    const normalizedAction = String(action || '')
      .trim()
      .toUpperCase();
    const normalizedUserId = String(userId || '').trim();
    const normalizedEvaluationId = String(evaluationId || '').trim();
    const normalizedSource = String(source || '').trim() || 'UNSPECIFIED';

    if (
      normalizedAction !== MEDIA_ACCESS_MEMBERSHIP_ACTIONS.GRANT &&
      normalizedAction !== MEDIA_ACCESS_MEMBERSHIP_ACTIONS.REVOKE
    ) {
      throw new UnrecoverableError(
        `Accion de sync de membresia invalida: ${String(action)}`,
      );
    }
    if (!normalizedUserId || !normalizedEvaluationId) {
      throw new UnrecoverableError(
        'Payload incompleto para sync de membresia media-access',
      );
    }

    const user = await this.userRepository.findOne({
      where: { id: normalizedUserId },
    });
    if (!user?.email) {
      throw new UnrecoverableError(
        `Usuario ${normalizedUserId} no encontrado para sync de membresia`,
      );
    }
    const normalizedUserEmail = user.email.trim().toLowerCase();

    if (normalizedAction === MEDIA_ACCESS_MEMBERSHIP_ACTIONS.GRANT) {
      const hasEffectiveAccess = await this.userHasEffectiveAccess(
        normalizedUserId,
        normalizedEvaluationId,
      );
      if (!hasEffectiveAccess) {
        this.logger.log({
          context: MediaAccessMembershipProcessor.name,
          message:
            'Grant omitido: el usuario no tiene acceso efectivo vigente a la evaluacion',
          evaluationId: normalizedEvaluationId,
          userId: normalizedUserId,
          source: normalizedSource,
        });
        return;
      }

      const driveAccess = await this.ensureActiveDriveAccess(
        normalizedEvaluationId,
      );
      await this.workspaceGroupsService.ensureMemberInGroup({
        groupEmail: driveAccess.viewerGroupEmail,
        memberEmail: normalizedUserEmail,
      });

      this.logger.log({
        context: MediaAccessMembershipProcessor.name,
        message: 'Membresia Drive otorgada',
        evaluationId: normalizedEvaluationId,
        userId: normalizedUserId,
        userEmail: normalizedUserEmail,
        groupEmail: driveAccess.viewerGroupEmail,
        source: normalizedSource,
      });
      return;
    }

    const driveAccess =
      await this.evaluationDriveAccessRepository.findByEvaluationId(
        normalizedEvaluationId,
      );
    if (!driveAccess?.isActive || !driveAccess.viewerGroupEmail) {
      this.logger.log({
        context: MediaAccessMembershipProcessor.name,
        message:
          'Revocacion omitida: evaluacion sin scope activo persistido en Drive',
        evaluationId: normalizedEvaluationId,
        userId: normalizedUserId,
        source: normalizedSource,
      });
      return;
    }

    const hasEffectiveAccess = await this.userHasEffectiveAccess(
      normalizedUserId,
      normalizedEvaluationId,
    );
    if (hasEffectiveAccess) {
      this.logger.log({
        context: MediaAccessMembershipProcessor.name,
        message:
          'Revocacion omitida: el usuario mantiene acceso efectivo a la evaluacion',
        evaluationId: normalizedEvaluationId,
        userId: normalizedUserId,
        source: normalizedSource,
      });
      return;
    }

    await this.workspaceGroupsService.removeMemberFromGroup({
      groupEmail: driveAccess.viewerGroupEmail,
      memberEmail: normalizedUserEmail,
    });

    this.logger.log({
      context: MediaAccessMembershipProcessor.name,
      message: 'Membresia Drive revocada',
      evaluationId: normalizedEvaluationId,
      userId: normalizedUserId,
      userEmail: normalizedUserEmail,
      groupEmail: driveAccess.viewerGroupEmail,
      source: normalizedSource,
    });
  }

  private async ensureActiveDriveAccess(
    evaluationId: string,
  ): Promise<EvaluationDriveAccess> {
    const existing =
      await this.evaluationDriveAccessRepository.findByEvaluationId(
        evaluationId,
      );
    if (existing?.isActive && existing.viewerGroupEmail) {
      return existing;
    }

    const provisioned =
      await this.provisioningService.provisionByEvaluationId(evaluationId);
    if (!provisioned.isActive || !provisioned.viewerGroupEmail) {
      throw new UnrecoverableError(
        `Scope Drive incompleto para evaluacion ${evaluationId}`,
      );
    }
    return provisioned;
  }

  private async userHasEffectiveAccess(
    userId: string,
    evaluationId: string,
  ): Promise<boolean> {
    const now = new Date();
    const result = await this.dataSource.query<
      Array<{ hasAccess: number | string }>
    >(
      `SELECT EXISTS(
         SELECT 1
         FROM enrollment_evaluation ee
         INNER JOIN enrollment e ON e.id = ee.enrollment_id
         WHERE ee.evaluation_id = ?
           AND ee.is_active = 1
           AND ee.access_start_date <= ?
           AND ee.access_end_date >= ?
           AND e.user_id = ?
           AND e.cancelled_at IS NULL
         LIMIT 1
       ) AS hasAccess`,
      [evaluationId, now, now, userId],
    );

    return Number(result[0]?.hasAccess) === 1;
  }
}
