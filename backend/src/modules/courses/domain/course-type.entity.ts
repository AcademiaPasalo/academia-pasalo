import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('course_type')
export class CourseType {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ length: 30 })
  code: string;

  @Column({ length: 60 })
  name: string;
}
