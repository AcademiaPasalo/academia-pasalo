import { Logger } from '@nestjs/common';
import { EntitySubscriberInterface, EventSubscriber, InsertEvent, DataSource } from 'typeorm';
import { Evaluation } from '@modules/evaluations/domain/evaluation.entity';
import { Enrollment } from '@modules/enrollments/domain/enrollment.entity';
import { EnrollmentEvaluation } from '@modules/enrollments/domain/enrollment-evaluation.entity';
import { EnrollmentType } from '@modules/enrollments/domain/enrollment-type.entity';
import { EvaluationType } from '@modules/evaluations/domain/evaluation-type.entity';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

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
        message: 'Tipo de evaluación no encontrado, omitiendo lógica del subscriber',
        evaluationTypeId: evaluation.evaluationTypeId,
        evaluationId: evaluation.id,
      });
      return;
    }

    const fullType = await manager.findOne(EnrollmentType, {
      where: { code: 'FULL' },
    });

    if (!fullType) {
      this.logger.warn({
        message: 'Tipo de matrícula FULL no encontrado, omitiendo lógica del subscriber',
        evaluationId: evaluation.id,
      });
      return;
    }

    if (evaluationType.code === 'BANCO_ENUNCIADOS') {
      const allEnrollments = await manager.find(Enrollment, {
        where: { courseCycleId: evaluation.courseCycleId },
      });

      if (allEnrollments.length === 0) return;

      const enrollmentIds = allEnrollments.map(e => e.id);
      
      const allExistingAccess = await manager.createQueryBuilder(EnrollmentEvaluation, 'ee')
        .innerJoinAndSelect('ee.evaluation', 'ev')
        .innerJoinAndSelect('ev.evaluationType', 'et')
        .where('ee.enrollmentId IN (:...ids)', { ids: enrollmentIds })
        .andWhere('et.code != :bancoCode', { bancoCode: 'BANCO_ENUNCIADOS' })
        .getMany();

      const accessMap = new Map<string, Evaluation[]>();
      for (const access of allExistingAccess) {
        if (!accessMap.has(access.enrollmentId)) {
          accessMap.set(access.enrollmentId, []);
        }
        accessMap.get(access.enrollmentId)?.push(access.evaluation);
      }

      const accessEntries: EnrollmentEvaluation[] = [];

      for (const enrollment of allEnrollments) {
        let accessEndDate = evaluation.endDate;

        if (enrollment.enrollmentTypeId !== fullType.id) {
          const academicEvaluations = accessMap.get(enrollment.id) || [];

          if (academicEvaluations.length > 0) {
            const maxAcademicEndDate = academicEvaluations.reduce((max, current) => {
              return current.endDate > max ? current.endDate : max;
            }, new Date(0));
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

      await manager.save(EnrollmentEvaluation, accessEntries);
    } else {
      const fullEnrollments = await manager.find(Enrollment, {
        where: {
          courseCycleId: evaluation.courseCycleId,
          enrollmentTypeId: fullType.id,
        },
      });

      if (fullEnrollments.length === 0) return;

      const accessEntries = fullEnrollments.map((enrollment) => {
        const accessEntry = new EnrollmentEvaluation();
        accessEntry.enrollmentId = enrollment.id;
        accessEntry.evaluationId = evaluation.id;
        accessEntry.accessStartDate = evaluation.startDate;
        accessEntry.accessEndDate = evaluation.endDate;
        accessEntry.isActive = true;
        return accessEntry;
      });

      await manager.save(EnrollmentEvaluation, accessEntries);
    }
  }
}
