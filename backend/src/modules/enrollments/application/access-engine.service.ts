import { Injectable, Logger } from '@nestjs/common';
import { EnrollmentEvaluationRepository } from '@modules/enrollments/infrastructure/enrollment-evaluation.repository';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import { technicalSettings } from '@config/technical-settings';

@Injectable()
export class AccessEngineService {
  private readonly logger = new Logger(AccessEngineService.name);

  constructor(
    private readonly enrollmentEvaluationRepository: EnrollmentEvaluationRepository,
    private readonly cacheService: RedisCacheService,
  ) {}

  async hasAccess(userId: string, evaluationId: string): Promise<boolean> {
    const cacheKey = `cache:access:user:${userId}:eval:${evaluationId}`;
    
    const cachedAccess = await this.cacheService.get<boolean>(cacheKey);
    if (cachedAccess !== null) {
      return cachedAccess;
    }

    const hasAccess = await this.enrollmentEvaluationRepository.checkAccess(userId, evaluationId);

    this.logger.debug({
      message: 'Access check result',
      userId,
      evaluationId,
      hasAccess,
      timestamp: new Date().toISOString(),
    });

    await this.cacheService.set(cacheKey, hasAccess, technicalSettings.cache.enrollments.accessCheckCacheTtlSeconds);

    return hasAccess;
  }
}
