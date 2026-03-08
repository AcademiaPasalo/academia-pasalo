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

export type ClassEventRecordingStatusCode =
  (typeof CLASS_EVENT_RECORDING_STATUS_CODES)[keyof typeof CLASS_EVENT_RECORDING_STATUS_CODES];

export const CLASS_EVENT_CACHE_KEYS = {
  EVALUATION_LIST: (evaluationId: string) =>
    `cache:class-events:evaluation:${evaluationId}`,
  GLOBAL_EVALUATION_LIST_GROUP: 'cache:class-events:evaluation:*',
  DETAIL: (eventId: string) => `cache:class-event:${eventId}`,
  MY_SCHEDULE: (userId: string, start: string, end: string) =>
    `cache:my-schedule:user:${userId}:from:${start}:to:${end}`,
  USER_SCHEDULE_INDEX: (userId: string) =>
    `cache:index:my-schedule:user:${userId}`,
  GLOBAL_SCHEDULE_INDEX: 'cache:index:my-schedule:all',
  USER_SCHEDULE_GROUP: (userId: string) => `cache:my-schedule:user:${userId}:*`,
  GLOBAL_SCHEDULE_GROUP: 'cache:my-schedule:*',
  CATEGORY_CYCLE_GROUP: (courseTypeId: string, academicCycleId: string) =>
    `cache:class-events:category-cycle:course-type:${courseTypeId}:cycle:${academicCycleId}:*`,
  CATEGORY_CYCLE_INDEX: (courseTypeId: string, academicCycleId: string) =>
    `cache:index:class-events:category-cycle:course-type:${courseTypeId}:cycle:${academicCycleId}`,
  DISCOVERY_LAYERS: (
    courseCycleId: string,
    courseTypeId: string,
    academicCycleId: string,
  ) =>
    `cache:class-events:category-cycle:course-type:${courseTypeId}:cycle:${academicCycleId}:discovery:course-cycle:${courseCycleId}`,
  GLOBAL_SESSIONS: (
    courseTypeId: string,
    academicCycleId: string,
    startDateIso: string,
    endDateIso: string,
    courseCycleIdsKey: string,
  ) =>
    `cache:class-events:category-cycle:course-type:${courseTypeId}:cycle:${academicCycleId}:global:start:${startDateIso}:end:${endDateIso}:cycles:${courseCycleIdsKey}`,
} as const;
