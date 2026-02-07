import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditAction } from '@modules/audit/domain/audit-action.entity';
import { AuditLog } from '@modules/audit/domain/audit-log.entity';
import { AuditActionRepository } from '@modules/audit/infrastructure/audit-action.repository';
import { AuditLogRepository } from '@modules/audit/infrastructure/audit-log.repository';
import { AuditService } from '@modules/audit/application/audit.service';
import { AuditController } from '@modules/audit/presentation/audit.controller';
import { AuthModule } from '@modules/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditAction, AuditLog]),
    forwardRef(() => AuthModule),
  ],
  controllers: [AuditController],
  providers: [AuditActionRepository, AuditLogRepository, AuditService],
  exports: [AuditService],
})
export class AuditModule {}
