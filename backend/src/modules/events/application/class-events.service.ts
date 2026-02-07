import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ClassEventRepository } from '@modules/events/infrastructure/class-event.repository';
import { ClassEventProfessorRepository } from '@modules/events/infrastructure/class-event-professor.repository';
import { EvaluationRepository } from '@modules/evaluations/infrastructure/evaluation.repository';
import { EnrollmentEvaluationRepository } from '@modules/enrollments/infrastructure/enrollment-evaluation.repository';
import { UserRepository } from '@modules/users/infrastructure/user.repository';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import { ClassEvent } from '@modules/events/domain/class-event.entity';
import { User } from '@modules/users/domain/user.entity';
import { technicalSettings } from '@config/technical-settings';

export type ClassEventStatus =
  | 'CANCELADA'
  | 'PROGRAMADA'
  | 'EN_CURSO'
  | 'FINALIZADA';

@Injectable()
export class ClassEventsService {
  private readonly logger = new Logger(ClassEventsService.name);
  private readonly EVENT_CACHE_TTL =
    technicalSettings.cache.events.classEventsCacheTtlSeconds;
  private readonly CYCLE_ACTIVE_CACHE_TTL =
    technicalSettings.cache.events.cycleActiveCacheTtlSeconds;
  private readonly PROFESSOR_ASSIGNMENT_CACHE_TTL =
    technicalSettings.cache.events.professorAssignmentCacheTtlSeconds;

  private getProfessorAssignmentCacheKey(
    courseCycleId: string,
    professorUserId: string,
  ): string {
    return `cache:cc-professor:cycle:${courseCycleId}:prof:${professorUserId}`;
  }

