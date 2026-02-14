import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('folder_status')
export class FolderStatus {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;
}
