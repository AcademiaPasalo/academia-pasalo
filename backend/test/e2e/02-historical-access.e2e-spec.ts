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
  let pastPC1: Evaluation;

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
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    dataSource = app.get(DataSource);
    accessEngine = app.get(AccessEngineService);
    seeder = new TestSeeder(dataSource, app);

    // 1. Ciclos
    const uniqueSuffix = Date.now().toString();
    pastCycle = await seeder.createCycle(`2025-HIST-${uniqueSuffix}`, formatDate(pastDateStart), formatDate(pastDateEnd));
    const nextYear = new Date();
    nextYear.setFullYear(now.getFullYear() + 1);
    currentCycle = await seeder.createCycle(`2026-HIST-${uniqueSuffix}`, formatDate(now), formatDate(nextYear));

    // 2. Curso (Mismo código FIS101_HIST)
    const course = await seeder.createCourse(`FIS101_HIST_${uniqueSuffix}`, 'Física I Histórica');

    // 3. Vincular a ambos ciclos
    pastCourseCycle = await seeder.linkCourseCycle(course.id, pastCycle.id);
    currentCourseCycle = await seeder.linkCourseCycle(course.id, currentCycle.id);

    // 4. Crear Contenido Histórico (PC1 del pasado)
    const pastPCStart = new Date(pastDateStart);
    pastPCStart.setMonth(pastPCStart.getMonth() + 1);
    const pastPCEnd = new Date(pastPCStart);
    pastPCEnd.setMonth(pastPCEnd.getMonth() + 1);
    
    pastPC1 = await seeder.createEvaluation(pastCourseCycle.id, 'PC', 1, formatDate(pastPCStart), formatDate(pastPCEnd));

    // 5. Usuario Full Actual
    const adminEmail = TestSeeder.generateUniqueEmail('admin_hist');
    const userFullEmail = TestSeeder.generateUniqueEmail('full_hist');

    const admin = await seeder.createAuthenticatedUser(adminEmail, ['ADMIN']);
    userFull = await seeder.createUser(userFullEmail);
    
    await request(app.getHttpServer())
      .post('/enrollments')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        userId: userFull.id,
        courseCycleId: currentCourseCycle.id,
        enrollmentTypeCode: 'FULL',
        historicalCourseCycleIds: [pastCourseCycle.id] // Nuevo requerimiento: Explicito
      })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });

  it('Caso 1: Acceso a Ciclo Pasado - Usuario Full debería ver contenido histórico', async () => {
    // Al haber enviado explícitamente el pastCourseCycle.id, el servicio debe haber creado el acceso
    const hasAccess = await accessEngine.hasAccess(userFull.id, pastPC1.id);
    expect(hasAccess).toBe(true); 
  });
});