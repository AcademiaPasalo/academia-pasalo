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

  async create(data: Partial<CourseCycle>, manager?: EntityManager): Promise<CourseCycle> {
    const repo = manager ? manager.getRepository(CourseCycle) : this.ormRepository;
    const courseCycle = repo.create(data);
    return await repo.save(courseCycle);
  }

  async findByCourseAndCycle(courseId: string, cycleId: string): Promise<CourseCycle | null> {
    return await this.ormRepository.findOne({
      where: {
        courseId,
        academicCycleId: cycleId,
      },
    });
  }
}
