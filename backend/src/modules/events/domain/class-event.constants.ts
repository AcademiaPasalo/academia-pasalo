export const CLASS_EVENT_STATUS = {
  CANCELADA: 'CANCELADA',
  PROGRAMADA: 'PROGRAMADA',
  EN_CURSO: 'EN_CURSO',
  FINALIZADA: 'FINALIZADA',
} as const;

export type ClassEventStatus =
  (typeof CLASS_EVENT_STATUS)[keyof typeof CLASS_EVENT_STATUS];

export interface ClassEventAccess {
  canJoinLive: boolean;
  canWatchRecording: boolean;
  canCopyLiveLink: boolean;
  canCopyRecordingLink: boolean;
}

export const CLASS_EVENT_RECORDING_STATUS_CODES = {
  NOT_AVAILABLE: 'NOT_AVAILABLE',
  PROCESSING: 'PROCESSING',
  READY: 'READY',
  FAILED: 'FAILED',
} as const;

export const CLASS_EVENT_CACHE_KEYS = {
  EVALUATION_LIST: (evaluationId: string) =>
    `cache:class-events:evaluation:${evaluationId}`,
  GLOBAL_EVALUATION_LIST_GROUP: 'cache:class-events:evaluation:*',
  DETAIL: (eventId: string) => `cache:class-event:${eventId}`,
  MY_SCHEDULE: (userId: string, start: string, end: string) =>
    `cache:my-schedule:user:${userId}:from:${start}:to:${end}`,
  USER_SCHEDULE_GROUP: (userId: string) => `cache:my-schedule:user:${userId}:*`,
  GLOBAL_SCHEDULE_GROUP: 'cache:my-schedule:*',
} as const;
