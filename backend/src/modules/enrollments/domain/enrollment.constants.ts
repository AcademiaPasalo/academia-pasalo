export const ENROLLMENT_TYPE_CODES = {
  FULL: 'FULL',
  PARTIAL: 'PARTIAL',
} as const;

export const ENROLLMENT_STATUS_CODES = {
  ACTIVE: 'ACTIVE',
  CANCELLED: 'CANCELLED',
  SUSPENDED: 'SUSPENDED',
} as const;

export type EnrollmentTypeCode =
  (typeof ENROLLMENT_TYPE_CODES)[keyof typeof ENROLLMENT_TYPE_CODES];
export type EnrollmentStatusCode =
  (typeof ENROLLMENT_STATUS_CODES)[keyof typeof ENROLLMENT_STATUS_CODES];

export const ENROLLMENT_CACHE_KEYS = {
  DASHBOARD: (userId: string) => `cache:enrollment:user:${userId}:dashboard`,
  GLOBAL_DASHBOARD_GROUP: 'cache:enrollment:user:*:dashboard',
  ACCESS_CHECK: (userId: string, evaluationId: string) =>
    `cache:access:user:${userId}:eval:${evaluationId}`,
  USER_ACCESS_GROUP: (userId: string) => `cache:access:user:${userId}:*`,
} as const;
