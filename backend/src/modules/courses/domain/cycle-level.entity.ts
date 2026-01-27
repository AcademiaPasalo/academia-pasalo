import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('cycle_level')
export class CycleLevel {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'level_number' })
  levelNumber: number;

  @Column({ length: 50 })
  name: string;
}
