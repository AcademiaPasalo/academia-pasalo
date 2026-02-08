import { ClassEvent } from '@modules/events/domain/class-event.entity';
import { ClassEventStatus } from '@modules/events/application/class-events.service';

export class ClassEventResponseDto {
  id: string;
  sessionNumber: number;
  title: string;
  topic: string;
  startDatetime: Date;
  endDatetime: Date;
  meetingLink: string;
  isCancelled: boolean;
  status: ClassEventStatus;
  canJoinMeeting: boolean;
  canCopyLink: boolean;
  courseName: string;
  courseCode: string;
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
    canAccess: boolean,
  ): ClassEventResponseDto {
    return {
      id: event.id,
      sessionNumber: event.sessionNumber,
      title: event.title,
      topic: event.topic,
      startDatetime: event.startDatetime,
      endDatetime: event.endDatetime,
      meetingLink: event.meetingLink,
      isCancelled: event.isCancelled,
      status,
      canJoinMeeting: canAccess,
      canCopyLink: canAccess,
      courseName: event.evaluation?.courseCycle?.course?.name || '',
      courseCode: event.evaluation?.courseCycle?.course?.code || '',
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
