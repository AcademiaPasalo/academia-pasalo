const DRIVE_PREVIEW_URL = 'https://drive.google.com/file/d';
const DRIVE_DOWNLOAD_URL = 'https://drive.google.com/uc';

export function buildDrivePreviewUrl(fileId: string): string {
  return `${DRIVE_PREVIEW_URL}/${encodeURIComponent(fileId)}/preview`;
}

export function buildDriveViewUrl(fileId: string): string {
  return `${DRIVE_PREVIEW_URL}/${encodeURIComponent(fileId)}/view`;
}

export function buildDriveDownloadUrl(fileId: string): string {
  const params = new URLSearchParams({
    export: 'download',
    id: fileId,
  });
  return `${DRIVE_DOWNLOAD_URL}?${params.toString()}`;
}

export function extractDriveFileIdFromUrl(urlRaw: string): string | null {
  const candidate = String(urlRaw || '').trim();
  if (!candidate) {
    return null;
  }

  const byPath = candidate.match(/\/file\/d\/([^/?#]+)/i);
  if (byPath?.[1]) {
    return decodeURIComponent(byPath[1]);
  }

  try {
    const parsed = new URL(candidate);
    const byQuery = parsed.searchParams.get('id');
    if (byQuery) {
      return byQuery;
    }
  } catch {
    // Non URL input is treated as unsupported format.
  }

  return null;
}
