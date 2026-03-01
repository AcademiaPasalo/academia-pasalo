export interface ClassEventContext {
  classEventId: string;
  classTitle: string;
  startDatetime: Date;
  courseCycleId: string;
  courseName: string;
  recipientUserIds: string[];
}

export interface MaterialContext {
  materialId: string;
  folderId: string;
  materialDisplayName: string;
  courseName: string;
  recipientUserIds: string[];
}
