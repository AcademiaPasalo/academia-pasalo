import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { MaterialFolder } from '@modules/materials/domain/material-folder.entity';
import { FileResource } from '@modules/materials/domain/file-resource.entity';
import { FileVersion } from '@modules/materials/domain/file-version.entity';
import { User } from '@modules/users/domain/user.entity';
import { MaterialStatus } from '@modules/materials/domain/material-status.entity';

@Entity('material')
export class Material {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'material_folder_id', type: 'bigint' })
  materialFolderId: string;

  @ManyToOne(() => MaterialFolder, (folder) => folder.materials)
  @JoinColumn({ name: 'material_folder_id' })
  materialFolder: MaterialFolder;

  @Column({ name: 'file_resource_id', type: 'bigint' })
  fileResourceId: string;

  @ManyToOne(() => FileResource)
  @JoinColumn({ name: 'file_resource_id' })
  fileResource: FileResource;

  @Column({ name: 'file_version_id', type: 'bigint' })
  fileVersionId: string;

  @ManyToOne(() => FileVersion)
  @JoinColumn({ name: 'file_version_id' })
  fileVersion: FileVersion;

  @Column({ name: 'material_status_id', type: 'bigint' })
  materialStatusId: string;

  @ManyToOne(() => MaterialStatus)
  @JoinColumn({ name: 'material_status_id' })
  materialStatus: MaterialStatus;

  @Column({ name: 'display_name', type: 'varchar', length: 255 })
  displayName: string;

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