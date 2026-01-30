import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '@modules/users/domain/user.entity';
import { DeletionRequestStatus } from '@modules/materials/domain/deletion-request-status.entity';

@Entity('deletion_request')
export class DeletionRequest {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'requested_by', type: 'bigint' })
  requestedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requested_by' })
  requestedBy: User;

  @Column({ name: 'deletion_request_status_id', type: 'bigint' })
  deletionRequestStatusId: string;

  @ManyToOne(() => DeletionRequestStatus)
  @JoinColumn({ name: 'deletion_request_status_id' })
  deletionRequestStatus: DeletionRequestStatus;

  @Column({ name: 'entity_type', type: 'varchar', length: 50 })
  entityType: string;

  @Column({ name: 'entity_id', type: 'bigint' })
  entityId: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  reason: string | null;

  @Column({ name: 'reviewed_by', type: 'bigint', nullable: true })
  reviewedById: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewed_by' })
  reviewedBy: User;

  @Column({ name: 'reviewed_at', type: 'datetime', nullable: true })
  reviewedAt: Date | null;

  @Column({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'datetime', nullable: true })
  updatedAt: Date | null;
}
