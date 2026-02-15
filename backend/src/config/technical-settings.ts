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
    // src/infrastructure/queue/queue.module.ts
    defaultAttempts: 3,
    // src/infrastructure/queue/queue.module.ts
    backoffDelayMs: 5000,
    // src/infrastructure/queue/queue.module.ts
    backoffType: 'exponential' as const,
    // src/infrastructure/queue/queue.module.ts
    removeOnComplete: true,
    // src/infrastructure/queue/queue.module.ts
    removeOnFail: false,
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
} as const;
