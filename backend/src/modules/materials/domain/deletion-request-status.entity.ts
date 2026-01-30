import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('deletion_request_status')
export class DeletionRequestStatus {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;
}