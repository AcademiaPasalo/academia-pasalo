export const COURSE_CACHE_KEYS = {
  COURSE_CONTENT: (courseCycleId: string, userId: string) =>
    `cache:content:cycle:${courseCycleId}:user:${userId}`,
  GLOBAL_CONTENT_GROUP: 'cache:content:cycle:*',
} as const;
