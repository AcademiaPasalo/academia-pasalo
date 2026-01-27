import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { EnrollmentEvaluation } from '@modules/enrollments/domain/enrollment-evaluation.entity';

@Injectable()
export class EnrollmentEvaluationRepository {
  constructor(
    @InjectRepository(EnrollmentEvaluation)
    private readonly ormRepository: Repository<EnrollmentEvaluation>,
  ) {}

  async createMany(data: Partial<EnrollmentEvaluation>[], manager?: EntityManager): Promise<EnrollmentEvaluation[]> {
    const repo = manager ? manager.getRepository(EnrollmentEvaluation) : this.ormRepository;
    const items = repo.create(data);
    return await repo.save(items);
  }

  async findActiveByEnrollmentAndEvaluation(enrollmentId: string, evaluationId: string): Promise<EnrollmentEvaluation | null> {
    return await this.ormRepository.findOne({
      where: {
        enrollmentId,
        evaluationId,
        isActive: true,
      },
    });
  }

  async checkAccess(userId: string, evaluationId: string): Promise<boolean> {
    const now = new Date();
    const count = await this.ormRepository.count({
      where: {
        evaluationId,
        isActive: true,
        accessStartDate: LessThanOrEqual(now),
        accessEndDate: MoreThanOrEqual(now),
        enrollment: {
          userId,
          cancelledAt: null,
        },
      },
      relations: {
        enrollment: true,
      },
    });

    return count > 0;
  }
}
