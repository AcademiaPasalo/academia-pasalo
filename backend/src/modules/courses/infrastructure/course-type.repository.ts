import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseType } from '@modules/courses/domain/course-type.entity';

@Injectable()
export class CourseTypeRepository {
  constructor(
    @InjectRepository(CourseType)
    private readonly ormRepository: Repository<CourseType>,
  ) {}

  async findAll(): Promise<CourseType[]> {
    return await this.ormRepository.find({
      order: { name: 'ASC' },
    });
  }
}
