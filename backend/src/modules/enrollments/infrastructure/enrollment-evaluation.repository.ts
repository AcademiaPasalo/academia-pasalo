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
    const result = await this.ormRepository.query(
      `SELECT EXISTS(
        SELECT 1 FROM enrollment_evaluation ee
        INNER JOIN enrollment e ON e.id = ee.enrollment_id
        WHERE ee.evaluation_id = ?
          AND ee.is_active = 1
          AND ee.access_start_date <= NOW()
          AND ee.access_end_date >= NOW()
          AND e.user_id = ?
          AND e.cancelled_at IS NULL
        LIMIT 1
      ) as hasAccess`,
      [evaluationId, userId],
    );

    return Number(result[0]?.hasAccess) === 1;
  }
}
