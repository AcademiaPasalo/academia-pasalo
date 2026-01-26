import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, IsNull } from 'typeorm';
import { Enrollment } from '@modules/enrollments/domain/enrollment.entity';

@Injectable()
export class EnrollmentRepository {
  constructor(
    @InjectRepository(Enrollment)
    private readonly ormRepository: Repository<Enrollment>,
  ) {}

  async create(data: Partial<Enrollment>, manager?: EntityManager): Promise<Enrollment> {
    const repo = manager ? manager.getRepository(Enrollment) : this.ormRepository;
    const enrollment = repo.create(data);
    return await repo.save(enrollment);
  }

  async findActiveByUserAndCourseCycle(userId: string, courseCycleId: string): Promise<Enrollment | null> {
    return await this.ormRepository.findOne({
      where: {
        userId,
        courseCycleId,
        cancelledAt: IsNull(),
      },
    });
  }
}