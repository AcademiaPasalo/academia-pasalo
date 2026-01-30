import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Evaluation } from '@modules/evaluations/domain/evaluation.entity';
import { User } from '@modules/users/domain/user.entity';
import { Material } from '@modules/materials/domain/material.entity';
import { FolderStatus } from '@modules/materials/domain/folder-status.entity';

@Entity('material_folder')
export class MaterialFolder {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'evaluation_id', type: 'bigint' })
  evaluationId: string;

  @ManyToOne(() => Evaluation)
  @JoinColumn({ name: 'evaluation_id' })
  evaluation: Evaluation;

  @Column({ name: 'parent_folder_id', type: 'bigint', nullable: true })
  parentFolderId: string | null;

  @ManyToOne(() => MaterialFolder, (folder) => folder.subFolders)
  @JoinColumn({ name: 'parent_folder_id' })
  parentFolder: MaterialFolder;

  @OneToMany(() => MaterialFolder, (folder) => folder.parentFolder)
  subFolders: MaterialFolder[];

  @OneToMany(() => Material, (material) => material.materialFolder)
  materials: Material[];

  @Column({ name: 'folder_status_id', type: 'bigint' })
  folderStatusId: string;

  @ManyToOne(() => FolderStatus)
  @JoinColumn({ name: 'folder_status_id' })
  folderStatus: FolderStatus;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'visible_from', type: 'datetime', nullable: true })
  visibleFrom: Date | null;

  @Column({ name: 'visible_until', type: 'datetime', nullable: true })
  visibleUntil: Date | null;

  @Column({ name: 'created_by', type: 'bigint' })
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'datetime', nullable: true })
  updatedAt: Date | null;
}