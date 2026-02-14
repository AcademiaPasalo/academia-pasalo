import { ClassEventResponseDto } from '@modules/events/dto/class-event-response.dto';
import { ClassEvent } from '@modules/events/domain/class-event.entity';
import { CLASS_EVENT_STATUS } from '@modules/events/domain/class-event.constants';

describe('ClassEventResponseDto', () => {
  it('debe ocultar URLs sensibles cuando no hay permisos efectivos', () => {
    const event = {
      id: 'event-1',
      sessionNumber: 1,
      title: 'Clase 1',
      topic: 'Tema',
      startDatetime: new Date('2026-02-01T08:00:00Z'),
      endDatetime: new Date('2026-02-01T10:00:00Z'),
      liveMeetingUrl: 'https://meet.example.com/room-1',
      recordingUrl: 'https://video.example.com/recording-1',
      isCancelled: false,
      createdAt: new Date('2026-01-31T10:00:00Z'),
      updatedAt: null,
      creator: {
        id: 'teacher-1',
        firstName: 'Docente',
        lastName1: 'Pasalo',
        lastName2: null,
        profilePhotoUrl: null,
      },
      professors: [],
      evaluation: null,
    } as unknown as ClassEvent;

    const dto = ClassEventResponseDto.fromEntity(
      event,
      CLASS_EVENT_STATUS.PROGRAMADA,
      {
      canJoinLive: false,
      canWatchRecording: false,
      canCopyLiveLink: false,
      canCopyRecordingLink: false,
      },
    );

    expect(dto.canJoinLive).toBe(false);
    expect(dto.canWatchRecording).toBe(false);
    expect(dto.canCopyLiveLink).toBe(false);
    expect(dto.canCopyRecordingLink).toBe(false);
    expect(dto.liveMeetingUrl).toBeNull();
    expect(dto.recordingUrl).toBeNull();
  });
});
