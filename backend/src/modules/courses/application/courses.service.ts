import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
  InternalServerErrorException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CourseRepository } from '@modules/courses/infrastructure/course.repository';
import { CourseTypeRepository } from '@modules/courses/infrastructure/course-type.repository';
import { CycleLevelRepository } from '@modules/courses/infrastructure/cycle-level.repository';
import { CourseCycleRepository } from '@modules/courses/infrastructure/course-cycle.repository';
import { CourseCycleProfessorRepository } from '@modules/courses/infrastructure/course-cycle-professor.repository';
import { CourseCycleAllowedEvaluationTypeRepository } from '@modules/courses/infrastructure/course-cycle-allowed-evaluation-type.repository';
import { EvaluationRepository } from '@modules/evaluations/infrastructure/evaluation.repository';
import { CyclesService } from '@modules/cycles/application/cycles.service';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import { Course } from '@modules/courses/domain/course.entity';
import { CourseType } from '@modules/courses/domain/course-type.entity';
import { CycleLevel } from '@modules/courses/domain/cycle-level.entity';
import { CourseCycle } from '@modules/courses/domain/course-cycle.entity';
import { CreateCourseDto } from '@modules/courses/dto/create-course.dto';
import { UpdateCourseDto } from '@modules/courses/dto/update-course.dto';
import { AssignCourseToCycleDto } from '@modules/courses/dto/assign-course-to-cycle.dto';
import {
  AdminCourseCycleListQueryDto,
  AdminCourseCycleListResponseDto,
} from '@modules/courses/dto/admin-course-cycle-list.dto';
import {
  CourseContentResponseDto,
  EvaluationStatusDto,
} from '@modules/courses/dto/course-content.dto';
import {
  StudentCurrentCycleContentResponseDto,
  StudentBankStructureResponseDto,
  StudentPreviousCycleContentResponseDto,
  StudentPreviousCycleListResponseDto,
} from '@modules/courses/dto/student-course-view.dto';
import { Evaluation } from '@modules/evaluations/domain/evaluation.entity';
import { EnrollmentEvaluation } from '@modules/enrollments/domain/enrollment-evaluation.entity';
import {
  EVALUATION_ACCESS_STATUS_CODES,
  EVALUATION_TYPE_CODES,
} from '@modules/evaluations/domain/evaluation.constants';
import { COURSE_CACHE_KEYS } from '@modules/courses/domain/course.constants';
import { ENROLLMENT_CACHE_KEYS } from '@modules/enrollments/domain/enrollment.constants';
import { CLASS_EVENT_CACHE_KEYS } from '@modules/events/domain/class-event.constants';
import { technicalSettings } from '@config/technical-settings';
import { User } from '@/modules/users/domain/user.entity';
import { ENROLLMENT_TYPE_CODES } from '@modules/enrollments/domain/enrollment.constants';
import {
  STUDENT_EVALUATION_LABELS,
  StudentEvaluationLabel,
} from '@modules/courses/domain/student-course.constants';
import { ROLE_CODES } from '@common/constants/role-codes.constants';
import { ACCESS_MESSAGES } from '@common/constants/access-messages.constants';
import {
  MEDIA_ACCESS_MODES,
  MEDIA_CONTENT_KINDS,
  MEDIA_VIDEO_LINK_MODES,
} from '@modules/media-access/domain/media-access.constants';
import {
  buildDrivePreviewUrl,
  extractDriveFileIdFromUrl,
} from '@modules/media-access/domain/media-access-url.util';
import { STORAGE_PROVIDER_CODES } from '@modules/materials/domain/material.constants';
import { AuthorizedCourseIntroVideoLinkDto } from '@modules/courses/dto/authorized-course-intro-video-link.dto';
import { MediaAccessMembershipDispatchService } from '@modules/media-access/application/media-access-membership-dispatch.service';
import { MEDIA_ACCESS_SYNC_SOURCES } from '@modules/media-access/domain/media-access.constants';

type EvaluationWithAccess = Evaluation & {
  enrollmentEvaluations?: EnrollmentEvaluation[];
  name?: string;
};

