import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '@src/app.module';
import { DataSource } from 'typeorm';
import { TestSeeder } from './test-utils';
import { AccessEngineService } from '@modules/enrollments/application/access-engine.service';
import { AcademicCycle } from '@modules/cycles/domain/academic-cycle.entity';
import { CourseCycle } from '@modules/courses/domain/course-cycle.entity';
import { User } from '@modules/users/domain/user.entity';
import { Evaluation } from '@modules/evaluations/domain/evaluation.entity';
import { Enrollment } from '@modules/enrollments/domain/enrollment.entity';
import { EnrollmentEvaluation } from '@modules/enrollments/domain/enrollment-evaluation.entity';
import { ROLE_CODES } from '@common/constants/role-codes.constants';
import { ENROLLMENT_TYPE_CODES } from '@modules/enrollments/domain/enrollment.constants';
import { EVALUATION_TYPE_CODES } from '@modules/evaluations/domain/evaluation.constants';

jest.setTimeout(60000);

describe('E2E: Acceso Histórico y Ciclos Pasados', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let seeder: TestSeeder;
  let accessEngine: AccessEngineService;

  let pastCycle: AcademicCycle;
  let currentCycle: AcademicCycle;
  let pastCourseCycle: CourseCycle;
  let currentCourseCycle: CourseCycle;
  let userFull: User;
  let userPartial: User;
  let pastPC1: Evaluation;
  let currentPC1: Evaluation;

  const now = new Date();
  const pastDateStart = new Date();
  pastDateStart.setFullYear(now.getFullYear() - 1);
  const pastDateEnd = new Date();
  pastDateEnd.setFullYear(now.getFullYear() - 1);
  pastDateEnd.setMonth(now.getMonth() + 4);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    dataSource = app.get(DataSource);
    accessEngine = app.get(AccessEngineService);
    seeder = new TestSeeder(dataSource, app);

    const uniqueSuffix = Date.now().toString();
    pastCycle = await seeder.createCycle(
      `2025-HIST-${uniqueSuffix}`,
      formatDate(pastDateStart),
      formatDate(pastDateEnd),
    );
    const nextYear = new Date();
    nextYear.setFullYear(now.getFullYear() + 1);
    currentCycle = await seeder.createCycle(
      `2026-HIST-${uniqueSuffix}`,
      formatDate(now),
      formatDate(nextYear),
    );

    const course = await seeder.createCourse(
      `FIS101_HIST_${uniqueSuffix}`,
      'Física I Histórica',
    );

    pastCourseCycle = await seeder.linkCourseCycle(course.id, pastCycle.id);
    currentCourseCycle = await seeder.linkCourseCycle(
      course.id,
      currentCycle.id,
    );

    const pastPCStart = new Date(pastDateStart);
    pastPCStart.setMonth(pastPCStart.getMonth() + 1);
    const pastPCEnd = new Date(pastPCStart);
    pastPCEnd.setMonth(pastPCEnd.getMonth() + 1);

    pastPC1 = await seeder.createEvaluation(
      pastCourseCycle.id,
      EVALUATION_TYPE_CODES.PC,
      1,
      formatDate(pastPCStart),
      formatDate(pastPCEnd),
    );

    const currentPCStart = new Date(now);
    currentPCStart.setDate(currentPCStart.getDate() + 10);
    const currentPCEnd = new Date(currentPCStart);
    currentPCEnd.setDate(currentPCEnd.getDate() + 20);

    currentPC1 = await seeder.createEvaluation(
      currentCourseCycle.id,
      EVALUATION_TYPE_CODES.PC,
      1,
      formatDate(currentPCStart),
      formatDate(currentPCEnd),
    );

    const adminEmail = TestSeeder.generateUniqueEmail('admin_hist');
    const userFullEmail = TestSeeder.generateUniqueEmail('full_hist');
    const userPartialEmail = TestSeeder.generateUniqueEmail('partial_hist');

    const admin = await seeder.createAuthenticatedUser(adminEmail, [ROLE_CODES.ADMIN]);
    userFull = await seeder.createUser(userFullEmail);
    userPartial = await seeder.createUser(userPartialEmail);

    await request(app.getHttpServer())
      .post('/enrollments')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        userId: userFull.id,
        courseCycleId: currentCourseCycle.id,
        enrollmentTypeCode: ENROLLMENT_TYPE_CODES.FULL,
        historicalCourseCycleIds: [pastCourseCycle.id],
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/enrollments')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        userId: userPartial.id,
        courseCycleId: currentCourseCycle.id,
        enrollmentTypeCode: ENROLLMENT_TYPE_CODES.PARTIAL,
        evaluationIds: [pastPC1.id],
        historicalCourseCycleIds: [pastCourseCycle.id],
      })
      .expect(201);
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('Caso 1: Acceso a Ciclo Pasado - Usuario Full debería ver contenido histórico', async () => {
    const hasAccess = await accessEngine.hasAccess(userFull.id, pastPC1.id);
    expect(hasAccess).toBe(true);
  });
  it('Caso 2: PARTIAL historico alinea accessEndDate con su simil actual', async () => {
    const enrollment = await dataSource.getRepository(Enrollment).findOneOrFail({
      where: {
        userId: userPartial.id,
        courseCycleId: currentCourseCycle.id,
        cancelledAt: null,
      },
    });

    const accessRow = await dataSource
      .getRepository(EnrollmentEvaluation)
      .findOneOrFail({
        where: {
          enrollmentId: enrollment.id,
          evaluationId: pastPC1.id,
        },
      });

    const format = (d: Date) => d.toISOString().split('T')[0];
    expect(format(new Date(accessRow.accessEndDate))).toBe(
      format(new Date(currentPC1.endDate)),
    );
  });
});
