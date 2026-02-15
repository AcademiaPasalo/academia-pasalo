export const COURSE_CACHE_KEYS = {
  COURSE_CONTENT: (courseCycleId: string, userId: string) =>
    `cache:content:cycle:${courseCycleId}:user:${userId}`,
} as const;
