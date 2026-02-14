import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from '@modules/materials/domain/material.entity';

@Injectable()
export class MaterialRepository {
  constructor(
    @InjectRepository(Material)
    private readonly ormRepository: Repository<Material>,
  ) {}

  async create(material: Partial<Material>): Promise<Material> {
    const newMaterial = this.ormRepository.create(material);
    return await this.ormRepository.save(newMaterial);
  }

  async findById(id: string): Promise<Material | null> {
    return await this.ormRepository.findOne({
      where: { id },
      relations: {
        fileResource: true,
        fileVersion: true,
      },
    });
  }

  async findByFolderId(folderId: string): Promise<Material[]> {
    return await this.ormRepository.find({
      where: { materialFolderId: folderId },
      relations: {
        fileResource: true,
        fileVersion: true,
      },
      order: { displayName: 'ASC' },
    });
  }
}
