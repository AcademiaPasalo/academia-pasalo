import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Course } from '@modules/courses/domain/course.entity';
import { AcademicCycle } from '@modules/cycles/domain/academic-cycle.entity';
import { Evaluation } from '@modules/evaluations/domain/evaluation.entity';
import { CourseCycleProfessor } from '@modules/courses/domain/course-cycle-professor.entity';
import { Enrollment } from '@modules/enrollments/domain/enrollment.entity';

@Entity('course_cycle')
export class CourseCycle {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'course_id', type: 'bigint' })
  courseId: string;

  @Column({ name: 'academic_cycle_id', type: 'bigint' })
  academicCycleId: string;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToOne(() => AcademicCycle)
  @JoinColumn({ name: 'academic_cycle_id' })
  academicCycle: AcademicCycle;

  @OneToMany(() => Evaluation, (evaluation) => evaluation.courseCycle)
  evaluations: Evaluation[];

  @OneToMany(() => CourseCycleProfessor, (ccp) => ccp.courseCycle)
  professors: CourseCycleProfessor[];

  @OneToMany(() => Enrollment, (enrollment) => enrollment.courseCycle)
  enrollments: Enrollment[];
}
