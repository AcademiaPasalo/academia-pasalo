import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '@modules/audit/domain/audit-log.entity';
import { technicalSettings } from '@config/technical-settings';
import type { EntityManager } from 'typeorm';

interface MysqlDeleteResult {
  affectedRows: number;
}

@Injectable()
export class AuditLogRepository {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repository: Repository<AuditLog>,
  ) {}

  async create(
    data: Partial<AuditLog>,
    manager?: EntityManager,
  ): Promise<AuditLog> {
    const repo = manager ? manager.getRepository(AuditLog) : this.repository;
    const entity = repo.create(data);
    return await repo.save(entity);
  }

  async findAll(
    filters: {
      startDate?: Date;
      endDate?: Date;
      userId?: string;
    },
    limit: number,
  ): Promise<AuditLog[]> {
    const query = this.repository
      .createQueryBuilder('l')
      .leftJoinAndSelect('l.auditAction', 'a')
      .leftJoinAndSelect('l.user', 'u');

    if (filters.startDate) {
      query.andWhere('l.eventDatetime >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      query.andWhere('l.eventDatetime <= :endDate', {
        endDate: filters.endDate,
      });
    }

    if (filters.userId) {
      query.andWhere('l.userId = :userId', { userId: filters.userId });
    }

    return await query.orderBy('l.eventDatetime', 'DESC').take(limit).getMany();
  }

  async deleteOlderThan(
    date: Date,
    batchSize = technicalSettings.audit.cleanupBatchSize,
  ): Promise<number> {
    let totalDeleted = 0;
    let batchDeleted = 0;
    let iterationCount = 0;
    const maxBatches = technicalSettings.audit.maxCleanupBatchesPerRun;

    do {
      const result: MysqlDeleteResult = await this.repository.query(
        'DELETE FROM audit_log WHERE event_datetime < ? LIMIT ?',
        [date, batchSize],
      );
      batchDeleted = result.affectedRows || 0;
      totalDeleted += batchDeleted;
      iterationCount++;
    } while (batchDeleted === batchSize && iterationCount < maxBatches);

    return totalDeleted;
  }
}
