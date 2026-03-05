export const NOTIFICATION_TYPE_CODES = {
  NEW_MATERIAL: 'NEW_MATERIAL',
  CLASS_SCHEDULED: 'CLASS_SCHEDULED',
  CLASS_UPDATED: 'CLASS_UPDATED',
  CLASS_CANCELLED: 'CLASS_CANCELLED',
  CLASS_REMINDER: 'CLASS_REMINDER',
  DELETION_REQUEST_APPROVED: 'DELETION_REQUEST_APPROVED',
  DELETION_REQUEST_REJECTED: 'DELETION_REQUEST_REJECTED',
} as const;

export type NotificationTypeCode =
  (typeof NOTIFICATION_TYPE_CODES)[keyof typeof NOTIFICATION_TYPE_CODES];

export const NOTIFICATION_JOB_NAMES = {
  DISPATCH: 'dispatch-notification',
  CLEANUP: 'cleanup-old-notifications',
  CLASS_REMINDER: 'class-reminder',
} as const;

export const NOTIFICATION_CACHE_KEYS = {
  UNREAD_COUNT: (userId: string) =>
    `cache:notifications:unread-count:${userId}`,
  TYPE_BY_CODE: (code: string) => `cache:notifications:type:${code}`,
  ACTIVE_ENROLLMENT_STATUS_ID:
    'cache:notifications:active-enrollment-status-id',
} as const;

export const NOTIFICATION_SYSTEM_SETTING_KEYS = {
  CLEANUP_RETENTION_DAYS: 'NOTIFICATION_CLEANUP_RETENTION_DAYS',
  REMINDER_MINUTES: 'NOTIFICATION_REMINDER_MINUTES',
} as const;

export const NOTIFICATION_ENTITY_TYPES = {
  MATERIAL_FOLDER: 'material_folder',
  CLASS_EVENT: 'class_event',
  DELETION_REQUEST: 'deletion_request',
} as const;

export const NOTIFICATION_MESSAGES = {
  [NOTIFICATION_TYPE_CODES.NEW_MATERIAL]: {
    title: 'Nuevo material disponible',
    message: (displayName: string, courseName: string) =>
      `Se publicó '${displayName}' en el curso ${courseName}.`,
  },
  [NOTIFICATION_TYPE_CODES.CLASS_SCHEDULED]: {
    title: 'Nueva clase programada',
    message: (classTitle: string, fecha: string) =>
      `La clase '${classTitle}' ha sido programada para el ${fecha}.`,
  },
  [NOTIFICATION_TYPE_CODES.CLASS_UPDATED]: {
    title: 'Clase actualizada',
    message: (classTitle: string, nuevaFecha: string) =>
      `La clase '${classTitle}' ha sido reprogramada al ${nuevaFecha}.`,
  },
  [NOTIFICATION_TYPE_CODES.CLASS_CANCELLED]: {
    title: 'Clase cancelada',
    message: (classTitle: string, fecha: string) =>
      `La clase '${classTitle}' programada para el ${fecha} ha sido cancelada.`,
  },
  [NOTIFICATION_TYPE_CODES.CLASS_REMINDER]: {
    title: 'Recordatorio de clase',
    message: (classTitle: string, minutosRestantes: number) =>
      `Tienes una clase '${classTitle}' en ${minutosRestantes} minutos.`,
  },
  [NOTIFICATION_TYPE_CODES.DELETION_REQUEST_APPROVED]: {
    title: 'Solicitud de eliminación aprobada',
    message: (displayName: string) =>
      `Tu solicitud de eliminación del material '${displayName}' fue aprobada.`,
  },
  [NOTIFICATION_TYPE_CODES.DELETION_REQUEST_REJECTED]: {
    title: 'Solicitud de eliminación rechazada',
    message: (displayName: string, adminComment?: string) =>
      adminComment && adminComment.trim().length > 0
        ? `Tu solicitud de eliminación del material '${displayName}' fue rechazada. Motivo: ${adminComment.trim()}.`
        : `Tu solicitud de eliminación del material '${displayName}' fue rechazada.`,
  },
} as const;
