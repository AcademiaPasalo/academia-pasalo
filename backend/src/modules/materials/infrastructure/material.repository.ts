import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Material } from '@modules/materials/domain/material.entity';

@Injectable()
export class MaterialRepository {
  constructor(
    @InjectRepository(Material)
    private readonly ormRepository: Repository<Material>,
  ) {}

  async create(data: Partial<Material>, manager?: EntityManager): Promise<Material> {
    const repo = manager ? manager.getRepository(Material) : this.ormRepository;
    const material = repo.create({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return await repo.save(material);
  }

  async findById(id: string): Promise<Material | null> {
    return await this.ormRepository.findOne({
      where: { id },
      relations: { fileResource: true },
    });
  }
}
