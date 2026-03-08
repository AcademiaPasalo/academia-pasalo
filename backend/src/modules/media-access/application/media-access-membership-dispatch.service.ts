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

type CourseCycleMembershipTarget = {
  userId: string;
  courseCycleId: string;
};

export type MediaAccessMembershipSyncJobPayload = {
  action: MediaAccessMembershipAction;
  userId: string;
  evaluationId: string;
  source: string;
  requestedAt: string;
};

export type MediaAccessCourseCycleMembershipSyncJobPayload = {
  action: MediaAccessMembershipAction;
  userId: string;
  courseCycleId: string;
  source: string;
  requestedAt: string;
};

export type MediaAccessRecoverScopeJobPayload = {
  evaluationId: string;
  requestedByUserId: string;
  reconcileMembers: boolean;
  pruneExtraMembers: boolean;
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

  async enqueueGrantForUserCourseCycles(
    userId: string,
    courseCycleIds: string[],
    source: string,
  ): Promise<void> {
    await this.enqueueCourseCycleMembershipSyncJobs(
      MEDIA_ACCESS_MEMBERSHIP_ACTIONS.GRANT,
      courseCycleIds.map((courseCycleId) => ({ userId, courseCycleId })),
      source,
    );
  }

  async enqueueRevokeForUserCourseCycles(
    userId: string,
    courseCycleIds: string[],
    source: string,
  ): Promise<void> {
    await this.enqueueCourseCycleMembershipSyncJobs(
      MEDIA_ACCESS_MEMBERSHIP_ACTIONS.REVOKE,
      courseCycleIds.map((courseCycleId) => ({ userId, courseCycleId })),
      source,
    );
  }

  async enqueueRecoverEvaluationScope(input: {
    evaluationId: string;
    requestedByUserId: string;
    reconcileMembers?: boolean;
    pruneExtraMembers?: boolean;
    source?: string;
  }): Promise<{ jobId: string }> {
    const evaluationId = String(input.evaluationId || '').trim();
    const requestedByUserId = String(input.requestedByUserId || '').trim();
    if (!evaluationId || !requestedByUserId) {
      throw new Error(
        'evaluationId y requestedByUserId son obligatorios para recover scope',
      );
    }

    const reconcileMembers = input.reconcileMembers !== false;
    const pruneExtraMembers = input.pruneExtraMembers === true;
    if (pruneExtraMembers && !reconcileMembers) {
      throw new Error(
        'No se puede podar miembros si reconcileMembers está desactivado',
      );
    }

    const source = String(input.source || '').trim() || 'UNSPECIFIED';
    const payload: MediaAccessRecoverScopeJobPayload = {
      evaluationId,
      requestedByUserId,
      reconcileMembers,
      pruneExtraMembers,
      source,
      requestedAt: new Date().toISOString(),
    };
    const jobId = this.buildRecoverScopeJobId(payload);
    await this.mediaAccessQueue.add(
      MEDIA_ACCESS_JOB_NAMES.RECOVER_EVALUATION_SCOPE,
      payload,
      {
        jobId,
        removeOnComplete: true,
      },
    );
    return { jobId };
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
        message: 'No se pudo encolar sync de membresía en Media Access',
        action,
        source: normalizedSource,
        totalJobs: jobs.length,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private async enqueueCourseCycleMembershipSyncJobs(
    action: MediaAccessMembershipAction,
    targets: CourseCycleMembershipTarget[],
    source: string,
  ): Promise<void> {
    const normalizedSource = String(source || '').trim() || 'UNSPECIFIED';
    const deduplicatedTargets = this.deduplicateCourseCycleTargets(targets);
    if (deduplicatedTargets.length === 0) {
      return;
    }

    const requestedAt = new Date().toISOString();
    const jobs = deduplicatedTargets.map((target) => {
      const payload: MediaAccessCourseCycleMembershipSyncJobPayload = {
        action,
        userId: target.userId,
        courseCycleId: target.courseCycleId,
        source: normalizedSource,
        requestedAt,
      };
      return {
        name: MEDIA_ACCESS_JOB_NAMES.SYNC_COURSE_CYCLE_MEMBERSHIP,
        data: payload,
        opts: {
          jobId: this.buildCourseCycleMembershipSyncJobId(payload),
          removeOnComplete: true,
        },
      };
    });

    try {
      await this.mediaAccessQueue.addBulk(jobs);
    } catch (error) {
      this.logger.warn({
        context: MediaAccessMembershipDispatchService.name,
        message:
          'No se pudo encolar sync de membresia course_cycle en Media Access',
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

  private deduplicateCourseCycleTargets(
    targets: CourseCycleMembershipTarget[],
  ): CourseCycleMembershipTarget[] {
    const uniqueKeys = new Set<string>();
    const deduplicated: CourseCycleMembershipTarget[] = [];

    for (const target of targets) {
      const normalizedUserId = String(target.userId || '').trim();
      const normalizedCourseCycleId = String(target.courseCycleId || '').trim();
      if (!normalizedUserId || !normalizedCourseCycleId) {
        continue;
      }
      const key = `${normalizedUserId}:${normalizedCourseCycleId}`;
      if (uniqueKeys.has(key)) {
        continue;
      }
      uniqueKeys.add(key);
      deduplicated.push({
        userId: normalizedUserId,
        courseCycleId: normalizedCourseCycleId,
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
    ].join('__');
  }

  private buildCourseCycleMembershipSyncJobId(
    payload: MediaAccessCourseCycleMembershipSyncJobPayload,
  ): string {
    return [
      'media-access',
      'course-cycle-membership',
      payload.action,
      payload.userId,
      payload.courseCycleId,
    ].join('__');
  }

  private buildRecoverScopeJobId(
    payload: MediaAccessRecoverScopeJobPayload,
  ): string {
    return [
      'media-access',
      'recover-scope',
      payload.evaluationId,
      payload.reconcileMembers ? 'reconcile' : 'no-reconcile',
      payload.pruneExtraMembers ? 'prune' : 'keep-extra',
    ].join('__');
  }
}
