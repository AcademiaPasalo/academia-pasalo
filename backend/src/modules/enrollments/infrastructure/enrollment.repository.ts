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

  async findActiveByUserAndCourseCycle(
    userId: string, 
    courseCycleId: string, 
    manager?: EntityManager
  ): Promise<Enrollment | null> {
    const repo = manager ? manager.getRepository(Enrollment) : this.ormRepository;
    return await repo.findOne({
      where: {
        userId,
        courseCycleId,
        cancelledAt: IsNull(),
      },
    });
  }

  async findMyEnrollments(userId: string): Promise<Enrollment[]> {
    return await this.ormRepository.createQueryBuilder('enrollment')
      .innerJoinAndSelect('enrollment.courseCycle', 'courseCycle')
      .innerJoinAndSelect('courseCycle.course', 'course')
      .innerJoinAndSelect('course.courseType', 'courseType')
      .innerJoinAndSelect('course.cycleLevel', 'cycleLevel')
      .innerJoinAndSelect('courseCycle.academicCycle', 'academicCycle')
      .leftJoinAndSelect('courseCycle.professors', 'courseCycleProfessor', 'courseCycleProfessor.revokedAt IS NULL')
      .leftJoinAndSelect('courseCycleProfessor.professor', 'professor')
      .where('enrollment.userId = :userId', { userId })
      .andWhere('enrollment.cancelledAt IS NULL')
      .orderBy('enrollment.enrolledAt', 'DESC')
      .getMany();
  }

  async findById(id: string): Promise<Enrollment | null> {
    return await this.ormRepository.findOne({ where: { id } });
  }

  async update(id: string, data: Partial<Enrollment>): Promise<void> {
    await this.ormRepository.update(id, data);
  }
}