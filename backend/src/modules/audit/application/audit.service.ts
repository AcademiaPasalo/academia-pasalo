import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { AuditLogRepository } from '@modules/audit/infrastructure/audit-log.repository';
import { AuditActionRepository } from '@modules/audit/infrastructure/audit-action.repository';
import { SecurityEventRepository } from '@modules/auth/infrastructure/security-event.repository';
import { AuditLog } from '@modules/audit/domain/audit-log.entity';
import { UnifiedAuditHistoryDto } from '@modules/audit/dto/unified-audit-history.dto';
import type { EntityManager } from 'typeorm';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private readonly actionIdCache = new Map<string, string>();

  constructor(
    private readonly auditLogRepository: AuditLogRepository,
    private readonly auditActionRepository: AuditActionRepository,
    private readonly securityEventRepository: SecurityEventRepository,
  ) {}

  async logAction(
    userId: string,
    actionCode: string,
    entityType?: string,
    entityId?: string,
    manager?: EntityManager,
  ): Promise<AuditLog> {
    let actionId = this.actionIdCache.get(actionCode);

    if (!actionId) {
      const action = await this.auditActionRepository.findByCode(actionCode, manager);
      
      if (!action) {
        this.logger.error(JSON.stringify({
          level: 'error',
          context: AuditService.name,
          message: 'Critical: Audit action code not configured in DB',
          actionCode,
          userId,
        }));
        throw new InternalServerErrorException('Error de integridad: Código de auditoría no válido');
      }
      
      actionId = action.id;
      this.actionIdCache.set(actionCode, actionId);
    }

    const log = await this.auditLogRepository.create({
      userId,
      auditActionId: actionId,
      eventDatetime: new Date(),
      entityType: entityType || null,
      entityId: entityId || null,
    }, manager);

    return log;
  }

  async getUnifiedHistory(filters: {
    startDate?: string;
    endDate?: string;
    userId?: string;
    limit?: number;
  }): Promise<UnifiedAuditHistoryDto[]> {
    const parsedFilters = {
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
      userId: filters.userId,
    };
    
    const safeLimit = filters.limit ? Math.min(filters.limit, 100) : 50; 

    const [securityEvents, auditLogs] = await Promise.all([
      this.securityEventRepository.findAll(parsedFilters, safeLimit),
      this.auditLogRepository.findAll(parsedFilters, safeLimit),
    ]);

    const unifiedHistory: UnifiedAuditHistoryDto[] = [
      ...securityEvents.map((e) => ({
        id: `sec-${e.id}`,
        datetime: e.eventDatetime,
        userId: e.userId,
        userName: e.user ? `${e.user.firstName} ${e.user.lastName1 || ''}`.trim() : 'Usuario',
        actionCode: e.securityEventType?.code || 'UNKNOWN',
        actionName: e.securityEventType?.name || 'Evento Seguridad',
        source: 'SECURITY' as const,
        ipAddress: e.ipAddress,
        userAgent: e.userAgent,
        metadata: e.metadata || undefined,
      })),
      ...auditLogs.map((l) => ({
        id: `aud-${l.id}`,
        datetime: l.eventDatetime,
        userId: l.userId,
        userName: l.user ? `${l.user.firstName} ${l.user.lastName1 || ''}`.trim() : 'Usuario',
        actionCode: l.auditAction?.code || 'UNKNOWN',
        actionName: l.auditAction?.name || 'Acción Sistema',
        source: 'AUDIT' as const,
        entityType: l.entityType || undefined,
        entityId: l.entityId || undefined,
      })),
    ];

    return unifiedHistory
      .sort((a, b) => b.datetime.getTime() - a.datetime.getTime())
      .slice(0, safeLimit);
  }
}