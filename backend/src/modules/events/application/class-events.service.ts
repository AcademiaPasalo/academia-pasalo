import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ClassEventRepository } from '@modules/events/infrastructure/class-event.repository';
import { ClassEventProfessorRepository } from '@modules/events/infrastructure/class-event-professor.repository';
import { ClassEventRecordingStatusRepository } from '@modules/events/infrastructure/class-event-recording-status.repository';
import { EvaluationRepository } from '@modules/evaluations/infrastructure/evaluation.repository';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import { ClassEvent } from '@modules/events/domain/class-event.entity';
import { User } from '@modules/users/domain/user.entity';
import { technicalSettings } from '@config/technical-settings';
import { getEpoch } from '@common/utils/date.util';
import { CategoryCycleContext } from '@modules/events/interfaces/class-event.interfaces';
import {
  ClassEventAccess,
  ClassEventStatus,
  CLASS_EVENT_CACHE_KEYS,
  CLASS_EVENT_RECORDING_STATUS_CODES,
  CLASS_EVENT_STATUS,
} from '@modules/events/domain/class-event.constants';
import { ClassEventsPermissionService } from '@modules/events/application/class-events-permission.service';
import { ClassEventsSchedulingService } from '@modules/events/application/class-events-scheduling.service';
import { ClassEventsCacheService } from '@modules/events/application/class-events-cache.service';
import { NotificationsDispatchService } from '@modules/notifications/application/notifications-dispatch.service';
import { STORAGE_PROVIDER_CODES } from '@modules/materials/domain/material.constants';
import { AuthorizedMediaLinkDto } from '@modules/media-access/dto/authorized-media-link.dto';
import {
  MEDIA_ACCESS_MODES,
  MEDIA_CONTENT_KINDS,
  MEDIA_VIDEO_LINK_MODES,
} from '@modules/media-access/domain/media-access.constants';
import {
  buildDrivePreviewUrl,
  extractDriveFileIdFromUrl,
} from '@modules/media-access/domain/media-access-url.util';
import { DriveAccessScopeService } from '@modules/media-access/application/drive-access-scope.service';
import { StorageService } from '@infrastructure/storage/storage.service';

@Injectable()
export class ClassEventsService {
  private readonly logger = new Logger(ClassEventsService.name);
  private readonly EVENT_CACHE_TTL =
    technicalSettings.cache.events.classEventsCacheTtlSeconds;
  private readonly RECORDING_STATUS_CACHE_TTL =
    technicalSettings.cache.events.recordingStatusCatalogCacheTtlSeconds;

  constructor(
    private readonly dataSource: DataSource,
    private readonly classEventRepository: ClassEventRepository,
    private readonly classEventProfessorRepository: ClassEventProfessorRepository,
    private readonly classEventRecordingStatusRepository: ClassEventRecordingStatusRepository,
    private readonly evaluationRepository: EvaluationRepository,
    private readonly permissionService: ClassEventsPermissionService,
    private readonly schedulingService: ClassEventsSchedulingService,
    private readonly cacheModuleService: ClassEventsCacheService,
    private readonly cacheService: RedisCacheService,
    private readonly notificationsDispatchService: NotificationsDispatchService,
    private readonly driveAccessScopeService: DriveAccessScopeService,
    private readonly storageService: StorageService,
  ) {}

