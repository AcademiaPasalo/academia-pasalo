export interface DispatchClassPayload {
  type:
    | (typeof import('@modules/notifications/domain/notification.constants').NOTIFICATION_TYPE_CODES)['CLASS_SCHEDULED']
    | (typeof import('@modules/notifications/domain/notification.constants').NOTIFICATION_TYPE_CODES)['CLASS_UPDATED']
    | (typeof import('@modules/notifications/domain/notification.constants').NOTIFICATION_TYPE_CODES)['CLASS_CANCELLED'];
  classEventId: string;
}

export interface DispatchMaterialPayload {
  type: (typeof import('@modules/notifications/domain/notification.constants').NOTIFICATION_TYPE_CODES)['NEW_MATERIAL'];
  materialId: string;
  folderId: string;
}

export type DispatchPayload = DispatchClassPayload | DispatchMaterialPayload;

export interface ClassReminderPayload {
  classEventId: string;
  reminderMinutes: number;
}
