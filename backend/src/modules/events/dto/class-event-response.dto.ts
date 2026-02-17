import { ClassEvent } from '@modules/events/domain/class-event.entity';
import {
  ClassEventAccess,
  ClassEventStatus,
} from '@modules/events/domain/class-event.constants';

export class ClassEventResponseDto {
  id: string;
  sessionNumber: number;
  title: string;
  topic: string;
  startDatetime: Date;
  endDatetime: Date;
  liveMeetingUrl: string | null;
  recordingUrl: string | null;
  isCancelled: boolean;
  status: ClassEventStatus;
  canJoinLive: boolean;
  canWatchRecording: boolean;
  canCopyLiveLink: boolean;
  canCopyRecordingLink: boolean;
  courseName: string;
  courseCode: string;
  evaluationName: string;
  creator: {
    id: string;
    firstName: string;
    lastName1: string;
    lastName2: string;
    profilePhotoUrl: string | null;
  };
  professors: Array<{
    id: string;
    firstName: string;
    lastName1: string;
    lastName2: string;
    profilePhotoUrl: string | null;
  }>;
  createdAt: Date;
  updatedAt: Date | null;

  static fromEntity(
    event: ClassEvent,
    status: ClassEventStatus,
    access: ClassEventAccess,
  ): ClassEventResponseDto {
    return {
      id: event.id,
      sessionNumber: event.sessionNumber,
      title: event.title,
      topic: event.topic,
      startDatetime: event.startDatetime,
      endDatetime: event.endDatetime,
      liveMeetingUrl: access.canJoinLive ? event.liveMeetingUrl : null,
      recordingUrl: access.canWatchRecording ? event.recordingUrl : null,
      isCancelled: event.isCancelled,
      status,
      canJoinLive: access.canJoinLive,
      canWatchRecording: access.canWatchRecording,
      canCopyLiveLink: access.canCopyLiveLink,
      canCopyRecordingLink: access.canCopyRecordingLink,
      courseName: event.evaluation?.courseCycle?.course?.name || '',
      courseCode: event.evaluation?.courseCycle?.course?.code || '',
      evaluationName: event.evaluation
        ? `${event.evaluation.evaluationType?.code || ''}${event.evaluation.number || ''}`.trim()
        : '',
      creator: {
        id: event.creator.id,
        firstName: event.creator.firstName,
        lastName1: event.creator.lastName1 || '',
        lastName2: event.creator.lastName2 || '',
        profilePhotoUrl: event.creator.profilePhotoUrl || null,
      },
      professors: (event.professors || []).map((p) => ({
        id: p.professor.id,
        firstName: p.professor.firstName,
        lastName1: p.professor.lastName1 || '',
        lastName2: p.professor.lastName2 || '',
        profilePhotoUrl: p.professor.profilePhotoUrl || null,
      })),
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }
}
