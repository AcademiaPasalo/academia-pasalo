import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Evaluation } from '@modules/evaluations/domain/evaluation.entity';
import { User } from '@modules/users/domain/user.entity';
import { ClassEventProfessor } from '@modules/events/domain/class-event-professor.entity';

@Entity('class_event')
export class ClassEvent {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'evaluation_id', type: 'bigint' })
  evaluationId: string;

  @Column({ name: 'session_number', type: 'int' })
  sessionNumber: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 120 })
  topic: string;

  @Column({ name: 'start_datetime', type: 'datetime' })
  startDatetime: Date;

  @Column({ name: 'end_datetime', type: 'datetime' })
  endDatetime: Date;

  @Column({ name: 'meeting_link', type: 'varchar', length: 500 })
  meetingLink: string;

  @Column({ name: 'is_cancelled', type: 'boolean', default: false })
  isCancelled: boolean;

  @Column({ name: 'created_by', type: 'bigint' })
  createdBy: string;

  @Column({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'datetime', nullable: true })
  updatedAt: Date | null;

  @ManyToOne(() => Evaluation)
  @JoinColumn({ name: 'evaluation_id' })
  evaluation: Evaluation;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => ClassEventProfessor, (cep) => cep.classEvent)
  professors: ClassEventProfessor[];
}
