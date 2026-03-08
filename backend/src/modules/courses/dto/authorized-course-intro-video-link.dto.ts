import { Expose } from 'class-transformer';
import {
  MEDIA_ACCESS_MODES,
  MEDIA_CONTENT_KINDS,
  type MediaAccessMode,
  type MediaContentKind,
  type MediaVideoLinkMode,
} from '@modules/media-access/domain/media-access.constants';

export class AuthorizedCourseIntroVideoLinkDto {
  @Expose()
  contentKind: MediaContentKind = MEDIA_CONTENT_KINDS.VIDEO;

  @Expose()
  accessMode: MediaAccessMode = MEDIA_ACCESS_MODES.DIRECT_URL;

  @Expose()
  courseCycleId: string;

  @Expose()
  driveFileId: string | null = null;

  @Expose()
  url: string;

  @Expose()
  expiresAt: Date | null;

  @Expose()
  requestedMode: MediaVideoLinkMode;

  @Expose()
  fileName: string | null = null;

  @Expose()
  mimeType: string | null = null;

  @Expose()
  storageProvider: string | null = null;
}
