import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('role')
export class Role {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar', length: 30, nullable: false })
  code: string;

  @Column({ type: 'varchar', length: 30, nullable: false })
  name: string;
}
