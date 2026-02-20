import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { STORAGE_PROVIDER_CODES } from '@modules/materials/domain/material.constants';

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

  @Column({ name: 'storage_provider', type: 'varchar', length: 20 })
  storageProvider: (typeof STORAGE_PROVIDER_CODES)[keyof typeof STORAGE_PROVIDER_CODES];

  @Column({ name: 'storage_key', type: 'varchar', length: 512 })
  storageKey: string;

  @Column({ name: 'storage_url', type: 'varchar', length: 500, nullable: true })
  storageUrl: string | null;

  @Column({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}
