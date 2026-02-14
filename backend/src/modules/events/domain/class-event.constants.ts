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

