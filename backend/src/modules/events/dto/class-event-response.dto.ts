import { ClassEvent } from '@modules/events/domain/class-event.entity';
import {
  ClassEventAccess,
  ClassEventRecordingStatusCode,
  CLASS_EVENT_RECORDING_STATUS_CODES,
  ClassEventStatus,
} from '@modules/events/domain/class-event.constants';
import {
  buildDrivePreviewUrl,
  extractDriveFileIdFromUrl,
} from '@modules/media-access/domain/media-access-url.util';

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
  sessionStatus: ClassEventStatus;
  recordingStatus: ClassEventRecordingStatusCode;
  canJoinLive: boolean;
  canWatchRecording: boolean;
  canCopyLiveLink: boolean;
  canCopyRecordingLink: boolean;
  courseName: string;
  courseCode: string;
  courseCycleId: string;
  evaluationId: string;
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
    const recordingFileId =
      String(event.recordingFileId || '').trim() ||
      extractDriveFileIdFromUrl(event.recordingUrl || '');
    const recordingUrl = recordingFileId
      ? buildDrivePreviewUrl(recordingFileId)
      : event.recordingUrl;

    return {
      id: event.id,
      sessionNumber: event.sessionNumber,
      title: event.title,
      topic: event.topic,
      startDatetime: event.startDatetime,
      endDatetime: event.endDatetime,
      liveMeetingUrl: event.liveMeetingUrl,
      recordingUrl,
      isCancelled: event.isCancelled,
      sessionStatus: status,
      recordingStatus:
        (event.recordingStatus?.code as ClassEventRecordingStatusCode) ||
        CLASS_EVENT_RECORDING_STATUS_CODES.NOT_AVAILABLE,
      canJoinLive: access.canJoinLive,
      canWatchRecording: access.canWatchRecording,
      canCopyLiveLink: access.canCopyLiveLink,
      canCopyRecordingLink: access.canCopyRecordingLink,
      courseName: event.evaluation?.courseCycle?.course?.name || '',
      courseCode: event.evaluation?.courseCycle?.course?.code || '',
      courseCycleId: event.evaluation?.courseCycleId || '',
      evaluationId: event.evaluationId || '',
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
