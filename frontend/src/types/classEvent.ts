// ============================================
// CLASS EVENT TYPES - Eventos de Calendario
// ============================================

export type ClassEventStatus = 'PROGRAMADA' | 'EN_CURSO' | 'FINALIZADA' | 'CANCELADA';

export interface ClassEventCreator {
  id: string;
  firstName: string;
  lastName1: string;
  profilePhotoUrl: string | null;
}

export interface ClassEventProfessor {
  id: string;
  firstName: string;
  lastName1: string;
  profilePhotoUrl: string | null;
}

export interface ClassEvent {
  id: string;
  sessionNumber: number;
  title: string;
  topic: string;
  startDatetime: string;
  endDatetime: string;
  liveMeetingUrl: string | null;
  recordingUrl: string | null;
  recordingStatus: 'NOT_AVAILABLE' | 'PROCESSING' | 'READY' | 'FAILED';
  isCancelled: boolean;
  status: ClassEventStatus;
  canJoinLive: boolean;
  canWatchRecording: boolean;
  canCopyLiveLink: boolean;
  canCopyRecordingLink: boolean;
  courseName: string;
  courseCode: string;
  courseCycleId: string;
  evaluationId: string;
  evaluationName: string;
  creator: ClassEventCreator;
  professors: ClassEventProfessor[];
  createdAt: string;
  updatedAt: string | null;
}

export interface ClassEventResponse {
  data: ClassEvent[];
  statusCode: number;
  message: string;
  timestamp: string;
}