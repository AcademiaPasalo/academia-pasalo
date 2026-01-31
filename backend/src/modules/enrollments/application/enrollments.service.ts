import { Injectable, ConflictException, Logger, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { DataSource, In, LessThan } from 'typeorm';
import { EnrollmentRepository } from '@modules/enrollments/infrastructure/enrollment.repository';
import { EnrollmentStatusRepository } from '@modules/enrollments/infrastructure/enrollment-status.repository';
import { EnrollmentEvaluationRepository } from '@modules/enrollments/infrastructure/enrollment-evaluation.repository';
import { EnrollmentTypeRepository } from '@modules/enrollments/infrastructure/enrollment-type.repository';
import { CreateEnrollmentDto } from '@modules/enrollments/dto/create-enrollment.dto';
import { Enrollment } from '@modules/enrollments/domain/enrollment.entity';
import { CourseCycle } from '@modules/courses/domain/course-cycle.entity';
import { Evaluation } from '@modules/evaluations/domain/evaluation.entity';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import { MyEnrollmentsResponseDto } from '@modules/enrollments/dto/my-enrollments-response.dto';

@Injectable()
export class EnrollmentsService {
  private readonly logger = new Logger(EnrollmentsService.name);
  private readonly DASHBOARD_CACHE_TTL = 3600;

  constructor(
    private readonly dataSource: DataSource,
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly enrollmentStatusRepository: EnrollmentStatusRepository,
    private readonly enrollmentEvaluationRepository: EnrollmentEvaluationRepository,
    private readonly enrollmentTypeRepository: EnrollmentTypeRepository,
    private readonly cacheService: RedisCacheService,
  ) {}

  async findMyEnrollments(userId: string): Promise<MyEnrollmentsResponseDto[]> {
    const cacheKey = `cache:enrollment:user:${userId}:dashboard`;
    
    const cachedData = await this.cacheService.get<MyEnrollmentsResponseDto[]>(cacheKey);
    if (cachedData) return cachedData;

    const enrollments = await this.enrollmentRepository.findMyEnrollments(userId);
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const result = enrollments.map((enrollment) => {
      const startDate = new Date(enrollment.courseCycle.academicCycle.startDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(enrollment.courseCycle.academicCycle.endDate);
      endDate.setHours(0, 0, 0, 0);

      const isCurrent = now >= startDate && now <= endDate;

      return {
        id: enrollment.id,
        enrolledAt: enrollment.enrolledAt,
        courseCycle: {
          id: enrollment.courseCycle.id,
          course: {
            id: enrollment.courseCycle.course.id,
            code: enrollment.courseCycle.course.code,
            name: enrollment.courseCycle.course.name,
            courseType: {
              code: enrollment.courseCycle.course.courseType.code,
              name: enrollment.courseCycle.course.courseType.name,
            },
            cycleLevel: {
              name: enrollment.courseCycle.course.cycleLevel.name,
            },
          },
          academicCycle: {
            id: enrollment.courseCycle.academicCycle.id,
            code: enrollment.courseCycle.academicCycle.code,
            startDate: enrollment.courseCycle.academicCycle.startDate,
            endDate: enrollment.courseCycle.academicCycle.endDate,
            isCurrent,
          },
          professors: (enrollment.courseCycle.professors || []).map(p => ({
            id: p.professor.id,
            firstName: p.professor.firstName,
            lastName1: p.professor.lastName1 || '',
            lastName2: p.professor.lastName2 || '',
            profilePhotoUrl: p.professor.profilePhotoUrl,
          })),
        },
      };
    });

    await this.cacheService.set(cacheKey, result, this.DASHBOARD_CACHE_TTL);
    return result;
  }

  async enroll(dto: CreateEnrollmentDto): Promise<Enrollment> {
    return await this.dataSource.transaction(async (manager) => {
      const existing = await this.enrollmentRepository.findActiveByUserAndCourseCycle(
        dto.userId, 
        dto.courseCycleId, 
        manager
      );

      if (existing) {
        throw new ConflictException('El usuario ya cuenta con una matrícula activa en este curso.');
      }

      const type = await this.enrollmentTypeRepository.findByCode(dto.enrollmentTypeCode, manager);
      if (!type) {
        throw new BadRequestException('Tipo de matrícula no válido.');
      }

      if (type.code === 'PARTIAL' && (!dto.evaluationIds || dto.evaluationIds.length === 0)) {
        throw new BadRequestException('Las matrículas parciales deben especificar al menos una evaluación.');
      }

      const status = await this.enrollmentStatusRepository.findByCode('ACTIVE', manager);
      if (!status) {
        throw new InternalServerErrorException('Error de configuración del sistema.');
      }

      const courseCycle = await manager.getRepository(CourseCycle).findOne({
        where: { id: dto.courseCycleId },
        relations: { academicCycle: true },
        lock: { mode: 'pessimistic_read' }
      });

      if (!courseCycle || !courseCycle.academicCycle) {
        throw new InternalServerErrorException('Inconsistencia en datos del ciclo.');
      }

      const now = new Date();
      const cycleEndDate = new Date(courseCycle.academicCycle.endDate);

      if (cycleEndDate < now) {
        this.logger.warn({
          message: 'Intento de matrícula en ciclo finalizado',
          courseCycleId: dto.courseCycleId,
          academicCycleCode: courseCycle.academicCycle.code,
          cycleEndDate: cycleEndDate.toISOString(),
          userId: dto.userId,
        });
        throw new BadRequestException(
          `No se puede matricular en el ciclo ${courseCycle.academicCycle.code} porque ya ha finalizado.`,
        );
      }

      const enrollment = await this.enrollmentRepository.create({
        userId: dto.userId,
        courseCycleId: dto.courseCycleId,
        enrollmentStatusId: status.id,
        enrollmentTypeId: type.id,
        enrolledAt: new Date(),
      }, manager);

      const courseCycleIdsToFetch: string[] = [dto.courseCycleId];

      if (type.code === 'FULL' && dto.historicalCourseCycleIds && dto.historicalCourseCycleIds.length > 0) {
        const pastCycles = await manager.getRepository(CourseCycle).find({
          where: {
            id: In(dto.historicalCourseCycleIds),
            courseId: courseCycle.courseId,
            academicCycle: {
              startDate: LessThan(courseCycle.academicCycle.startDate),
            },
          },
        });

        if (pastCycles.length !== dto.historicalCourseCycleIds.length) {
          throw new BadRequestException('Uno o más ciclos históricos no son válidos o no pertenecen al curso.');
        }

        courseCycleIdsToFetch.push(...pastCycles.map((pc) => pc.id));
      }

      const allEvaluations = await manager.getRepository(Evaluation).find({
        where: { courseCycleId: In(courseCycleIdsToFetch) },
        relations: { evaluationType: true },
      });
      
      if (allEvaluations.length > 0) {
        let evaluationsToGrant: Evaluation[] = [];
        let bankAccessLimitDate: Date | null = null;

        if (type.code === 'FULL') {
          evaluationsToGrant = allEvaluations;
        } else {
          const requestedIds = dto.evaluationIds || [];
          const academicEvaluations = allEvaluations.filter(e => requestedIds.includes(e.id));
          const bankEvaluation = allEvaluations.find(e => e.evaluationType.code === 'BANCO_ENUNCIADOS');

          if (academicEvaluations.length === 0) {
            throw new BadRequestException('Las evaluaciones solicitadas no son válidas para este ciclo.');
          }

          const maxAcademicEndDate = academicEvaluations.reduce((max, current) => {
            const currentEndDate = new Date(current.endDate);
            return currentEndDate > max ? currentEndDate : max;
          }, new Date(0));

          evaluationsToGrant = [...academicEvaluations];
          
          if (bankEvaluation) {
            evaluationsToGrant.push(bankEvaluation);
            bankAccessLimitDate = maxAcademicEndDate;
          }
        }

        const accessEntries = evaluationsToGrant.map(evaluation => {
          let accessEnd = new Date(evaluation.endDate);

          if (evaluation.evaluationType.code === 'BANCO_ENUNCIADOS' && bankAccessLimitDate) {
            accessEnd = bankAccessLimitDate;
          } else if (type.code === 'FULL') {
            const cycleEnd = new Date(courseCycle.academicCycle.endDate);
            accessEnd = accessEnd > cycleEnd ? accessEnd : cycleEnd;
          }

          return {
            enrollmentId: enrollment.id,
            evaluationId: evaluation.id,
            accessStartDate: new Date(evaluation.startDate),
            accessEndDate: accessEnd,
            isActive: true,
          };
        });

        await this.enrollmentEvaluationRepository.createMany(accessEntries, manager);
      }

      await this.cacheService.del(`cache:enrollment:user:${dto.userId}:dashboard`);
      await this.cacheService.invalidateGroup(`cache:access:user:${dto.userId}:*`);

      this.logger.log(JSON.stringify({
        message: 'Matrícula procesada exitosamente',
        userId: dto.userId,
        courseCycleId: dto.courseCycleId,
        enrollmentId: enrollment.id,
        timestamp: new Date().toISOString(),
      }));

      return enrollment;
    });
  }
}