  constructor(
    private readonly dataSource: DataSource,
    private readonly classEventRepository: ClassEventRepository,
    private readonly classEventProfessorRepository: ClassEventProfessorRepository,
    private readonly evaluationRepository: EvaluationRepository,
    private readonly enrollmentEvaluationRepository: EnrollmentEvaluationRepository,
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
    meetingLink: string,
    creatorUser: User,
  ): Promise<ClassEvent> {
    const evaluation =
      await this.evaluationRepository.findByIdWithCycle(evaluationId);
    if (!evaluation) {
      throw new NotFoundException('Evaluación no encontrada');
    }

    await this.validateEventDates(
      startDatetime,
      endDatetime,
      evaluation.startDate,
      evaluation.endDate,
    );

    return await this.dataSource.transaction(async (manager) => {
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
          meetingLink,
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

    const cacheKey = `cache:class-events:evaluation:${evaluationId}`;
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
    meetingLink?: string,
  ): Promise<ClassEvent> {
    const event = await this.classEventRepository.findByIdSimple(eventId);
    if (!event) {
      throw new NotFoundException('Evento de clase no encontrado');
    }

    await this.validateEventOwnership(event.createdBy, user);

    const updateData: Partial<ClassEvent> = {};
    if (title !== undefined) updateData.title = title;
    if (topic !== undefined) updateData.topic = topic;
    if (startDatetime !== undefined) updateData.startDatetime = startDatetime;
    if (endDatetime !== undefined) updateData.endDatetime = endDatetime;
    if (meetingLink !== undefined) updateData.meetingLink = meetingLink;

    if (startDatetime || endDatetime) {
      const finalStart = startDatetime || event.startDatetime;
      const finalEnd = endDatetime || event.endDatetime;

      const evaluation = await this.evaluationRepository.findByIdWithCycle(
        event.evaluationId,
      );
      if (evaluation) {
        await this.validateEventDates(
          finalStart,
          finalEnd,
          evaluation.startDate,
          evaluation.endDate,
        );
      }
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

    await this.validateEventOwnership(event.createdBy, user);

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
      return 'CANCELADA';
    }

    const now = new Date();
    if (now < event.startDatetime) {
      return 'PROGRAMADA';
    }
    if (now >= event.startDatetime && now < event.endDatetime) {
      return 'EN_CURSO';
    }
    return 'FINALIZADA';
  }

  async canAccessMeetingLink(event: ClassEvent, user: User): Promise<boolean> {
    if (!event.meetingLink) {
      return false;
    }

    const status = this.calculateEventStatus(event);
    if (status !== 'PROGRAMADA' && status !== 'EN_CURSO') {
      return false;
    }

    return await this.checkUserAuthorizationWithUser(user, event.evaluationId);
  }

  private async checkUserAuthorizationWithUser(
    user: User,
    evaluationId: string,
  ): Promise<boolean> {
    const roleCodes = (user.roles || []).map((r) => r.code);

    if (roleCodes.some((r) => ['ADMIN', 'SUPER_ADMIN'].includes(r))) {
      return true;
    }

    if (roleCodes.includes('PROFESSOR')) {
      const evaluation =
        await this.evaluationRepository.findByIdWithCycle(evaluationId);
      if (!evaluation) return false;

      const cacheKey = this.getProfessorAssignmentCacheKey(
        evaluation.courseCycleId,
        user.id,
      );
      const cached = await this.cacheService.get<boolean>(cacheKey);
      if (cached !== null) {
        return cached;
      }

      const isAssigned = await this.dataSource.query(
        'SELECT 1 FROM course_cycle_professor WHERE course_cycle_id = ? AND professor_user_id = ? LIMIT 1',
        [evaluation.courseCycleId, user.id],
      );

      const result = isAssigned.length > 0;
      await this.cacheService.set(
        cacheKey,
        result,
        this.PROFESSOR_ASSIGNMENT_CACHE_TTL,
      );
      return result;
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

    const roleCodes = (user.roles || []).map((r) => r.code);

    if (roleCodes.some((r) => ['ADMIN', 'SUPER_ADMIN'].includes(r))) {
      return true;
    }

    if (roleCodes.includes('PROFESSOR')) {
      const evaluation =
        await this.evaluationRepository.findByIdWithCycle(evaluationId);
      if (!evaluation) return false;

      const isAssigned = await this.dataSource.query(
        'SELECT 1 FROM course_cycle_professor WHERE course_cycle_id = ? AND professor_user_id = ? LIMIT 1',
        [evaluation.courseCycleId, userId],
      );

      return isAssigned.length > 0;
    }

    return await this.enrollmentEvaluationRepository.checkAccess(
      userId,
      evaluationId,
    );
  }

  async getMySchedule(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<ClassEvent[]> {
    const cacheKey = `cache:my-schedule:user:${userId}:from:${start.toISOString().split('T')[0]}:to:${end.toISOString().split('T')[0]}`;

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
      `cache:class-events:evaluation:${evaluationId}`,
    );

    if (eventId) {
      await this.cacheService.del(`cache:class-event:${eventId}`);
    }

    await this.cacheService.invalidateGroup('cache:my-schedule:*');
  }

  private async validateEventOwnership(
    creatorId: string,
    user: User,
  ): Promise<void> {
    const roles = (user.roles || []).map((r) => r.code);
    const isAdmin = roles.includes('ADMIN') || roles.includes('SUPER_ADMIN');

    if (!isAdmin && creatorId !== user.id) {
      throw new ForbiddenException(
        'Solo el creador o un administrador puede realizar esta acción',
      );
    }
  }

  private async validateEventDates(
    startDatetime: Date,
    endDatetime: Date,
    evaluationStart: Date,
    evaluationEnd: Date,
  ): Promise<void> {
    if (endDatetime <= startDatetime) {
      throw new BadRequestException(
        'La fecha de fin debe ser posterior a la fecha de inicio',
      );
    }

    if (startDatetime < evaluationStart || startDatetime > evaluationEnd) {
      throw new BadRequestException(
        'La fecha de inicio debe estar dentro del rango de la evaluación',
      );
    }

    if (endDatetime < evaluationStart || endDatetime > evaluationEnd) {
      throw new BadRequestException(
        'La fecha de fin debe estar dentro del rango de la evaluación',
      );
    }
  }
}
