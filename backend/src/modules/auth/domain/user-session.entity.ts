import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@modules/users/domain/user.entity';
import { SessionStatus } from '@modules/auth/domain/session-status.entity';
import { Role } from '@modules/users/domain/role.entity';

@Entity('user_session')
export class UserSession {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'bigint', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 255, name: 'device_id' })
  deviceId: string;

  @Column({ type: 'varchar', length: 50, name: 'ip_address' })
  ipAddress: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) => (value === null ? null : Number(value)),
    },
  })
  latitude: number | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) => (value === null ? null : Number(value)),
    },
  })
  longitude: number | null;

  @Column({ type: 'varchar', length: 255, name: 'refresh_token_hash' })
  refreshTokenHash: string;

  @Column({
    type: 'varchar',
    length: 36,
    name: 'refresh_token_jti',
    nullable: true,
  })
  refreshTokenJti: string | null;

  @Column({ type: 'bigint', name: 'session_status_id' })
  sessionStatusId: string;

  @ManyToOne(() => SessionStatus)
  @JoinColumn({ name: 'session_status_id' })
  sessionStatus: SessionStatus;

  @Column({ type: 'bigint', name: 'active_role_id', nullable: true })
  activeRoleId: string | null;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'active_role_id' })
  activeRole: Role | null;

  @Column({ type: 'datetime', name: 'expires_at' })
  expiresAt: Date;

  @Column({ type: 'datetime', name: 'last_activity_at' })
  lastActivityAt: Date;

  @Column({ type: 'boolean', name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'datetime', name: 'created_at', nullable: false })
  createdAt: Date;
}
