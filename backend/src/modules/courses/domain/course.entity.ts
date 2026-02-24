import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CourseType } from '@modules/courses/domain/course-type.entity';
import { CycleLevel } from '@modules/courses/domain/cycle-level.entity';

@Entity('course')
export class Course {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'course_type_id', type: 'bigint' })
  courseTypeId: string;

  @Column({ name: 'cycle_level_id', type: 'bigint' })
  cycleLevelId: string;

  @Column({ length: 50 })
  code: string;

  @Column({ length: 100 })
  name: string;

  @Column({ name: 'primary_color', length: 7, nullable: true })
  primaryColor: string;

  @Column({ name: 'secondary_color', length: 7, nullable: true })
  secondaryColor: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => CourseType)
  @JoinColumn({ name: 'course_type_id' })
  courseType: CourseType;

  @ManyToOne(() => CycleLevel)
  @JoinColumn({ name: 'cycle_level_id' })
  cycleLevel: CycleLevel;
}
