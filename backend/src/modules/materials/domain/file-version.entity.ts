import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { FileResource } from './file-resource.entity';
import { User } from '@modules/users/domain/user.entity';

@Entity('file_version')
export class FileVersion {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'file_resource_id', type: 'bigint' })
  fileResourceId: string;

  @ManyToOne(() => FileResource)
  @JoinColumn({ name: 'file_resource_id' })
  fileResource: FileResource;

  @Column({ name: 'version_number', type: 'int' })
  versionNumber: number;

  @Column({ name: 'storage_url', type: 'varchar', length: 500 })
  storageUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'created_by', type: 'bigint' })
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;
}