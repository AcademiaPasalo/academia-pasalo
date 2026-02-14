import { Logger } from '@nestjs/common';
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  DataSource,
} from 'typeorm';
import { Evaluation } from '@modules/evaluations/domain/evaluation.entity';
import { Enrollment } from '@modules/enrollments/domain/enrollment.entity';
import { EnrollmentEvaluation } from '@modules/enrollments/domain/enrollment-evaluation.entity';
import { EnrollmentType } from '@modules/enrollments/domain/enrollment-type.entity';
import { EvaluationType } from '@modules/evaluations/domain/evaluation-type.entity';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { ENROLLMENT_TYPE_CODES } from '@modules/enrollments/domain/enrollment.constants';
import { EVALUATION_TYPE_CODES } from '@modules/evaluations/domain/evaluation.constants';

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
      this.logger.warn({
        message:
          'Tipo de evaluación no encontrado, omitiendo lógica del subscriber',
        evaluationTypeId: evaluation.evaluationTypeId,
        evaluationId: evaluation.id,
      });
      return;
    }

    const fullType = await manager.findOne(EnrollmentType, {
      where: { code: ENROLLMENT_TYPE_CODES.FULL },
    });

    if (!fullType) {
      this.logger.warn({
        message:
          'Tipo de matrícula FULL no encontrado, omitiendo lógica del subscriber',
        evaluationId: evaluation.id,
      });
      return;
    }

    const BATCH_SIZE = 100;
    let offset = 0;
    let hasMore = true;
    let totalProcessed = 0;

    if (evaluationType.code === EVALUATION_TYPE_CODES.BANCO_ENUNCIADOS) {
      while (hasMore) {
        const enrollmentsBatch = await manager.find(Enrollment, {
          where: { courseCycleId: evaluation.courseCycleId },
          order: { id: 'ASC' },
          skip: offset,
          take: BATCH_SIZE,
        });

        if (enrollmentsBatch.length === 0) {
          hasMore = false;
          break;
        }

        const enrollmentIds = enrollmentsBatch.map((e) => e.id);

        const allExistingAccess = await manager
          .createQueryBuilder(EnrollmentEvaluation, 'ee')
          .innerJoinAndSelect('ee.evaluation', 'ev')
          .innerJoinAndSelect('ev.evaluationType', 'et')
          .where('ee.enrollmentId IN (:...ids)', { ids: enrollmentIds })
          .andWhere('et.code != :bancoCode', {
            bancoCode: EVALUATION_TYPE_CODES.BANCO_ENUNCIADOS,
          })
          .getMany();

        const accessMap = new Map<string, Evaluation[]>();
        for (const access of allExistingAccess) {
          if (!accessMap.has(access.enrollmentId)) {
            accessMap.set(access.enrollmentId, []);
          }
          accessMap.get(access.enrollmentId)?.push(access.evaluation);
        }

        const accessEntries: EnrollmentEvaluation[] = [];

        for (const enrollment of enrollmentsBatch) {
          let accessEndDate = evaluation.endDate;

          if (enrollment.enrollmentTypeId !== fullType.id) {
            const academicEvaluations = accessMap.get(enrollment.id) || [];

            if (academicEvaluations.length > 0) {
              const maxAcademicEndDate = academicEvaluations.reduce(
                (max, current) => {
                  return current.endDate > max ? current.endDate : max;
                },
                new Date(0),
              );
              accessEndDate = maxAcademicEndDate;
            }
          }

          const accessEntry = new EnrollmentEvaluation();
          accessEntry.enrollmentId = enrollment.id;
          accessEntry.evaluationId = evaluation.id;
          accessEntry.accessStartDate = evaluation.startDate;
          accessEntry.accessEndDate = accessEndDate;
          accessEntry.isActive = true;
          accessEntries.push(accessEntry);
        }

        if (accessEntries.length > 0) {
          await manager.save(EnrollmentEvaluation, accessEntries);
        }

        totalProcessed += enrollmentsBatch.length;
        offset += BATCH_SIZE;

        if (enrollmentsBatch.length < BATCH_SIZE) {
          hasMore = false;
        }
      }
    } else {
      while (hasMore) {
        const fullEnrollmentsBatch = await manager.find(Enrollment, {
          where: {
            courseCycleId: evaluation.courseCycleId,
            enrollmentTypeId: fullType.id,
          },
          order: { id: 'ASC' },
          skip: offset,
          take: BATCH_SIZE,
        });

        if (fullEnrollmentsBatch.length === 0) {
          hasMore = false;
          break;
        }

        const accessEntries = fullEnrollmentsBatch.map((enrollment) => {
          const accessEntry = new EnrollmentEvaluation();
          accessEntry.enrollmentId = enrollment.id;
          accessEntry.evaluationId = evaluation.id;
          accessEntry.accessStartDate = evaluation.startDate;
          accessEntry.accessEndDate = evaluation.endDate;
          accessEntry.isActive = true;
          return accessEntry;
        });

        if (accessEntries.length > 0) {
          await manager.save(EnrollmentEvaluation, accessEntries);
        }

        totalProcessed += fullEnrollmentsBatch.length;
        offset += BATCH_SIZE;

        if (fullEnrollmentsBatch.length < BATCH_SIZE) {
          hasMore = false;
        }
      }
    }

    this.logger.log({
      message: 'Accesos otorgados automáticamente por subscriber',
      evaluationId: evaluation.id,
      totalEnrollments: totalProcessed,
    });
  }
}
