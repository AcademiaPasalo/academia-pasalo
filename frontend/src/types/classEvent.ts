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
  meetingLink: string;
  isCancelled: boolean;
  status: ClassEventStatus;
  canJoinMeeting: boolean;
  canCopyLink: boolean;
  courseName: string;
  courseCode: string;
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
