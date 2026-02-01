import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { AppModule } from '@src/app.module';
import { DataSource } from 'typeorm';
import { TestSeeder } from './test-utils';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { User } from '@modules/users/domain/user.entity';
import { CourseCycle } from '@modules/courses/domain/course-cycle.entity';
import { Evaluation } from '@modules/evaluations/domain/evaluation.entity';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';

describe('E2E: Class Events (Eventos de Clase)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let seeder: TestSeeder;

  let professor: { user: User; token: string };
  let student: { user: User; token: string };
  let courseCycle: CourseCycle;
  let evaluation: Evaluation;
  let createdEventId: string;

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 7);
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    
    const reflector = app.get(Reflector);
    app.useGlobalInterceptors(new TransformInterceptor(reflector));

    await app.init();

    dataSource = app.get(DataSource);
    const cacheService = app.get(RedisCacheService);
    
    await cacheService.invalidateGroup('*');
    seeder = new TestSeeder(dataSource, app);

    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    await dataSource.query('DELETE FROM academic_event');
    await dataSource.query('DELETE FROM enrollment_evaluation');
    await dataSource.query('DELETE FROM enrollment');
    await dataSource.query('DELETE FROM course_cycle');
    await dataSource.query('DELETE FROM academic_cycle');
    await dataSource.query('DELETE FROM course');
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');

    const cycle = await seeder.createCycle(
      `CYCLE-EVENT-${Date.now()}`,
      formatDate(now),
      formatDate(nextWeek),
    );
    const course = await seeder.createCourse(`COURSE-EVENT-${Date.now()}`, 'Eventos 101');
    courseCycle = await seeder.linkCourseCycle(course.id, cycle.id);
    evaluation = await seeder.createEvaluation(
      courseCycle.id,
      'PC',
      1,
      formatDate(now),
      formatDate(nextWeek),
    );

    const admin = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail('admin_ev'),
      ['ADMIN'],
    );
    professor = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail('prof_ev'),
      ['PROFESSOR'],
    );
    student = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail('student_ev'),
      ['STUDENT'],
    );

    await request(app.getHttpServer())
      .post('/api/v1/enrollments')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        userId: student.user.id,
        courseCycleId: courseCycle.id,
        enrollmentTypeCode: 'FULL',
      })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/class-events - Crear evento', () => {
    it('debe crear un evento exitosamente como docente', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/class-events')
        .set('Authorization', `Bearer ${professor.token}`)
        .send({
          evaluationId: evaluation.id,
          sessionNumber: 1,
          title: 'Clase 1: Introducción',
          topic: 'Conceptos básicos',
          startDatetime: tomorrow.toISOString(),
          endDatetime: new Date(tomorrow.getTime() + 7200000).toISOString(),
          meetingLink: 'https://zoom.us/j/123456789',
        })
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      createdEventId = response.body.data.id;
    });

    it('debe rechazar creación por alumno (403)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/class-events')
        .set('Authorization', `Bearer ${student.token}`)
        .send({
          evaluationId: evaluation.id,
          sessionNumber: 2,
          title: 'Clase 2',
          topic: 'Test',
          startDatetime: tomorrow.toISOString(),
          endDatetime: new Date(tomorrow.getTime() + 7200000).toISOString(),
          meetingLink: 'https://zoom.us/test',
        })
        .expect(403);
    });
  });

  describe('GET /api/v1/class-events/evaluation/:evaluationId', () => {
    it('debe listar eventos para alumno matriculado', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/class-events/evaluation/${evaluation.id}`)
        .set('Authorization', `Bearer ${student.token}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('OPERACIONES SOBRE EVENTO EXISTENTE', () => {
    // ... (existing tests)
  });

  describe('GET /api/v1/class-events/my-schedule - Calendario Unificado', () => {
    it('debe retornar el horario para el profesor (Staff bypass)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/class-events/my-schedule')
        .query({ start: now.toISOString(), end: nextWeek.toISOString() })
        .set('Authorization', `Bearer ${professor.token}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].id).toBe(createdEventId);
    });

    it('debe invalidar el caché del calendario cuando se actualiza un evento', async () => {
      // 1. Primer llamado para poblar caché
      await request(app.getHttpServer())
        .get('/api/v1/class-events/my-schedule')
        .query({ start: now.toISOString(), end: nextWeek.toISOString() })
        .set('Authorization', `Bearer ${professor.token}`)
        .expect(200);

      // 2. Actualizar el evento (Esto dispara la invalidación)
      const newTitle = 'Clase con Caché Invalidado';
      await request(app.getHttpServer())
        .patch(`/api/v1/class-events/${createdEventId}`)
        .set('Authorization', `Bearer ${professor.token}`)
        .send({ title: newTitle })
        .expect(200);

      // 3. Verificar que el segundo llamado trae el dato nuevo (No el cacheado)
      const res = await request(app.getHttpServer())
        .get('/api/v1/class-events/my-schedule')
        .query({ start: now.toISOString(), end: nextWeek.toISOString() })
        .set('Authorization', `Bearer ${professor.token}`)
        .expect(200);

      const event = res.body.data.find((e: any) => e.id === createdEventId);
      expect(event.title).toBe(newTitle);
    });

    it('debe retornar el horario para el alumno matriculado', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/class-events/my-schedule')
        .query({ start: now.toISOString(), end: nextWeek.toISOString() })
        .set('Authorization', `Bearer ${student.token}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });
});
