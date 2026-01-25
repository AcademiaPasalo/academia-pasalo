import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { EntityManager } from 'typeorm';
import { SecurityEventType } from '@modules/auth/domain/security-event-type.entity';

@Injectable()
export class SecurityEventTypeRepository {
  constructor(
    @InjectRepository(SecurityEventType)
    private readonly ormRepository: Repository<SecurityEventType>,
  ) {}

  private getRepository(manager?: EntityManager): Repository<SecurityEventType> {
    return manager ? manager.getRepository(SecurityEventType) : this.ormRepository;
  }

  async findByCode(code: string, manager?: EntityManager): Promise<SecurityEventType | null> {
    const repo = this.getRepository(manager);
    return await repo.findOne({
      where: { code },
    });
  }

  async findAll(): Promise<SecurityEventType[]> {
    return await this.ormRepository.find();
  }
}
