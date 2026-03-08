const envNumberOrDefault = (envName: string, fallback: number): number => {
  const raw = process.env[envName];
  if (raw == null || String(raw).trim() === '') {
    return fallback;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const envStringOrDefault = (envName: string, fallback: string): string => {
  const raw = process.env[envName];
  if (raw == null) {
    return fallback;
  }
  const normalized = String(raw).trim();
  if (!normalized) {
    return fallback;
  }
  return normalized;
};

export const technicalSettings = {
  throttler: {
    // src/app.module.ts
    ttlMs: 60000, // 60s
    // src/app.module.ts
    limit: 500000,
  },

  http: {
    // src/main.ts
    defaultPort: 3000,
    // src/main.ts
    defaultApiPrefix: 'api/v1',
    // src/main.ts
    defaultCorsOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    // src/main.ts
    corsOptionsSuccessStatus: 204,
    // src/main.ts
    corsAllowedMethods: [
      'GET',
      'HEAD',
      'PUT',
      'PATCH',
      'POST',
      'DELETE',
      'OPTIONS',
    ],
    // src/main.ts
    corsAllowedHeaders: ['Content-Type', 'Authorization'],
  },

  auth: {
    tokens: {
      // src/modules/auth/application/auth-settings.service.ts
      accessTokenTtlMinutes: 180, // 3h
      // src/modules/auth/application/auth-settings.service.ts
      refreshTokenTtlDays: 7, // 7d
      // src/modules/auth/application/auth-settings.service.ts
      sessionExpirationWarningMinutes: 10, // 10m

      // src/modules/auth/presentation/auth.controller.ts
      authResponseExpiresInSeconds: 180 * 60, // 3h

      // src/modules/auth/auth.module.ts
      jwtModuleDefaultAccessTokenExpiresIn: '180m',

      // src/modules/auth/application/auth.service.ts
      refreshTokenBlacklistTtlSeconds: 7 * 24 * 60 * 60, // 7d
    },

    session: {
      // src/modules/auth/strategies/jwt.strategy.ts
      sessionUserCacheTtlSeconds: 3600,
    },

    oauth: {
      // src/modules/auth/application/google-provider.service.ts
      googleRedirectUriFallback: 'postmessage',
    },

    security: {
      // src/modules/auth/application/session.service.ts
      anomalyStrikeThreshold: 2,
      maxPendingSessionsPerUser: 5,
      coordinates: {
        minLat: -90,
        maxLat: 90,
        minLon: -180,
        maxLon: 180,
      },
    },
  },

  materials: {
    // src/modules/materials/application/materials.service.ts
    maxFolderDepth: Math.max(
      2,
      Math.floor(envNumberOrDefault('MATERIALS_MAX_FOLDER_DEPTH', 3)),
    ),
  },

  cache: {
    redis: {
      // src/infrastructure/cache/redis-cache.service.ts
      defaultHost: 'localhost',
      // src/infrastructure/cache/redis-cache.service.ts
      defaultPort: 6379,
      // src/infrastructure/cache/redis-cache.service.ts
      invalidateGroupScanCount: 100,
    },

    settings: {
      // src/modules/settings/infrastructure/system-setting.repository.ts
      systemSettingCacheTtlSeconds: 3600, // 60m
    },

    events: {
      // src/modules/events/application/class-events.service.ts
      classEventsCacheTtlSeconds: 1800, // 30m
      // src/modules/events/application/class-events.service.ts
      calendarLockTimeoutSeconds: 10, // 10s
      // src/modules/events/application/class-events.service.ts
      cycleActiveCacheTtlSeconds: 3600, // 60m
      // src/modules/events/application/class-events.service.ts
      professorAssignmentCacheTtlSeconds: 3600, // 60m
      // src/modules/events/application/class-events.service.ts
      recordingStatusCatalogCacheTtlSeconds: 21600, // 6h

      // src/modules/events/presentation/class-events.controller.ts
      myScheduleDefaultRangeDays: 7, // 7d
    },

    courses: {
      // src/modules/courses/application/courses.service.ts
      courseContentCacheTtlSeconds: 600, // 10m
      // src/modules/courses/application/courses.service.ts
      professorAssignmentCacheTtlSeconds: 3600, // 60m
      // src/modules/courses/application/courses.service.ts
      courseCycleExistsCacheTtlSeconds: 30, // 30s
    },

    enrollments: {
      // src/modules/enrollments/application/enrollments.service.ts
      myEnrollmentsDashboardCacheTtlSeconds: 3600, // 60m
      // src/modules/enrollments/application/access-engine.service.ts
      accessCheckCacheTtlSeconds: 3600, // 60m
    },

    feedback: {
      // src/modules/feedback/application/feedback.service.ts
      publicFeaturedTestimoniesCacheTtlSeconds: 600, // 10m
    },

    materials: {
      // src/modules/materials/application/materials.service.ts
      materialsExplorerCacheTtlSeconds: 300, // 5m
    },

    notifications: {
      // src/modules/notifications/infrastructure/notification-type.repository.ts
      notificationTypeCacheTtlSeconds: 21600, // 6h — catálogo estático
      // src/modules/notifications/application/notification-recipients.service.ts
      activeEnrollmentStatusCacheTtlSeconds: 21600, // 6h — catálogo estático
      // src/modules/notifications/infrastructure/user-notification.repository.ts
      unreadCountCacheTtlSeconds: 60,
    },
  },

  database: {
    typeorm: {
      // src/infrastructure/database/database.module.ts
      retryAttempts: 10,
      // src/infrastructure/database/database.module.ts
      retryDelayMs: 5000, // 5s

      pool: {
        // src/infrastructure/database/database.module.ts
        connectionLimit: 50,
        // src/infrastructure/database/database.module.ts
        waitForConnections: true,
        // src/infrastructure/database/database.module.ts
        queueLimit: 0,
        // src/infrastructure/database/database.module.ts
        connectTimeoutMs: 10000, // 10s
      },

      // src/infrastructure/database/database.module.ts
      timezone: 'Z',
    },

    batching: {
      // src/modules/evaluations/infrastructure/evaluation.subscriber.ts
      evaluationSubscriberBatchSize: 100,
    },
  },

  uploads: {
    // src/modules/feedback/presentation/feedback.controller.ts
    feedbackPhotoMaxSizeBytes: 5 * 1024 * 1024, // 5MB
    // src/modules/feedback/presentation/feedback.controller.ts
    feedbackPhotoAllowedExtensionsRegex: /(jpg|jpeg|png)$/,

    materials: {
      // src/modules/materials/application/materials.service.ts
      allowedMimeTypes: [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'application/zip',
      ],
      // src/modules/materials/application/materials.service.ts
      pdfMagicHeaderHex: '25504446',
    },

    feedback: {
      // src/modules/feedback/application/feedback.service.ts
      feedbackDriveFolderName: 'feedback_images',
    },

    storage: {
      // src/infrastructure/storage/storage.service.ts
      storagePathFallback: 'uploads',
    },
  },

  geo: {
    // src/modules/auth/application/geolocation.service.ts
    earthRadiusKm: 6371,

    // src/infrastructure/geo/geoip-lite.service.ts
    mockGeoEnabled: process.env.MOCK_GEO_ENABLED === 'true',
    mockGeoDefaultLat: '0',
    mockGeoDefaultLon: '0',
  },

  responses: {
    // src/common/interceptors/transform.interceptor.ts
    defaultSuccessMessage: 'Operación exitosa',

    // src/common/filters/all-exceptions.filter.ts
    defaultInternalServerErrorMessage:
      'Error Interno del Servidor. Por favor contacte con la academia.',
  },

  queue: {
    enableRepeatSchedulers: process.env.DISABLE_REPEAT_SCHEDULERS !== '1',
    // src/infrastructure/queue/queue.module.ts
    defaultAttempts: Math.max(
      1,
      envNumberOrDefault('QUEUE_DEFAULT_ATTEMPTS', 3),
    ),
    // src/infrastructure/queue/queue.module.ts
    backoffDelayMs: Math.max(
      0,
      envNumberOrDefault('QUEUE_BACKOFF_DELAY_MS', 5000),
    ),
    // src/infrastructure/queue/queue.module.ts
    backoffType: 'exponential' as const,
    // src/infrastructure/queue/queue.module.ts
    removeOnCompleteCount: 50,
    // src/infrastructure/queue/queue.module.ts
    removeOnFailCount: 100,
  },

  mediaAccess: {
    staffViewersGroupEmail: envStringOrDefault(
      'GOOGLE_WORKSPACE_STAFF_VIEWERS_GROUP_EMAIL',
      '',
    ),
    reconciliationScopeBatchSize: 100,
    reconciliationMutationDelayMs: 50,
  },

  audit: {
    // src/modules/audit/application/audit.service.ts
    cleanupCronPattern: '0 0 3 1 * *',
    // src/modules/audit/infrastructure/processors/audit-cleanup.processor.ts
    retentionDefaultDays: 30,
    // src/modules/audit/infrastructure/processors/audit-cleanup.processor.ts
    retentionMinSafeDays: 7,
    // src/modules/audit/infrastructure/audit-log.repository.ts
    cleanupBatchSize: 5000,
    // src/modules/audit/infrastructure/audit-log.repository.ts
    maxCleanupBatchesPerRun: 100,
  },

  notifications: {
    // src/modules/notifications/application/notifications.service.ts
    cleanupCronPattern: '0 0 2 1 * *',
    // src/modules/notifications/infrastructure/processors/notification-dispatch.processor.ts
    retentionDefaultDays: 180,
    // src/modules/notifications/infrastructure/processors/notification-dispatch.processor.ts
    retentionMinSafeDays: 30,
    // src/modules/notifications/infrastructure/processors/notification-dispatch.processor.ts
    cleanupBatchSize: 1000,
    // src/modules/notifications/infrastructure/processors/notification-dispatch.processor.ts
    maxCleanupBatchesPerRun: 100,
    // src/modules/notifications/application/notifications-dispatch.service.ts
    reminderDefaultMinutes: 1440,
    // src/modules/notifications/application/notifications-dispatch.service.ts
    reminderMinMinutes: 30,
    // src/modules/notifications/application/notifications-dispatch.service.ts
    reminderMaxMinutes: 10080,
    // src/modules/notifications/application/notifications-dispatch.service.ts
    reminderMinEnqueueMs: 120000, // 2 minutos — delay mínimo para encolar recordatorio
    // src/modules/notifications/infrastructure/processors/notification-dispatch.processor.ts
    workerLockDurationMs: 120000, // 2 minutos — lockDuration del worker BullMQ
    // src/modules/notifications/dto/get-notifications-query.dto.ts
    defaultPageLimit: 20,
  },
} as const;
