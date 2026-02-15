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
import { EnrollmentEvaluation } from '@modules/enrollments/domain/enrollment-evaluation.entity';
import { ROLE_CODES } from '@common/constants/role-codes.constants';
import { ENROLLMENT_TYPE_CODES } from '@modules/enrollments/domain/enrollment.constants';
import { EVALUATION_TYPE_CODES } from '@modules/evaluations/domain/evaluation.constants';

describe('E2E: Estructuras Dinámicas y Acceso Evolutivo', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let seeder: TestSeeder;
  let accessEngine: AccessEngineService;

  let currentCycle: AcademicCycle;
  let courseCycle: CourseCycle;
  let userFull: User;
  let userPartial: User;
  let pc1: Evaluation;

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const nextMonth = new Date();
  nextMonth.setMonth(now.getMonth() + 1);
  const prevMonth = new Date();
  prevMonth.setMonth(now.getMonth() - 1);
  const next2Months = new Date();
  next2Months.setMonth(now.getMonth() + 2);

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
    currentCycle = await seeder.createCycle(
      `2026-DYN-${uniqueSuffix}`,
      formatDate(prevMonth),
      formatDate(next2Months),
    );
    const course = await seeder.createCourse(
      `FIS101_DYN_${uniqueSuffix}`,
      'Física I Dinámica',
    );
    courseCycle = await seeder.linkCourseCycle(course.id, currentCycle.id);

    pc1 = await seeder.createEvaluation(
      courseCycle.id,
      EVALUATION_TYPE_CODES.PC,
      1,
      formatDate(yesterday),
      formatDate(nextMonth),
    );

    const adminEmail = TestSeeder.generateUniqueEmail('admin_dyn');
    const userFullEmail = TestSeeder.generateUniqueEmail('full_dyn');
    const userPartialEmail = TestSeeder.generateUniqueEmail('partial_dyn');

    const admin = await seeder.createAuthenticatedUser(adminEmail, [
      ROLE_CODES.ADMIN,
    ]);
    userFull = await seeder.createUser(userFullEmail);
    userPartial = await seeder.createUser(userPartialEmail);

    await request(app.getHttpServer())
      .post('/enrollments')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        userId: userFull.id,
        courseCycleId: courseCycle.id,
        enrollmentTypeCode: ENROLLMENT_TYPE_CODES.FULL,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/enrollments')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        userId: userPartial.id,
        courseCycleId: courseCycle.id,
        enrollmentTypeCode: ENROLLMENT_TYPE_CODES.PARTIAL,
        evaluationIds: [pc1.id],
      })
      .expect(201);
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('Caso 1: Creación tardía de PC2 - Usuario Full debe tener acceso automático', async () => {
    const pc2 = await seeder.createEvaluation(
      courseCycle.id,
      EVALUATION_TYPE_CODES.PC,
      2,
      formatDate(yesterday),
      formatDate(next2Months),
    );

    const hasAccess = await accessEngine.hasAccess(userFull.id, pc2.id);
    expect(hasAccess).toBe(true);
  });

  it('Caso 2: Creación tardía de PC2 - Usuario Parcial NO debe tener acceso', async () => {
    const evaluations = await dataSource.getRepository(Evaluation).find({
      where: { courseCycleId: courseCycle.id, number: 2 },
    });
    const pc2 = evaluations[0];

    const hasAccess = await accessEngine.hasAccess(userPartial.id, pc2.id);
    expect(hasAccess).toBe(false);
  });

  it('Caso 3: Acceso a Banco de Enunciados - Usuario Parcial (Debe expirar con PC1)', async () => {
    const banco = await dataSource.getRepository(Evaluation).findOneOrFail({
      where: { courseCycleId: courseCycle.id, number: 0 },
    });

    const accessRow = await dataSource
      .getRepository(EnrollmentEvaluation)
      .findOneOrFail({
        where: {
          enrollment: { userId: userPartial.id },
          evaluationId: banco.id,
        },
        relations: { enrollment: true },
      });

    expect(accessRow).toBeDefined();

    const pc1EndDate = formatDate(nextMonth);
    const bancoAccessEnd = formatDate(new Date(accessRow.accessEndDate));

    expect(bancoAccessEnd).toBe(pc1EndDate);
  });

  it('Caso 4: Creación tardía de Banco de Enunciados - Todos deben tener acceso (con clamping)', async () => {
    const extraBank = await seeder.createEvaluation(
      courseCycle.id,
      EVALUATION_TYPE_CODES.BANCO_ENUNCIADOS,
      99,
      formatDate(now),
      formatDate(next2Months),
    );

    const accessFull = await dataSource
      .getRepository(EnrollmentEvaluation)
      .findOneOrFail({
        where: {
          enrollment: { userId: userFull.id },
          evaluationId: extraBank.id,
        },
      });
    expect(formatDate(new Date(accessFull.accessEndDate))).toBe(
      formatDate(next2Months),
    );

    const accessPartial = await dataSource
      .getRepository(EnrollmentEvaluation)
      .findOneOrFail({
        where: {
          enrollment: { userId: userPartial.id },
          evaluationId: extraBank.id,
        },
      });
    expect(formatDate(new Date(accessPartial.accessEndDate))).toBe(
      formatDate(nextMonth),
    );
  });
});
