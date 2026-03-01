// ============================================
// MATERIAL TYPES - Materiales de Sesiones de Clase
// ============================================

export interface FileResource {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: string;
  storageProvider: string;
  checksumHash: string;
  storageKey: string;
  storageUrl: string | null;
  createdAt: string;
}

export interface FileVersion {
  id: string;
  fileResourceId: string;
  versionNumber: number;
  storageUrl: string | null;
  createdAt: string;
  createdById: string;
}

export interface ClassEventMaterial {
  id: string;
  materialFolderId: string;
  classEventId: string | null;
  fileResourceId: string;
  fileVersionId: string;
  displayName: string;
  visibleFrom: string | null;
  visibleUntil: string | null;
  createdAt: string;
  fileResource: FileResource;
  fileVersion: FileVersion;
}
