import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { AppModule } from '@src/app.module';
import { DataSource } from 'typeorm';
import { TestSeeder } from './test-utils';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { User } from '@modules/users/domain/user.entity';

interface EnrollmentDashboardItem {
  courseCycle: {
    course: {
      code: string;
    };
    professors: unknown[];
    academicCycle: {
      isCurrent: boolean;
    };
  };
}

interface DashboardResponse {
  data: EnrollmentDashboardItem[];
}

describe('E2E: Dashboard del Alumno (My Courses)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let seeder: TestSeeder;

  let student: { user: User; token: string };
  let admin: { user: User; token: string };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalInterceptors(new TransformInterceptor(app.get(Reflector)));
    await app.init();

    dataSource = app.get(DataSource);
    seeder = new TestSeeder(dataSource, app);

    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    await dataSource.query('DELETE FROM enrollment_evaluation');
    await dataSource.query('DELETE FROM enrollment');
    await dataSource.query('DELETE FROM course_cycle_professor');
    await dataSource.query('DELETE FROM course_cycle');
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');

    admin = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail('admin_db'),
      ['ADMIN'],
    );
    student = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail('student_db'),
      ['STUDENT'],
    );

    const cycle = await seeder.createCycle(
      '2026-I',
      '2026-01-01',
      '2026-06-30',
    );

    const course1 = await seeder.createCourse('C1', 'Curso con 2 Profes');
    const course2 = await seeder.createCourse('C2', 'Curso con 1 Profe');

    const cc1 = await seeder.linkCourseCycle(course1.id, cycle.id);
    const cc2 = await seeder.linkCourseCycle(course2.id, cycle.id);

    const prof1 = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail('p1'),
      ['PROFESSOR'],
    );
    const prof2 = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail('p2'),
      ['PROFESSOR'],
    );

    await dataSource.query(
      `INSERT INTO course_cycle_professor (course_cycle_id, professor_user_id, assigned_at) VALUES (?, ?, ?), (?, ?, ?)`,
      [cc1.id, prof1.user.id, new Date(), cc1.id, prof2.user.id, new Date()],
    );
    await dataSource.query(
      `INSERT INTO course_cycle_professor (course_cycle_id, professor_user_id, assigned_at) VALUES (?, ?, ?)`,
      [cc2.id, prof1.user.id, new Date()],
    );

    await request(app.getHttpServer())
      .post('/enrollments')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        userId: student.user.id,
        courseCycleId: cc1.id,
        enrollmentTypeCode: 'FULL',
      });

    await request(app.getHttpServer())
      .post('/enrollments')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        userId: student.user.id,
        courseCycleId: cc2.id,
        enrollmentTypeCode: 'FULL',
      });
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('Debe retornar los cursos matriculados con sus respectivos profesores', async () => {
    const res = await request(app.getHttpServer())
      .get('/enrollments/my-courses')
      .set('Authorization', `Bearer ${student.token}`)
      .expect(200);

    const body = res.body as DashboardResponse;
    const data = body.data;
    expect(data).toHaveLength(2);

    const courseWith2Prof = data.find(
      (e) => e.courseCycle.course.code === 'C1',
    );
    if (!courseWith2Prof) throw new Error('Course C1 not found');

    expect(courseWith2Prof.courseCycle.professors).toHaveLength(2);
    expect(courseWith2Prof.courseCycle.academicCycle.isCurrent).toBe(true);

    const courseWith1Prof = data.find(
      (e) => e.courseCycle.course.code === 'C2',
    );
    if (!courseWith1Prof) throw new Error('Course C2 not found');
    expect(courseWith1Prof.courseCycle.professors).toHaveLength(1);
  });
});
