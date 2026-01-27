import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('material_status')
export class MaterialStatus {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ length: 50 })
  code: string;

  @Column({ length: 100 })
  name: string;
}
