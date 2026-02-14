export const AUDIT_JOB_NAMES = {
  CLEANUP_OLD_LOGS: 'cleanup-old-logs',
} as const;

export const AUDIT_SYSTEM_SETTING_KEYS = {
  CLEANUP_RETENTION_DAYS: 'AUDIT_CLEANUP_RETENTION_DAYS',
} as const;

export const AUDIT_ACTION_CODES = {
  CLEANUP_EXECUTED: 'AUDIT_CLEANUP_EXECUTED',
} as const;

export const AUDIT_ENTITY_TYPES = {
  SYSTEM: 'SYSTEM',
} as const;

export const AUDIT_SYSTEM_ACTOR = {
  USER_ID: '1',
} as const;
