import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CourseCycle } from '@modules/courses/domain/course-cycle.entity';
import { EvaluationType } from '@modules/evaluations/domain/evaluation-type.entity';

@Entity('course_cycle_allowed_evaluation_type')
export class CourseCycleAllowedEvaluationType {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'course_cycle_id', type: 'bigint' })
  courseCycleId: string;

  @Column({ name: 'evaluation_type_id', type: 'bigint' })
  evaluationTypeId: string;

  @Column({ name: 'is_active', type: 'boolean' })
  isActive: boolean;

  @Column({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'datetime', nullable: true })
  updatedAt: Date | null;

  @ManyToOne(() => CourseCycle)
  @JoinColumn({ name: 'course_cycle_id' })
  courseCycle: CourseCycle;

  @ManyToOne(() => EvaluationType)
  @JoinColumn({ name: 'evaluation_type_id' })
  evaluationType: EvaluationType;
}
