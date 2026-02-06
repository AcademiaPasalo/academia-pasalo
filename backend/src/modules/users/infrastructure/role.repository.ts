import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { EntityManager } from 'typeorm';
import { Role } from '@modules/users/domain/role.entity';

@Injectable()
export class RoleRepository {
  constructor(
    @InjectRepository(Role)
    private readonly ormRepository: Repository<Role>,
  ) {}

  async findByCode(code: string, manager?: EntityManager): Promise<Role | null> {
    const repo = manager ? manager.getRepository(Role) : this.ormRepository;
    return await repo.findOne({
      where: { code },
    });
  }

  async findById(id: string, manager?: EntityManager): Promise<Role | null> {
    const repo = manager ? manager.getRepository(Role) : this.ormRepository;
    return await repo.findOne({
      where: { id },
    });
  }

  async findAll(): Promise<Role[]> {
    return await this.ormRepository.find();
  }
}
