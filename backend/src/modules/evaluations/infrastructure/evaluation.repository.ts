import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Evaluation } from '@modules/evaluations/domain/evaluation.entity';
import { EvaluationType } from '@modules/evaluations/domain/evaluation-type.entity';

@Injectable()
export class EvaluationRepository {
  constructor(
    @InjectRepository(Evaluation)
    private readonly evaluationOrm: Repository<Evaluation>,
    @InjectRepository(EvaluationType)
    private readonly typeOrm: Repository<EvaluationType>,
  ) {}

  async findTypeByCode(code: string, manager?: EntityManager): Promise<EvaluationType | null> {
    const repo = manager ? manager.getRepository(EvaluationType) : this.typeOrm;
    return await repo.findOne({ where: { code } });
  }

  async findByCourseCycle(courseCycleId: string): Promise<Evaluation[]> {
    return await this.evaluationOrm.find({
      where: { courseCycleId },
      relations: ['evaluationType'],
      order: { number: 'ASC' },
    });
  }

  async findById(id: string): Promise<Evaluation | null> {
    return await this.evaluationOrm.findOne({ where: { id } });
  }

  async create(data: Partial<Evaluation>, manager?: EntityManager): Promise<Evaluation> {
    const repo = manager ? manager.getRepository(Evaluation) : this.evaluationOrm;
    const evaluation = repo.create(data);
    return await repo.save(evaluation);
  }

  async findAllWithUserAccess(courseCycleId: string, userId: string): Promise<Evaluation[]> {
    return await this.evaluationOrm.createQueryBuilder('evaluation')
      .innerJoinAndSelect('evaluation.evaluationType', 'evaluationType')
      .leftJoinAndSelect(
        'evaluation.enrollmentEvaluations',
        'access',
        'access.enrollmentId IN (SELECT id FROM enrollment WHERE user_id = :userId AND course_cycle_id = :courseCycleId AND cancelled_at IS NULL)',
        { userId, courseCycleId }
      )
      .where('evaluation.courseCycleId = :courseCycleId', { courseCycleId })
      .orderBy('evaluation.number', 'ASC')
      .getMany();
  }
}