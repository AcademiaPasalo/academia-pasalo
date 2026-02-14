export const MATERIAL_STATUS_CODES = {
  ACTIVE: 'ACTIVE',
  HIDDEN: 'HIDDEN',
  ARCHIVED: 'ARCHIVED',
} as const;

export const FOLDER_STATUS_CODES = {
  ACTIVE: 'ACTIVE',
  HIDDEN: 'HIDDEN',
  ARCHIVED: 'ARCHIVED',
} as const;

export const DELETION_REQUEST_STATUS_CODES = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export const MATERIAL_CACHE_KEYS = {
  ROOTS: (evaluationId: string) => `cache:materials:roots:eval:${evaluationId}`,
  CONTENTS: (folderId: string) => `cache:materials:contents:folder:${folderId}`,
  CLASS_EVENT: (classEventId: string) =>
    `cache:materials:class-event:${classEventId}`,
} as const;

export type MaterialStatusCode =
  (typeof MATERIAL_STATUS_CODES)[keyof typeof MATERIAL_STATUS_CODES];
export type FolderStatusCode =
  (typeof FOLDER_STATUS_CODES)[keyof typeof FOLDER_STATUS_CODES];
export type DeletionRequestStatusCode =
  (typeof DELETION_REQUEST_STATUS_CODES)[keyof typeof DELETION_REQUEST_STATUS_CODES];
