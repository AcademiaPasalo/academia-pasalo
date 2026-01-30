import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { CourseCycle } from '@modules/courses/domain/course-cycle.entity';
import { CourseTestimony } from '@modules/feedback/domain/course-testimony.entity';

@Entity('featured_testimony')
@Unique(['courseCycleId', 'courseTestimonyId'])
export class FeaturedTestimony {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'course_cycle_id', type: 'bigint' })
  courseCycleId: string;

  @ManyToOne(() => CourseCycle)
  @JoinColumn({ name: 'course_cycle_id' })
  courseCycle: CourseCycle;

  @Column({ name: 'course_testimony_id', type: 'bigint' })
  courseTestimonyId: string;

  @ManyToOne(() => CourseTestimony)
  @JoinColumn({ name: 'course_testimony_id' })
  courseTestimony: CourseTestimony;

  @Column({ name: 'display_order', type: 'int' })
  displayOrder: number;

  @Column({ name: 'is_active', type: 'boolean' })
  isActive: boolean;

  @Column({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'datetime', nullable: true })
  updatedAt: Date | null;
}