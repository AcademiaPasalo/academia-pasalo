import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '@src/app.module';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { TestSeeder } from './test-utils';
import { ROLE_CODES } from '@common/constants/role-codes.constants';
import { ENROLLMENT_TYPE_CODES } from '@modules/enrollments/domain/enrollment.constants';

describe('E2E: Admin course cycles listing', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let seeder: TestSeeder;

  let admin: { user: { id: string }; token: string };
  let superAdmin: { user: { id: string }; token: string };
  let student: { user: { id: string }; token: string };
  let enrolledStudentA: { user: { id: string }; token: string };
  let enrolledStudentB: { user: { id: string }; token: string };
  let professorA: { user: { id: string }; token: string };
  let professorB: { user: { id: string }; token: string };

  let courseCycleCurrentId: string;
  let courseCyclePastId: string;

  const addDays = (base: Date, days: number): string => {
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
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
    await dataSource.query('DELETE FROM evaluation');
    await dataSource.query('DELETE FROM course_cycle_professor');
    await dataSource.query('DELETE FROM course_cycle');
    await dataSource.query('DELETE FROM academic_cycle');
    await dataSource.query('DELETE FROM course');
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');

    admin = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail('admin_cycles'),
      [ROLE_CODES.ADMIN],
    );
    superAdmin = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail('superadmin_cycles'),
      [ROLE_CODES.SUPER_ADMIN],
    );
    student = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail('student_cycles'),
      [ROLE_CODES.STUDENT],
    );
    enrolledStudentA = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail('enrolled_a'),
      [ROLE_CODES.STUDENT],
    );
    enrolledStudentB = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail('enrolled_b'),
      [ROLE_CODES.STUDENT],
    );
    professorA = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail('prof_a'),
      [ROLE_CODES.PROFESSOR],
    );
    professorB = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail('prof_b'),
      [ROLE_CODES.PROFESSOR],
    );

    const now = new Date();
    const cycleCurrent = await seeder.createCycle(
      '2026-1',
      addDays(now, -30),
      addDays(now, 60),
    );
    const cyclePast = await seeder.createCycle(
      '2024-2',
      addDays(now, -500),
      addDays(now, -430),
    );

    const courseCurrent = await seeder.createCourse(
      'ADM-QA',
      'Admin Quality Assurance',
    );
    const coursePast = await seeder.createCourse('ADM-HIS', 'Admin History');

    const ccCurrent = await seeder.linkCourseCycle(
      courseCurrent.id,
      cycleCurrent.id,
    );
    const ccPast = await seeder.linkCourseCycle(coursePast.id, cyclePast.id);
    courseCycleCurrentId = ccCurrent.id;
    courseCyclePastId = ccPast.id;

    await seeder.createEvaluation(
      ccCurrent.id,
      'PC',
      1,
      addDays(now, -10),
      addDays(now, -8),
    );
    await seeder.createEvaluation(
      ccCurrent.id,
      'EX',
      1,
      addDays(now, 10),
      addDays(now, 12),
    );

    const enrollmentA = await request(app.getHttpServer())
      .post('/api/v1/enrollments')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        userId: enrolledStudentA.user.id,
        courseCycleId: ccCurrent.id,
        enrollmentTypeCode: ENROLLMENT_TYPE_CODES.FULL,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/enrollments')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        userId: enrolledStudentB.user.id,
        courseCycleId: ccCurrent.id,
        enrollmentTypeCode: ENROLLMENT_TYPE_CODES.FULL,
      })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/api/v1/enrollments/${enrollmentA.body.data.id}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(204);

    await dataSource.query(
      `INSERT INTO course_cycle_professor (course_cycle_id, professor_user_id, assigned_at)
       VALUES (?, ?, NOW()), (?, ?, NOW())`,
      [ccCurrent.id, professorA.user.id, ccCurrent.id, professorB.user.id],
    );
    await dataSource.query(
      `UPDATE course_cycle_professor
       SET revoked_at = NOW()
       WHERE course_cycle_id = ? AND professor_user_id = ?`,
      [ccCurrent.id, professorB.user.id],
    );
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('admin can list all course cycles paginated with active professors', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/courses/course-cycles?page=1&pageSize=1')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);

    expect(res.body.data.page).toBe(1);
    expect(res.body.data.pageSize).toBe(1);
    expect(res.body.data.totalItems).toBe(2);
    expect(res.body.data.totalPages).toBe(2);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].courseCycleId).toBe(courseCycleCurrentId);
    expect(res.body.data.items[0].professors).toHaveLength(1);
    expect(res.body.data.items[0].professors[0].id).toBe(professorA.user.id);
    expect(res.body.data.items[0].academicCycle.isCurrent).toBe(true);
  });

  it('super admin can use search and receives only matching rows', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/courses/course-cycles?search=ADM-HIS')
      .set('Authorization', `Bearer ${superAdmin.token}`)
      .expect(200);

    expect(res.body.data.totalItems).toBe(1);
    expect(res.body.data.items[0].courseCycleId).toBe(courseCyclePastId);
  });

  it('student cannot access admin course cycles endpoint', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/courses/course-cycles')
      .set('Authorization', `Bearer ${student.token}`)
      .expect(403);
  });

  it('rejects invalid pagination params', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/courses/course-cycles?page=0&pageSize=101')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(400);
  });
});
