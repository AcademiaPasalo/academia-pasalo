import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('enrollment_status')
export class EnrollmentStatus {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ length: 50 })
  code: string;

  @Column({ length: 100 })
  name: string;
}
