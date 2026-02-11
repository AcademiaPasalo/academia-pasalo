import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { EntityManager } from 'typeorm';
import { SessionStatus } from '@modules/auth/domain/session-status.entity';

@Injectable()
export class SessionStatusRepository {
  constructor(
    @InjectRepository(SessionStatus)
    private readonly ormRepository: Repository<SessionStatus>,
  ) {}

  private getRepository(manager?: EntityManager): Repository<SessionStatus> {
    return manager ? manager.getRepository(SessionStatus) : this.ormRepository;
  }

  async findByCode(
    code: string,
    manager?: EntityManager,
  ): Promise<SessionStatus | null> {
    const repo = this.getRepository(manager);
    return await repo.findOne({
      where: { code },
    });
  }

  async findAll(manager?: EntityManager): Promise<SessionStatus[]> {
    const repo = this.getRepository(manager);
    return await repo.find();
  }
}
