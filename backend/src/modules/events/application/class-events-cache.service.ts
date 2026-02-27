import { Injectable } from '@nestjs/common';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import { ClassEventRepository } from '@modules/events/infrastructure/class-event.repository';
import { EvaluationRepository } from '@modules/evaluations/infrastructure/evaluation.repository';
import { CategoryCycleContext } from '@modules/events/interfaces/class-event.interfaces';
import { CLASS_EVENT_CACHE_KEYS } from '@modules/events/domain/class-event.constants';

@Injectable()
export class ClassEventsCacheService {
  constructor(
    private readonly cacheService: RedisCacheService,
    private readonly classEventRepository: ClassEventRepository,
    private readonly evaluationRepository: EvaluationRepository,
  ) {}

  getRecordingStatusCacheKey(code: string): string {
    return `cache:class-event-recording-status:code:${code}`;
  }

  async invalidateForEvaluation(
    evaluationId: string,
    eventId?: string,
    categoryCycleContext?: CategoryCycleContext,
  ): Promise<void> {
    const deleteOps: Promise<unknown>[] = [
      this.cacheService.del(
        CLASS_EVENT_CACHE_KEYS.EVALUATION_LIST(evaluationId),
      ),
    ];
    if (eventId) {
      deleteOps.push(
        this.cacheService.del(CLASS_EVENT_CACHE_KEYS.DETAIL(eventId)),
      );
    }
    await Promise.all(deleteOps);

    const categoryCycleGroup =
      this.resolveCategoryCycleGroupByContext(categoryCycleContext) ??
      (await this.resolveCategoryCycleGroupByEvaluationId(evaluationId));
    const categoryCycleIndex =
      this.resolveCategoryCycleIndexByContext(categoryCycleContext) ??
      (await this.resolveCategoryCycleIndexByEvaluationId(evaluationId));
    const affectedUserIds =
      await this.classEventRepository.findAffectedScheduleUserIdsByEvaluation(
        evaluationId,
      );
    const uniqueAffectedUserIds = [...new Set(affectedUserIds)];

    const invalidateOps: Promise<unknown>[] = [];
    if (categoryCycleIndex) {
      invalidateOps.push(this.cacheService.invalidateIndex(categoryCycleIndex));
    } else if (categoryCycleGroup) {
      invalidateOps.push(this.cacheService.invalidateGroup(categoryCycleGroup));
    }
    const userInvalidationThreshold = 100;
    if (uniqueAffectedUserIds.length > userInvalidationThreshold) {
      invalidateOps.push(
        this.cacheService.invalidateIndex(
          CLASS_EVENT_CACHE_KEYS.GLOBAL_SCHEDULE_INDEX,
        ),
      );
    } else {
      for (const userId of uniqueAffectedUserIds) {
        invalidateOps.push(
          this.cacheService.invalidateIndex(
            CLASS_EVENT_CACHE_KEYS.USER_SCHEDULE_INDEX(userId),
          ),
        );
      }
    }

    if (invalidateOps.length > 0) {
      await Promise.all(invalidateOps);
    }
  }

  private resolveCategoryCycleGroupByContext(
    context?: CategoryCycleContext,
  ): string | null {
    if (!context?.courseTypeId || !context.academicCycleId) {
      return null;
    }
    return CLASS_EVENT_CACHE_KEYS.CATEGORY_CYCLE_GROUP(
      context.courseTypeId,
      context.academicCycleId,
    );
  }

  private resolveCategoryCycleIndexByContext(
    context?: CategoryCycleContext,
  ): string | null {
    if (!context?.courseTypeId || !context.academicCycleId) {
      return null;
    }
    return CLASS_EVENT_CACHE_KEYS.CATEGORY_CYCLE_INDEX(
      context.courseTypeId,
      context.academicCycleId,
    );
  }

  private async resolveCategoryCycleGroupByEvaluationId(
    evaluationId: string,
  ): Promise<string | null> {
    const evaluation =
      await this.evaluationRepository.findByIdWithCycle(evaluationId);
    if (!evaluation) {
      return null;
    }

    const courseTypeId = evaluation.courseCycle?.course?.courseTypeId;
    const academicCycleId = evaluation.courseCycle?.academicCycleId;
    if (!courseTypeId || !academicCycleId) {
      return null;
    }

    return CLASS_EVENT_CACHE_KEYS.CATEGORY_CYCLE_GROUP(
      courseTypeId,
      academicCycleId,
    );
  }

  private async resolveCategoryCycleIndexByEvaluationId(
    evaluationId: string,
  ): Promise<string | null> {
    const evaluation =
      await this.evaluationRepository.findByIdWithCycle(evaluationId);
    if (!evaluation) {
      return null;
    }

    const courseTypeId = evaluation.courseCycle?.course?.courseTypeId;
    const academicCycleId = evaluation.courseCycle?.academicCycleId;
    if (!courseTypeId || !academicCycleId) {
      return null;
    }

    return CLASS_EVENT_CACHE_KEYS.CATEGORY_CYCLE_INDEX(
      courseTypeId,
      academicCycleId,
    );
  }
}
