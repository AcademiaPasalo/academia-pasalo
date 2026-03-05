import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Evaluation } from '@modules/evaluations/domain/evaluation.entity';
import { CreateEvaluationDto } from '@modules/evaluations/dto/create-evaluation.dto';
import { EvaluationRepository } from '@modules/evaluations/infrastructure/evaluation.repository';
import { CourseCycleRepository } from '@modules/courses/infrastructure/course-cycle.repository';
import { CourseCycleProfessorRepository } from '@modules/courses/infrastructure/course-cycle-professor.repository';
import { CourseCycleAllowedEvaluationTypeRepository } from '@modules/courses/infrastructure/course-cycle-allowed-evaluation-type.repository';
import { AcademicCycleRepository } from '@modules/cycles/infrastructure/academic-cycle.repository';
import { ROLE_CODES } from '@common/constants/role-codes.constants';
import { ACCESS_MESSAGES } from '@common/constants/access-messages.constants';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import { COURSE_CACHE_KEYS } from '@modules/courses/domain/course.constants';
import { technicalSettings } from '@config/technical-settings';
import { DataSource } from 'typeorm';

@Injectable()
export class EvaluationsService {
  private readonly logger = new Logger(EvaluationsService.name);
  private readonly PROFESSOR_ASSIGNMENT_CACHE_TTL =
    technicalSettings.cache.courses.professorAssignmentCacheTtlSeconds;
  private readonly COURSE_CYCLE_EXISTS_CACHE_TTL =
    technicalSettings.cache.courses.courseCycleExistsCacheTtlSeconds;

  constructor(
    private readonly dataSource: DataSource,
    private readonly evaluationRepository: EvaluationRepository,
    private readonly courseCycleRepository: CourseCycleRepository,
    private readonly courseCycleProfessorRepository: CourseCycleProfessorRepository,
    private readonly courseCycleAllowedEvaluationTypeRepository: CourseCycleAllowedEvaluationTypeRepository,
    private readonly academicCycleRepository: AcademicCycleRepository,
    private readonly cacheService: RedisCacheService,
  ) {}

  async create(dto: CreateEvaluationDto): Promise<Evaluation> {
    const evaluationTypeId = dto.evaluationTypeId.trim();
    if (evaluationTypeId.length === 0) {
      throw new BadRequestException('El tipo de evaluacion es obligatorio.');
    }

    const evaluation = await this.dataSource.transaction(async (manager) => {
      const courseCycle = await this.courseCycleRepository.findById(
        dto.courseCycleId,
        manager,
      );
      if (!courseCycle) {
        throw new NotFoundException('La instancia de curso-ciclo no existe.');
      }

      const academicCycle = await this.academicCycleRepository.findById(
        courseCycle.academicCycleId,
        manager,
      );
      if (!academicCycle) {
        throw new NotFoundException('El ciclo academico vinculado no existe.');
      }

      const evalStart = new Date(dto.startDate);
      const evalEnd = new Date(dto.endDate);
      const cycleStart = new Date(academicCycle.startDate);
      const cycleEnd = new Date(academicCycle.endDate);

      if (evalStart < cycleStart || evalEnd > cycleEnd) {
        throw new BadRequestException(
          'Las fechas de la evaluacion deben estar dentro del rango del ciclo academico.',
        );
      }

      if (evalStart > evalEnd) {
        throw new BadRequestException(
          'La fecha de inicio no puede ser posterior a la fecha de fin.',
        );
      }

      const allowedTypes =
        await this.courseCycleAllowedEvaluationTypeRepository.findActiveByCourseCycleId(
          dto.courseCycleId,
          manager,
        );

      if (allowedTypes.length === 0) {
        throw new BadRequestException(
          'El curso-ciclo no tiene estructura de evaluacion activa.',
        );
      }

      const isAllowedType = allowedTypes.some(
        (item) => String(item.evaluationTypeId) === evaluationTypeId,
      );

      if (!isAllowedType) {
        throw new BadRequestException(
          'El tipo de evaluacion no esta permitido para este curso-ciclo.',
        );
      }

      return await this.evaluationRepository.create(
        {
          courseCycleId: dto.courseCycleId,
          evaluationTypeId,
          number: dto.number,
          startDate: evalStart,
          endDate: evalEnd,
        },
        manager,
      );
    });

    await this.cacheService.invalidateGroup(
      COURSE_CACHE_KEYS.CONTENT_BY_CYCLE_GROUP(dto.courseCycleId),
    );

    this.logger.log({
      message: 'Evaluacion academica creada exitosamente',
      evaluationId: evaluation.id,
      courseCycleId: dto.courseCycleId,
      typeId: evaluationTypeId,
      timestamp: new Date().toISOString(),
    });

    return evaluation;
  }

  async findByCourseCycle(
    courseCycleId: string,
    requesterUserId?: string,
    requesterActiveRole?: string,
  ): Promise<Evaluation[]> {
    if (
      requesterActiveRole === ROLE_CODES.PROFESSOR &&
      requesterUserId !== undefined
    ) {
      const assignmentCacheKey =
        COURSE_CACHE_KEYS.PROFESSOR_ASSIGNMENT_COURSE_CYCLE(
          courseCycleId,
          requesterUserId,
        );
      const cachedIsAssigned =
        await this.cacheService.get<boolean>(assignmentCacheKey);
      const isAssigned =
        cachedIsAssigned !== null
          ? cachedIsAssigned
          : await this.courseCycleProfessorRepository.isProfessorAssigned(
              courseCycleId,
              requesterUserId,
            );
      if (cachedIsAssigned === null) {
        await this.cacheService.set(
          assignmentCacheKey,
          isAssigned,
          this.PROFESSOR_ASSIGNMENT_CACHE_TTL,
        );
      }

      if (!isAssigned) {
        await this.assertCourseCycleExists(courseCycleId);

        throw new ForbiddenException(
          ACCESS_MESSAGES.COURSE_EVALUATIONS_FORBIDDEN,
        );
      }
    } else {
      await this.assertCourseCycleExists(courseCycleId);
    }

    return await this.evaluationRepository.findByCourseCycle(courseCycleId);
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
}
