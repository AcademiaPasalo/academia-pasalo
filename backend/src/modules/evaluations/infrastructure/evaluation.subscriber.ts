import { Logger, InternalServerErrorException } from '@nestjs/common';
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  DataSource,
  IsNull,
  MoreThan,
} from 'typeorm';
import { Evaluation } from '@modules/evaluations/domain/evaluation.entity';
import { Enrollment } from '@modules/enrollments/domain/enrollment.entity';
import { EnrollmentEvaluation } from '@modules/enrollments/domain/enrollment-evaluation.entity';
import { EnrollmentType } from '@modules/enrollments/domain/enrollment-type.entity';
import { EvaluationType } from '@modules/evaluations/domain/evaluation-type.entity';
import { CourseCycle } from '@modules/courses/domain/course-cycle.entity';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { ENROLLMENT_TYPE_CODES } from '@modules/enrollments/domain/enrollment.constants';
import { EVALUATION_TYPE_CODES } from '@modules/evaluations/domain/evaluation.constants';
import { toUtcEndOfDay, toUtcStartOfDay } from '@common/utils/date.util';
import { technicalSettings } from '@config/technical-settings';

@EventSubscriber()
@Injectable()
export class EvaluationSubscriber implements EntitySubscriberInterface<Evaluation> {
  private readonly logger = new Logger(EvaluationSubscriber.name);

  constructor(@InjectDataSource() readonly dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Evaluation;
  }

  async afterInsert(event: InsertEvent<Evaluation>) {
    const evaluation = event.entity;
    const manager = event.manager;

    const evaluationType = await manager.findOne(EvaluationType, {
      where: { id: evaluation.evaluationTypeId },
    });

    if (!evaluationType) {
      this.logger.error({
        message:
          'Error de integridad: Tipo de evaluación no encontrado en subscriber',
        evaluationTypeId: evaluation.evaluationTypeId,
        evaluationId: evaluation.id,
      });
      throw new InternalServerErrorException(
        'Error de integridad al procesar la evaluación',
      );
    }

    const fullType = await manager.findOne(EnrollmentType, {
      where: { code: ENROLLMENT_TYPE_CODES.FULL },
    });

    if (!fullType) {
      this.logger.error({
        message:
          'Error de integridad: Tipo de matrícula FULL no encontrado en subscriber',
        evaluationId: evaluation.id,
      });
      throw new InternalServerErrorException(
        'Configuración de sistema incompleta (FULL_TYPE)',
      );
    }

    const courseCycle = await manager.findOne(CourseCycle, {
      where: { id: evaluation.courseCycleId },
      relations: { academicCycle: true },
    });

    if (!courseCycle?.academicCycle) {
      this.logger.error({
        message:
          'Error de integridad: Curso/ciclo académico no encontrado en subscriber',
        evaluationId: evaluation.id,
        courseCycleId: evaluation.courseCycleId,
      });
      throw new InternalServerErrorException(
        'Error de integridad al procesar la evaluación',
      );
    }

    const unifiedAccessStartDate = toUtcStartOfDay(
      courseCycle.academicCycle.startDate,
    );
    const unifiedAccessEndDate = toUtcEndOfDay(
      courseCycle.academicCycle.endDate,
    );

    const BATCH_SIZE = Math.max(
      1,
      technicalSettings.database.batching.evaluationSubscriberBatchSize,
    );
    let totalProcessed = 0;

    if (evaluationType.code === EVALUATION_TYPE_CODES.BANCO_ENUNCIADOS) {
      let lastEnrollmentId = '0';

      while (true) {
        const enrollmentsBatch = await manager.find(Enrollment, {
          where: {
            courseCycleId: evaluation.courseCycleId,
            cancelledAt: IsNull(),
            id: MoreThan(lastEnrollmentId),
          },
          order: { id: 'ASC' },
          take: BATCH_SIZE,
        });

        if (enrollmentsBatch.length === 0) {
          break;
        }

        const accessEntries: Array<Partial<EnrollmentEvaluation>> = [];

        for (const enrollment of enrollmentsBatch) {
          accessEntries.push({
            enrollmentId: enrollment.id,
            evaluationId: evaluation.id,
            accessStartDate: new Date(unifiedAccessStartDate),
            accessEndDate: new Date(unifiedAccessEndDate),
            isActive: true,
          });
        }

        if (accessEntries.length > 0) {
          await manager
            .createQueryBuilder()
            .insert()
            .into(EnrollmentEvaluation)
            .values(accessEntries)
            .orIgnore()
            .execute();
        }

        totalProcessed += enrollmentsBatch.length;
        lastEnrollmentId = enrollmentsBatch[enrollmentsBatch.length - 1].id;
      }
    } else {
      let lastEnrollmentId = '0';

      while (true) {
        const fullEnrollmentsBatch = await manager.find(Enrollment, {
          where: {
            courseCycleId: evaluation.courseCycleId,
            enrollmentTypeId: fullType.id,
            cancelledAt: IsNull(),
            id: MoreThan(lastEnrollmentId),
          },
          order: { id: 'ASC' },
          take: BATCH_SIZE,
        });

        if (fullEnrollmentsBatch.length === 0) {
          break;
        }

        const accessEntries: Array<Partial<EnrollmentEvaluation>> =
          fullEnrollmentsBatch.map((enrollment) => ({
            enrollmentId: enrollment.id,
            evaluationId: evaluation.id,
            accessStartDate: new Date(unifiedAccessStartDate),
            accessEndDate: new Date(unifiedAccessEndDate),
            isActive: true,
          }));

        if (accessEntries.length > 0) {
          await manager
            .createQueryBuilder()
            .insert()
            .into(EnrollmentEvaluation)
            .values(accessEntries)
            .orIgnore()
            .execute();
        }

        totalProcessed += fullEnrollmentsBatch.length;
        lastEnrollmentId =
          fullEnrollmentsBatch[fullEnrollmentsBatch.length - 1].id;
      }
    }

    this.logger.log({
      message: 'Accesos otorgados automáticamente por subscriber',
      evaluationId: evaluation.id,
      totalEnrollments: totalProcessed,
    });
  }
}
