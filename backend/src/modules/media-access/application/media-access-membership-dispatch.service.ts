import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUES } from '@infrastructure/queue/queue.constants';
import {
  MEDIA_ACCESS_JOB_NAMES,
  MEDIA_ACCESS_MEMBERSHIP_ACTIONS,
  MediaAccessMembershipAction,
} from '@modules/media-access/domain/media-access.constants';

type MembershipTarget = {
  userId: string;
  evaluationId: string;
};

export type MediaAccessMembershipSyncJobPayload = {
  action: MediaAccessMembershipAction;
  userId: string;
  evaluationId: string;
  source: string;
  requestedAt: string;
};

@Injectable()
export class MediaAccessMembershipDispatchService {
  private readonly logger = new Logger(
    MediaAccessMembershipDispatchService.name,
  );

  constructor(
    @InjectQueue(QUEUES.MEDIA_ACCESS)
    private readonly mediaAccessQueue: Queue,
  ) {}

  async enqueueGrantForUserEvaluations(
    userId: string,
    evaluationIds: string[],
    source: string,
  ): Promise<void> {
    await this.enqueueMembershipSyncJobs(
      MEDIA_ACCESS_MEMBERSHIP_ACTIONS.GRANT,
      evaluationIds.map((evaluationId) => ({ userId, evaluationId })),
      source,
    );
  }

  async enqueueRevokeForUserEvaluations(
    userId: string,
    evaluationIds: string[],
    source: string,
  ): Promise<void> {
    await this.enqueueMembershipSyncJobs(
      MEDIA_ACCESS_MEMBERSHIP_ACTIONS.REVOKE,
      evaluationIds.map((evaluationId) => ({ userId, evaluationId })),
      source,
    );
  }

  async enqueueGrantForEvaluationUsers(
    evaluationId: string,
    userIds: string[],
    source: string,
  ): Promise<void> {
    await this.enqueueMembershipSyncJobs(
      MEDIA_ACCESS_MEMBERSHIP_ACTIONS.GRANT,
      userIds.map((userId) => ({ userId, evaluationId })),
      source,
    );
  }

  private async enqueueMembershipSyncJobs(
    action: MediaAccessMembershipAction,
    targets: MembershipTarget[],
    source: string,
  ): Promise<void> {
    const normalizedSource = String(source || '').trim() || 'UNSPECIFIED';
    const deduplicatedTargets = this.deduplicateTargets(targets);
    if (deduplicatedTargets.length === 0) {
      return;
    }

    const requestedAt = new Date().toISOString();
    const jobs = deduplicatedTargets.map((target) => {
      const payload: MediaAccessMembershipSyncJobPayload = {
        action,
        userId: target.userId,
        evaluationId: target.evaluationId,
        source: normalizedSource,
        requestedAt,
      };
      return {
        name: MEDIA_ACCESS_JOB_NAMES.SYNC_MEMBERSHIP,
        data: payload,
        opts: {
          // Idempotencia fuerte por accion+usuario+evaluacion.
          jobId: this.buildMembershipSyncJobId(payload),
          // Permite re-encolar la misma combinacion en eventos futuros.
          removeOnComplete: true,
        },
      };
    });

    try {
      await this.mediaAccessQueue.addBulk(jobs);
    } catch (error) {
      this.logger.warn({
        context: MediaAccessMembershipDispatchService.name,
        message: 'No se pudo encolar sync de membresia en Media Access',
        action,
        source: normalizedSource,
        totalJobs: jobs.length,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private deduplicateTargets(targets: MembershipTarget[]): MembershipTarget[] {
    const uniqueKeys = new Set<string>();
    const deduplicated: MembershipTarget[] = [];

    for (const target of targets) {
      const normalizedUserId = String(target.userId || '').trim();
      const normalizedEvaluationId = String(target.evaluationId || '').trim();
      if (!normalizedUserId || !normalizedEvaluationId) {
        continue;
      }
      const key = `${normalizedUserId}:${normalizedEvaluationId}`;
      if (uniqueKeys.has(key)) {
        continue;
      }
      uniqueKeys.add(key);
      deduplicated.push({
        userId: normalizedUserId,
        evaluationId: normalizedEvaluationId,
      });
    }

    return deduplicated;
  }

  private buildMembershipSyncJobId(
    payload: MediaAccessMembershipSyncJobPayload,
  ): string {
    return [
      'media-access',
      'membership',
      payload.action,
      payload.userId,
      payload.evaluationId,
    ].join(':');
  }
}
