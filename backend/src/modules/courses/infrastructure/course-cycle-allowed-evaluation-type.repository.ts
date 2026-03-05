import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { CourseCycleAllowedEvaluationType } from '@modules/courses/domain/course-cycle-allowed-evaluation-type.entity';

@Injectable()
export class CourseCycleAllowedEvaluationTypeRepository {
  constructor(
    @InjectRepository(CourseCycleAllowedEvaluationType)
    private readonly ormRepository: Repository<CourseCycleAllowedEvaluationType>,
  ) {}

  async findActiveByCourseCycleId(
    courseCycleId: string,
    manager?: EntityManager,
  ): Promise<CourseCycleAllowedEvaluationType[]> {
    const repo = manager
      ? manager.getRepository(CourseCycleAllowedEvaluationType)
      : this.ormRepository;

    return await repo.find({
      where: {
        courseCycleId,
        isActive: true,
      },
      order: { id: 'ASC' },
    });
  }

  async findActiveWithTypeByCourseCycleId(
    courseCycleId: string,
  ): Promise<CourseCycleAllowedEvaluationType[]> {
    return await this.ormRepository.find({
      where: {
        courseCycleId,
        isActive: true,
      },
      relations: ['evaluationType'],
      order: {
        evaluationType: { code: 'ASC' },
        id: 'ASC',
      },
    });
  }

  async replaceAllowedTypes(
    courseCycleId: string,
    evaluationTypeIds: string[],
    manager?: EntityManager,
  ): Promise<void> {
    const repo = manager
      ? manager.getRepository(CourseCycleAllowedEvaluationType)
      : this.ormRepository;

    await repo.update(
      { courseCycleId },
      { isActive: false, updatedAt: new Date() },
    );

    if (evaluationTypeIds.length === 0) {
      return;
    }

    const now = new Date();
    const existing = await repo.find({
      where: {
        courseCycleId,
        evaluationTypeId: In(evaluationTypeIds),
      },
    });
    const existingMap = new Map(
      existing.map((row) => [String(row.evaluationTypeId), row]),
    );

    const toInsert: CourseCycleAllowedEvaluationType[] = [];
    for (const evaluationTypeId of evaluationTypeIds) {
      const row = existingMap.get(String(evaluationTypeId));
      if (row) {
        row.isActive = true;
        row.updatedAt = now;
      } else {
        toInsert.push(
          repo.create({
            courseCycleId,
            evaluationTypeId,
            isActive: true,
            createdAt: now,
            updatedAt: null,
          }),
        );
      }
    }

    const selectedIdSet = new Set(evaluationTypeIds);
    const toUpdate = existing.filter((row) =>
      selectedIdSet.has(String(row.evaluationTypeId)),
    );

    if (toUpdate.length > 0) {
      await repo.save(toUpdate);
    }
    if (toInsert.length > 0) {
      await repo.save(toInsert);
    }
  }
}
