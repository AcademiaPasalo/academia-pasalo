import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '@modules/courses/domain/course.entity';

@Injectable()
export class CourseRepository {
  constructor(
    @InjectRepository(Course)
    private readonly ormRepository: Repository<Course>,
  ) {}

  async findAll(): Promise<Course[]> {
    return await this.ormRepository.find({
      relations: {
        courseType: true,
        cycleLevel: true,
      },
      order: { name: 'ASC' },
    });
  }

  async findById(id: string): Promise<Course | null> {
    return await this.ormRepository.findOne({
      where: { id },
      relations: {
        courseType: true,
        cycleLevel: true,
      },
    });
  }

  async findByCode(code: string): Promise<Course | null> {
    return await this.ormRepository.findOne({
      where: { code },
    });
  }
}
