import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '@modules/users/domain/user.entity';
import { CourseCycle } from '@modules/courses/domain/course-cycle.entity';
import { EnrollmentStatus } from '@modules/enrollments/domain/enrollment-status.entity';
import { EnrollmentType } from '@modules/enrollments/domain/enrollment-type.entity';

@Entity('enrollment')
export class Enrollment {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'course_cycle_id', type: 'bigint' })
  courseCycleId: string;

  @Column({ name: 'enrollment_status_id', type: 'bigint' })
  enrollmentStatusId: string;

  @Column({ name: 'enrollment_type_id', type: 'bigint' })
  enrollmentTypeId: string;

  @CreateDateColumn({ name: 'enrolled_at' })
  enrolledAt: Date;

  @Column({ name: 'cancelled_at', type: 'datetime', nullable: true })
  cancelledAt: Date | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => CourseCycle)
  @JoinColumn({ name: 'course_cycle_id' })
  courseCycle: CourseCycle;

  @ManyToOne(() => EnrollmentStatus)
  @JoinColumn({ name: 'enrollment_status_id' })
  status: EnrollmentStatus;

  @ManyToOne(() => EnrollmentType)
  @JoinColumn({ name: 'enrollment_type_id' })
  type: EnrollmentType;
}
