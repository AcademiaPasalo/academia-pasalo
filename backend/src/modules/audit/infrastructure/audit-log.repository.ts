import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '@modules/audit/domain/audit-log.entity';
import type { EntityManager } from 'typeorm';

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
          const query = this.repository.createQueryBuilder('l')
            .leftJoinAndSelect('l.auditAction', 'a')
            .leftJoinAndSelect('l.user', 'u');
      
          if (filters.startDate) {
            query.andWhere('l.eventDatetime >= :startDate', { startDate: filters.startDate });
          }
      
          if (filters.endDate) {
            query.andWhere('l.eventDatetime <= :endDate', { endDate: filters.endDate });
          }
      
          if (filters.userId) {
            query.andWhere('l.userId = :userId', { userId: filters.userId });
          }
      
          return await query
            .orderBy('l.eventDatetime', 'DESC')
            .take(limit)
            .getMany();
        }
      }
      