  async createEvent(
    evaluationId: string,
    sessionNumber: number,
    title: string,
    topic: string,
    startDatetime: Date,
    endDatetime: Date,
    liveMeetingUrl: string,
    creatorUser: User,
  ): Promise<ClassEvent> {
    const evaluation =
      await this.evaluationRepository.findByIdWithCycle(evaluationId);
    if (!evaluation) {
      throw new NotFoundException('Evaluación no encontrada');
    }
    await this.permissionService.assertMutationAllowedForEvaluation(
      creatorUser,
      evaluation,
    );

    this.schedulingService.validateEventDates(
      startDatetime,
      endDatetime,
      evaluation.startDate,
      evaluation.endDate,
    );

    const courseTypeId = evaluation.courseCycle?.course?.courseTypeId;
    const academicCycleId = evaluation.courseCycle?.academicCycleId;
    if (!courseTypeId || !academicCycleId) {
      throw new InternalServerErrorException(
        'No se pudo resolver la categoría o ciclo académico del curso',
      );
    }

    const categoryCycleContext: CategoryCycleContext = {
      courseTypeId,
      academicCycleId,
    };

    const created = await this.dataSource.transaction(async (manager) => {
      const lockKey = await this.schedulingService.acquireCalendarLock(
        manager,
        courseTypeId,
        academicCycleId,
      );

      try {
        const overlap = await this.schedulingService.findOverlap(
          evaluation.courseCycleId,
          startDatetime,
          endDatetime,
          undefined,
          manager,
        );

        if (overlap) {
          throw new ConflictException(
            `El horario ya está ocupado por la sesión ${overlap.sessionNumber} de ${overlap.evaluation.evaluationType.name}${overlap.evaluation.number}`,
          );
        }

        const notAvailableStatusId = await this.getRecordingStatusIdByCode(
          CLASS_EVENT_RECORDING_STATUS_CODES.NOT_AVAILABLE,
          manager,
        );

        const existingSession =
          await this.classEventRepository.findByEvaluationAndSessionNumber(
            evaluationId,
            sessionNumber,
            manager,
          );

        if (existingSession) {
          throw new ConflictException(
            `Ya existe la sesión ${sessionNumber} para esta evaluación`,
          );
        }

        const classEvent = await this.classEventRepository.create(
          {
            evaluationId,
            sessionNumber,
            title,
            topic,
            startDatetime,
            endDatetime,
            liveMeetingUrl,
            recordingStatusId: notAvailableStatusId,
            isCancelled: false,
            createdBy: creatorUser.id,
            createdAt: new Date(),
            updatedAt: null,
          },
          manager,
        );

        await this.classEventProfessorRepository.assignProfessor(
          classEvent.id,
          creatorUser.id,
          manager,
        );

        return classEvent;
      } finally {
        await this.schedulingService.releaseCalendarLock(manager, lockKey);
      }
    });

    await this.cacheModuleService.invalidateForEvaluation(
      evaluationId,
      undefined,
      categoryCycleContext,
    );

    void this.notificationsDispatchService.dispatchClassScheduled(created.id);
    void this.notificationsDispatchService.scheduleClassReminder(
      created.id,
      created.startDatetime,
    );

    return created;
  }

