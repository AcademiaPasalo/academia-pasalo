export const STUDENT_EVALUATION_LABELS = {
  COMPLETED: 'Completado',
  IN_PROGRESS: 'En curso',
  UPCOMING: 'Próximamente',
  LOCKED: 'Bloqueado',
  ARCHIVED: 'Archivado',
} as const;

export type StudentEvaluationLabel =
  (typeof STUDENT_EVALUATION_LABELS)[keyof typeof STUDENT_EVALUATION_LABELS];
