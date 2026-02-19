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
import { EnrollmentEvaluationRepository } from '@modules/enrollments/infrastructure/enrollment-evaluation.repository';
import { CourseCycleProfessorRepository } from '@modules/courses/infrastructure/course-cycle-professor.repository';
import { UserRepository } from '@modules/users/infrastructure/user.repository';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import { ClassEvent } from '@modules/events/domain/class-event.entity';
import { User } from '@modules/users/domain/user.entity';
import { technicalSettings } from '@config/technical-settings';
import { getEpoch } from '@common/utils/date.util';
import {
  ClassEventAccess,
  ClassEventStatus,
  CLASS_EVENT_CACHE_KEYS,
  CLASS_EVENT_RECORDING_STATUS_CODES,
  CLASS_EVENT_STATUS,
} from '@modules/events/domain/class-event.constants';
import {
  ADMIN_ROLE_CODES,
  ROLE_CODES,
} from '@common/constants/role-codes.constants';
import { COURSE_CACHE_KEYS } from '@modules/courses/domain/course.constants';

@Injectable()
export class ClassEventsService {
  private readonly logger = new Logger(ClassEventsService.name);
  private readonly EVENT_CACHE_TTL =
    technicalSettings.cache.events.classEventsCacheTtlSeconds;
  private readonly CYCLE_ACTIVE_CACHE_TTL =
    technicalSettings.cache.events.cycleActiveCacheTtlSeconds;
  private readonly PROFESSOR_ASSIGNMENT_CACHE_TTL =
    technicalSettings.cache.events.professorAssignmentCacheTtlSeconds;
  private readonly RECORDING_STATUS_CACHE_TTL =
    technicalSettings.cache.events.recordingStatusCatalogCacheTtlSeconds;

  private getRecordingStatusCacheKey(code: string): string {
    return `cache:class-event-recording-status:code:${code}`;
  }

  constructor(
    private readonly dataSource: DataSource,
    private readonly classEventRepository: ClassEventRepository,
    private readonly classEventProfessorRepository: ClassEventProfessorRepository,
    private readonly classEventRecordingStatusRepository: ClassEventRecordingStatusRepository,
    private readonly evaluationRepository: EvaluationRepository,
    private readonly enrollmentEvaluationRepository: EnrollmentEvaluationRepository,
    private readonly courseCycleProfessorRepository: CourseCycleProfessorRepository,
    private readonly userRepository: UserRepository,
    private readonly cacheService: RedisCacheService,
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

    this.validateEventDates(
      startDatetime,
      endDatetime,
      evaluation.startDate,
      evaluation.endDate,
    );

    return await this.dataSource.transaction(async (manager) => {
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

      await this.invalidateEventCache(evaluationId);

      return classEvent;
    });
  }

