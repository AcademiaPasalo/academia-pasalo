import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { CourseCycle } from '@modules/courses/domain/course-cycle.entity';

@Injectable()
export class CourseCycleRepository {
  constructor(
    @InjectRepository(CourseCycle)
    private readonly ormRepository: Repository<CourseCycle>,
  ) {}

  async create(
    data: Partial<CourseCycle>,
    manager?: EntityManager,
  ): Promise<CourseCycle> {
    const repo = manager
      ? manager.getRepository(CourseCycle)
      : this.ormRepository;
    const courseCycle = repo.create(data);
    return await repo.save(courseCycle);
  }

  async findByCourseAndCycle(
    courseId: string,
    cycleId: string,
  ): Promise<CourseCycle | null> {
    return await this.ormRepository.findOne({
      where: {
        courseId,
        academicCycleId: cycleId,
      },
    });
  }

  async findById(id: string): Promise<CourseCycle | null> {
    return await this.ormRepository.findOne({
      where: { id },
      relations: { academicCycle: true },
    });
  }

  async findFullById(id: string): Promise<CourseCycle | null> {
    return await this.ormRepository.findOne({
      where: { id },
      relations: {
        academicCycle: true,
        course: true,
      },
    });
  }

  async findPreviousByCourseId(
    courseId: string,
    currentCycleStartDate: Date,
  ): Promise<CourseCycle[]> {
    return await this.ormRepository
      .createQueryBuilder('cc')
      .innerJoinAndSelect('cc.academicCycle', 'ac')
      .where('cc.courseId = :courseId', { courseId })
      .andWhere('ac.startDate < :currentCycleStartDate', {
        currentCycleStartDate,
      })
      .orderBy('ac.startDate', 'DESC')
      .getMany();
  }

  async findAccessiblePreviousByCourseIdAndUserId(
    courseId: string,
    currentCycleStartDate: Date,
    userId: string,
  ): Promise<CourseCycle[]> {
    return await this.ormRepository
      .createQueryBuilder('cc')
      .innerJoinAndSelect('cc.academicCycle', 'ac')
      .where('cc.courseId = :courseId', { courseId })
      .andWhere('ac.startDate < :currentCycleStartDate', {
        currentCycleStartDate,
      })
      .andWhere(
        `EXISTS (
          SELECT 1
          FROM evaluation ev
          INNER JOIN enrollment_evaluation ee
            ON ee.evaluation_id = ev.id
            AND ee.is_active = 1
          INNER JOIN enrollment e
            ON e.id = ee.enrollment_id
            AND e.user_id = :userId
            AND e.cancelled_at IS NULL
          WHERE ev.course_cycle_id = cc.id
        )`,
        { userId },
      )
      .orderBy('ac.startDate', 'DESC')
      .getMany();
  }

  async hasAccessiblePreviousByCourseIdAndUserId(
    courseId: string,
    currentCycleStartDate: Date,
    userId: string,
  ): Promise<boolean> {
    const row = await this.ormRepository
      .createQueryBuilder('cc')
      .select('1', 'exists')
      .innerJoin('cc.academicCycle', 'ac')
      .where('cc.courseId = :courseId', { courseId })
      .andWhere('ac.startDate < :currentCycleStartDate', {
        currentCycleStartDate,
      })
      .andWhere(
        `EXISTS (
          SELECT 1
          FROM evaluation ev
          INNER JOIN enrollment_evaluation ee
            ON ee.evaluation_id = ev.id
            AND ee.is_active = 1
          INNER JOIN enrollment e
            ON e.id = ee.enrollment_id
            AND e.user_id = :userId
            AND e.cancelled_at IS NULL
          WHERE ev.course_cycle_id = cc.id
        )`,
        { userId },
      )
      .limit(1)
      .getRawOne<{ exists: string }>();

    return !!row;
  }

  async findByCourseIdAndCycleCode(
    courseId: string,
    cycleCode: string,
  ): Promise<CourseCycle | null> {
    return await this.ormRepository
      .createQueryBuilder('cc')
      .innerJoinAndSelect('cc.academicCycle', 'ac')
      .where('cc.courseId = :courseId', { courseId })
      .andWhere('ac.code = :cycleCode', { cycleCode })
      .getOne();
  }
}
