import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { AuditAction } from '@modules/audit/domain/audit-action.entity';
import { AuditLog } from '@modules/audit/domain/audit-log.entity';
import { AuditActionRepository } from '@modules/audit/infrastructure/audit-action.repository';
import { AuditLogRepository } from '@modules/audit/infrastructure/audit-log.repository';
import { AuditService } from '@modules/audit/application/audit.service';
import { AuditController } from '@modules/audit/presentation/audit.controller';
import { AuthModule } from '@modules/auth/auth.module';
import { SettingsModule } from '@modules/settings/settings.module';
import { QUEUES } from '@infrastructure/queue/queue.constants';
import { AuditCleanupProcessor } from './infrastructure/processors/audit-cleanup.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditAction, AuditLog]),
    BullModule.registerQueue({
      name: QUEUES.AUDIT,
    }),
    forwardRef(() => AuthModule),
    SettingsModule,
  ],
  controllers: [AuditController],
  providers: [
    AuditActionRepository,
    AuditLogRepository,
    AuditService,
    AuditCleanupProcessor,
  ],
  exports: [AuditService],
})
export class AuditModule {}
