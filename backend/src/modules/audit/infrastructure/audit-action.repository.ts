import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditAction } from '@modules/audit/domain/audit-action.entity';
import type { EntityManager } from 'typeorm';

@Injectable()
export class AuditActionRepository {
  constructor(
    @InjectRepository(AuditAction)
    private readonly repository: Repository<AuditAction>,
  ) {}

  async findByCode(
    code: string,
    manager?: EntityManager,
  ): Promise<AuditAction | null> {
    const repo = manager ? manager.getRepository(AuditAction) : this.repository;
    return await repo.findOne({ where: { code } });
  }
}
