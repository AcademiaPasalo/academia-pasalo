import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@modules/users/domain/user.entity';
import { SecurityEventType } from '@modules/auth/domain/security-event-type.entity';

@Entity('security_event')
export class SecurityEvent {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'bigint', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'bigint', name: 'security_event_type_id' })
  securityEventTypeId: string;

  @ManyToOne(() => SecurityEventType)
  @JoinColumn({ name: 'security_event_type_id' })
  securityEventType: SecurityEventType;

  @Column({ type: 'varchar', length: 50, name: 'ip_address', nullable: true })
  ipAddress: string | null;

  @Column({ type: 'varchar', length: 255, name: 'user_agent', nullable: true })
  userAgent: string | null;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, unknown> | null;

  @Column({ type: 'datetime', name: 'event_datetime' })
  eventDatetime: Date;
}
