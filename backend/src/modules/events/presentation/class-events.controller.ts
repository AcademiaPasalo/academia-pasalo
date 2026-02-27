import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import { ClassEventsService } from '@modules/events/application/class-events.service';
import { ClassEventsQueryService } from '@modules/events/application/class-events-query.service';
import { CreateClassEventDto } from '@modules/events/dto/create-class-event.dto';
import { UpdateClassEventDto } from '@modules/events/dto/update-class-event.dto';
import { AssignProfessorDto } from '@modules/events/dto/assign-professor.dto';
import { ClassEventResponseDto } from '@modules/events/dto/class-event-response.dto';
import { GlobalSessionsQueryDto } from '@modules/events/dto/global-sessions-query.dto';
import { Auth } from '@common/decorators/auth.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseMessage } from '@common/decorators/response-message.decorator';
import { User } from '@modules/users/domain/user.entity';
import { ClassEvent } from '@modules/events/domain/class-event.entity';
import { ROLE_CODES } from '@common/constants/role-codes.constants';

@Controller('class-events')
@Auth()
export class ClassEventsController {
  constructor(
    private readonly classEventsService: ClassEventsService,
    private readonly classEventsQueryService: ClassEventsQueryService,
  ) {}

  private mapEventsToResponse(
    events: Awaited<ReturnType<ClassEventsService['getEventsByEvaluation']>>,
  ): ClassEventResponseDto[] {
    const now = new Date();
    const access = this.classEventsService.getEventAccess();

    return events.map((event) => {
      const status = this.classEventsService.calculateEventStatus(event, now);
      return ClassEventResponseDto.fromEntity(event, status, access);
    });
  }

  private mapEventToResponse(event: ClassEvent): ClassEventResponseDto {
    const status = this.classEventsService.calculateEventStatus(event);
    const access = this.classEventsService.getEventAccess();
    return ClassEventResponseDto.fromEntity(event, status, access);
  }

  @Post()
  @Roles(ROLE_CODES.PROFESSOR, ROLE_CODES.ADMIN, ROLE_CODES.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Evento de clase creado exitosamente')
  async create(
    @Body() dto: CreateClassEventDto,
    @CurrentUser() user: User,
  ): Promise<ClassEventResponseDto> {
    const event = await this.classEventsService.createEvent(
      dto.evaluationId,
      dto.sessionNumber,
      dto.title,
      dto.topic,
      new Date(dto.startDatetime),
      new Date(dto.endDatetime),
      dto.liveMeetingUrl,
      user,
    );

    const eventDetail = await this.classEventsService.getEventDetail(
      event.id,
      user.id,
    );
    return this.mapEventToResponse(eventDetail);
  }

  @Get('my-schedule')
  @Roles(
    ROLE_CODES.STUDENT,
    ROLE_CODES.PROFESSOR,
    ROLE_CODES.ADMIN,
    ROLE_CODES.SUPER_ADMIN,
  )
  @ResponseMessage('Calendario obtenido exitosamente')
  async getMySchedule(
    @CurrentUser() user: User,
    @Query('start') startDate: string,
    @Query('end') endDate: string,
  ): Promise<ClassEventResponseDto[]> {
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate
      ? new Date(endDate)
      : new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);

    const events = await this.classEventsQueryService.getMySchedule(
      user.id,
      start,
      end,
    );
    return this.mapEventsToResponse(events);
  }

  @Get('discovery/layers/:courseCycleId')
  @Roles(ROLE_CODES.PROFESSOR, ROLE_CODES.ADMIN, ROLE_CODES.SUPER_ADMIN)
  @ResponseMessage('Capas de calendario obtenidas exitosamente')
  async getDiscoveryLayers(
    @Param('courseCycleId') courseCycleId: string,
  ): Promise<
    Awaited<ReturnType<ClassEventsQueryService['getDiscoveryLayers']>>
  > {
    return await this.classEventsQueryService.getDiscoveryLayers(courseCycleId);
  }

  @Get('global/sessions')
  @Roles(ROLE_CODES.PROFESSOR, ROLE_CODES.ADMIN, ROLE_CODES.SUPER_ADMIN)
  @ResponseMessage('Sesiones globales obtenidas exitosamente')
  async getGlobalSessions(
    @Query() query: GlobalSessionsQueryDto,
  ): Promise<
    Awaited<ReturnType<ClassEventsQueryService['getGlobalSessions']>>
  > {
    return await this.classEventsQueryService.getGlobalSessions(
      query.courseCycleIds,
      new Date(query.startDate),
      new Date(query.endDate),
    );
  }

  @Get('evaluation/:evaluationId')
  @ResponseMessage('Eventos obtenidos exitosamente')
  async getByEvaluation(
    @Param('evaluationId') evaluationId: string,
    @CurrentUser() user: User,
  ): Promise<ClassEventResponseDto[]> {
    const events = await this.classEventsService.getEventsByEvaluation(
      evaluationId,
      user.id,
    );

    if (events.length === 0) {
      return [];
    }

    return this.mapEventsToResponse(events);
  }

  @Get(':id')
  @ResponseMessage('Detalle del evento obtenido exitosamente')
  async getDetail(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<ClassEventResponseDto> {
    const event = await this.classEventsService.getEventDetail(id, user.id);
    return this.mapEventToResponse(event);
  }

  @Patch(':id')
  @Roles(ROLE_CODES.PROFESSOR, ROLE_CODES.ADMIN, ROLE_CODES.SUPER_ADMIN)
  @ResponseMessage('Evento actualizado exitosamente')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateClassEventDto,
    @CurrentUser() user: User,
  ): Promise<ClassEventResponseDto> {
    const event = await this.classEventsService.updateEvent(
      id,
      user,
      dto.title,
      dto.topic,
      dto.startDatetime ? new Date(dto.startDatetime) : undefined,
      dto.endDatetime ? new Date(dto.endDatetime) : undefined,
      dto.liveMeetingUrl,
      dto.recordingUrl,
    );

    const eventDetail = await this.classEventsService.getEventDetail(
      event.id,
      user.id,
    );
    return this.mapEventToResponse(eventDetail);
  }

  @Delete(':id/cancel')
  @Roles(ROLE_CODES.PROFESSOR, ROLE_CODES.ADMIN, ROLE_CODES.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResponseMessage('Evento cancelado exitosamente')
  async cancel(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    await this.classEventsService.cancelEvent(id, user);
  }

  @Post(':id/professors')
  @Roles(ROLE_CODES.ADMIN, ROLE_CODES.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Profesor asignado exitosamente')
  async assignProfessor(
    @Param('id') id: string,
    @Body() dto: AssignProfessorDto,
  ): Promise<void> {
    await this.classEventsService.assignProfessor(id, dto.professorUserId);
  }

  @Delete(':id/professors/:professorId')
  @Roles(ROLE_CODES.ADMIN, ROLE_CODES.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResponseMessage('Profesor removido exitosamente')
  async removeProfessor(
    @Param('id') id: string,
    @Param('professorId') professorId: string,
  ): Promise<void> {
    await this.classEventsService.removeProfessor(id, professorId);
  }
}