  async getEventsByEvaluation(
    evaluationId: string,
    userId: string,
  ): Promise<ClassEvent[]> {
    const isAuthorized = await this.checkUserAuthorization(
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

    const isAuthorized = await this.checkUserAuthorization(
      userId,
      event.evaluationId,
    );
    if (!isAuthorized) {
      throw new ForbiddenException('No tienes acceso a este evento');
    }

    return event;
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

    this.validateEventOwnership(event.createdBy, user);

    const updateData: Partial<ClassEvent> = {};
    if (title !== undefined) updateData.title = title;
    if (topic !== undefined) updateData.topic = topic;
    if (startDatetime !== undefined) updateData.startDatetime = startDatetime;
    if (endDatetime !== undefined) updateData.endDatetime = endDatetime;
    if (liveMeetingUrl !== undefined)
      updateData.liveMeetingUrl = liveMeetingUrl;
    if (recordingUrl !== undefined) updateData.recordingUrl = recordingUrl;

    if (startDatetime || endDatetime) {
      const finalStart = startDatetime || event.startDatetime;
      const finalEnd = endDatetime || event.endDatetime;

      const evaluation = await this.evaluationRepository.findByIdWithCycle(
        event.evaluationId,
      );
      if (evaluation) {
        this.validateEventDates(
          finalStart,
          finalEnd,
          evaluation.startDate,
          evaluation.endDate,
        );
      }
    }

    if (recordingUrl !== undefined) {
      const readyStatusId = await this.getRecordingStatusIdByCode(
        CLASS_EVENT_RECORDING_STATUS_CODES.READY,
      );
      updateData.recordingStatusId = readyStatusId;
    }

    const updated = await this.classEventRepository.update(eventId, updateData);

    await this.invalidateEventCache(event.evaluationId, eventId);

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

    this.validateEventOwnership(event.createdBy, user);

    await this.classEventRepository.cancelEvent(eventId);

    await this.invalidateEventCache(event.evaluationId, eventId);
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

    await this.invalidateEventCache(event.evaluationId, eventId);
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

    await this.invalidateEventCache(event.evaluationId, eventId);
  }

  calculateEventStatus(event: ClassEvent): ClassEventStatus {
    if (event.isCancelled) {
      return CLASS_EVENT_STATUS.CANCELADA;
    }

    const nowTime = getEpoch(new Date());
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

  async canJoinLive(
    event: ClassEvent,
    user: User,
    hasAuthorization?: boolean,
  ): Promise<boolean> {
    if (!event.liveMeetingUrl) {
      return false;
    }

    const status = this.calculateEventStatus(event);
    if (
      status !== CLASS_EVENT_STATUS.PROGRAMADA &&
      status !== CLASS_EVENT_STATUS.EN_CURSO
    ) {
      return false;
    }

    if (hasAuthorization !== undefined) {
      return hasAuthorization;
    }

    return await this.checkUserAuthorizationWithUser(user, event.evaluationId);
  }

  async canWatchRecording(
    event: ClassEvent,
    user: User,
    hasAuthorization?: boolean,
  ): Promise<boolean> {
    if (!event.recordingUrl) {
      return false;
    }

    const status = this.calculateEventStatus(event);
    if (status !== CLASS_EVENT_STATUS.FINALIZADA) {
      return false;
    }

    if (hasAuthorization !== undefined) {
      return hasAuthorization;
    }

    return await this.checkUserAuthorizationWithUser(user, event.evaluationId);
  }

  async getEventAccess(
    event: ClassEvent,
    user: User,
    hasAuthorization?: boolean,
  ): Promise<ClassEventAccess> {
    const canJoinLive = await this.canJoinLive(event, user, hasAuthorization);
    const canWatchRecording = await this.canWatchRecording(
      event,
      user,
      hasAuthorization,
    );

    return {
      canJoinLive,
      canWatchRecording,
      canCopyLiveLink: canJoinLive,
      canCopyRecordingLink: canWatchRecording,
    };
  }

  async canAccessMeetingLink(event: ClassEvent, user: User): Promise<boolean> {
    return await this.canJoinLive(event, user);
  }

  async checkUserAuthorizationForUser(
    user: User,
    evaluationId: string,
  ): Promise<boolean> {
    return await this.checkUserAuthorizationWithUser(user, evaluationId);
  }

  private async checkUserAuthorizationWithUser(
    user: User,
    evaluationId: string,
  ): Promise<boolean> {
    const roleCodes = (user.roles || []).map((r) => r.code);

    if (roleCodes.some((r) => ADMIN_ROLE_CODES.includes(r))) {
      return true;
    }

    if (roleCodes.includes(ROLE_CODES.PROFESSOR)) {
      const cacheKey = COURSE_CACHE_KEYS.PROFESSOR_ASSIGNMENT(
        evaluationId,
        user.id,
      );
      const cached = await this.cacheService.get<boolean>(cacheKey);
      if (cached !== null) {
        return cached;
      }

      const isAssigned =
        await this.courseCycleProfessorRepository.isProfessorAssignedToEvaluation(
          evaluationId,
          user.id,
        );

      await this.cacheService.set(
        cacheKey,
        isAssigned,
        this.PROFESSOR_ASSIGNMENT_CACHE_TTL,
      );
      return isAssigned;
    }

    return await this.enrollmentEvaluationRepository.checkAccess(
      user.id,
      evaluationId,
    );
  }

  async checkUserAuthorization(
    userId: string,
    evaluationId: string,
  ): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) return false;

    return await this.checkUserAuthorizationWithUser(user, evaluationId);
  }

