import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { MaterialFolder } from './material-folder.entity';
import { FileResource } from './file-resource.entity';
import { FileVersion } from './file-version.entity';
import { MaterialStatus } from './material-status.entity';
import { User } from '@modules/users/domain/user.entity';

@Entity('material')
export class Material {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'material_folder_id', type: 'bigint' })
  materialFolderId: string;

  @Column({ name: 'file_resource_id', type: 'bigint' })
  fileResourceId: string;

  @Column({ name: 'file_version_id', type: 'bigint' })
  fileVersionId: string;

  @Column({ name: 'material_status_id', type: 'bigint' })
  materialStatusId: string;

  @Column({ name: 'display_name', length: 255 })
  displayName: string;

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

  @ManyToOne(() => MaterialFolder)
  @JoinColumn({ name: 'material_folder_id' })
  folder: MaterialFolder;

  @ManyToOne(() => FileResource)
  @JoinColumn({ name: 'file_resource_id' })
  fileResource: FileResource;

  @ManyToOne(() => FileVersion)
  @JoinColumn({ name: 'file_version_id' })
  currentVersion: FileVersion;

  @ManyToOne(() => MaterialStatus)
  @JoinColumn({ name: 'material_status_id' })
  status: MaterialStatus;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;
}
