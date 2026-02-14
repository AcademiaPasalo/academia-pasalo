import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, InternalServerErrorException } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUES } from '@infrastructure/queue/queue.constants';
import { AuditLogRepository } from '@modules/audit/infrastructure/audit-log.repository';
import { SecurityEventRepository } from '@modules/auth/infrastructure/security-event.repository';
import { SettingsService } from '@modules/settings/application/settings.service';
import { AuditService } from '@modules/audit/application/audit.service';
import { technicalSettings } from '@config/technical-settings';
import {
  AUDIT_ACTION_CODES,
  AUDIT_ENTITY_TYPES,
  AUDIT_JOB_NAMES,
  AUDIT_SYSTEM_ACTOR,
  AUDIT_SYSTEM_SETTING_KEYS,
} from '@modules/audit/interfaces/audit.constants';

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
    if (job.name === AUDIT_JOB_NAMES.CLEANUP_OLD_LOGS) {
      await this.handleCleanup(job.name);
    }
  }

  private async handleCleanup(jobName: string): Promise<void> {
    this.logger.log({
      context: AuditCleanupProcessor.name,
      job: jobName,
      message: 'Iniciando proceso de limpieza de logs de auditoria',
    });

    let retentionDays: number;
    try {
      const retentionDaysStr = await this.settingsService.getString(
        AUDIT_SYSTEM_SETTING_KEYS.CLEANUP_RETENTION_DAYS,
      );
      retentionDays =
        parseInt(retentionDaysStr, 10) ||
        technicalSettings.audit.retentionDefaultDays;

      if (retentionDays < technicalSettings.audit.retentionMinSafeDays) {
        this.logger.error({
          context: AuditCleanupProcessor.name,
          message: `Error de seguridad: Se intento configurar una retencion menor a ${technicalSettings.audit.retentionMinSafeDays} dias`,
          valueReceived: retentionDays,
        });
        throw new InternalServerErrorException(
          `Error de configuracion: El periodo minimo de retencion es de ${technicalSettings.audit.retentionMinSafeDays} dias`,
        );
      }
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;

      this.logger.warn({
        context: AuditCleanupProcessor.name,
        job: jobName,
        message:
          'No se encontro la configuracion de retencion en system_setting, usando valor por defecto',
        missingKey: AUDIT_SYSTEM_SETTING_KEYS.CLEANUP_RETENTION_DAYS,
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
          AUDIT_SYSTEM_ACTOR.USER_ID,
          AUDIT_ACTION_CODES.CLEANUP_EXECUTED,
          AUDIT_ENTITY_TYPES.SYSTEM,
          `Eliminados seguridad: ${totalSecurityDeleted}, auditoria: ${totalAuditDeleted}`,
        )
        .catch((err: Error) => {
          this.logger.warn({
            context: AuditCleanupProcessor.name,
            job: jobName,
            message:
              'No se pudo registrar la accion de limpieza en el audit_log',
            error: err.message,
          });
        });
    } catch (error) {
      const isError = error instanceof Error;
      this.logger.error({
        context: AuditCleanupProcessor.name,
        job: jobName,
        message: 'Error critico durante la limpieza de logs de auditoria',
        error: isError ? error.message : 'Error desconocido',
        stack: isError ? error.stack : undefined,
      });
      throw error;
    }
  }
}
