import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeaturedTestimony } from '@modules/feedback/domain/featured-testimony.entity';

@Injectable()
export class FeaturedTestimonyRepository {
  constructor(
    @InjectRepository(FeaturedTestimony)
    private readonly ormRepository: Repository<FeaturedTestimony>,
  ) {}

  async create(entity: Partial<FeaturedTestimony>): Promise<FeaturedTestimony> {
    const newFeatured = this.ormRepository.create(entity);
    return await this.ormRepository.save(newFeatured);
  }

  async findActiveByCycle(courseCycleId: string): Promise<FeaturedTestimony[]> {
    return await this.ormRepository.find({
      where: { 
        courseCycleId, 
        isActive: true 
      },
      relations: { 
        courseTestimony: {
            user: true
        } 
      },
      order: { displayOrder: 'ASC' },
    });
  }

  async findByTestimonyId(courseTestimonyId: string): Promise<FeaturedTestimony | null> {
    return await this.ormRepository.findOne({
      where: { courseTestimonyId },
    });
  }

  async save(entity: FeaturedTestimony): Promise<FeaturedTestimony> {
      return await this.ormRepository.save(entity);
  }
}