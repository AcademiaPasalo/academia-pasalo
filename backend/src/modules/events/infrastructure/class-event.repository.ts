import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, Brackets } from 'typeorm';
import { ClassEvent } from '@modules/events/domain/class-event.entity';

@Injectable()
export class ClassEventRepository {
  constructor(
    @InjectRepository(ClassEvent)
    private readonly ormRepository: Repository<ClassEvent>,
  ) {}

  async create(
    data: Partial<ClassEvent>,
    manager?: EntityManager,
  ): Promise<ClassEvent> {
    const repo = manager
      ? manager.getRepository(ClassEvent)
      : this.ormRepository;
    const classEvent = repo.create(data);
    return await repo.save(classEvent);
  }

  async findById(id: string): Promise<ClassEvent | null> {
    return await this.ormRepository
      .createQueryBuilder('classEvent')
      .leftJoinAndSelect('classEvent.evaluation', 'evaluation')
      .leftJoinAndSelect('evaluation.courseCycle', 'courseCycle')
      .leftJoinAndSelect('courseCycle.course', 'course')
      .leftJoinAndSelect('courseCycle.academicCycle', 'academicCycle')
      .leftJoinAndSelect('classEvent.creator', 'creator')
      .leftJoinAndSelect(
        'classEvent.professors',
        'professors',
        'professors.revokedAt IS NULL',
      )
      .leftJoinAndSelect('professors.professor', 'professor')
      .where('classEvent.id = :id', { id })
      .getOne();
  }

  async findByIdSimple(
    id: string,
    manager?: EntityManager,
  ): Promise<ClassEvent | null> {
    const repo = manager
      ? manager.getRepository(ClassEvent)
      : this.ormRepository;
    return await repo.findOne({ where: { id } });
  }

  async findByEvaluationId(evaluationId: string): Promise<ClassEvent[]> {
    return await this.ormRepository
      .createQueryBuilder('classEvent')
      .leftJoinAndSelect('classEvent.evaluation', 'evaluation')
      .leftJoinAndSelect('evaluation.courseCycle', 'courseCycle')
      .leftJoinAndSelect('courseCycle.course', 'course')
      .leftJoinAndSelect('classEvent.creator', 'creator')
      .leftJoinAndSelect(
        'classEvent.professors',
        'professors',
        'professors.revokedAt IS NULL',
      )
      .leftJoinAndSelect('professors.professor', 'professor')
      .where('classEvent.evaluationId = :evaluationId', { evaluationId })
      .orderBy('classEvent.sessionNumber', 'ASC')
      .getMany();
  }

  async findByEvaluationAndSessionNumber(
    evaluationId: string,
    sessionNumber: number,
    manager?: EntityManager,
  ): Promise<ClassEvent | null> {
    const repo = manager
      ? manager.getRepository(ClassEvent)
      : this.ormRepository;
    return await repo.findOne({
      where: {
        evaluationId,
        sessionNumber,
      },
    });
  }

  async findUpcomingByEvaluationId(
    evaluationId: string,
  ): Promise<ClassEvent[]> {
    return await this.ormRepository
      .createQueryBuilder('classEvent')
      .leftJoinAndSelect('classEvent.evaluation', 'evaluation')
      .leftJoinAndSelect('evaluation.courseCycle', 'courseCycle')
      .leftJoinAndSelect('courseCycle.course', 'course')
      .leftJoinAndSelect('classEvent.creator', 'creator')
      .leftJoinAndSelect(
        'classEvent.professors',
        'professors',
        'professors.revokedAt IS NULL',
      )
      .leftJoinAndSelect('professors.professor', 'professor')
      .where('classEvent.evaluationId = :evaluationId', { evaluationId })
      .andWhere('classEvent.isCancelled = :isCancelled', { isCancelled: false })
      .andWhere('classEvent.endDatetime > :now', { now: new Date() })
      .orderBy('classEvent.startDatetime', 'ASC')
      .getMany();
  }

  async update(
    id: string,
    data: Partial<ClassEvent>,
    manager?: EntityManager,
  ): Promise<ClassEvent> {
    const repo = manager
      ? manager.getRepository(ClassEvent)
      : this.ormRepository;
    await repo.update(id, { ...data, updatedAt: new Date() });
    const updated = await repo.findOne({ where: { id } });
    if (!updated) {
      throw new Error('Evento de clase no encontrado despues de actualizar');
    }
    return updated;
  }

  async cancelEvent(id: string, manager?: EntityManager): Promise<void> {
    const repo = manager
      ? manager.getRepository(ClassEvent)
      : this.ormRepository;
    await repo.update(id, {
      isCancelled: true,
      updatedAt: new Date(),
    });
  }

  async findByUserAndRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ClassEvent[]> {
    const qb = this.ormRepository
      .createQueryBuilder('classEvent')
      .leftJoinAndSelect('classEvent.evaluation', 'evaluation')
      .leftJoinAndSelect('evaluation.courseCycle', 'courseCycle')
      .leftJoinAndSelect('courseCycle.course', 'course')
      .leftJoinAndSelect('classEvent.creator', 'creator')
      .leftJoinAndSelect(
        'classEvent.professors',
        'professors',
        'professors.revokedAt IS NULL',
      )
      .leftJoinAndSelect('professors.professor', 'professor');

    return await qb
      .where('classEvent.startDatetime BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere(
        new Brackets((where) => {
          where
            .where('classEvent.createdBy = :userId', { userId })
            .orWhere(
              `EXISTS (
                SELECT 1
                FROM class_event_professor cep
                WHERE cep.class_event_id = classEvent.id
                  AND cep.professor_user_id = :userId
                  AND cep.revoked_at IS NULL
              )`,
              { userId },
            )
            .orWhere(
              `EXISTS (
                SELECT 1
                FROM enrollment_evaluation ee
                INNER JOIN enrollment e
                  ON e.id = ee.enrollment_id
                WHERE ee.evaluation_id = classEvent.evaluation_id
                  AND ee.is_active = 1
                  AND ee.access_start_date <= UTC_TIMESTAMP()
                  AND ee.access_end_date >= UTC_TIMESTAMP()
                  AND e.user_id = :userId
                  AND e.cancelled_at IS NULL
              )`,
              { userId },
            );
        }),
      )
      .orderBy('classEvent.startDatetime', 'ASC')
      .getMany();
  }
}
