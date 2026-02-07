import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { EntityManager } from 'typeorm';
import { User } from '@modules/users/domain/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly ormRepository: Repository<User>,
  ) {}

  private getRepository(manager?: EntityManager): Repository<User> {
    return manager ? manager.getRepository(User) : this.ormRepository;
  }

  async create(
    userData: Omit<Partial<User>, 'createdAt' | 'updatedAt'> & {
      createdAt: Date;
      updatedAt: Date | null;
    },
    manager?: EntityManager,
  ): Promise<User> {
    const repo = this.getRepository(manager);
    const user = repo.create(userData);
    return await repo.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.ormRepository.find({
      relations: ['roles'],
    });
  }

  async findById(id: string, manager?: EntityManager): Promise<User | null> {
    const repo = this.getRepository(manager);
    return await repo.findOne({
      where: { id },
      relations: ['roles'],
    });
  }

  async findByEmail(
    email: string,
    manager?: EntityManager,
  ): Promise<User | null> {
    const repo = this.getRepository(manager);
    return await repo.findOne({
      where: { email },
      relations: ['roles'],
    });
  }

  async delete(id: string, manager?: EntityManager): Promise<void> {
    const repo = this.getRepository(manager);
    await repo.delete(id);
  }

  async save(user: User, manager?: EntityManager): Promise<User> {
    const repo = this.getRepository(manager);
    return await repo.save(user);
  }
}
