export class UnifiedAuditHistoryDto {
  id: string;
  datetime: Date;
  userId: string;
  userName: string;
  actionCode: string;
  actionName: string;
  source: 'SECURITY' | 'AUDIT';
  entityType?: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}
