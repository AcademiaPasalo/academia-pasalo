import {
  buildDriveDownloadUrl,
  buildDrivePreviewUrl,
  buildDriveViewUrl,
  extractDriveFileIdFromUrl,
} from '@modules/media-access/domain/media-access-url.util';

describe('media-access-url.util', () => {
  it('builds Drive preview/view/download URLs', () => {
    expect(buildDrivePreviewUrl('abc123')).toBe(
      'https://drive.google.com/file/d/abc123/preview',
    );
    expect(buildDriveViewUrl('abc123')).toBe(
      'https://drive.google.com/file/d/abc123/view',
    );
    expect(buildDriveDownloadUrl('abc123')).toContain(
      'https://drive.google.com/uc?',
    );
  });

  it('extracts Drive file id from /file/d path', () => {
    expect(
      extractDriveFileIdFromUrl(
        'https://drive.google.com/file/d/drive-file-99/view?usp=drive_link',
      ),
    ).toBe('drive-file-99');
  });

  it('extracts Drive file id from id query param', () => {
    expect(
      extractDriveFileIdFromUrl(
        'https://drive.google.com/uc?export=download&id=drive-file-88',
      ),
    ).toBe('drive-file-88');
  });

  it('returns null when input is not a Drive URL with file id', () => {
    expect(extractDriveFileIdFromUrl('https://example.com/video.mp4')).toBe(
      null,
    );
  });
});
