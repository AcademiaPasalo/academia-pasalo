import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, IsNull } from 'typeorm';
import { CourseCycleProfessor } from '@modules/courses/domain/course-cycle-professor.entity';
import { Evaluation } from '@modules/evaluations/domain/evaluation.entity';

@Injectable()
export class CourseCycleProfessorRepository {
  constructor(
    @InjectRepository(CourseCycleProfessor)
    private readonly ormRepository: Repository<CourseCycleProfessor>,
  ) {}

  async findActive(
    courseCycleId: string,
    professorUserId: string,
    manager?: EntityManager,
  ): Promise<CourseCycleProfessor | null> {
    const repo = manager
      ? manager.getRepository(CourseCycleProfessor)
      : this.ormRepository;
    return await repo.findOne({
      where: {
        courseCycleId,
        professorUserId,
        revokedAt: null,
      },
    });
  }

  async upsertAssign(
    courseCycleId: string,
    professorUserId: string,
    manager?: EntityManager,
  ): Promise<CourseCycleProfessor> {
    const repo = manager
      ? manager.getRepository(CourseCycleProfessor)
      : this.ormRepository;

    const existing = await repo.findOne({
      where: {
        courseCycleId,
        professorUserId,
      },
    });

    const now = new Date();

    if (!existing) {
      const created = repo.create({
        courseCycleId,
        professorUserId,
        assignedAt: now,
        revokedAt: null,
      });
      return await repo.save(created);
    }

    existing.assignedAt = now;
    existing.revokedAt = null;
    return await repo.save(existing);
  }

  async isProfessorAssigned(
    courseCycleId: string,
    professorUserId: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    const repo = manager
      ? manager.getRepository(CourseCycleProfessor)
      : this.ormRepository;

    const result = await repo
      .createQueryBuilder('ccp')
      .select('1', 'exists')
      .where('ccp.course_cycle_id = :courseCycleId', { courseCycleId })
      .andWhere('ccp.professor_user_id = :professorUserId', { professorUserId })
      .andWhere('ccp.revoked_at IS NULL')
      .limit(1)
      .getRawOne<{ exists: string }>();

    return !!result;
  }

  async isProfessorAssignedToEvaluation(
    evaluationId: string,
    professorUserId: string,
    manager?: EntityManager,
  ): Promise<boolean>;
  async isProfessorAssignedToEvaluation(
    evaluationIds: string[],
    professorUserId: string,
    manager?: EntityManager,
  ): Promise<Map<string, boolean>>;
  async isProfessorAssignedToEvaluation(
    evaluationIdOrIds: string | string[],
    professorUserId: string,
    manager?: EntityManager,
  ): Promise<boolean | Map<string, boolean>> {
    const repo = manager
      ? manager.getRepository(CourseCycleProfessor)
      : this.ormRepository;

    const isArray = Array.isArray(evaluationIdOrIds);
    const ids: string[] = isArray ? evaluationIdOrIds : [evaluationIdOrIds];

    if (ids.length === 0) {
      return isArray ? new Map() : false;
    }

    const query = repo
      .createQueryBuilder('ccp')
      .select('ev.id', 'evaluationId')
      .innerJoin(Evaluation, 'ev', 'ev.course_cycle_id = ccp.course_cycle_id')
      .where('ev.id IN (:...ids)', { ids })
      .andWhere('ccp.professor_user_id = :professorUserId', { professorUserId })
      .andWhere('ccp.revoked_at IS NULL');

    const results = await query.getRawMany<{ evaluationId: string }>();

    if (!isArray) {
      return results.length > 0;
    }

    const resultMap = new Map<string, boolean>();
    ids.forEach((id) => resultMap.set(id, false));
    results.forEach((r) => resultMap.set(r.evaluationId, true));

    return resultMap;
  }

  async revoke(
    courseCycleId: string,
    professorUserId: string,
    manager?: EntityManager,
  ): Promise<void> {
    const repo = manager
      ? manager.getRepository(CourseCycleProfessor)
      : this.ormRepository;
    await repo.update(
      {
        courseCycleId,
        professorUserId,
        revokedAt: IsNull(),
      },
      {
        revokedAt: new Date(),
      },
    );
  }

  async findByCourseCycleId(
    courseCycleId: string,
  ): Promise<CourseCycleProfessor[]> {
    return await this.ormRepository
      .createQueryBuilder('ccp')
      .innerJoinAndSelect('ccp.professor', 'professor')
      .where('ccp.course_cycle_id = :courseCycleId', { courseCycleId })
      .andWhere('ccp.revoked_at IS NULL')
      .andWhere('professor.is_active = :isActive', { isActive: true })
      .getMany();
  }
}
