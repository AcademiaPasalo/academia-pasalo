import { IsIn, IsOptional } from 'class-validator';
import { MEDIA_DOCUMENT_LINK_MODES } from '@modules/media-access/domain/media-access.constants';
import type { MediaDocumentLinkMode } from '@modules/media-access/domain/media-access.constants';

export class GetAuthorizedDocumentLinkQueryDto {
  @IsOptional()
  @IsIn([MEDIA_DOCUMENT_LINK_MODES.VIEW, MEDIA_DOCUMENT_LINK_MODES.DOWNLOAD])
  mode?: MediaDocumentLinkMode;
}
