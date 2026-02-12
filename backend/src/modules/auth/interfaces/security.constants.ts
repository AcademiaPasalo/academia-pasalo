export type AnomalyType =
  | 'NONE'
  | 'IMPOSSIBLE_TRAVEL'
  | 'NEW_DEVICE_QUICK_CHANGE';

export const ANOMALY_TYPES: Record<string, AnomalyType> = {
  NONE: 'NONE',
  IMPOSSIBLE_TRAVEL: 'IMPOSSIBLE_TRAVEL',
  NEW_DEVICE_QUICK_CHANGE: 'NEW_DEVICE_QUICK_CHANGE',
};

export type ConcurrentDecision = 'KEEP_NEW' | 'KEEP_EXISTING';

export const CONCURRENT_DECISIONS: Record<string, ConcurrentDecision> = {
  KEEP_NEW: 'KEEP_NEW',
  KEEP_EXISTING: 'KEEP_EXISTING',
};

export type IdentitySourceFlow =
  | 'LOGIN_GOOGLE'
  | 'ANOMALOUS_REAUTH'
  | 'REFRESH_TOKEN'
  | 'CONCURRENT_RESOLUTION';

export const IDENTITY_SOURCE_FLOWS: Record<string, IdentitySourceFlow> = {
  LOGIN_GOOGLE: 'LOGIN_GOOGLE',
  ANOMALOUS_REAUTH: 'ANOMALOUS_REAUTH',
  REFRESH_TOKEN: 'REFRESH_TOKEN',
  CONCURRENT_RESOLUTION: 'CONCURRENT_RESOLUTION',
};

export type SecurityEventCode = 'ACCESS_DENIED';

export const SECURITY_EVENT_CODES: Record<string, SecurityEventCode> = {
  ACCESS_DENIED: 'ACCESS_DENIED',
};

export type IdentityDenyReason = 'INACTIVE_ACCOUNT';

export const IDENTITY_DENY_REASONS: Record<string, IdentityDenyReason> = {
  INACTIVE_ACCOUNT: 'INACTIVE_ACCOUNT',
};

export type IdentityInvalidationReason =
  | 'USER_BANNED'
  | 'SENSITIVE_UPDATE'
  | 'ROLE_CHANGE'
  | 'UNSPECIFIED';

export const IDENTITY_INVALIDATION_REASONS: Record<
  string,
  IdentityInvalidationReason
> = {
  USER_BANNED: 'USER_BANNED',
  SENSITIVE_UPDATE: 'SENSITIVE_UPDATE',
  ROLE_CHANGE: 'ROLE_CHANGE',
  UNSPECIFIED: 'UNSPECIFIED',
};

export type SessionStatusCodeValue = 'REVOKED';

export const SESSION_STATUS_CODES: Record<string, SessionStatusCodeValue> = {
  REVOKED: 'REVOKED',
};

export const SECURITY_MESSAGES = {
  INACTIVE_ACCOUNT:
    'Tu cuenta se encuentra inactiva. Contacta a administracion.',
} as const;
