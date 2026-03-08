import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, Brackets } from 'typeorm';
import { ClassEvent } from '@modules/events/domain/class-event.entity';

export type GlobalSessionRow = {
  eventId: string;
  evaluationId: string;
  sessionNumber: number;
  title: string;
  topic: string;
  startDatetime: Date;
  endDatetime: Date;
  courseCycleId: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  primaryColor: string | null;
  secondaryColor: string | null;
};

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
      .leftJoinAndSelect('classEvent.recordingStatus', 'recordingStatus')
      .leftJoinAndSelect('classEvent.evaluation', 'evaluation')
      .leftJoinAndSelect('evaluation.evaluationType', 'evaluationType')
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
      .leftJoinAndSelect('classEvent.recordingStatus', 'recordingStatus')
      .leftJoinAndSelect('classEvent.evaluation', 'evaluation')
      .leftJoinAndSelect('evaluation.evaluationType', 'evaluationType')
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
      .leftJoinAndSelect('evaluation.evaluationType', 'evaluationType')
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

  async findOverlap(
    courseCycleId: string,
    start: Date,
    end: Date,
    excludeEventId?: string,
    manager?: EntityManager,
  ): Promise<ClassEvent | null> {
    const repo = manager
      ? manager.getRepository(ClassEvent)
      : this.ormRepository;

    const qb = repo
      .createQueryBuilder('ce')
      .select(['ce.id', 'ce.sessionNumber', 'ev.id', 'ev.number', 'et.name'])
      .innerJoin('ce.evaluation', 'ev')
      .innerJoin('ev.evaluationType', 'et')
      .innerJoin('ev.courseCycle', 'cc')
      .innerJoin('cc.course', 'course')
      .innerJoin('course_cycle', 'targetCc', 'targetCc.id = :courseCycleId', {
        courseCycleId,
      })
      .innerJoin(
        'course',
        'targetCourse',
        'targetCourse.id = targetCc.course_id',
      )
      .where('cc.academic_cycle_id = targetCc.academic_cycle_id')
      .andWhere('course.course_type_id = targetCourse.course_type_id')
      .andWhere('ce.is_cancelled = :isCancelled', { isCancelled: false })
      .andWhere(
        new Brackets((qb) => {
          qb.where(':start < ce.end_datetime AND :end > ce.start_datetime', {
            start,
            end,
          });
        }),
      );

    if (excludeEventId) {
      qb.andWhere('ce.id != :excludeEventId', { excludeEventId });
    }

    return await qb.getOne();
  }

  async findByUserAndRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ClassEvent[]> {
    const now = new Date();
    const qb = this.ormRepository
      .createQueryBuilder('classEvent')
      .leftJoinAndSelect('classEvent.recordingStatus', 'recordingStatus')
      .leftJoinAndSelect('classEvent.evaluation', 'evaluation')
      .leftJoinAndSelect('evaluation.evaluationType', 'evaluationType')
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
      .andWhere('classEvent.isCancelled = :isCancelled', {
        isCancelled: false,
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
                  AND ee.access_start_date <= :now
                  AND ee.access_end_date >= :now
                  AND e.user_id = :userId
                  AND e.cancelled_at IS NULL
              )`,
              { userId, now },
            );
        }),
      )
      .orderBy('classEvent.startDatetime', 'ASC')
      .getMany();
  }

  async findGlobalSessionsByCourseCyclesAndRange(
    courseCycleIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<GlobalSessionRow[]> {
    if (courseCycleIds.length === 0) {
      return [];
    }

    const rows = await this.ormRepository
      .createQueryBuilder('ce')
      .innerJoin('ce.evaluation', 'ev')
      .innerJoin('ev.courseCycle', 'cc')
      .innerJoin('cc.course', 'course')
      .where('cc.id IN (:...courseCycleIds)', { courseCycleIds })
      .andWhere('ce.is_cancelled = :isCancelled', { isCancelled: false })
      .andWhere(
        ':startDate < ce.end_datetime AND :endDate > ce.start_datetime',
        {
          startDate,
          endDate,
        },
      )
      .select([
        'ce.id AS eventId',
        'ce.evaluation_id AS evaluationId',
        'ce.session_number AS sessionNumber',
        'ce.title AS title',
        'ce.topic AS topic',
        'ce.start_datetime AS startDatetime',
        'ce.end_datetime AS endDatetime',
        'cc.id AS courseCycleId',
        'course.id AS courseId',
        'course.code AS courseCode',
        'course.name AS courseName',
        'course.primary_color AS primaryColor',
        'course.secondary_color AS secondaryColor',
      ])
      .orderBy('ce.start_datetime', 'ASC')
      .getRawMany<GlobalSessionRow>();

    return rows.map((row) => ({
      eventId: row.eventId,
      evaluationId: row.evaluationId,
      sessionNumber: Number(row.sessionNumber),
      title: row.title,
      topic: row.topic,
      startDatetime: row.startDatetime,
      endDatetime: row.endDatetime,
      courseCycleId: row.courseCycleId,
      courseId: row.courseId,
      courseCode: row.courseCode,
      courseName: row.courseName,
      primaryColor: row.primaryColor || null,
      secondaryColor: row.secondaryColor || null,
    }));
  }

  async findAffectedScheduleUserIdsByEvaluation(
    evaluationId: string,
  ): Promise<string[]> {
    const now = new Date();
    const rawRows: unknown = await this.ormRepository.query(
      `
        SELECT DISTINCT affected.user_id AS userId
        FROM (
          SELECT ce.created_by AS user_id
          FROM class_event ce
          WHERE ce.evaluation_id = ?

          UNION

          SELECT cep.professor_user_id AS user_id
          FROM class_event ce
          INNER JOIN class_event_professor cep
            ON cep.class_event_id = ce.id
           AND cep.revoked_at IS NULL
          WHERE ce.evaluation_id = ?

          UNION

          SELECT e.user_id AS user_id
          FROM enrollment_evaluation ee
          INNER JOIN enrollment e
            ON e.id = ee.enrollment_id
          WHERE ee.evaluation_id = ?
            AND ee.is_active = 1
            AND ee.access_start_date <= ?
            AND ee.access_end_date >= ?
            AND e.cancelled_at IS NULL
        ) affected
        WHERE affected.user_id IS NOT NULL
      `,
      [evaluationId, evaluationId, evaluationId, now, now],
    );
    const rows = Array.isArray(rawRows)
      ? (rawRows as Array<{ userId?: string | null; user_id?: string | null }>)
      : [];

    return rows
      .map((row) => row.userId ?? row.user_id)
      .filter((userId: string | undefined): userId is string => !!userId);
  }
}
