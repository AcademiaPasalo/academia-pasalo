import { Expose } from 'class-transformer';
import {
  MEDIA_ACCESS_MODES,
  MEDIA_CONTENT_KINDS,
} from '@modules/media-access/domain/media-access.constants';
import type {
  MediaAccessMode,
  MediaContentKind,
} from '@modules/media-access/domain/media-access.constants';

export class AuthorizedMediaLinkDto {
  @Expose()
  contentKind: MediaContentKind = MEDIA_CONTENT_KINDS.DOCUMENT;

  @Expose()
  accessMode: MediaAccessMode = MEDIA_ACCESS_MODES.DIRECT_URL;

  @Expose()
  evaluationId: string;

  @Expose()
  driveFileId: string | null = null;

  @Expose()
  url: string;

  @Expose()
  expiresAt: Date | null;

  @Expose()
  requestedMode: string;

  @Expose()
  fileName: string | null = null;

  @Expose()
  mimeType: string | null = null;

  @Expose()
  storageProvider: string | null = null;
}
