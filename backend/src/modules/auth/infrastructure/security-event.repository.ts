import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { EntityManager } from 'typeorm';
import { SecurityEvent } from '@modules/auth/domain/security-event.entity';
import { technicalSettings } from '@config/technical-settings';

interface MysqlDeleteResult {
  affectedRows: number;
}

@Injectable()
export class SecurityEventRepository {
  constructor(
    @InjectRepository(SecurityEvent)
    private readonly ormRepository: Repository<SecurityEvent>,
  ) {}

  private getRepository(manager?: EntityManager): Repository<SecurityEvent> {
    return manager ? manager.getRepository(SecurityEvent) : this.ormRepository;
  }

  async create(
    eventData: Omit<
      Partial<SecurityEvent>,
      'userId' | 'securityEventTypeId' | 'eventDatetime'
    > & {
      userId: string;
      securityEventTypeId: string;
      eventDatetime: Date;
    },
    manager?: EntityManager,
  ): Promise<SecurityEvent> {
    const repo = this.getRepository(manager);
    const event = repo.create(eventData);
    return await repo.save(event);
  }

  async findByUserId(userId: string, limit = 50): Promise<SecurityEvent[]> {
    return await this.ormRepository.find({
      where: { userId },
      relations: ['securityEventType'],
      order: { eventDatetime: 'DESC' },
      take: limit,
    });
  }

  async findAll(
    filters: {
      startDate?: Date;
      endDate?: Date;
      userId?: string;
    },
    limit: number,
  ): Promise<SecurityEvent[]> {
    const query = this.ormRepository
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.securityEventType', 'et')
      .leftJoinAndSelect('e.user', 'u');

    if (filters.startDate) {
      query.andWhere('e.eventDatetime >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      query.andWhere('e.eventDatetime <= :endDate', {
        endDate: filters.endDate,
      });
    }

    if (filters.userId) {
      query.andWhere('e.userId = :userId', { userId: filters.userId });
    }

    return await query.orderBy('e.eventDatetime', 'DESC').take(limit).getMany();
  }

  async countByUserIdAndTypeCode(
    userId: string,
    eventTypeCode: string,
    manager?: EntityManager,
  ): Promise<number> {
    const repo = this.getRepository(manager);
    return await repo
      .createQueryBuilder('e')
      .innerJoin('e.securityEventType', 'et')
      .where('e.userId = :userId', { userId })
      .andWhere('et.code = :eventTypeCode', { eventTypeCode })
      .getCount();
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
      const result: MysqlDeleteResult = await this.ormRepository.query(
        'DELETE FROM security_event WHERE event_datetime < ? LIMIT ?',
        [date, batchSize],
      );
      batchDeleted = result.affectedRows || 0;
      totalDeleted += batchDeleted;
      iterationCount++;
    } while (batchDeleted === batchSize && iterationCount < maxBatches);

    return totalDeleted;
  }
}
