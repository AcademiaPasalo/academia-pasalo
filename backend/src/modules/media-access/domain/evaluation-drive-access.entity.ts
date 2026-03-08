import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Evaluation } from '@modules/evaluations/domain/evaluation.entity';

@Entity('evaluation_drive_access')
export class EvaluationDriveAccess {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'evaluation_id', type: 'bigint' })
  evaluationId: string;

  @ManyToOne(() => Evaluation)
  @JoinColumn({ name: 'evaluation_id' })
  evaluation: Evaluation;

  @Column({ name: 'scope_key', type: 'varchar', length: 64 })
  scopeKey: string;

  @Column({
    name: 'drive_scope_folder_id',
    type: 'varchar',
    length: 128,
    nullable: true,
  })
  driveScopeFolderId: string | null;

  @Column({
    name: 'drive_videos_folder_id',
    type: 'varchar',
    length: 128,
    nullable: true,
  })
  driveVideosFolderId: string | null;

  @Column({
    name: 'drive_documents_folder_id',
    type: 'varchar',
    length: 128,
    nullable: true,
  })
  driveDocumentsFolderId: string | null;

  @Column({
    name: 'drive_archived_folder_id',
    type: 'varchar',
    length: 128,
    nullable: true,
  })
  driveArchivedFolderId: string | null;

  @Column({ name: 'viewer_group_email', type: 'varchar', length: 320 })
  viewerGroupEmail: string;

  @Column({
    name: 'viewer_group_id',
    type: 'varchar',
    length: 128,
    nullable: true,
  })
  viewerGroupId: string | null;

  @Column({ name: 'is_active', type: 'boolean' })
  isActive: boolean;

  @Column({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'datetime', nullable: true })
  updatedAt: Date | null;
}
