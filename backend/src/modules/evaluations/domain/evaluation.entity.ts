import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { EvaluationType } from '@modules/evaluations/domain/evaluation-type.entity';
import { CourseCycle } from '@modules/courses/domain/course-cycle.entity';
import { EnrollmentEvaluation } from '@modules/enrollments/domain/enrollment-evaluation.entity';

@Entity('evaluation')
export class Evaluation {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'course_cycle_id', type: 'bigint' })
  courseCycleId: string;

  @Column({ name: 'evaluation_type_id', type: 'bigint' })
  evaluationTypeId: string;

  @Column()
  number: number;

  @Column({ name: 'start_date' })
  startDate: Date;

  @Column({ name: 'end_date' })
  endDate: Date;

  @ManyToOne(() => EvaluationType)
  @JoinColumn({ name: 'evaluation_type_id' })
  evaluationType: EvaluationType;

  @ManyToOne(() => CourseCycle, (courseCycle) => courseCycle.evaluations)
  @JoinColumn({ name: 'course_cycle_id' })
  courseCycle: CourseCycle;

  @OneToMany(
    () => EnrollmentEvaluation,
    (enrollmentEvaluation) => enrollmentEvaluation.evaluation,
  )
  enrollmentEvaluations: EnrollmentEvaluation[];
}
