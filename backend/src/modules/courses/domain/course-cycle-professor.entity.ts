import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { CourseCycle } from '@modules/courses/domain/course-cycle.entity';
import { User } from '@modules/users/domain/user.entity';

@Entity('course_cycle_professor')
export class CourseCycleProfessor {
  @PrimaryColumn({ name: 'course_cycle_id', type: 'bigint' })
  courseCycleId: string;

  @PrimaryColumn({ name: 'professor_user_id', type: 'bigint' })
  professorUserId: string;

  @ManyToOne(() => CourseCycle)
  @JoinColumn({ name: 'course_cycle_id' })
  courseCycle: CourseCycle;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'professor_user_id' })
  professor: User;

  @Column({ name: 'assigned_at', type: 'datetime' })
  assignedAt: Date;

  @Column({ name: 'revoked_at', type: 'datetime', nullable: true })
  revokedAt: Date | null;
}
