export type AnomalyType = 'NONE' | 'IMPOSSIBLE_TRAVEL' | 'NEW_DEVICE_QUICK_CHANGE';

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
