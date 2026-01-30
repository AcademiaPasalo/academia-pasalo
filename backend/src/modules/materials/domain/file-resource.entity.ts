import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('file_resource')
export class FileResource {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'checksum_hash', type: 'varchar', length: 255 })
  checksumHash: string;

  @Column({ name: 'original_name', type: 'varchar', length: 255 })
  originalName: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 100 })
  mimeType: string;

  @Column({ name: 'size_bytes', type: 'bigint' })
  sizeBytes: string;

  @Column({ name: 'storage_url', type: 'varchar', length: 500 })
  storageUrl: string;

  @Column({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}
