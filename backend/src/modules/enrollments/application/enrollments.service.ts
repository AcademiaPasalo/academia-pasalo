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

@Injectable()
export class EnrollmentsService {
  private readonly logger = new Logger(EnrollmentsService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly enrollmentStatusRepository: EnrollmentStatusRepository,
    private readonly enrollmentEvaluationRepository: EnrollmentEvaluationRepository,
    private readonly enrollmentTypeRepository: EnrollmentTypeRepository,
    private readonly cacheService: RedisCacheService,
  ) {}

  async enroll(dto: CreateEnrollmentDto): Promise<Enrollment> {
    const existing = await this.enrollmentRepository.findActiveByUserAndCourseCycle(dto.userId, dto.courseCycleId);
    if (existing) {
      throw new ConflictException('El usuario ya cuenta con una matrícula activa en este curso.');
    }

    const type = await this.enrollmentTypeRepository.findByCode(dto.enrollmentTypeCode);
    if (!type) {
      throw new BadRequestException('Tipo de matrícula no válido.');
    }

    if (type.code === 'PARTIAL' && (!dto.evaluationIds || dto.evaluationIds.length === 0)) {
      throw new BadRequestException('Las matrículas parciales deben especificar al menos una evaluación.');
    }

    const status = await this.enrollmentStatusRepository.findByCode('ACTIVE');
    if (!status) {
      throw new InternalServerErrorException('Error de configuración del sistema.');
    }

    const enrollment = await this.dataSource.transaction(async (manager) => {
      const newEnrollment = await this.enrollmentRepository.create({
        userId: dto.userId,
        courseCycleId: dto.courseCycleId,
        enrollmentStatusId: status.id,
        enrollmentTypeId: type.id,
        enrolledAt: new Date(),
      }, manager);

      let courseCycleIdsToFetch: string[] = [dto.courseCycleId];
      let currentCycleEndDate: Date | null = null;

      const courseCycle = await manager.getRepository(CourseCycle).findOne({
        where: { id: dto.courseCycleId },
        relations: { academicCycle: true },
      });

      if (!courseCycle || !courseCycle.academicCycle) {
        throw new InternalServerErrorException('Inconsistencia en datos del ciclo.');
      }
      currentCycleEndDate = courseCycle.academicCycle.endDate;

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
        let evaluationsToGrant: typeof allEvaluations = [];
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
            return current.endDate > max ? current.endDate : max;
          }, new Date(0));

          evaluationsToGrant = [...academicEvaluations];
          
          if (bankEvaluation) {
            evaluationsToGrant.push(bankEvaluation);
            bankAccessLimitDate = maxAcademicEndDate;
          }
        }

        const accessEntries = evaluationsToGrant.map(evaluation => {
          let accessEnd = evaluation.endDate;

          if (evaluation.evaluationType.code === 'BANCO_ENUNCIADOS' && bankAccessLimitDate) {
            accessEnd = bankAccessLimitDate;
          } else if (type.code === 'FULL' && currentCycleEndDate) {
            accessEnd = evaluation.endDate > currentCycleEndDate ? evaluation.endDate : currentCycleEndDate;
          }

          return {
            enrollmentId: newEnrollment.id,
            evaluationId: evaluation.id,
            accessStartDate: evaluation.startDate,
            accessEndDate: accessEnd,
            isActive: true,
          };
        });

        if (accessEntries.length > 0) {
          await this.enrollmentEvaluationRepository.createMany(accessEntries, manager);
        }
      }

      return newEnrollment;
    });

    await this.cacheService.del(`cache:enrollment:user:${dto.userId}`);
    await this.cacheService.invalidateGroup(`cache:access:user:${dto.userId}:*`);

    this.logger.log({
      message: 'Matrícula procesada exitosamente',
      userId: dto.userId,
      courseCycleId: dto.courseCycleId,
      enrollmentId: enrollment.id,
      timestamp: new Date().toISOString(),
    });

    return enrollment;
  }
}