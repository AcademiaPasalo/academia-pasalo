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

  async findByCourseCycle(courseCycleId: string, manager?: EntityManager): Promise<Evaluation[]> {
    const repo = manager ? manager.getRepository(Evaluation) : this.evaluationOrm;
    return await repo.find({
      where: { courseCycleId },
      relations: { evaluationType: true },
    });
  }

  async findByIds(ids: string[], manager?: EntityManager): Promise<Evaluation[]> {
    const repo = manager ? manager.getRepository(Evaluation) : this.evaluationOrm;
    return await repo.find({
      where: ids.map(id => ({ id })),
      relations: { evaluationType: true },
    });
  }

  async create(data: Partial<Evaluation>, manager?: EntityManager): Promise<Evaluation> {
    const repo = manager ? manager.getRepository(Evaluation) : this.evaluationOrm;
    const evaluation = repo.create(data);
    return await repo.save(evaluation);
  }
}