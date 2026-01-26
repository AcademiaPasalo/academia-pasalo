import { Injectable, NotFoundException, ConflictException, Logger, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EnrollmentRepository } from '@modules/enrollments/infrastructure/enrollment.repository';
import { EnrollmentStatusRepository } from '@modules/enrollments/infrastructure/enrollment-status.repository';
import { EnrollmentEvaluationRepository } from '@modules/enrollments/infrastructure/enrollment-evaluation.repository';
import { EvaluationRepository } from '@modules/evaluations/infrastructure/evaluation.repository';
import { CreateEnrollmentDto } from '@modules/enrollments/dto/create-enrollment.dto';
import { Enrollment } from '@modules/enrollments/domain/enrollment.entity';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';

@Injectable()
export class EnrollmentsService {
  private readonly logger = new Logger(EnrollmentsService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly enrollmentStatusRepository: EnrollmentStatusRepository,
    private readonly enrollmentEvaluationRepository: EnrollmentEvaluationRepository,
    private readonly evaluationRepository: EvaluationRepository,
    private readonly cacheService: RedisCacheService,
  ) {}

  async enroll(dto: CreateEnrollmentDto): Promise<Enrollment> {
    const existing = await this.enrollmentRepository.findActiveByUserAndCourseCycle(dto.userId, dto.courseCycleId);
    if (existing) {
      throw new ConflictException('El usuario ya cuenta con una matrícula activa en este curso.');
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
      }, manager);

      const allEvaluations = await this.evaluationRepository.findByCourseCycle(dto.courseCycleId, manager);
      
      if (allEvaluations.length > 0) {
        let selectedEvaluations: typeof allEvaluations = [];

        if (dto.isFullCourse) {
          selectedEvaluations = allEvaluations;
        } else {
          const requestedIds = dto.evaluationIds || [];
          selectedEvaluations = allEvaluations.filter(e => 
            requestedIds.includes(e.id) || e.evaluationType.code === 'BANCO_ENUNCIADOS'
          );
        }

        const accessEntries = selectedEvaluations.map(evaluation => ({
          enrollmentId: newEnrollment.id,
          evaluationId: evaluation.id,
          accessStartDate: evaluation.startDate,
          accessEndDate: evaluation.endDate,
          isActive: true,
        }));

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