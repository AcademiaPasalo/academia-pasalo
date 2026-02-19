export const COURSE_CACHE_KEYS = {
  COURSE_CONTENT: (courseCycleId: string, userId: string) =>
    `cache:content:cycle:${courseCycleId}:user:${userId}`,
  PROFESSOR_ASSIGNMENT: (evaluationId: string, userId: string) =>
    `cache:prof-assignment:eval:${evaluationId}:user:${userId}`,
  PROFESSORS_LIST: (courseCycleId: string) =>
    `cache:prof-list:cycle:${courseCycleId}`,
  GLOBAL_CONTENT_GROUP: 'cache:content:cycle:*',
  GLOBAL_PROFESSOR_ASSIGNMENT_GROUP: 'cache:prof-assignment:*',
  GLOBAL_PROFESSOR_LIST_GROUP: 'cache:prof-list:cycle:*',
} as const;