  async getEventsByEvaluation(
    evaluationId: string,
    userId: string,
  ): Promise<ClassEvent[]> {
    const isAuthorized = await this.permissionService.checkUserAuthorization(
      userId,
      evaluationId,
    );
    if (!isAuthorized) {
      throw new ForbiddenException('No tienes acceso a esta evaluación');
    }

    const cacheKey = CLASS_EVENT_CACHE_KEYS.EVALUATION_LIST(evaluationId);
    const cached = await this.cacheService.get<ClassEvent[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const events =
      await this.classEventRepository.findByEvaluationId(evaluationId);

    await this.cacheService.set(cacheKey, events, this.EVENT_CACHE_TTL);

    return events;
  }

  async getEventDetail(eventId: string, userId: string): Promise<ClassEvent> {
    const event = await this.classEventRepository.findById(eventId);

    if (!event) {
      throw new NotFoundException('Evento de clase no encontrado');
    }

    const isAuthorized = await this.permissionService.checkUserAuthorization(
      userId,
      event.evaluationId,
    );
    if (!isAuthorized) {
      throw new ForbiddenException('No tienes acceso a este evento');
    }

    return event;
  }

  async getAuthorizedRecordingLink(
    user: User,
    eventId: string,
  ): Promise<AuthorizedMediaLinkDto> {
    const event = await this.getEventDetail(eventId, user.id);
    if (!event.recordingUrl && !event.recordingFileId) {
      throw new NotFoundException(
        'Grabacion no disponible para este evento de clase',
      );
    }

    const driveFileId =
      String(event.recordingFileId || '').trim() ||
      extractDriveFileIdFromUrl(event.recordingUrl || '');
    if (!driveFileId) {
      throw new BadRequestException(
        'Grabacion sin ID de archivo Drive. Configure URL de Drive para control de acceso',
      );
    }
    const scope = await this.driveAccessScopeService.resolveForEvaluation(
      event.evaluationId,
    );
    const expectedVideosFolderId = scope.persisted?.driveVideosFolderId;
    if (!expectedVideosFolderId) {
      throw new ForbiddenException(
        'El scope Drive de la evaluacion no esta provisionado para videos',
      );
    }

    const isInExpectedFolder =
      await this.storageService.isDriveFileDirectlyInFolder(
        driveFileId,
        expectedVideosFolderId,
      );
    if (!isInExpectedFolder) {
      throw new ForbiddenException(
        'La grabacion no pertenece al scope Drive autorizado para esta evaluacion',
      );
    }

    const url = buildDrivePreviewUrl(driveFileId);

    return {
      contentKind: MEDIA_CONTENT_KINDS.VIDEO,
      accessMode: MEDIA_ACCESS_MODES.DIRECT_URL,
      evaluationId: event.evaluationId,
      driveFileId,
      url,
      expiresAt: null,
      requestedMode: MEDIA_VIDEO_LINK_MODES.EMBED,
      fileName: null,
      mimeType: null,
      storageProvider: driveFileId ? STORAGE_PROVIDER_CODES.GDRIVE : null,
    };
  }

  async updateEvent(
    eventId: string,
    user: User,
    title?: string,
    topic?: string,
    startDatetime?: Date,
    endDatetime?: Date,
    liveMeetingUrl?: string,
    recordingUrl?: string,
  ): Promise<ClassEvent> {
    const event = await this.classEventRepository.findByIdSimple(eventId);
    if (!event) {
      throw new NotFoundException('Evento de clase no encontrado');
    }

    this.permissionService.validateEventOwnership(event.createdBy, user);
    const evaluation = await this.evaluationRepository.findByIdWithCycle(
      event.evaluationId,
    );
    if (!evaluation) {
      throw new NotFoundException('Evaluación no encontrada');
    }
    await this.permissionService.assertMutationAllowedForEvaluation(
      user,
      evaluation,
    );

    const updateData: Partial<ClassEvent> = {};
    if (title !== undefined) updateData.title = title;
    if (topic !== undefined) updateData.topic = topic;
    if (startDatetime !== undefined) updateData.startDatetime = startDatetime;
    if (endDatetime !== undefined) updateData.endDatetime = endDatetime;
    if (liveMeetingUrl !== undefined)
      updateData.liveMeetingUrl = liveMeetingUrl;
    if (recordingUrl !== undefined) updateData.recordingUrl = recordingUrl;
    if (recordingUrl !== undefined) {
      const extractedFileId = extractDriveFileIdFromUrl(recordingUrl);
      updateData.recordingFileId = extractedFileId;
    }

    if (recordingUrl !== undefined) {
      const readyStatusId = await this.getRecordingStatusIdByCode(
        CLASS_EVENT_RECORDING_STATUS_CODES.READY,
      );
      updateData.recordingStatusId = readyStatusId;
    }

    const courseTypeId = evaluation.courseCycle?.course?.courseTypeId;
    const academicCycleId = evaluation.courseCycle?.academicCycleId;
    if (!courseTypeId || !academicCycleId) {
      throw new InternalServerErrorException(
        'No se pudo resolver la categoría o ciclo académico del curso',
      );
    }
    const categoryCycleContext: CategoryCycleContext = {
      courseTypeId,
      academicCycleId,
    };

    let updated: ClassEvent;
    if (startDatetime || endDatetime) {
      const finalStart = startDatetime || event.startDatetime;
      const finalEnd = endDatetime || event.endDatetime;

      this.schedulingService.validateEventDates(
        finalStart,
        finalEnd,
        evaluation.startDate,
        evaluation.endDate,
      );

      updated = await this.dataSource.transaction(async (manager) => {
        const lockKey = await this.schedulingService.acquireCalendarLock(
          manager,
          courseTypeId,
          academicCycleId,
        );

        try {
          const overlap = await this.schedulingService.findOverlap(
            evaluation.courseCycleId,
            finalStart,
            finalEnd,
            eventId,
            manager,
          );

          if (overlap) {
            throw new ConflictException(
              `No es posible actualizar el horario. Existe un cruce con la sesión ${overlap.sessionNumber} de ${overlap.evaluation.evaluationType.name}${overlap.evaluation.number}`,
            );
          }

          return await this.classEventRepository.update(
            eventId,
            updateData,
            manager,
          );
        } finally {
          await this.schedulingService.releaseCalendarLock(manager, lockKey);
        }
      });
    } else {
      updated = await this.classEventRepository.update(eventId, updateData);
    }

    await this.cacheModuleService.invalidateForEvaluation(
      event.evaluationId,
      eventId,
      categoryCycleContext,
    );

    void this.notificationsDispatchService.dispatchClassUpdated(eventId);
    if (startDatetime !== undefined) {
      void this.notificationsDispatchService.scheduleClassReminder(
        eventId,
        updated.startDatetime,
      );
    }

    return updated;
  }

  async cancelEvent(eventId: string, user: User): Promise<void> {
    const event = await this.classEventRepository.findByIdSimple(eventId);
    if (!event) {
      throw new NotFoundException('Evento de clase no encontrado');
    }

    if (event.isCancelled) {
      throw new BadRequestException('El evento ya está cancelado');
    }

    this.permissionService.validateEventOwnership(event.createdBy, user);
    const evaluation = await this.evaluationRepository.findByIdWithCycle(
      event.evaluationId,
    );
    if (!evaluation) {
      throw new NotFoundException('Evaluación no encontrada');
    }
    await this.permissionService.assertMutationAllowedForEvaluation(
      user,
      evaluation,
    );

    await this.classEventRepository.cancelEvent(eventId);

    await this.cacheModuleService.invalidateForEvaluation(
      event.evaluationId,
      eventId,
    );

    void this.notificationsDispatchService.dispatchClassCancelled(eventId);
    void this.notificationsDispatchService.cancelClassReminder(eventId);
  }

  async assignProfessor(
    eventId: string,
    professorUserId: string,
  ): Promise<void> {
    const event = await this.classEventRepository.findByIdSimple(eventId);
    if (!event) {
      throw new NotFoundException('Evento de clase no encontrado');
    }

    await this.classEventProfessorRepository.assignProfessor(
      eventId,
      professorUserId,
    );

    await this.cacheModuleService.invalidateForEvaluation(
      event.evaluationId,
      eventId,
    );
  }

  async removeProfessor(
    eventId: string,
    professorUserId: string,
  ): Promise<void> {
    const event = await this.classEventRepository.findByIdSimple(eventId);
    if (!event) {
      throw new NotFoundException('Evento de clase no encontrado');
    }

    if (event.createdBy === professorUserId) {
      throw new BadRequestException(
        'No se puede remover al creador del evento',
      );
    }

    const isAssigned =
      await this.classEventProfessorRepository.isProfessorAssigned(
        eventId,
        professorUserId,
      );
    if (!isAssigned) {
      throw new NotFoundException('El profesor no está asignado a este evento');
    }

    await this.classEventProfessorRepository.revokeProfessor(
      eventId,
      professorUserId,
    );

    await this.cacheModuleService.invalidateForEvaluation(
      event.evaluationId,
      eventId,
    );
  }

  calculateEventStatus(
    event: ClassEvent,
    nowReference?: Date,
  ): ClassEventStatus {
    if (event.isCancelled) {
      return CLASS_EVENT_STATUS.CANCELADA;
    }

    const nowTime = getEpoch(nowReference || new Date());
    const startTime = getEpoch(event.startDatetime);
    const endTime = getEpoch(event.endDatetime);

    if (nowTime < startTime) {
      return CLASS_EVENT_STATUS.PROGRAMADA;
    }
    if (nowTime >= startTime && nowTime < endTime) {
      return CLASS_EVENT_STATUS.EN_CURSO;
    }
    return CLASS_EVENT_STATUS.FINALIZADA;
  }

  canJoinLive(): Promise<boolean> {
    return Promise.resolve(false);
  }

  canWatchRecording(): Promise<boolean> {
    return Promise.resolve(false);
  }

  getEventAccess(event: ClassEvent): ClassEventAccess {
    const recordingCode = String(event.recordingStatus?.code || '').trim();
    const canWatchRecording =
      recordingCode === CLASS_EVENT_RECORDING_STATUS_CODES.READY;

    return {
      canJoinLive: false,
      canWatchRecording,
      canCopyLiveLink: false,
      canCopyRecordingLink: false,
    };
  }

  canAccessMeetingLink(): Promise<boolean> {
    return Promise.resolve(false);
  }

  async checkUserAuthorizationForUser(
    user: User,
    evaluationId: string,
  ): Promise<boolean> {
    return await this.permissionService.checkUserAuthorizationForUser(
      user,
      evaluationId,
    );
  }

  async checkUserAuthorization(
    userId: string,
    evaluationId: string,
  ): Promise<boolean> {
    return await this.permissionService.checkUserAuthorization(
      userId,
      evaluationId,
    );
  }

  private async getRecordingStatusIdByCode(
    code: string,
    manager?: import('typeorm').EntityManager,
  ): Promise<string> {
    const cacheKey = this.cacheModuleService.getRecordingStatusCacheKey(code);
    const cached = await this.cacheService.get<string>(cacheKey);
    if (cached) {
      return cached;
    }

    const status = await this.classEventRecordingStatusRepository.findByCode(
      code,
      manager,
    );
    if (!status) {
      throw new InternalServerErrorException(
        `Estado de grabación ${code} no configurado`,
      );
    }

    await this.cacheService.set(
      cacheKey,
      status.id,
      this.RECORDING_STATUS_CACHE_TTL,
    );
    return status.id;
  }
}
