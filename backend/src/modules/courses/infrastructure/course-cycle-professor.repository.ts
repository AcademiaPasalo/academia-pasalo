import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CourseCycleProfessor } from '@modules/courses/domain/course-cycle-professor.entity';

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
        revokedAt: null,
      },
      {
        revokedAt: new Date(),
      },
    );
  }
}
