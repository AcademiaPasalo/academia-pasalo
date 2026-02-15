export const EVALUATION_TYPE_CODES = {
  PC: 'PC',
  EX: 'EX',
  LAB: 'LAB',
  TUTORING: 'TUTORING',
  BANCO_ENUNCIADOS: 'BANCO_ENUNCIADOS',
} as const;

export const EVALUATION_ACCESS_STATUS_CODES = {
  LOCKED: 'LOCKED',
  UPCOMING: 'UPCOMING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
} as const;

export type EvaluationTypeCode =
  (typeof EVALUATION_TYPE_CODES)[keyof typeof EVALUATION_TYPE_CODES];

export type EvaluationAccessStatusCode =
  (typeof EVALUATION_ACCESS_STATUS_CODES)[keyof typeof EVALUATION_ACCESS_STATUS_CODES];
