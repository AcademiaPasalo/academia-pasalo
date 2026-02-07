import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@modules/users/domain/user.entity';
import { AuditAction } from '@modules/audit/domain/audit-action.entity';

@Entity('audit_log')
export class AuditLog {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'bigint', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'bigint', name: 'audit_action_id' })
  auditActionId: string;

  @ManyToOne(() => AuditAction)
  @JoinColumn({ name: 'audit_action_id' })
  auditAction: AuditAction;

  @Column({ type: 'datetime', name: 'event_datetime' })
  eventDatetime: Date;

  @Column({ type: 'varchar', length: 50, name: 'entity_type', nullable: true })
  entityType: string | null;

  @Column({ type: 'bigint', name: 'entity_id', nullable: true })
  entityId: string | null;
}