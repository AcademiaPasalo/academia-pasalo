import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('security_event_type')
export class SecurityEventType {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;
}
