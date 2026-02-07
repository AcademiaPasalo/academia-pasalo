import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { Workbook } from 'exceljs';
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
          message: 'Crítico: El código de acción de auditoría no está configurado en la BD',
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

  async getUnifiedHistory(
    filters: {
      startDate?: string;
      endDate?: string;
      userId?: string;
      limit?: number;
    },
    maxAllowedLimit = 100,
  ): Promise<UnifiedAuditHistoryDto[]> {
    const parsedFilters = {
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
      userId: filters.userId,
    };
    
    const safeLimit = filters.limit ? Math.min(filters.limit, maxAllowedLimit) : 50; 

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

  async exportHistoryToExcel(filters: {
    startDate?: string;
    endDate?: string;
    userId?: string;
  }): Promise<Buffer> {
    const history = await this.getUnifiedHistory(
      { ...filters, limit: 1000 },
      1000,
    );
    
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Historial');

    worksheet.columns = [
      { header: 'FECHA Y HORA', key: 'datetime', width: 25 },
      { header: 'USUARIO', key: 'userName', width: 30 },
      { header: 'ACCIÓN', key: 'actionName', width: 35 },
      { header: 'CÓDIGO', key: 'actionCode', width: 25 },
      { header: 'FUENTE', key: 'source', width: 15 },
      { header: 'ENTIDAD', key: 'entityType', width: 20 },
      { header: 'ID ENTIDAD', key: 'entityId', width: 15 },
      { header: 'IP', key: 'ipAddress', width: 20 },
      { header: 'NAVEGADOR', key: 'userAgent', width: 50 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2D5F9E' },
    };

    history.forEach((row) => {
      worksheet.addRow({
        ...row,
        source: row.source === 'SECURITY' ? 'SEGURIDAD' : 'AUDITORÍA',
        datetime: row.datetime.toLocaleString('es-PE'),
      });
    });

    return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
  }
}