  async getMySchedule(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<ClassEvent[]> {
    const cacheKey = CLASS_EVENT_CACHE_KEYS.MY_SCHEDULE(
      userId,
      start.toISOString().split('T')[0],
      end.toISOString().split('T')[0],
    );

    const cached = await this.cacheService.get<ClassEvent[]>(cacheKey);
    if (cached) return cached;

    const events = await this.classEventRepository.findByUserAndRange(
      userId,
      start,
      end,
    );

    await this.cacheService.set(cacheKey, events, this.EVENT_CACHE_TTL);
    return events;
  }

  async isCycleActive(evaluationId: string): Promise<boolean> {
    const cacheKey = `cache:cycle-active:${evaluationId}`;
    const cached = await this.cacheService.get<boolean>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const evaluation =
      await this.evaluationRepository.findByIdWithCycle(evaluationId);
    if (!evaluation) {
      return false;
    }

    const now = new Date();
    const cycleStart = new Date(evaluation.courseCycle.academicCycle.startDate);
    const cycleEnd = new Date(evaluation.courseCycle.academicCycle.endDate);

    const isActive = now >= cycleStart && now <= cycleEnd;

    await this.cacheService.set(
      cacheKey,
      isActive,
      this.CYCLE_ACTIVE_CACHE_TTL,
    );

    return isActive;
  }

  private async invalidateEventCache(
    evaluationId: string,
    eventId?: string,
  ): Promise<void> {
    await this.cacheService.del(
      CLASS_EVENT_CACHE_KEYS.EVALUATION_LIST(evaluationId),
    );

    if (eventId) {
      await this.cacheService.del(CLASS_EVENT_CACHE_KEYS.DETAIL(eventId));
    }

    await this.cacheService.invalidateGroup(
      CLASS_EVENT_CACHE_KEYS.GLOBAL_SCHEDULE_GROUP,
    );
  }

  private async getRecordingStatusIdByCode(
    code: string,
    manager?: import('typeorm').EntityManager,
  ): Promise<string> {
    const cacheKey = this.getRecordingStatusCacheKey(code);
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
        `Estado de grabacion ${code} no configurado`,
      );
    }

    await this.cacheService.set(
      cacheKey,
      status.id,
      this.RECORDING_STATUS_CACHE_TTL,
    );
    return status.id;
  }

  private validateEventOwnership(creatorId: string, user: User): void {
    const roles = (user.roles || []).map((r) => r.code);
    const isAdmin = ADMIN_ROLE_CODES.some((roleCode) =>
      roles.includes(roleCode),
    );

    if (!isAdmin && creatorId !== user.id) {
      throw new ForbiddenException(
        'Solo el creador o un administrador puede realizar esta acción',
      );
    }
  }

  private validateEventDates(
    startDatetime: Date,
    endDatetime: Date,
    evaluationStart: Date,
    evaluationEnd: Date,
  ): void {
    const startTime = getEpoch(startDatetime);
    const endTime = getEpoch(endDatetime);
    const evalStartTime = getEpoch(evaluationStart);
    const evalEndTime = getEpoch(evaluationEnd);

    if (endTime <= startTime) {
      throw new BadRequestException(
        'La fecha de fin debe ser posterior a la fecha de inicio',
      );
    }

    if (startTime < evalStartTime || startTime > evalEndTime) {
      throw new BadRequestException(
        'La fecha de inicio debe estar dentro del rango de la evaluación',
      );
    }

    if (endTime < evalStartTime || endTime > evalEndTime) {
      throw new BadRequestException(
        'La fecha de fin debe estar dentro del rango de la evaluación',
      );
    }
  }
}
