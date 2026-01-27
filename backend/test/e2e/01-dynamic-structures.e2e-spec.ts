import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DataSource } from 'typeorm';
import { TestSeeder } from './test-utils';
import { AccessEngineService } from '@modules/enrollments/application/access-engine.service';

describe('E2E: Estructuras Dinámicas y Acceso Evolutivo', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let seeder: TestSeeder;
  let accessEngine: AccessEngineService;

  let currentCycle: any;
  let courseCycle: any;
  let userFull: any;
  let userPartial: any;
  let pc1: any;

  // Fechas dinámicas
  const now = new Date();
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
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    dataSource = app.get(DataSource);
    accessEngine = app.get(AccessEngineService);
    seeder = new TestSeeder(dataSource, app);

    // 1. Setup Base
    const uniqueSuffix = Date.now().toString();
    currentCycle = await seeder.createCycle(`2026-DYN-${uniqueSuffix}`, formatDate(prevMonth), formatDate(next2Months));
    const course = await seeder.createCourse(`FIS101_DYN_${uniqueSuffix}`, 'Física I Dinámica');
    courseCycle = await seeder.linkCourseCycle(course.id, currentCycle.id);

    // 2. Crear PC1 Inicial (IMPORTANTE: Antes de las matrículas)
    pc1 = await seeder.createEvaluation(courseCycle.id, 'PC', 1, formatDate(now), formatDate(nextMonth));

    // 3. Crear Usuarios
    const adminEmail = TestSeeder.generateUniqueEmail('admin_dyn');
    const userFullEmail = TestSeeder.generateUniqueEmail('full_dyn');
    const userPartialEmail = TestSeeder.generateUniqueEmail('partial_dyn');

    const admin = await seeder.createAuthenticatedUser(adminEmail, ['ADMIN']);
    userFull = await seeder.createUser(userFullEmail);
    userPartial = await seeder.createUser(userPartialEmail);

    // 4. Matriculas Iniciales
    // Full
    await request(app.getHttpServer())
      .post('/enrollments')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        userId: userFull.id,
        courseCycleId: courseCycle.id,
        enrollmentTypeCode: 'FULL'
      })
      .expect(201);

    // Parcial (Solo PC1)
    await request(app.getHttpServer())
      .post('/enrollments')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        userId: userPartial.id,
        courseCycleId: courseCycle.id,
        enrollmentTypeCode: 'PARTIAL',
        evaluationIds: [pc1.id]
      })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });

  it('Caso 1: Creación tardía de PC2 - Usuario Full debe tener acceso automático', async () => {
    // A. Crear PC2 DESPUÉS de la matrícula
    // Usamos 'now' para que sea accesible inmediatamente (checkAccess valida fechas)
    const pc2 = await seeder.createEvaluation(courseCycle.id, 'PC', 2, formatDate(now), formatDate(next2Months));

    // B. Verificar acceso Full (Debería ser TRUE gracias al EvaluationSubscriber)
    const hasAccess = await accessEngine.hasAccess(userFull.id, pc2.id);
    expect(hasAccess).toBe(true);
  });

  it('Caso 2: Creación tardía de PC2 - Usuario Parcial NO debe tener acceso', async () => {
    // Recuperamos la PC2 creada en el test anterior
    const evaluations = await dataSource.getRepository('Evaluation').find({ 
      where: { courseCycleId: courseCycle.id, number: 2 } 
    });
    const pc2 = evaluations[0];

    const hasAccess = await accessEngine.hasAccess(userPartial.id, pc2.id);
    expect(hasAccess).toBe(false);
  });

  it('Caso 3: Acceso a Banco de Enunciados - Usuario Parcial (Debe expirar con PC1)', async () => {
    // Buscar la evaluación Banco (number 0)
    const banco = await dataSource.getRepository('Evaluation').findOne({ 
      where: { courseCycleId: courseCycle.id, number: 0 } 
    });
    
    // Validar que existe acceso
    const accessRow = await dataSource.getRepository('EnrollmentEvaluation').findOne({
      where: { enrollment: { userId: userPartial.id }, evaluationId: banco.id },
      relations: { enrollment: true }
    });

    expect(accessRow).toBeDefined();

    const pc1EndDate = formatDate(nextMonth);
    const bancoAccessEnd = formatDate(new Date(accessRow.accessEndDate));

    expect(bancoAccessEnd).toBe(pc1EndDate);
  });

  it('Caso 4: Creación tardía de Banco de Enunciados - Todos deben tener acceso (con clamping)', async () => {
    // A. Simular creación de un Banco de Enunciados Extra (aunque normalmente solo hay uno)
    // Para probar el subscriber con BANCO_ENUNCIADOS
    const extraBank = await seeder.createEvaluation(courseCycle.id, 'BANCO_ENUNCIADOS', 99, formatDate(now), formatDate(next2Months));

    // B. Usuario Full debe tener acceso hasta el fin del ciclo (next2Months)
    const accessFull = await dataSource.getRepository('EnrollmentEvaluation').findOne({
      where: { enrollment: { userId: userFull.id }, evaluationId: extraBank.id }
    });
    expect(formatDate(new Date(accessFull.accessEndDate))).toBe(formatDate(next2Months));

    // C. Usuario Parcial debe tener acceso solo hasta el fin de sus evaluaciones (PC1 = nextMonth)
    const accessPartial = await dataSource.getRepository('EnrollmentEvaluation').findOne({
      where: { enrollment: { userId: userPartial.id }, evaluationId: extraBank.id }
    });
    expect(formatDate(new Date(accessPartial.accessEndDate))).toBe(formatDate(nextMonth));
  });
});