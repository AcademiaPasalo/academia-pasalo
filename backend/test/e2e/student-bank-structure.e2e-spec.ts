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

describe('E2E: Student bank structure', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let seeder: TestSeeder;

  let admin: { user: { id: string }; token: string };
  let enrolledStudent: { user: { id: string }; token: string };
  let notEnrolledStudent: { user: { id: string }; token: string };
  let courseCycleId: string;
  let pcTypeId: string;
  let exTypeId: string;
  let taTypeId: string;

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
    await dataSource.query('DELETE FROM course_cycle_allowed_evaluation_type');
    await dataSource.query('DELETE FROM enrollment_evaluation');
    await dataSource.query('DELETE FROM enrollment');
    await dataSource.query('DELETE FROM evaluation');
    await dataSource.query('DELETE FROM course_cycle_professor');
    await dataSource.query('DELETE FROM course_cycle');
    await dataSource.query('DELETE FROM academic_cycle');
    await dataSource.query('DELETE FROM course');
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');

    admin = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail('admin_bank_struct'),
      [ROLE_CODES.ADMIN],
    );
    enrolledStudent = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail('student_bank_struct_ok'),
      [ROLE_CODES.STUDENT],
    );
    notEnrolledStudent = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail('student_bank_struct_forbidden'),
      [ROLE_CODES.STUDENT],
    );

    const now = new Date();
    const cycle = await seeder.createCycle(
      '2026-0',
      addDays(now, -20),
      addDays(now, 90),
    );
    const course = await seeder.createCourse('BNK-STR', 'Banco Structure');
    const cc = await seeder.linkCourseCycle(course.id, cycle.id);
    courseCycleId = cc.id;

    const maybePc = await dataSource.query<Array<{ id: string }>>(
      `SELECT id FROM evaluation_type WHERE code = 'PC' LIMIT 1`,
    );
    if (maybePc.length === 0) {
      await dataSource.query(
        `INSERT INTO evaluation_type (code, name) VALUES ('PC', 'Practica Calificada')`,
      );
    }
    const maybeEx = await dataSource.query<Array<{ id: string }>>(
      `SELECT id FROM evaluation_type WHERE code = 'EX' LIMIT 1`,
    );
    if (maybeEx.length === 0) {
      await dataSource.query(
        `INSERT INTO evaluation_type (code, name) VALUES ('EX', 'Examen')`,
      );
    }
    const maybeTa = await dataSource.query<Array<{ id: string }>>(
      `SELECT id FROM evaluation_type WHERE code = 'TA' LIMIT 1`,
    );
    if (maybeTa.length === 0) {
      await dataSource.query(
        `INSERT INTO evaluation_type (code, name) VALUES ('TA', 'Taller Aplicado')`,
      );
    }

    const pcRows = await dataSource.query<Array<{ id: string }>>(
      `SELECT id FROM evaluation_type WHERE code = 'PC' LIMIT 1`,
    );
    const exRows = await dataSource.query<Array<{ id: string }>>(
      `SELECT id FROM evaluation_type WHERE code = 'EX' LIMIT 1`,
    );
    const taRows = await dataSource.query<Array<{ id: string }>>(
      `SELECT id FROM evaluation_type WHERE code = 'TA' LIMIT 1`,
    );
    pcTypeId = pcRows[0].id;
    exTypeId = exRows[0].id;
    taTypeId = taRows[0].id;

    await dataSource.query(
      `INSERT INTO course_cycle_allowed_evaluation_type
        (course_cycle_id, evaluation_type_id, is_active, created_at, updated_at)
       VALUES
        (?, ?, 1, NOW(), NULL),
        (?, ?, 1, NOW(), NULL),
        (?, ?, 1, NOW(), NULL)`,
      [
        courseCycleId,
        pcTypeId,
        courseCycleId,
        exTypeId,
        courseCycleId,
        taTypeId,
      ],
    );

    await request(app.getHttpServer())
      .post('/api/v1/enrollments')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        userId: enrolledStudent.user.id,
        courseCycleId,
        enrollmentTypeCode: ENROLLMENT_TYPE_CODES.FULL,
      })
      .expect(201);
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('student with active enrollment gets bank structure', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/courses/cycle/${courseCycleId}/bank-structure`)
      .set('Authorization', `Bearer ${enrolledStudent.token}`)
      .expect(200);

    expect(res.body.data.courseCycleId).toBe(courseCycleId);
    expect(res.body.data.cycleCode).toBe('2026-0');
    expect(res.body.data.items).toHaveLength(3);
    expect(res.body.data.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          evaluationTypeId: String(exTypeId),
          evaluationTypeCode: 'EX',
          evaluationTypeName: expect.any(String),
        }),
        expect.objectContaining({
          evaluationTypeId: String(pcTypeId),
          evaluationTypeCode: 'PC',
          evaluationTypeName: expect.any(String),
        }),
        expect.objectContaining({
          evaluationTypeId: String(taTypeId),
          evaluationTypeCode: 'TA',
          evaluationTypeName: expect.any(String),
        }),
      ]),
    );
  });

  it('student without active enrollment is forbidden', async () => {
    await request(app.getHttpServer())
      .get(`/api/v1/courses/cycle/${courseCycleId}/bank-structure`)
      .set('Authorization', `Bearer ${notEnrolledStudent.token}`)
      .expect(403);
  });
});
