import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { ClassEvent } from '@modules/events/domain/class-event.entity';
import { User } from '@modules/users/domain/user.entity';

@Entity('class_event_professor')
export class ClassEventProfessor {
  @PrimaryColumn({ name: 'class_event_id', type: 'bigint' })
  classEventId: string;

  @PrimaryColumn({ name: 'professor_user_id', type: 'bigint' })
  professorUserId: string;

  @Column({ name: 'assigned_at', type: 'datetime' })
  assignedAt: Date;

  @Column({ name: 'revoked_at', type: 'datetime', nullable: true })
  revokedAt: Date | null;

  @ManyToOne(() => ClassEvent, (classEvent) => classEvent.professors)
  @JoinColumn({ name: 'class_event_id' })
  classEvent: ClassEvent;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'professor_user_id' })
  professor: User;
}
