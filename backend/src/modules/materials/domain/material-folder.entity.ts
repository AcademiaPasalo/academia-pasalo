import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Evaluation } from '@modules/evaluations/domain/evaluation.entity';
import { FolderStatus } from './folder-status.entity';
import { User } from '@modules/users/domain/user.entity';

@Entity('material_folder')
export class MaterialFolder {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'evaluation_id', type: 'bigint' })
  evaluationId: string;

  @Column({ name: 'parent_folder_id', type: 'bigint', nullable: true })
  parentFolderId: string | null;

  @Column({ name: 'folder_status_id', type: 'bigint' })
  folderStatusId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ name: 'visible_from', type: 'datetime', nullable: true })
  visibleFrom: Date | null;

  @Column({ name: 'visible_until', type: 'datetime', nullable: true })
  visibleUntil: Date | null;

  @Column({ name: 'created_by', type: 'bigint' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Evaluation)
  @JoinColumn({ name: 'evaluation_id' })
  evaluation: Evaluation;

  @ManyToOne(() => MaterialFolder, (folder) => folder.subfolders)
  @JoinColumn({ name: 'parent_folder_id' })
  parentFolder: MaterialFolder | null;

  @OneToMany(() => MaterialFolder, (folder) => folder.parentFolder)
  subfolders: MaterialFolder[];

  @ManyToOne(() => FolderStatus)
  @JoinColumn({ name: 'folder_status_id' })
  status: FolderStatus;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;
}
