import {
  Injectable,
  Logger,
  InternalServerErrorException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { Workbook } from 'exceljs';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AuditLogRepository } from '@modules/audit/infrastructure/audit-log.repository';
import { AuditActionRepository } from '@modules/audit/infrastructure/audit-action.repository';
import { SecurityEventRepository } from '@modules/auth/infrastructure/security-event.repository';
import { AuditLog } from '@modules/audit/domain/audit-log.entity';
import { UnifiedAuditHistoryDto } from '@modules/audit/dto/unified-audit-history.dto';
import { QUEUES } from '@infrastructure/queue/queue.constants';
import { JobScheduler } from '@infrastructure/queue/queue.interfaces';
import { technicalSettings } from '@config/technical-settings';
import {
  AUDIT_SOURCES,
  AUDIT_LABELS,
  AUDIT_EXCEL_CONFIG,
  AUDIT_JOB_NAMES,
} from '@modules/audit/interfaces/audit.constants';
import type { EntityManager } from 'typeorm';
import { User } from '@modules/users/domain/user.entity';

@Injectable()
export class AuditService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AuditService.name);
  private readonly actionIdCache = new Map<string, string>();

  constructor(
    private readonly auditLogRepository: AuditLogRepository,
    private readonly auditActionRepository: AuditActionRepository,
    private readonly securityEventRepository: SecurityEventRepository,
    @InjectQueue(QUEUES.AUDIT) private readonly auditQueue: Queue,
  ) {}

  async onApplicationBootstrap() {
    await this.setupRepeatableJobs();
  }

  private resolveUserRole(user?: User): string {
    if (!user) return AUDIT_LABELS.UNKNOWN_ROLE;

    if (user.lastActiveRole?.name) {
      return user.lastActiveRole.name;
    }

    if (user.roles && user.roles.length > 0) {
      const firstRole = user.roles[0];
      return firstRole?.name || AUDIT_LABELS.UNKNOWN_ROLE;
    }

    return AUDIT_LABELS.UNKNOWN_ROLE;
  }

  private resolveUserName(user?: User): string {
    if (!user) return AUDIT_LABELS.UNKNOWN_USER;
    const fullName = `${user.firstName} ${user.lastName1 || ''}`.trim();
    return fullName || AUDIT_LABELS.UNKNOWN_USER;
  }

  async setupRepeatableJobs() {
    const jobName = AUDIT_JOB_NAMES.CLEANUP_OLD_LOGS;
    const cronPattern = technicalSettings.audit.cleanupCronPattern;

    const schedulers =
      (await this.auditQueue.getJobSchedulers()) as unknown as JobScheduler[];
    const existingScheduler = schedulers.find((s) => s.name === jobName);

    if (existingScheduler) {
      const currentPattern =
        existingScheduler.cron || existingScheduler.pattern;

      if (currentPattern !== cronPattern) {
        this.logger.log({
          context: AuditService.name,
          message:
            'Detectado cambio en el patrón de horario. Actualizando Redis...',
          oldPattern: currentPattern,
          newPattern: cronPattern,
        });

        await this.auditQueue.removeJobScheduler(jobName);
        await this.auditQueue.add(
          jobName,
          {},
          {
            repeat: { pattern: cronPattern },
          },
        );
      }
    } else {
      await this.auditQueue.add(
        jobName,
        {},
        {
          repeat: { pattern: cronPattern },
        },
      );

      this.logger.log({
        context: AuditService.name,
        message: 'Tarea repetitiva de limpieza registrada por primera vez',
        job: jobName,
        pattern: cronPattern,
      });
    }
  }

  async logAction(
    userId: string,
    actionCode: string,
    entityType?: string,
    entityId?: string,
    manager?: EntityManager,
  ): Promise<AuditLog> {
    let actionId = this.actionIdCache.get(actionCode);

    if (!actionId) {
      const action = await this.auditActionRepository.findByCode(
        actionCode,
        manager,
      );

      if (!action) {
        this.logger.error({
          context: AuditService.name,
          message:
            'Crítico: El código de acción de auditoría no está configurado en la BD',
          actionCode,
          userId,
        });
        throw new InternalServerErrorException(
          'Error de integridad: Código de auditoría no válido',
        );
      }

      actionId = action.id;
      this.actionIdCache.set(actionCode, actionId);
    }

    const log = await this.auditLogRepository.create(
      {
        userId,
        auditActionId: actionId,
        eventDatetime: new Date(),
        entityType: entityType || null,
        entityId: entityId || null,
      },
      manager,
    );

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

    const safeLimit = filters.limit
      ? Math.min(filters.limit, maxAllowedLimit)
      : 50;

    const [securityEvents, auditLogs] = await Promise.all([
      this.securityEventRepository.findAll(parsedFilters, safeLimit),
      this.auditLogRepository.findAll(parsedFilters, safeLimit),
    ]);

    const unifiedHistory: UnifiedAuditHistoryDto[] = [
      ...securityEvents.map((e) => ({
        id: `sec-${e.id}`,
        datetime: e.eventDatetime,
        userId: e.userId,
        userName: this.resolveUserName(e.user),
        userEmail: e.user?.email || AUDIT_LABELS.NOT_AVAILABLE,
        userRole: this.resolveUserRole(e.user),
        actionCode: e.securityEventType?.code || AUDIT_LABELS.UNKNOWN_ACTION,
        actionName: e.securityEventType?.name || AUDIT_LABELS.SOURCE_SECURITY,
        source: AUDIT_SOURCES.SECURITY,
        ipAddress: e.ipAddress,
        userAgent: e.userAgent,
        metadata: e.metadata || undefined,
      })),
      ...auditLogs.map((l) => ({
        id: `aud-${l.id}`,
        datetime: l.eventDatetime,
        userId: l.userId,
        userName: this.resolveUserName(l.user),
        userEmail: l.user?.email || AUDIT_LABELS.NOT_AVAILABLE,
        userRole: this.resolveUserRole(l.user),
        actionCode: l.auditAction?.code || AUDIT_LABELS.UNKNOWN_ACTION,
        actionName: l.auditAction?.name || AUDIT_LABELS.SOURCE_AUDIT,
        source: AUDIT_SOURCES.AUDIT,
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
    const worksheet = workbook.addWorksheet(AUDIT_EXCEL_CONFIG.SHEET_NAME);

    worksheet.columns = [
      {
        header: AUDIT_EXCEL_CONFIG.COLUMNS.DATETIME,
        key: 'datetime',
        width: 25,
      },
      {
        header: AUDIT_EXCEL_CONFIG.COLUMNS.USER_NAME,
        key: 'userName',
        width: 30,
      },
      {
        header: AUDIT_EXCEL_CONFIG.COLUMNS.USER_EMAIL,
        key: 'userEmail',
        width: 35,
      },
      {
        header: AUDIT_EXCEL_CONFIG.COLUMNS.USER_ROLE,
        key: 'userRole',
        width: 20,
      },
      {
        header: AUDIT_EXCEL_CONFIG.COLUMNS.ACTION_NAME,
        key: 'actionName',
        width: 35,
      },
      {
        header: AUDIT_EXCEL_CONFIG.COLUMNS.ACTION_CODE,
        key: 'actionCode',
        width: 25,
      },
      { header: AUDIT_EXCEL_CONFIG.COLUMNS.SOURCE, key: 'source', width: 15 },
      { header: AUDIT_EXCEL_CONFIG.COLUMNS.IP, key: 'ipAddress', width: 20 },
      {
        header: AUDIT_EXCEL_CONFIG.COLUMNS.USER_AGENT,
        key: 'userAgent',
        width: 50,
      },
    ];

    worksheet.getRow(1).font = {
      bold: true,
      color: { argb: AUDIT_EXCEL_CONFIG.HEADER_FONT_COLOR },
    };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: AUDIT_EXCEL_CONFIG.HEADER_FILL_COLOR },
    };

    history.forEach((row) => {
      worksheet.addRow({
        ...row,
        source:
          row.source === AUDIT_SOURCES.SECURITY
            ? AUDIT_LABELS.SOURCE_SECURITY
            : AUDIT_LABELS.SOURCE_AUDIT,
        datetime: row.datetime.toLocaleString(AUDIT_EXCEL_CONFIG.LOCALE_ES_PE),
      });
    });

    return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
  }
}