type StudentCourseAccessContext = {
  cycle: CourseCycle;
  enrollmentTypeCode: string;
  canViewPreviousCycles: boolean;
};

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);
  private readonly CONTENT_CACHE_TTL =
    technicalSettings.cache.courses.courseContentCacheTtlSeconds;
  private readonly BANK_STRUCTURE_CACHE_TTL =
    technicalSettings.cache.courses.courseContentCacheTtlSeconds;
  private readonly PROFESSOR_ASSIGNMENT_CACHE_TTL =
    technicalSettings.cache.courses.professorAssignmentCacheTtlSeconds;
  private readonly COURSE_CYCLE_EXISTS_CACHE_TTL =
    technicalSettings.cache.courses.courseCycleExistsCacheTtlSeconds;

  constructor(
    private readonly dataSource: DataSource,
    private readonly courseRepository: CourseRepository,
    private readonly courseTypeRepository: CourseTypeRepository,
    private readonly cycleLevelRepository: CycleLevelRepository,
    private readonly courseCycleRepository: CourseCycleRepository,
    private readonly courseCycleProfessorRepository: CourseCycleProfessorRepository,
    private readonly courseCycleAllowedEvaluationTypeRepository: CourseCycleAllowedEvaluationTypeRepository,
    private readonly evaluationRepository: EvaluationRepository,
    private readonly cyclesService: CyclesService,
    private readonly cacheService: RedisCacheService,
    private readonly mediaAccessMembershipDispatchService: MediaAccessMembershipDispatchService,
  ) {}

  async findAllCourses(): Promise<Course[]> {
    return await this.courseRepository.findAll();
  }

  async findAdminCourseCycles(
    query: AdminCourseCycleListQueryDto,
  ): Promise<AdminCourseCycleListResponseDto> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;

    const { rows, totalItems } =
      await this.courseCycleRepository.findAdminCourseCyclesPage({
        page,
        pageSize,
        search: query.search,
      });

    const now = new Date();
    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize);

    return {
      items: rows.map((row) => {
        const startDate = new Date(row.academicCycleStartDate);
        const endDate = new Date(row.academicCycleEndDate);
        return {
          courseCycleId: row.courseCycleId,
          course: {
            id: row.courseId,
            code: row.courseCode,
            name: row.courseName,
          },
          academicCycle: {
            id: row.academicCycleId,
            code: row.academicCycleCode,
            startDate,
            endDate,
            isCurrent: now >= startDate && now <= endDate,
          },
          professors: row.professors,
        };
      }),
      page,
      pageSize,
      totalItems,
      totalPages,
    };
  }

  async findCourseById(id: string): Promise<Course> {
    const course = await this.courseRepository.findById(id);
    if (!course) {
      this.logger.warn({
        message: 'Consulta de materia inexistente',
        courseId: id,
        timestamp: new Date().toISOString(),
      });
      throw new NotFoundException(
        'La materia solicitada no se encuentra disponible.',
      );
    }
    return course;
  }

  async create(dto: CreateCourseDto): Promise<Course> {
    const existing = await this.courseRepository.findByCode(dto.code);
    if (existing) {
      throw new ConflictException(
        'Ya existe una materia registrada con ese código.',
      );
    }

    const course = await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Course);
      const newCourse = repo.create({
        code: dto.code,
        name: dto.name,
        primaryColor: dto.primaryColor,
        secondaryColor: dto.secondaryColor,
        courseTypeId: dto.courseTypeId,
        cycleLevelId: dto.cycleLevelId,
        createdAt: new Date(),
      });
      return await repo.save(newCourse);
    });

    return await this.findCourseById(course.id);
  }

  async update(id: string, dto: UpdateCourseDto): Promise<Course> {
    const course = await this.findCourseById(id);

    if (dto.code && dto.code !== course.code) {
      const existing = await this.courseRepository.findByCode(dto.code);
      if (existing) {
        throw new ConflictException(
          'Ya existe una materia registrada con ese código.',
        );
      }
    }

    await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Course);
      await repo.update(id, {
        ...(dto.code && { code: dto.code }),
        ...(dto.name && { name: dto.name }),
        ...(dto.primaryColor !== undefined && {
          primaryColor: dto.primaryColor,
        }),
        ...(dto.secondaryColor !== undefined && {
          secondaryColor: dto.secondaryColor,
        }),
        ...(dto.courseTypeId && { courseTypeId: dto.courseTypeId }),
        ...(dto.cycleLevelId && { cycleLevelId: dto.cycleLevelId }),
      });
    });

    await this.cacheService.invalidateGroup(
      COURSE_CACHE_KEYS.GLOBAL_CONTENT_GROUP,
    );
    await this.cacheService.invalidateGroup(
      ENROLLMENT_CACHE_KEYS.GLOBAL_DASHBOARD_GROUP,
    );
    await this.cacheService.invalidateGroup(
      CLASS_EVENT_CACHE_KEYS.GLOBAL_SCHEDULE_GROUP,
    );
    await this.cacheService.invalidateGroup(
      CLASS_EVENT_CACHE_KEYS.GLOBAL_EVALUATION_LIST_GROUP,
    );

    return await this.findCourseById(id);
  }

  async assignToCycle(dto: AssignCourseToCycleDto): Promise<CourseCycle> {
    const course = await this.findCourseById(dto.courseId);
    const cycle = await this.cyclesService.findOne(dto.academicCycleId);

    const existing = await this.courseCycleRepository.findByCourseAndCycle(
      dto.courseId,
      dto.academicCycleId,
    );
    if (existing) {
      throw new ConflictException(
        'Esta materia ya se encuentra vinculada al ciclo seleccionado.',
      );
    }

    const courseCycle = await this.dataSource.transaction(async (manager) => {
      const courseCycle = await this.courseCycleRepository.create(
        {
          courseId: course.id,
          academicCycleId: cycle.id,
        },
        manager,
      );

      const bancoType = await this.evaluationRepository.findTypeByCode(
        EVALUATION_TYPE_CODES.BANCO_ENUNCIADOS,
        manager,
      );
      if (!bancoType) {
        this.logger.error({
          message: `Tipo de evaluación ${EVALUATION_TYPE_CODES.BANCO_ENUNCIADOS} no configurado en el catálogo`,
          timestamp: new Date().toISOString(),
        });
        throw new InternalServerErrorException(
          'Error de configuración del sistema: Tipo de evaluación faltante.',
        );
      }

      await this.evaluationRepository.create(
        {
          courseCycleId: courseCycle.id,
          evaluationTypeId: bancoType.id,
          number: 0,
          startDate: cycle.startDate,
          endDate: cycle.endDate,
        },
        manager,
      );

      this.logger.log({
        message:
          'Materia vinculada a ciclo exitosamente con Banco de Enunciados',
        courseId: course.id,
        cycleId: cycle.id,
        courseCycleId: courseCycle.id,
        timestamp: new Date().toISOString(),
      });

      return courseCycle;
    });

    await this.cacheService.invalidateGroup(
      COURSE_CACHE_KEYS.GLOBAL_COURSE_CYCLE_EXISTS_GROUP,
    );

    return courseCycle;
  }

  async assignProfessorToCourseCycle(
    courseCycleId: string,
    professorUserId: string,
  ): Promise<void> {
    const cycle = await this.courseCycleRepository.findById(courseCycleId);
    if (!cycle) {
      throw new NotFoundException('Ciclo del curso no encontrado');
    }
    await this.assertUserIsActiveProfessor(professorUserId);

    await this.dataSource.transaction(async (manager) => {
      await this.courseCycleProfessorRepository.upsertAssign(
        courseCycleId,
        professorUserId,
        manager,
      );
    });

    await this.cacheService.invalidateGroup(
      COURSE_CACHE_KEYS.GLOBAL_PROFESSOR_ASSIGNMENT_GROUP,
    );
    await this.cacheService.invalidateGroup(
      COURSE_CACHE_KEYS.GLOBAL_PROFESSOR_LIST_GROUP,
    );

    const evaluationIds =
      await this.listEvaluationIdsByCourseCycle(courseCycleId);
    await this.mediaAccessMembershipDispatchService.enqueueGrantForUserCourseCycles(
      professorUserId,
      [courseCycleId],
      MEDIA_ACCESS_SYNC_SOURCES.PROFESSOR_ASSIGNED_COURSE_CYCLE,
    );
    await this.mediaAccessMembershipDispatchService.enqueueGrantForUserEvaluations(
      professorUserId,
      evaluationIds,
      MEDIA_ACCESS_SYNC_SOURCES.PROFESSOR_ASSIGNED_COURSE_CYCLE,
    );
  }

  async revokeProfessorFromCourseCycle(
    courseCycleId: string,
    professorUserId: string,
  ): Promise<void> {
    const cycle = await this.courseCycleRepository.findById(courseCycleId);
    if (!cycle) {
      throw new NotFoundException('Ciclo del curso no encontrado');
    }

    await this.dataSource.transaction(async (manager) => {
      await this.courseCycleProfessorRepository.revoke(
        courseCycleId,
        professorUserId,
        manager,
      );
    });

    await this.cacheService.invalidateGroup(
      COURSE_CACHE_KEYS.GLOBAL_PROFESSOR_ASSIGNMENT_GROUP,
    );
    await this.cacheService.invalidateGroup(
      COURSE_CACHE_KEYS.GLOBAL_PROFESSOR_LIST_GROUP,
    );

    const evaluationIds =
      await this.listEvaluationIdsByCourseCycle(courseCycleId);
    await this.mediaAccessMembershipDispatchService.enqueueRevokeForUserCourseCycles(
      professorUserId,
      [courseCycleId],
      MEDIA_ACCESS_SYNC_SOURCES.PROFESSOR_REVOKED_COURSE_CYCLE,
    );
    await this.mediaAccessMembershipDispatchService.enqueueRevokeForUserEvaluations(
      professorUserId,
      evaluationIds,
      MEDIA_ACCESS_SYNC_SOURCES.PROFESSOR_REVOKED_COURSE_CYCLE,
    );
  }

  private async listEvaluationIdsByCourseCycle(
    courseCycleId: string,
  ): Promise<string[]> {
    const rows = await this.dataSource.query<Array<{ id: string }>>(
      `
        SELECT id
        FROM evaluation
        WHERE course_cycle_id = ?
      `,
      [courseCycleId],
    );
    return rows
      .map((row) => String(row.id || '').trim())
      .filter((id) => id.length > 0);
  }

  async getProfessorsByCourseCycle(courseCycleId: string): Promise<User[]> {
    const cacheKey = COURSE_CACHE_KEYS.PROFESSORS_LIST(courseCycleId);
    const cached = await this.cacheService.get<User[]>(cacheKey);
    if (cached) return cached;

    const cycle = await this.courseCycleRepository.findById(courseCycleId);
    if (!cycle) {
      throw new NotFoundException('Ciclo del curso no encontrado');
    }

    const assignments =
      await this.courseCycleProfessorRepository.findByCourseCycleId(
        courseCycleId,
      );
    const professors = assignments.map((a) => a.professor);

    await this.cacheService.set(
      cacheKey,
      professors,
      this.PROFESSOR_ASSIGNMENT_CACHE_TTL,
    );
    return professors;
  }

  async getMyCourseCycles(professorUserId: string): Promise<CourseCycle[]> {
    const assignments =
      await this.courseCycleProfessorRepository.findByProfessorUserId(
        professorUserId,
      );
    return assignments.map((a) => a.courseCycle);
  }

  async findAllTypes(): Promise<CourseType[]> {
    return await this.courseTypeRepository.findAll();
  }

  async findAllLevels(): Promise<CycleLevel[]> {
    return await this.cycleLevelRepository.findAll();
  }

  async updateCourseCycleEvaluationStructure(
    courseCycleId: string,
    rawEvaluationTypeIds: string[],
  ): Promise<{ courseCycleId: string; evaluationTypeIds: string[] }> {
    const cycle = await this.courseCycleRepository.findById(courseCycleId);
    if (!cycle) {
      throw new NotFoundException('Ciclo del curso no encontrado');
    }

    const evaluationTypeIds = rawEvaluationTypeIds.map((id) => id.trim());
    if (evaluationTypeIds.length === 0) {
      throw new BadRequestException(
        'Debes enviar al menos un tipo de evaluacion.',
      );
    }
    if (evaluationTypeIds.some((id) => id.length === 0)) {
      throw new BadRequestException(
        'Los ids de tipo de evaluacion no pueden estar vacios.',
      );
    }

    const uniqueIds = [...new Set(evaluationTypeIds)];
    if (uniqueIds.length !== evaluationTypeIds.length) {
      throw new BadRequestException(
        'No se permiten ids de tipo de evaluacion duplicados.',
      );
    }

    const existingTypes =
      await this.evaluationRepository.findTypesByIds(evaluationTypeIds);
    if (existingTypes.length !== evaluationTypeIds.length) {
      const existingIds = new Set(existingTypes.map((type) => String(type.id)));
      const missingIds = evaluationTypeIds.filter((id) => !existingIds.has(id));
      throw new BadRequestException(
        `Tipos de evaluacion no encontrados: ${missingIds.join(', ')}`,
      );
    }

    const currentAllowed =
      await this.courseCycleAllowedEvaluationTypeRepository.findActiveByCourseCycleId(
        courseCycleId,
      );
    const currentIds = new Set(
      currentAllowed.map((row) => String(row.evaluationTypeId)),
    );
    const requestedIds = new Set(evaluationTypeIds);
    const unchanged =
      currentIds.size === requestedIds.size &&
      [...requestedIds].every((id) => currentIds.has(id));

    if (unchanged) {
      return {
        courseCycleId,
        evaluationTypeIds,
      };
    }

    await this.dataSource.transaction(async (manager) => {
      await this.courseCycleAllowedEvaluationTypeRepository.replaceAllowedTypes(
        courseCycleId,
        evaluationTypeIds,
        manager,
      );
    });

    await this.cacheService.invalidateGroup(
      COURSE_CACHE_KEYS.CONTENT_BY_CYCLE_GROUP(courseCycleId),
    );
    await this.cacheService.del(
      COURSE_CACHE_KEYS.BANK_STRUCTURE(courseCycleId),
    );

    return {
      courseCycleId,
      evaluationTypeIds,
    };
  }

  async getCourseContent(
    courseCycleId: string,
    userId: string,
    requesterActiveRole?: string,
  ): Promise<CourseContentResponseDto> {
    const cacheKey = COURSE_CACHE_KEYS.COURSE_CONTENT(courseCycleId, userId);

    let rawData = await this.cacheService.get<{
      cycle: CourseCycle;
      evaluations: EvaluationWithAccess[];
    }>(cacheKey);

    if (!rawData) {
      await this.assertCourseCycleExists(courseCycleId);

      const fullCycle =
        await this.courseCycleRepository.findFullById(courseCycleId);
      if (!fullCycle) throw new NotFoundException('Curso no encontrado');

      const evaluations = await this.evaluationRepository.findAllWithUserAccess(
        courseCycleId,
        userId,
      );

      rawData = {
        cycle: fullCycle,
        evaluations: evaluations as EvaluationWithAccess[],
      };
      await this.cacheService.set(cacheKey, rawData, this.CONTENT_CACHE_TTL);
    }

    if (requesterActiveRole === ROLE_CODES.PROFESSOR) {
      const assignmentCacheKey =
        COURSE_CACHE_KEYS.PROFESSOR_ASSIGNMENT_COURSE_CYCLE(
          courseCycleId,
          userId,
        );
      const cachedIsAssigned =
        await this.cacheService.get<boolean>(assignmentCacheKey);

      const isAssigned =
        cachedIsAssigned !== null
          ? cachedIsAssigned
          : await this.courseCycleProfessorRepository.isProfessorAssigned(
              courseCycleId,
              userId,
            );
      if (cachedIsAssigned === null) {
        await this.cacheService.set(
          assignmentCacheKey,
          isAssigned,
          this.PROFESSOR_ASSIGNMENT_CACHE_TTL,
        );
      }

      if (!isAssigned) {
        throw new ForbiddenException(ACCESS_MESSAGES.COURSE_CONTENT_FORBIDDEN);
      }
    }

    const now = new Date();
    const cycleEndDate = new Date(rawData.cycle.academicCycle.endDate);
    const isCurrent =
      now >= new Date(rawData.cycle.academicCycle.startDate) &&
      now <= cycleEndDate;

    return {
      courseCycleId: rawData.cycle.id,
      courseName: rawData.cycle.course.name,
      courseCode: rawData.cycle.course.code,
      cycleCode: rawData.cycle.academicCycle.code,
      isCurrentCycle: isCurrent,
      evaluations: this.filterOutBankEvaluations(rawData.evaluations).map(
        (ev) => {
          const evStartDate = new Date(ev.startDate);
          const evEndDate = new Date(ev.endDate);

          const access =
            ev.enrollmentEvaluations && ev.enrollmentEvaluations.length > 0
              ? ev.enrollmentEvaluations[0]
              : null;

          const statusDto = new EvaluationStatusDto();

          if (!access || !access.isActive) {
            statusDto.status = EVALUATION_ACCESS_STATUS_CODES.LOCKED;
            statusDto.hasAccess = false;
            statusDto.accessStart = null;
            statusDto.accessEnd = null;
          } else {
            statusDto.hasAccess = true;
            statusDto.accessStart = new Date(access.accessStartDate);
            statusDto.accessEnd = new Date(access.accessEndDate);

            if (now > statusDto.accessEnd) {
              statusDto.status = EVALUATION_ACCESS_STATUS_CODES.COMPLETED;
            } else if (now < statusDto.accessStart) {
              statusDto.status = EVALUATION_ACCESS_STATUS_CODES.UPCOMING;
            } else {
              statusDto.status = EVALUATION_ACCESS_STATUS_CODES.IN_PROGRESS;
            }
          }

          return {
            id: ev.id,
            name: ev.name ?? '',
            description: null as string | null,
            evaluationType: ev.evaluationType.name,
            startDate: evStartDate,
            endDate: evEndDate,
            userStatus: statusDto,
          };
        },
      ),
    };
  }

  async updateCourseCycleIntroVideo(
    courseCycleId: string,
    introVideoUrl?: string | null,
  ): Promise<void> {
    const cycle = await this.courseCycleRepository.findById(courseCycleId);
    if (!cycle) {
      throw new NotFoundException('Ciclo del curso no encontrado');
    }

    const normalizedUrl = String(introVideoUrl || '').trim();
    if (!normalizedUrl) {
      await this.dataSource.query(
        `
          UPDATE course_cycle
          SET intro_video_url = NULL,
              intro_video_file_id = NULL
          WHERE id = ?
        `,
        [courseCycleId],
      );
      await this.cacheService.invalidateGroup(
        COURSE_CACHE_KEYS.CONTENT_BY_CYCLE_GROUP(courseCycleId),
      );
      return;
    }

    const introVideoFileId = extractDriveFileIdFromUrl(normalizedUrl);
    if (!introVideoFileId) {
      throw new BadRequestException(
        'La URL del video introductorio debe ser un enlace de Google Drive valido',
      );
    }

    await this.dataSource.query(
      `
        UPDATE course_cycle
        SET intro_video_url = ?,
            intro_video_file_id = ?
        WHERE id = ?
      `,
      [normalizedUrl, introVideoFileId, courseCycleId],
    );

    await this.cacheService.invalidateGroup(
      COURSE_CACHE_KEYS.CONTENT_BY_CYCLE_GROUP(courseCycleId),
    );
  }

  async getAuthorizedCourseIntroVideoLink(
    user: User,
    courseCycleId: string,
    requesterActiveRole: string | undefined,
  ): Promise<AuthorizedCourseIntroVideoLinkDto> {
    await this.assertCourseCycleExists(courseCycleId);
    await this.assertCanAccessCourseCycleIntroVideo(
      user.id,
      courseCycleId,
      requesterActiveRole,
    );

    const rows = await this.dataSource.query<
      Array<{ introVideoUrl: string | null; introVideoFileId: string | null }>
    >(
      `
        SELECT
          intro_video_url AS introVideoUrl,
          intro_video_file_id AS introVideoFileId
        FROM course_cycle
        WHERE id = ?
        LIMIT 1
      `,
      [courseCycleId],
    );
    const row = rows[0];
    if (!row) {
      throw new NotFoundException('Ciclo del curso no encontrado');
    }

    const driveFileId =
      String(row.introVideoFileId || '').trim() ||
      extractDriveFileIdFromUrl(String(row.introVideoUrl || ''));
    if (!driveFileId) {
      throw new NotFoundException(
        'Video introductorio no disponible para este curso',
      );
    }

    const url = buildDrivePreviewUrl(driveFileId);

    return {
      contentKind: MEDIA_CONTENT_KINDS.VIDEO,
      accessMode: MEDIA_ACCESS_MODES.DIRECT_URL,
      courseCycleId,
      driveFileId,
      url,
      expiresAt: null,
      requestedMode: MEDIA_VIDEO_LINK_MODES.EMBED,
      fileName: null,
      mimeType: null,
      storageProvider: STORAGE_PROVIDER_CODES.GDRIVE,
    };
  }

  private async assertCourseCycleExists(courseCycleId: string): Promise<void> {
    const existsKey = COURSE_CACHE_KEYS.COURSE_CYCLE_EXISTS(courseCycleId);
    const cachedExists = await this.cacheService.get<boolean>(existsKey);
    if (cachedExists !== null) {
      if (!cachedExists) {
        throw new NotFoundException('Ciclo del curso no encontrado');
      }
      return;
    }

    const cycle = await this.courseCycleRepository.findById(courseCycleId);
    const exists = cycle !== null;
    await this.cacheService.set(
      existsKey,
      exists,
      this.COURSE_CYCLE_EXISTS_CACHE_TTL,
    );

    if (!exists) {
      throw new NotFoundException('Ciclo del curso no encontrado');
    }
  }

  async getStudentCurrentCycleContent(
    courseCycleId: string,
    userId: string,
  ): Promise<StudentCurrentCycleContentResponseDto> {
    const accessContext = await this.getStudentCourseAccessContext(
      courseCycleId,
      userId,
    );

    const now = new Date();
    const evaluations = await this.evaluationRepository.findAllWithUserAccess(
      courseCycleId,
      userId,
    );

    const visibleEvaluations = this.filterOutBankEvaluations(
      evaluations as EvaluationWithAccess[],
    );

    return {
      courseCycleId: accessContext.cycle.id,
      cycleCode: accessContext.cycle.academicCycle.code,
      canViewPreviousCycles: accessContext.canViewPreviousCycles,
      evaluations: visibleEvaluations.map((evaluation) => {
        const startDate = new Date(evaluation.startDate);
        const endDate = new Date(evaluation.endDate);
        const hasAccess = this.hasActiveAccess(evaluation);

        let label: StudentEvaluationLabel;
        if (now > endDate) {
          label = hasAccess
            ? STUDENT_EVALUATION_LABELS.COMPLETED
            : STUDENT_EVALUATION_LABELS.LOCKED;
        } else if (now >= startDate && now <= endDate) {
          label = STUDENT_EVALUATION_LABELS.IN_PROGRESS;
        } else {
          label = hasAccess
            ? STUDENT_EVALUATION_LABELS.UPCOMING
            : STUDENT_EVALUATION_LABELS.LOCKED;
        }

        return {
          id: evaluation.id,
          evaluationTypeCode: evaluation.evaluationType.code,
          shortName: this.buildEvaluationShortName(evaluation),
          fullName: this.buildEvaluationFullName(evaluation),
          hasAccess,
          label,
        };
      }),
    };
  }

  async getStudentPreviousCycles(
    courseCycleId: string,
    userId: string,
  ): Promise<StudentPreviousCycleListResponseDto> {
    const accessContext = await this.getStudentCourseAccessContext(
      courseCycleId,
      userId,
    );
    if (!accessContext.canViewPreviousCycles) {
      throw new ForbiddenException(
        'No tienes acceso para consultar ciclos anteriores de este curso.',
      );
    }

    const previousCycles =
      await this.courseCycleRepository.findPreviousByCourseId(
        accessContext.cycle.courseId,
        new Date(accessContext.cycle.academicCycle.startDate),
      );

    return {
      cycles: previousCycles.map((cycle) => ({
        cycleCode: cycle.academicCycle.code,
      })),
    };
  }

  async getStudentPreviousCycleContent(
    courseCycleId: string,
    previousCycleCode: string,
    userId: string,
  ): Promise<StudentPreviousCycleContentResponseDto> {
    const accessContext = await this.getStudentCourseAccessContext(
      courseCycleId,
      userId,
    );
    if (!accessContext.canViewPreviousCycles) {
      throw new ForbiddenException(
        'No tienes acceso para consultar ciclos anteriores de este curso.',
      );
    }

    const targetCycle =
      await this.courseCycleRepository.findByCourseIdAndCycleCode(
        accessContext.cycle.courseId,
        previousCycleCode,
      );
    if (!targetCycle) {
      throw new NotFoundException('Ciclo anterior no encontrado');
    }
    if (
      new Date(targetCycle.academicCycle.startDate) >=
      new Date(accessContext.cycle.academicCycle.startDate)
    ) {
      throw new NotFoundException('Ciclo anterior no encontrado');
    }

    const evaluations = await this.evaluationRepository.findAllWithUserAccess(
      targetCycle.id,
      userId,
    );

    const visibleEvaluations = this.filterOutBankEvaluations(
      evaluations as EvaluationWithAccess[],
    );

    return {
      cycleCode: previousCycleCode,
      evaluations: visibleEvaluations.map((evaluation) => {
        const hasAccess = this.hasActiveAccess(evaluation);
        return {
          id: evaluation.id,
          evaluationTypeCode: evaluation.evaluationType.code,
          shortName: this.buildEvaluationShortName(evaluation),
          fullName: this.buildEvaluationFullName(evaluation),
          hasAccess,
          label: hasAccess
            ? STUDENT_EVALUATION_LABELS.ARCHIVED
            : STUDENT_EVALUATION_LABELS.LOCKED,
        };
      }),
    };
  }

  async getStudentBankStructure(
    courseCycleId: string,
    userId: string,
  ): Promise<StudentBankStructureResponseDto> {
    const accessContext = await this.getStudentCourseAccessContext(
      courseCycleId,
      userId,
    );

    const cacheKey = COURSE_CACHE_KEYS.BANK_STRUCTURE(courseCycleId);
    let items = await this.cacheService.get<
      Array<{
        evaluationTypeId: string;
        evaluationTypeCode: string;
        evaluationTypeName: string;
      }>
    >(cacheKey);

    if (!items) {
      const structure =
        await this.courseCycleAllowedEvaluationTypeRepository.findActiveWithTypeByCourseCycleId(
          courseCycleId,
        );

      items = structure.map((item) => ({
        evaluationTypeId: String(item.evaluationTypeId),
        evaluationTypeCode: item.evaluationType.code,
        evaluationTypeName: this.getBankEvaluationTypePluralName(
          item.evaluationType.code,
          item.evaluationType.name,
        ),
      }));

      await this.cacheService.set(
        cacheKey,
        items,
        this.BANK_STRUCTURE_CACHE_TTL,
      );
    }

    return {
      courseCycleId: accessContext.cycle.id,
      cycleCode: accessContext.cycle.academicCycle.code,
      items,
    };
  }

  private async getStudentCourseAccessContext(
    courseCycleId: string,
    userId: string,
  ): Promise<StudentCourseAccessContext> {
    const cycle = await this.courseCycleRepository.findFullById(courseCycleId);
    if (!cycle) {
      throw new NotFoundException('Ciclo del curso no encontrado');
    }

    const enrollmentTypeCode = await this.getActiveEnrollmentTypeCode(
      userId,
      courseCycleId,
    );
    if (!enrollmentTypeCode) {
      throw new ForbiddenException('No tienes matrícula activa en este curso.');
    }

    const canViewPreviousCycles =
      enrollmentTypeCode === ENROLLMENT_TYPE_CODES.FULL
        ? true
        : await this.courseCycleRepository.hasAccessiblePreviousByCourseIdAndUserId(
            cycle.courseId,
            new Date(cycle.academicCycle.startDate),
            userId,
          );

    return {
      cycle,
      enrollmentTypeCode,
      canViewPreviousCycles,
    };
  }

  private async getActiveEnrollmentTypeCode(
    userId: string,
    courseCycleId: string,
  ): Promise<string | null> {
    const rows = await this.dataSource.query<
      Array<{ typeCode: string | null }>
    >(
      `SELECT et.code as typeCode
       FROM enrollment e
       INNER JOIN enrollment_type et
         ON et.id = e.enrollment_type_id
       WHERE e.user_id = ?
         AND e.course_cycle_id = ?
         AND e.cancelled_at IS NULL
       LIMIT 1`,
      [userId, courseCycleId],
    );

    return rows[0]?.typeCode ?? null;
  }

  private async assertCanAccessCourseCycleIntroVideo(
    userId: string,
    courseCycleId: string,
    requesterActiveRole: string | undefined,
  ): Promise<void> {
    if (
      requesterActiveRole === ROLE_CODES.ADMIN ||
      requesterActiveRole === ROLE_CODES.SUPER_ADMIN
    ) {
      return;
    }

    if (requesterActiveRole === ROLE_CODES.PROFESSOR) {
      const isAssigned =
        await this.courseCycleProfessorRepository.isProfessorAssigned(
          courseCycleId,
          userId,
        );
      if (!isAssigned) {
        throw new ForbiddenException(ACCESS_MESSAGES.COURSE_CONTENT_FORBIDDEN);
      }
      return;
    }

    const enrollmentTypeCode = await this.getActiveEnrollmentTypeCode(
      userId,
      courseCycleId,
    );
    if (!enrollmentTypeCode) {
      throw new ForbiddenException('No tienes matricula activa en este curso.');
    }
  }

  private hasActiveAccess(evaluation: EvaluationWithAccess): boolean {
    const access =
      evaluation.enrollmentEvaluations && evaluation.enrollmentEvaluations[0]
        ? evaluation.enrollmentEvaluations[0]
        : null;
    return !!access && access.isActive;
  }

  private filterOutBankEvaluations(
    evaluations: EvaluationWithAccess[],
  ): EvaluationWithAccess[] {
    return (evaluations || []).filter(
      (evaluation) =>
        String(evaluation.evaluationType?.code || '')
          .trim()
          .toUpperCase() !== EVALUATION_TYPE_CODES.BANCO_ENUNCIADOS,
    );
  }

  private buildEvaluationShortName(evaluation: Evaluation): string {
    return `${evaluation.evaluationType.code}${evaluation.number}`;
  }

  private buildEvaluationFullName(evaluation: Evaluation): string {
    const typeName = this.toTitleCase(evaluation.evaluationType.name);
    return `${typeName} ${evaluation.number}`;
  }

  private toTitleCase(value: string): string {
    return value
      .toLocaleLowerCase('es-PE')
      .split(/\s+/)
      .filter((word) => word.length > 0)
      .map((word) => word.charAt(0).toLocaleUpperCase('es-PE') + word.slice(1))
      .join(' ');
  }

  private getBankEvaluationTypePluralName(
    evaluationTypeCode: string,
    evaluationTypeName: string,
  ): string {
    const code = String(evaluationTypeCode || '')
      .trim()
      .toUpperCase();
    switch (code) {
      case 'PC':
        return 'Practicas Calificadas';
      case 'EX':
        return 'Examenes';
      case 'PD':
        return 'Practicas Dirigidas';
      case 'LAB':
        return 'Laboratorios';
      case 'TUTORING':
        return 'Tutorias Especializadas';
      default: {
        const normalizedName = String(evaluationTypeName || '').trim();
        if (!normalizedName) {
          return normalizedName;
        }
        if (/[sS]$/.test(normalizedName)) {
          return normalizedName;
        }
        return `${normalizedName}s`;
      }
    }
  }

  private async assertUserIsActiveProfessor(userId: string): Promise<void> {
    const rows = await this.dataSource.query<
      Array<{ isActiveProfessor: number | string }>
    >(
      `SELECT EXISTS(
        SELECT 1
        FROM user u
        INNER JOIN user_role ur
          ON ur.user_id = u.id
        INNER JOIN role r
          ON r.id = ur.role_id
        WHERE u.id = ?
          AND u.is_active = 1
          AND r.code = ?
        LIMIT 1
      ) AS isActiveProfessor`,
      [userId, ROLE_CODES.PROFESSOR],
    );

    if (Number(rows[0]?.isActiveProfessor) !== 1) {
      throw new BadRequestException(
        'El usuario seleccionado no es un profesor activo.',
      );
    }
  }
}
