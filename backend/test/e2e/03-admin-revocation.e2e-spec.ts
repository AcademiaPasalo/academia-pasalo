import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DataSource } from 'typeorm';
import { TestSeeder } from './test-utils';
import { AccessEngineService } from '@modules/enrollments/application/access-engine.service';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';

describe('E2E: Revocación Administrativa', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let seeder: TestSeeder;
  let accessEngine: AccessEngineService;

  let courseCycle: any;
  let userTarget: any;
  let pc1: any;
  let enrollmentId: string;

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const nextMonth = new Date();
  nextMonth.setMonth(now.getMonth() + 1);
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    dataSource = app.get(DataSource);
    accessEngine = app.get(AccessEngineService);
    seeder = new TestSeeder(dataSource, app);

    const uniqueSuffix = Date.now().toString();
    const cycle = await seeder.createCycle(`2026-REV-${uniqueSuffix}`, formatDate(now), formatDate(nextMonth));
    const course = await seeder.createCourse(`REV101_REV_${uniqueSuffix}`, 'Revocación Test');
    courseCycle = await seeder.linkCourseCycle(course.id, cycle.id);
    pc1 = await seeder.createEvaluation(courseCycle.id, 'PC', 1, formatDate(yesterday), formatDate(nextMonth));

    const adminEmail = TestSeeder.generateUniqueEmail('admin_rev');
    const userTargetEmail = TestSeeder.generateUniqueEmail('target_rev');

    const admin = await seeder.createAuthenticatedUser(adminEmail, ['ADMIN']);
    userTarget = await seeder.createUser(userTargetEmail);

    const res = await request(app.getHttpServer())
      .post('/enrollments')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        userId: userTarget.id,
        courseCycleId: courseCycle.id,
        enrollmentTypeCode: 'PARTIAL',
        evaluationIds: [pc1.id]
      });

    enrollmentId = res.body.id; // Nota: El interceptor NO está activo en este test setup
  });

  afterAll(async () => {
    await app.close();
  });

  it('Caso 1: Revocación Manual - Admin quita acceso a PC1', async () => {
    expect(await accessEngine.hasAccess(userTarget.id, pc1.id)).toBe(true);

    await dataSource.getRepository('EnrollmentEvaluation').update(
      { enrollmentId, evaluationId: pc1.id },
      { isActive: false, revokedAt: new Date() }
    );

    const cacheService = app.get(RedisCacheService);
    await cacheService.del(`cache:access:user:${userTarget.id}:eval:${pc1.id}`);

    expect(await accessEngine.hasAccess(userTarget.id, pc1.id)).toBe(false);
  });
});