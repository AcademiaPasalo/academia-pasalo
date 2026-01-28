import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { FileResource } from './file-resource.entity';
import { User } from '@modules/users/domain/user.entity';

@Entity('file_version')
export class FileVersion {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'file_resource_id', type: 'bigint' })
  fileResourceId: string;

  @Column({ name: 'version_number' })
  versionNumber: number;

  @Column({ name: 'storage_url', length: 500 })
  storageUrl: string;

  @Column({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @Column({ name: 'created_by', type: 'bigint' })
  createdBy: string;

  @ManyToOne(() => FileResource)
  @JoinColumn({ name: 'file_resource_id' })
  fileResource: FileResource;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;
}
