import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, IsNull } from 'typeorm';
import { ClassEventProfessor } from '@modules/events/domain/class-event-professor.entity';

@Injectable()
export class ClassEventProfessorRepository {
  constructor(
    @InjectRepository(ClassEventProfessor)
    private readonly ormRepository: Repository<ClassEventProfessor>,
  ) {}

  async assignProfessor(
    classEventId: string,
    professorUserId: string,
    manager?: EntityManager,
  ): Promise<ClassEventProfessor> {
    const repo = manager ? manager.getRepository(ClassEventProfessor) : this.ormRepository;
    
    const existing = await repo.findOne({
      where: { classEventId, professorUserId },
    });

    if (existing) {
      if (existing.revokedAt) {
        existing.revokedAt = null;
        existing.assignedAt = new Date();
        return await repo.save(existing);
      }
      return existing;
    }

    const assignment = repo.create({
      classEventId,
      professorUserId,
      assignedAt: new Date(),
      revokedAt: null,
    });

    return await repo.save(assignment);
  }

  async revokeProfessor(
    classEventId: string,
    professorUserId: string,
    manager?: EntityManager,
  ): Promise<void> {
    const repo = manager ? manager.getRepository(ClassEventProfessor) : this.ormRepository;
    await repo.update(
      { classEventId, professorUserId },
      { revokedAt: new Date() },
    );
  }

  async findActiveProfessorsByEventId(classEventId: string): Promise<ClassEventProfessor[]> {
    return await this.ormRepository.find({
      where: {
        classEventId,
        revokedAt: IsNull(),
      },
      relations: ['professor'],
    });
  }

  async isProfessorAssigned(
    classEventId: string,
    professorUserId: string,
  ): Promise<boolean> {
    const assignment = await this.ormRepository.findOne({
      where: {
        classEventId,
        professorUserId,
        revokedAt: IsNull(),
      },
    });
    return !!assignment;
  }

  async findByEventId(classEventId: string): Promise<ClassEventProfessor[]> {
    return await this.ormRepository.find({
      where: { classEventId },
      relations: ['professor'],
    });
  }
}
