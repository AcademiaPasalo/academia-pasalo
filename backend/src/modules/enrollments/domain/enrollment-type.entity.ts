import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('enrollment_type')
export class EnrollmentType {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ unique: true, length: 32 })
  code: string;

  @Column({ length: 100 })
  name: string;
}
