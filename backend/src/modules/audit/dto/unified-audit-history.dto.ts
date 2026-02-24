import { AuditSource } from '../interfaces/audit.constants';

export class UnifiedAuditHistoryDto {
  id: string;
  datetime: Date;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  actionCode: string;
  actionName: string;
  source: AuditSource;
  entityType?: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}
