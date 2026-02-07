import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '@modules/users/domain/user.entity';
import { CourseCycle } from '@modules/courses/domain/course-cycle.entity';

export enum PhotoSource {
  PROFILE = 'profile',
  UPLOADED = 'uploaded',
  NONE = 'none',
}

@Entity('course_testimony')
@Unique(['userId', 'courseCycleId'])
export class CourseTestimony {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'course_cycle_id', type: 'bigint' })
  courseCycleId: string;

  @ManyToOne(() => CourseCycle)
  @JoinColumn({ name: 'course_cycle_id' })
  courseCycle: CourseCycle;

  @Column({ type: 'tinyint' })
  rating: number;

  @Column({ type: 'text' })
  comment: string;

  @Column({ name: 'photo_url', type: 'varchar', length: 500, nullable: true })
  photoUrl: string | null;

  @Column({
    name: 'photo_source',
    type: 'enum',
    enum: PhotoSource,
    default: PhotoSource.NONE,
  })
  photoSource: PhotoSource;

  @Column({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'datetime', nullable: true })
  updatedAt: Date | null;
}
