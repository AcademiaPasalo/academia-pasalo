import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { DataSource } from 'typeorm';
import { TestSeeder } from './test-utils';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { User } from '@modules/users/domain/user.entity';
import { Evaluation } from '@modules/evaluations/domain/evaluation.entity';
import { Enrollment } from '@modules/enrollments/domain/enrollment.entity';
import { ROLE_CODES } from '@common/constants/role-codes.constants';
import { ENROLLMENT_TYPE_CODES } from '@modules/enrollments/domain/enrollment.constants';
import { EVALUATION_TYPE_CODES } from '@modules/evaluations/domain/evaluation.constants';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import { EnrollmentEvaluation } from '@modules/enrollments/domain/enrollment-evaluation.entity';

describe('E2E: Integridad de Seguridad y Blindaje de Accesos', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let seeder: TestSeeder;
  let cacheService: RedisCacheService;

  let admin: { user: User; token: string };
  let studentPartial: { user: User; token: string };
  let studentFull: { user: User; token: string };

  let evaluationPC1: Evaluation;
  let evaluationPC2: Evaluation;
  let pc1FolderId: string;
  let pc2FolderId: string;
  let pc2MaterialId: string;
  let pc2SessionId: string;

  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  const now = new Date();
  const yesterday = new Date(now.getTime() - 86400000);
  const nextMonth = new Date(now.getTime() + 30 * 86400000);

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
      'deletion_request',
      'enrollment_evaluation',
      'enrollment',
      'material',
      'class_event',
      'material_folder',
      'evaluation',
      'course_cycle',
      'academic_cycle',
      'course',
      'user_role',
      'user',
      'user_session',
    ];
    for (const table of tables) await dataSource.query(`DELETE FROM ${table}`);
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');

    await seeder.ensureMaterialStatuses();

    // 1. Crear Estructura Base
    const cycle = await seeder.createCycle(
      `Integrity-Cycle-${Date.now()}`,
      formatDate(yesterday),
      formatDate(nextMonth),
    );
    const course = await seeder.createCourse(`INT-101`, 'Seguridad de Datos');
    const courseCycle = await seeder.linkCourseCycle(course.id, cycle.id);

    // 2. Crear Evaluaciones (PC1 y PC2)
    evaluationPC1 = await seeder.createEvaluation(
      courseCycle.id,
      EVALUATION_TYPE_CODES.PC,
      1,
      formatDate(yesterday),
      formatDate(nextMonth),
    );
    evaluationPC2 = await seeder.createEvaluation(
      courseCycle.id,
      EVALUATION_TYPE_CODES.PC,
      2,
      formatDate(yesterday),
      formatDate(nextMonth),
    );

    // 3. Crear Usuarios
    admin = await seeder.createAuthenticatedUser('admin@integrity.com', [
      ROLE_CODES.ADMIN,
    ]);
    studentPartial = await seeder.createAuthenticatedUser(
      'partial@integrity.com',
      [ROLE_CODES.STUDENT],
    );
    studentFull = await seeder.createAuthenticatedUser('full@integrity.com', [
      ROLE_CODES.STUDENT,
    ]);

    // 4. Matricular Alumnos
    await request(app.getHttpServer())
      .post('/api/v1/enrollments')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        userId: studentPartial.user.id,
        courseCycleId: courseCycle.id,
        enrollmentTypeCode: ENROLLMENT_TYPE_CODES.PARTIAL,
        evaluationIds: [evaluationPC1.id],
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/enrollments')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        userId: studentFull.user.id,
        courseCycleId: courseCycle.id,
        enrollmentTypeCode: ENROLLMENT_TYPE_CODES.FULL,
      })
      .expect(201);

    // 5. Crear Contenido en PC1 y PC2
    const resPC1Folder = await request(app.getHttpServer())
      .post('/api/v1/materials/folders')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ evaluationId: evaluationPC1.id, name: 'Carpeta PC1' })
      .expect(201);
    pc1FolderId = resPC1Folder.body.data.id;

    const resPC2Folder = await request(app.getHttpServer())
      .post('/api/v1/materials/folders')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ evaluationId: evaluationPC2.id, name: 'Carpeta PC2' })
      .expect(201);
    pc2FolderId = resPC2Folder.body.data.id;

    const resPC2Mat = await request(app.getHttpServer())
      .post('/api/v1/materials')
      .set('Authorization', `Bearer ${admin.token}`)
      .attach('file', Buffer.from('%PDF-1.4 secret'), 'test.pdf')
      .field('materialFolderId', pc2FolderId)
      .field('displayName', 'Material PC2')
      .expect(201);
    pc2MaterialId = resPC2Mat.body.data.id;

    const resPC2Session = await request(app.getHttpServer())
      .post('/api/v1/class-events')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        evaluationId: evaluationPC2.id,
        sessionNumber: 1,
        title: 'Sesion PC2',
        topic: 'Hack attempt',
        startDatetime: new Date(now.getTime() + 3600000).toISOString(), // +1 hora
        endDatetime: new Date(now.getTime() + 7200000).toISOString(), // +2 horas
        liveMeetingUrl: 'https://zoom.us/secret',
      })
      .expect(201);
    pc2SessionId = resPC2Session.body.data.id;

    await cacheService.invalidateGroup('*');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('CASOS DE ATAQUE - ALUMNO PARTIAL', () => {
    it('debe permitir acceso a PC1 (comprada)', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/materials/folders/evaluation/${evaluationPC1.id}`)
        .set('Authorization', `Bearer ${studentPartial.token}`)
        .expect(200);
    });

    it('debe RECHAZAR (403) listado de carpetas de PC2 (no comprada)', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/materials/folders/evaluation/${evaluationPC2.id}`)
        .set('Authorization', `Bearer ${studentPartial.token}`)
        .expect(403);
    });

    it('debe RECHAZAR (403) contenido de una carpeta de PC2 vía ID directo', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/materials/folders/${pc2FolderId}`)
        .set('Authorization', `Bearer ${studentPartial.token}`)
        .expect(403);
    });

    it('debe RECHAZAR (403) descarga de material de PC2 vía ID directo', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/materials/${pc2MaterialId}/download`)
        .set('Authorization', `Bearer ${studentPartial.token}`)
        .expect(403);
    });

    it('debe RECHAZAR (403) listado de materiales de una sesión de PC2', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/materials/class-event/${pc2SessionId}`)
        .set('Authorization', `Bearer ${studentPartial.token}`)
        .expect(403);
    });

    it('debe RECHAZAR (403) detalle de un evento/sesión de PC2', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/class-events/${pc2SessionId}`)
        .set('Authorization', `Bearer ${studentPartial.token}`)
        .expect(403);
    });
  });

  describe('CASOS DE INTEGRIDAD TEMPORAL', () => {
    it('debe revocar acceso INSTANTÁNEAMENTE si el Admin marca la evaluación como inactiva', async () => {
      // 1. Obtener el ID de la matrícula primero
      const enrollment = await dataSource
        .getRepository(Enrollment)
        .findOneOrFail({
          where: { userId: studentPartial.user.id },
        });

      // 2. Verificar que tiene acceso inicial
      await request(app.getHttpServer())
        .get(`/api/v1/materials/folders/evaluation/${evaluationPC1.id}`)
        .set('Authorization', `Bearer ${studentPartial.token}`)
        .expect(200);

      // 3. Desactivar acceso en DB
      await dataSource
        .getRepository(EnrollmentEvaluation)
        .update(
          { evaluationId: evaluationPC1.id, enrollmentId: enrollment.id },
          { isActive: false },
        );

      // 4. Limpiar caché específico para forzar re-evaluación
      await cacheService.invalidateGroup(
        `cache:access:user:${studentPartial.user.id}:*`,
      );

      // 5. Intentar acceder -> 403
      await request(app.getHttpServer())
        .get(`/api/v1/materials/folders/evaluation/${evaluationPC1.id}`)
        .set('Authorization', `Bearer ${studentPartial.token}`)
        .expect(403);
    });

    it('debe revocar acceso si la fecha actual supera accessEndDate', async () => {
      // 1. Obtener el ID de la matrícula primero
      const enrollment = await dataSource
        .getRepository(Enrollment)
        .findOneOrFail({
          where: { userId: studentPartial.user.id },
        });

      // 2. Restaurar acceso pero con fecha expirada (ayer)
      await dataSource
        .getRepository(EnrollmentEvaluation)
        .update(
          { evaluationId: evaluationPC1.id, enrollmentId: enrollment.id },
          { isActive: true, accessEndDate: yesterday },
        );
      await cacheService.invalidateGroup(
        `cache:access:user:${studentPartial.user.id}:*`,
      );

      // 3. Intentar acceder -> 403
      await request(app.getHttpServer())
        .get(`/api/v1/materials/folders/evaluation/${evaluationPC1.id}`)
        .set('Authorization', `Bearer ${studentPartial.token}`)
        .expect(403);
    });
  });

  describe('BYPASS DE ALUMNO FULL', () => {
    it('debe permitir acceso a PC1 y PC2 automáticamente', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/materials/folders/evaluation/${evaluationPC1.id}`)
        .set('Authorization', `Bearer ${studentFull.token}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/api/v1/materials/folders/evaluation/${evaluationPC2.id}`)
        .set('Authorization', `Bearer ${studentFull.token}`)
        .expect(200);
    });
  });
});
