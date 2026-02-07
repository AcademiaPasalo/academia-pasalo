import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, InternalServerErrorException } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUES } from '@infrastructure/queue/queue.constants';
import { AuditLogRepository } from '@modules/audit/infrastructure/audit-log.repository';
import { SecurityEventRepository } from '@modules/auth/infrastructure/security-event.repository';
import { SettingsService } from '@modules/settings/application/settings.service';
import { AuditService } from '@modules/audit/application/audit.service';
import { technicalSettings } from '@config/technical-settings';

@Processor(QUEUES.AUDIT)
export class AuditCleanupProcessor extends WorkerHost {
  private readonly logger = new Logger(AuditCleanupProcessor.name);

  constructor(
    private readonly auditLogRepository: AuditLogRepository,
    private readonly securityEventRepository: SecurityEventRepository,
    private readonly settingsService: SettingsService,
    private readonly auditService: AuditService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    if (job.name === 'cleanup-old-logs') {
      await this.handleCleanup(job.name);
    }
  }

  private async handleCleanup(jobName: string): Promise<void> {
    this.logger.log({
      context: AuditCleanupProcessor.name,
      job: jobName,
      message: 'Iniciando proceso de limpieza de logs de auditoría',
    });

    let retentionDays: number;
    try {
      const retentionDaysStr = await this.settingsService.getString(
        'AUDIT_CLEANUP_RETENTION_DAYS',
      );
      retentionDays =
        parseInt(retentionDaysStr, 10) ||
        technicalSettings.audit.retentionDefaultDays;

      if (retentionDays < technicalSettings.audit.retentionMinSafeDays) {
        this.logger.error({
          context: AuditCleanupProcessor.name,
          message: `Error de seguridad: Se intentó configurar una retención menor a ${technicalSettings.audit.retentionMinSafeDays} días`,
          valueReceived: retentionDays,
        });
        throw new InternalServerErrorException(
          `Error de configuración: El período mínimo de retención es de ${technicalSettings.audit.retentionMinSafeDays} días`,
        );
      }
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;

      this.logger.warn({
        context: AuditCleanupProcessor.name,
        job: jobName,
        message:
          'No se encontró AUDIT_CLEANUP_RETENTION_DAYS en system_setting, usando valor por defecto',
        defaultValue: technicalSettings.audit.retentionDefaultDays,
      });
      retentionDays = technicalSettings.audit.retentionDefaultDays;
    }

    const cutOffDate = new Date();
    cutOffDate.setDate(cutOffDate.getDate() - retentionDays);

    try {
      const totalSecurityDeleted =
        await this.securityEventRepository.deleteOlderThan(cutOffDate);
      const totalAuditDeleted =
        await this.auditLogRepository.deleteOlderThan(cutOffDate);

      this.logger.log({
        context: AuditCleanupProcessor.name,
        job: jobName,
        message: 'Limpieza de logs completada exitosamente',
        totalSecurityDeleted,
        totalAuditDeleted,
        retentionDays,
      });

      await this.auditService
        .logAction(
          '1',
          'AUDIT_CLEANUP_EXECUTED',
          'SYSTEM',
          `Deleted Security: ${totalSecurityDeleted}, Audit: ${totalAuditDeleted}`,
        )
        .catch((err: Error) => {
          this.logger.warn({
            context: AuditCleanupProcessor.name,
            job: jobName,
            message:
              'No se pudo registrar la acción de limpieza en el audit_log',
            error: err.message,
          });
        });
    } catch (error) {
      this.logger.error({
        context: AuditCleanupProcessor.name,
        job: jobName,
        message: 'Error crítico durante la limpieza de logs de auditoría',
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
