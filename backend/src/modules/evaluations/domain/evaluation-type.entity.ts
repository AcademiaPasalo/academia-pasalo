import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('evaluation_type')
export class EvaluationType {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ length: 50 })
  code: string;

  @Column({ length: 100 })
  name: string;
}
