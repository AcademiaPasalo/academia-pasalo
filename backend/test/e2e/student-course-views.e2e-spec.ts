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

describe('E2E: Student course views', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let seeder: TestSeeder;

  let admin: { user: { id: string }; token: string };
  let studentFull: { user: { id: string }; token: string };
  let studentPartialNoPrev: { user: { id: string }; token: string };
  let studentPartialWithPrev: { user: { id: string }; token: string };
  let outsider: { user: { id: string }; token: string };

  let currentCourseCycleId: string;
  let previousCycleCode1: string;
  let previousCycleCode2: string;
  let currentEvalPastId: string;
  let currentEvalInProgressId: string;
  let currentEvalFutureOpenId: string;
  let currentEvalFutureLockedId: string;
  let previousEvalArchivedId: string;
  let previousEvalLockedId: string;

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
      TestSeeder.generateUniqueEmail('admin_course_views'),
      [ROLE_CODES.ADMIN],
    );
    studentFull = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail('student_full'),
      [ROLE_CODES.STUDENT],
    );
    studentPartialNoPrev = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail('student_partial_no_prev'),
      [ROLE_CODES.STUDENT],
    );
    studentPartialWithPrev = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail('student_partial_with_prev'),
      [ROLE_CODES.STUDENT],
    );
    outsider = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail('student_outsider'),
      [ROLE_CODES.STUDENT],
    );

    const now = new Date();
    const cycleCurrent = await seeder.createCycle(
      '2026-1',
      addDays(now, -60),
      addDays(now, 120),
    );
    const cyclePrev1 = await seeder.createCycle(
      '2025-2',
      addDays(now, -260),
      addDays(now, -180),
    );
    const cyclePrev2 = await seeder.createCycle(
      '2024-2',
      addDays(now, -460),
      addDays(now, -380),
    );
    previousCycleCode1 = cyclePrev1.code;
    previousCycleCode2 = cyclePrev2.code;

    const course = await seeder.createCourse('QA-COURSE', 'Quality Assurance');
    const ccCurrent = await seeder.linkCourseCycle(course.id, cycleCurrent.id);
    const ccPrev1 = await seeder.linkCourseCycle(course.id, cyclePrev1.id);
    const ccPrev2 = await seeder.linkCourseCycle(course.id, cyclePrev2.id);
    currentCourseCycleId = ccCurrent.id;

    const currentEvalPast = await seeder.createEvaluation(
      ccCurrent.id,
      'PC',
      1,
      addDays(now, -30),
      addDays(now, -20),
    );
    const currentEvalInProgress = await seeder.createEvaluation(
      ccCurrent.id,
      'PC',
      2,
      addDays(now, -1),
      addDays(now, 1),
    );
    const currentEvalFutureOpen = await seeder.createEvaluation(
      ccCurrent.id,
      'PC',
      3,
      addDays(now, 10),
      addDays(now, 12),
    );
    const currentEvalFutureLocked = await seeder.createEvaluation(
      ccCurrent.id,
      'EX',
      2,
      addDays(now, 20),
      addDays(now, 22),
    );

    const prevEvalArchived = await seeder.createEvaluation(
      ccPrev1.id,
      'PC',
      1,
      addDays(now, -240),
      addDays(now, -235),
    );
    const prevEvalLocked = await seeder.createEvaluation(
      ccPrev1.id,
      'EX',
      1,
      addDays(now, -230),
      addDays(now, -225),
    );

    await seeder.createEvaluation(
      ccPrev2.id,
      'PC',
      1,
      addDays(now, -430),
      addDays(now, -425),
    );

    currentEvalPastId = currentEvalPast.id;
    currentEvalInProgressId = currentEvalInProgress.id;
    currentEvalFutureOpenId = currentEvalFutureOpen.id;
    currentEvalFutureLockedId = currentEvalFutureLocked.id;
    previousEvalArchivedId = prevEvalArchived.id;
    previousEvalLockedId = prevEvalLocked.id;

    await request(app.getHttpServer())
      .post('/enrollments')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        userId: studentFull.user.id,
        courseCycleId: ccCurrent.id,
        enrollmentTypeCode: ENROLLMENT_TYPE_CODES.FULL,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/enrollments')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        userId: studentPartialNoPrev.user.id,
        courseCycleId: ccCurrent.id,
        enrollmentTypeCode: ENROLLMENT_TYPE_CODES.PARTIAL,
        evaluationIds: [currentEvalFutureOpen.id],
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/enrollments')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        userId: studentPartialWithPrev.user.id,
        courseCycleId: ccCurrent.id,
        enrollmentTypeCode: ENROLLMENT_TYPE_CODES.PARTIAL,
        evaluationIds: [currentEvalFutureOpen.id, prevEvalArchived.id],
        historicalCourseCycleIds: [ccPrev1.id],
      })
      .expect(201);
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('partial sin acceso previo: flag false y etiquetas del ciclo vigente correctas', async () => {
    const res = await request(app.getHttpServer())
      .get(`/courses/cycle/${currentCourseCycleId}/current`)
      .set('Authorization', `Bearer ${studentPartialNoPrev.token}`)
      .expect(200);

    expect(res.body.data.canViewPreviousCycles).toBe(false);

    const byId = new Map(
      res.body.data.evaluations.map((ev: { id: string; label: string }) => [
        ev.id,
        ev.label,
      ]),
    );

    expect(byId.get(currentEvalPastId)).toBe('Completado');
    expect(byId.get(currentEvalInProgressId)).toBe('En curso');
    expect(byId.get(currentEvalFutureOpenId)).toBe('Próximamente');
    expect(byId.get(currentEvalFutureLockedId)).toBe('Bloqueado');
  });

  it('partial sin acceso previo: no puede abrir ciclos anteriores (403)', async () => {
    await request(app.getHttpServer())
      .get(`/courses/cycle/${currentCourseCycleId}/previous-cycles`)
      .set('Authorization', `Bearer ${studentPartialNoPrev.token}`)
      .expect(403);
  });

  it('partial con acceso previo: flag true y lista todos los ciclos anteriores', async () => {
    const currentRes = await request(app.getHttpServer())
      .get(`/courses/cycle/${currentCourseCycleId}/current`)
      .set('Authorization', `Bearer ${studentPartialWithPrev.token}`)
      .expect(200);
    expect(currentRes.body.data.canViewPreviousCycles).toBe(true);

    const prevRes = await request(app.getHttpServer())
      .get(`/courses/cycle/${currentCourseCycleId}/previous-cycles`)
      .set('Authorization', `Bearer ${studentPartialWithPrev.token}`)
      .expect(200);

    expect(prevRes.body.data.cycles).toEqual([
      { cycleCode: previousCycleCode1 },
      { cycleCode: previousCycleCode2 },
    ]);
  });

  it('detalle de ciclo anterior: solo evaluaciones con acceso salen Archivado', async () => {
    const res = await request(app.getHttpServer())
      .get(
        `/courses/cycle/${currentCourseCycleId}/previous-cycles/${previousCycleCode1}/content`,
      )
      .set('Authorization', `Bearer ${studentPartialWithPrev.token}`)
      .expect(200);

    const byId = new Map(
      res.body.data.evaluations.map((ev: { id: string; label: string }) => [
        ev.id,
        ev.label,
      ]),
    );
    expect(byId.get(previousEvalArchivedId)).toBe('Archivado');
    expect(byId.get(previousEvalLockedId)).toBe('Bloqueado');
  });

  it('alumno sin matrícula no puede entrar al curso (403)', async () => {
    await request(app.getHttpServer())
      .get(`/courses/cycle/${currentCourseCycleId}/current`)
      .set('Authorization', `Bearer ${outsider.token}`)
      .expect(403);
  });

  it('endpoint legado /content ya no es accesible para STUDENT (403)', async () => {
    await request(app.getHttpServer())
      .get(`/courses/cycle/${currentCourseCycleId}/content`)
      .set('Authorization', `Bearer ${studentFull.token}`)
      .expect(403);
  });
});
