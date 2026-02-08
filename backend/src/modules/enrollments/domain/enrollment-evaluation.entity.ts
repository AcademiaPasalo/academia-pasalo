import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Enrollment } from '@modules/enrollments/domain/enrollment.entity';
import { Evaluation } from '@modules/evaluations/domain/evaluation.entity';
import { User } from '@modules/users/domain/user.entity';

@Entity('enrollment_evaluation')
export class EnrollmentEvaluation {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'enrollment_id', type: 'bigint' })
  enrollmentId: string;

  @Column({ name: 'evaluation_id', type: 'bigint' })
  evaluationId: string;

  @Column({ name: 'access_start_date', type: 'datetime' })
  accessStartDate: Date;

  @Column({ name: 'access_end_date', type: 'datetime' })
  accessEndDate: Date;

  @Column({ name: 'is_active', type: 'boolean' })
  isActive: boolean;

  @Column({ name: 'revoked_at', type: 'datetime', nullable: true })
  revokedAt: Date | null;

  @Column({ name: 'revoked_by', type: 'bigint', nullable: true })
  revokedBy: string | null;

  @ManyToOne(() => Enrollment)
  @JoinColumn({ name: 'enrollment_id' })
  enrollment: Enrollment;

  @ManyToOne(() => Evaluation)
  @JoinColumn({ name: 'evaluation_id' })
  evaluation: Evaluation;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'revoked_by' })
  revokedByUser: User | null;
}
