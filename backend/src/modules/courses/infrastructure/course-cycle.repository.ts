import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { CourseCycle } from '@modules/courses/domain/course-cycle.entity';

export type AdminCourseCycleListParams = {
  page: number;
  pageSize: number;
  search?: string;
};

export type AdminCourseCycleListRow = {
  courseCycleId: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  academicCycleId: string;
  academicCycleCode: string;
  academicCycleStartDate: Date;
  academicCycleEndDate: Date;
  professors: Array<{
    id: string;
    firstName: string;
    lastName1: string;
    lastName2: string;
    profilePhotoUrl: string | null;
  }>;
};

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

  async findAdminCourseCyclesPage(
    params: AdminCourseCycleListParams,
  ): Promise<{ rows: AdminCourseCycleListRow[]; totalItems: number }> {
    const page = Math.max(1, params.page);
    const pageSize = Math.max(1, params.pageSize);
    const search = params.search?.trim();

    const baseQb = this.ormRepository
      .createQueryBuilder('cc')
      .innerJoin('cc.course', 'c')
      .innerJoin('cc.academicCycle', 'ac');

    if (search) {
      baseQb.andWhere(
        '(c.code LIKE :search OR c.name LIKE :search OR ac.code LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const totalItems = await baseQb.getCount();

    const idsQb = this.ormRepository
      .createQueryBuilder('cc')
      .innerJoin('cc.course', 'c')
      .innerJoin('cc.academicCycle', 'ac')
      .select('cc.id', 'courseCycleId')
      .orderBy('ac.startDate', 'DESC')
      .addOrderBy('c.name', 'ASC')
      .offset((page - 1) * pageSize)
      .limit(pageSize);

    if (search) {
      idsQb.andWhere(
        '(c.code LIKE :search OR c.name LIKE :search OR ac.code LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const idRows = await idsQb.getRawMany<{ courseCycleId: string }>();
    const courseCycleIds = idRows.map((row) => row.courseCycleId);
    if (courseCycleIds.length === 0) {
      return { rows: [], totalItems };
    }

    const entities = await this.ormRepository
      .createQueryBuilder('cc')
      .innerJoinAndSelect('cc.course', 'c')
      .innerJoinAndSelect('cc.academicCycle', 'ac')
      .leftJoinAndSelect('cc.professors', 'ccp', 'ccp.revokedAt IS NULL')
      .leftJoinAndSelect('ccp.professor', 'professor')
      .where('cc.id IN (:...courseCycleIds)', { courseCycleIds })
      .orderBy('ac.startDate', 'DESC')
      .addOrderBy('c.name', 'ASC')
      .getMany();

    const rowMap = new Map<string, AdminCourseCycleListRow>();
    for (const entity of entities) {
      rowMap.set(entity.id, {
        courseCycleId: entity.id,
        courseId: entity.course.id,
        courseCode: entity.course.code,
        courseName: entity.course.name,
        academicCycleId: entity.academicCycle.id,
        academicCycleCode: entity.academicCycle.code,
        academicCycleStartDate: entity.academicCycle.startDate,
        academicCycleEndDate: entity.academicCycle.endDate,
        professors: (entity.professors || []).map((assignment) => ({
          id: assignment.professor.id,
          firstName: assignment.professor.firstName,
          lastName1: assignment.professor.lastName1 || '',
          lastName2: assignment.professor.lastName2 || '',
          profilePhotoUrl: assignment.professor.profilePhotoUrl || null,
        })),
      });
    }

    const orderedRows = courseCycleIds
      .map((courseCycleId) => rowMap.get(courseCycleId))
      .filter((row): row is AdminCourseCycleListRow => !!row);

    return {
      rows: orderedRows.map((row) => ({
        courseCycleId: row.courseCycleId,
        courseId: row.courseId,
        courseCode: row.courseCode,
        courseName: row.courseName,
        academicCycleId: row.academicCycleId,
        academicCycleCode: row.academicCycleCode,
        academicCycleStartDate: row.academicCycleStartDate,
        academicCycleEndDate: row.academicCycleEndDate,
        professors: row.professors,
      })),
      totalItems,
    };
  }
}
