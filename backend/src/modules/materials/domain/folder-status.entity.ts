import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('folder_status')
export class FolderStatus {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ length: 50 })
  code: string;

  @Column({ length: 100 })
  name: string;
}
