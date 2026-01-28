import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '@modules/users/domain/user.entity';
import { DeletionRequestStatus } from './deletion-request-status.entity';

@Entity('deletion_request')
export class DeletionRequest {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'requested_by', type: 'bigint' })
  requestedById: string;

  @Column({ name: 'deletion_request_status_id', type: 'bigint' })
  deletionRequestStatusId: string;

  @Column({ name: 'entity_type', length: 50 })
  entityType: string;

  @Column({ name: 'entity_id', type: 'bigint' })
  entityId: string;

  @Column({ length: 500, nullable: true })
  reason: string | null;

  @Column({ name: 'reviewed_by', type: 'bigint', nullable: true })
  reviewedById: string | null;

  @Column({ name: 'reviewed_at', type: 'datetime', nullable: true })
  reviewedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requested_by' })
  requestedBy: User;

  @ManyToOne(() => DeletionRequestStatus)
  @JoinColumn({ name: 'deletion_request_status_id' })
  status: DeletionRequestStatus;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewed_by' })
  reviewer: User | null;
}
