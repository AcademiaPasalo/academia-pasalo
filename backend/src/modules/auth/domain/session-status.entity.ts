import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('session_status')
export class SessionStatus {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  code: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;
}
