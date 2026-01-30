import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseTestimony } from '@modules/feedback/domain/course-testimony.entity';

@Injectable()
export class CourseTestimonyRepository {
  constructor(
    @InjectRepository(CourseTestimony)
    private readonly ormRepository: Repository<CourseTestimony>,
  ) {}

  async create(entity: Partial<CourseTestimony>): Promise<CourseTestimony> {
    const newTestimony = this.ormRepository.create(entity);
    return await this.ormRepository.save(newTestimony);
  }

  async findByUserAndCycle(userId: string, courseCycleId: string): Promise<CourseTestimony | null> {
    return await this.ormRepository.findOne({
      where: { userId, courseCycleId },
    });
  }

  async findByCycleId(courseCycleId: string): Promise<CourseTestimony[]> {
    return await this.ormRepository.find({
      where: { courseCycleId },
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<CourseTestimony | null> {
    return await this.ormRepository.findOne({
        where: { id },
        relations: { user: true }
    });
  }
}