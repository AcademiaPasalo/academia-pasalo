import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '@src/app.module';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { TestSeeder } from './test-utils';
import { ROLE_CODES } from '@common/constants/role-codes.constants';

describe('E2E: Evaluation create respects structure', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let seeder: TestSeeder;

  let admin: { user: { id: string }; token: string };
  let courseCycleId: string;
  let courseCycleWithoutStructureId: string;
  let pcTypeId: string;
  let exTypeId: string;
  let evalStartInCycle: string;
  let evalEndInCycle: string;

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
      TestSeeder.generateUniqueEmail('admin_eval_struct'),
      [ROLE_CODES.ADMIN],
    );

    const now = new Date();
    const cycle = await seeder.createCycle(
      '2026-0',
      addDays(now, -10),
      addDays(now, 90),
    );
    evalStartInCycle = `${addDays(now, 1)}T05:00:00.000Z`;
    evalEndInCycle = `${addDays(now, 1)}T23:59:59.000Z`;

    const courseA = await seeder.createCourse('EVAL-ST-A', 'Eval Struct A');
    const courseB = await seeder.createCourse('EVAL-ST-B', 'Eval Struct B');
    const ccA = await seeder.linkCourseCycle(courseA.id, cycle.id);
    const ccB = await seeder.linkCourseCycle(courseB.id, cycle.id);
    courseCycleId = ccA.id;
    courseCycleWithoutStructureId = ccB.id;

    const pcRows = await dataSource.query<Array<{ id: string }>>(
      `SELECT id FROM evaluation_type WHERE code = 'PC' LIMIT 1`,
    );
    if (pcRows.length === 0) {
      await dataSource.query(
        `INSERT INTO evaluation_type (code, name) VALUES ('PC', 'Practica Calificada')`,
      );
    }

    const exRows = await dataSource.query<Array<{ id: string }>>(
      `SELECT id FROM evaluation_type WHERE code = 'EX' LIMIT 1`,
    );
    if (exRows.length === 0) {
      await dataSource.query(
        `INSERT INTO evaluation_type (code, name) VALUES ('EX', 'Examen')`,
      );
    }

    const selectedPcRows = await dataSource.query<Array<{ id: string }>>(
      `SELECT id FROM evaluation_type WHERE code = 'PC' LIMIT 1`,
    );
    const selectedExRows = await dataSource.query<Array<{ id: string }>>(
      `SELECT id FROM evaluation_type WHERE code = 'EX' LIMIT 1`,
    );
    pcTypeId = selectedPcRows[0].id;
    exTypeId = selectedExRows[0].id;

    await dataSource.query(
      `INSERT INTO course_cycle_allowed_evaluation_type
        (course_cycle_id, evaluation_type_id, is_active, created_at, updated_at)
       VALUES (?, ?, 1, NOW(), NULL)`,
      [courseCycleId, pcTypeId],
    );
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('creates evaluation when type is allowed', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/evaluations')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        courseCycleId,
        evaluationTypeId: pcTypeId,
        number: 7,
        startDate: evalStartInCycle,
        endDate: evalEndInCycle,
      })
      .expect(201);

    expect(res.body.data.courseCycleId).toBe(courseCycleId);
    expect(String(res.body.data.evaluationTypeId)).toBe(String(pcTypeId));
    expect(res.body.data.number).toBe(7);
  });

  it('rejects evaluation when type is not allowed', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/evaluations')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        courseCycleId,
        evaluationTypeId: exTypeId,
        number: 8,
        startDate: evalStartInCycle,
        endDate: evalEndInCycle,
      })
      .expect(400);
  });

  it('rejects evaluation when cycle has no active structure', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/evaluations')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        courseCycleId: courseCycleWithoutStructureId,
        evaluationTypeId: pcTypeId,
        number: 1,
        startDate: evalStartInCycle,
        endDate: evalEndInCycle,
      })
      .expect(400);
  });
});
