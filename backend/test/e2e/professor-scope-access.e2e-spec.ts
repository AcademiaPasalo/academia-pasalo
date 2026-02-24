import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '@src/app.module';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { TestSeeder } from './test-utils';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import { ROLE_CODES } from '@common/constants/role-codes.constants';
import { EVALUATION_TYPE_CODES } from '@modules/evaluations/domain/evaluation.constants';

jest.setTimeout(120000);

describe('E2E: Professor scope access (courses/evaluations)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let seeder: TestSeeder;
  let cacheService: RedisCacheService;

  let admin: { user: { id: string }; token: string };
  let superAdmin: { user: { id: string }; token: string };
  let assignedProfessor: { user: { id: string }; token: string };
  let unassignedProfessor: { user: { id: string }; token: string };

  let courseCycleAId: string;
  let courseCycleBId: string;

  const formatDate = (d: Date) => d.toISOString().slice(0, 10);

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
    cacheService = app.get(RedisCacheService);
    seeder = new TestSeeder(dataSource, app);

    await cacheService.invalidateGroup('*');
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    const tables = [
      'enrollment_evaluation',
      'enrollment',
      'material',
      'class_event',
      'material_folder',
      'evaluation',
      'course_cycle_professor',
      'course_cycle',
      'academic_cycle',
      'course',
      'user_role',
      'user_session',
      'user',
    ];
    for (const table of tables) {
      await dataSource.query(`DELETE FROM ${table}`);
    }
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');

    admin = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail('admin_scope'),
      [ROLE_CODES.ADMIN],
    );
    superAdmin = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail('super_scope'),
      [ROLE_CODES.SUPER_ADMIN],
    );
    assignedProfessor = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail('prof_assigned_scope'),
      [ROLE_CODES.PROFESSOR],
    );
    unassignedProfessor = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail('prof_unassigned_scope'),
      [ROLE_CODES.PROFESSOR],
    );

    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - 15);
    const endDate = new Date(now);
    endDate.setDate(now.getDate() + 45);

    const cycle = await seeder.createCycle(
      `SCOPE-${Date.now()}`,
      formatDate(startDate),
      formatDate(endDate),
    );

    const courseA = await seeder.createCourse(
      `SCOPE-A-${Date.now()}`,
      'Scope Course A',
    );
    const courseB = await seeder.createCourse(
      `SCOPE-B-${Date.now()}`,
      'Scope Course B',
    );

    const courseCycleA = await seeder.linkCourseCycle(courseA.id, cycle.id);
    const courseCycleB = await seeder.linkCourseCycle(courseB.id, cycle.id);
    courseCycleAId = courseCycleA.id;
    courseCycleBId = courseCycleB.id;

    await seeder.createEvaluation(
      courseCycleAId,
      EVALUATION_TYPE_CODES.PC,
      1,
      formatDate(startDate),
      formatDate(endDate),
    );
    await seeder.createEvaluation(
      courseCycleBId,
      EVALUATION_TYPE_CODES.PC,
      1,
      formatDate(startDate),
      formatDate(endDate),
    );

    await dataSource.query(
      `INSERT INTO course_cycle_professor (course_cycle_id, professor_user_id, assigned_at)
       VALUES (?, ?, NOW())`,
      [courseCycleAId, assignedProfessor.user.id],
    );

    await cacheService.invalidateGroup('*');
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('assigned professor can read course content on assigned courseCycle', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/courses/cycle/${courseCycleAId}/content`)
      .set('Authorization', `Bearer ${assignedProfessor.token}`)
      .expect(200);

    expect(res.body.data.courseCycleId).toBe(courseCycleAId);
  });

  it('assigned professor cannot read course content on non-assigned courseCycle', async () => {
    await request(app.getHttpServer())
      .get(`/api/v1/courses/cycle/${courseCycleBId}/content`)
      .set('Authorization', `Bearer ${assignedProfessor.token}`)
      .expect(403);
  });

  it('unassigned professor cannot read course content on courseCycle without assignment', async () => {
    await request(app.getHttpServer())
      .get(`/api/v1/courses/cycle/${courseCycleAId}/content`)
      .set('Authorization', `Bearer ${unassignedProfessor.token}`)
      .expect(403);
  });

  it('admin can read course content on any courseCycle', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/courses/cycle/${courseCycleBId}/content`)
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);

    expect(res.body.data.courseCycleId).toBe(courseCycleBId);
  });

  it('superadmin can read course content on any courseCycle', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/courses/cycle/${courseCycleBId}/content`)
      .set('Authorization', `Bearer ${superAdmin.token}`)
      .expect(200);

    expect(res.body.data.courseCycleId).toBe(courseCycleBId);
  });

  it('professor gets 404 when courseCycle does not exist', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/courses/cycle/999999/content')
      .set('Authorization', `Bearer ${assignedProfessor.token}`)
      .expect(404);
  });

  it('assigned professor can list evaluations on assigned courseCycle', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/evaluations/course-cycle/${courseCycleAId}`)
      .set('Authorization', `Bearer ${assignedProfessor.token}`)
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('assigned professor cannot list evaluations on non-assigned courseCycle', async () => {
    await request(app.getHttpServer())
      .get(`/api/v1/evaluations/course-cycle/${courseCycleBId}`)
      .set('Authorization', `Bearer ${assignedProfessor.token}`)
      .expect(403);
  });

  it('unassigned professor cannot list evaluations on courseCycle without assignment', async () => {
    await request(app.getHttpServer())
      .get(`/api/v1/evaluations/course-cycle/${courseCycleAId}`)
      .set('Authorization', `Bearer ${unassignedProfessor.token}`)
      .expect(403);
  });

  it('admin can list evaluations on any courseCycle', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/evaluations/course-cycle/${courseCycleBId}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('superadmin can list evaluations on any courseCycle', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/evaluations/course-cycle/${courseCycleBId}`)
      .set('Authorization', `Bearer ${superAdmin.token}`)
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('professor gets 404 on evaluations list when courseCycle does not exist', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/evaluations/course-cycle/999999')
      .set('Authorization', `Bearer ${assignedProfessor.token}`)
      .expect(404);
  });
});
