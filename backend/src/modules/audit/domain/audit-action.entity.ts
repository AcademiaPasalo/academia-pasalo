import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('audit_action')
export class AuditAction {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;
}
