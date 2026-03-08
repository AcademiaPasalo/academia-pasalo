import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { EnrollmentEvaluation } from '@modules/enrollments/domain/enrollment-evaluation.entity';

@Injectable()
export class EnrollmentEvaluationRepository {
  constructor(
    @InjectRepository(EnrollmentEvaluation)
    private readonly ormRepository: Repository<EnrollmentEvaluation>,
  ) {}

  async createMany(
    data: Partial<EnrollmentEvaluation>[],
    manager?: EntityManager,
  ): Promise<EnrollmentEvaluation[]> {
    const repo = manager
      ? manager.getRepository(EnrollmentEvaluation)
      : this.ormRepository;
    const items = repo.create(data);
    return await repo.save(items);
  }

  async findActiveByEnrollmentAndEvaluation(
    enrollmentId: string,
    evaluationId: string,
  ): Promise<EnrollmentEvaluation | null> {
    return await this.ormRepository
      .createQueryBuilder('ee')
      .innerJoin('ee.enrollment', 'enrollment')
      .where('ee.enrollmentId = :enrollmentId', { enrollmentId })
      .andWhere('ee.evaluationId = :evaluationId', { evaluationId })
      .andWhere('ee.isActive = :isActive', { isActive: true })
      .andWhere('enrollment.cancelledAt IS NULL')
      .getOne();
  }

  async checkAccess(userId: string, evaluationId: string): Promise<boolean> {
    const now = new Date();
    const result = await this.ormRepository.query<
      [{ hasAccess: number | string }]
    >(
      `SELECT EXISTS(
        SELECT 1 FROM enrollment_evaluation ee
        INNER JOIN enrollment e ON e.id = ee.enrollment_id
        WHERE ee.evaluation_id = ?
          AND ee.is_active = 1
          AND ee.access_start_date <= ?
          AND ee.access_end_date >= ?
          AND e.user_id = ?
          AND e.cancelled_at IS NULL
        LIMIT 1
      ) as hasAccess`,
      [evaluationId, now, now, userId],
    );

    return Number(result[0]?.hasAccess) === 1;
  }

  async findEvaluationIdsToRevokeAfterEnrollmentCancellation(
    userId: string,
    enrollmentId: string,
    manager?: EntityManager,
  ): Promise<string[]> {
    const repo = manager
      ? manager.getRepository(EnrollmentEvaluation)
      : this.ormRepository;
    const now = new Date();
    const result = await repo.query<Array<{ evaluationId: string | number }>>(
      `SELECT DISTINCT ee.evaluation_id AS evaluationId
       FROM enrollment_evaluation ee
       INNER JOIN enrollment e ON e.id = ee.enrollment_id
       WHERE ee.enrollment_id = ?
         AND ee.is_active = 1
         AND NOT EXISTS (
           SELECT 1
           FROM enrollment_evaluation ee2
           INNER JOIN enrollment e2 ON e2.id = ee2.enrollment_id
           WHERE ee2.evaluation_id = ee.evaluation_id
             AND ee2.enrollment_id <> ee.enrollment_id
             AND ee2.is_active = 1
             AND ee2.access_start_date <= ?
             AND ee2.access_end_date >= ?
             AND e2.user_id = ?
             AND e2.cancelled_at IS NULL
         )`,
      [enrollmentId, now, now, userId],
    );

    return result.map((row) => String(row.evaluationId));
  }
}
