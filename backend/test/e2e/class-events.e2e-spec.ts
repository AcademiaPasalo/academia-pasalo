import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { AppModule } from '@/app.module';
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

  let admin: { user: User; token: string };
  let professor: { user: User; token: string };
  let student: { user: User; token: string };
  let courseCycle: CourseCycle;
  let evaluation: Evaluation;
  let createdEventId: string;

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
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
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );

    const reflector = app.get(Reflector);
    app.useGlobalInterceptors(new TransformInterceptor(reflector));

    await app.init();

    dataSource = app.get(DataSource);
    const cacheService = app.get(RedisCacheService);

    await cacheService.invalidateGroup('*');
    seeder = new TestSeeder(dataSource, app);

    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    const tables = [
      'class_event_professor',
      'class_event',
      'academic_event',
      'enrollment_evaluation',
      'enrollment',
      'course_cycle_professor',
      'course_cycle',
      'academic_cycle',
      'course',
      'user_role',
      'user_session',
      'user',
    ];
    for (const table of tables) {
      await dataSource.query(`DELETE FROM ${table}`);
    }
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');

    const cycle = await seeder.createCycle(
      `CYCLE-EVENT-${Date.now()}`,
      formatDate(yesterday),
      formatDate(nextWeek),
    );
    const course = await seeder.createCourse(
      `COURSE-EVENT-${Date.now()}`,
      'Eventos 101',
    );
    courseCycle = await seeder.linkCourseCycle(course.id, cycle.id);

    // Iniciar evaluación ayer para garantizar acceso activo hoy
    evaluation = await seeder.createEvaluation(
      courseCycle.id,
      'PC',
      1,
      formatDate(yesterday),
      formatDate(nextWeek),
    );

    admin = await seeder.createAuthenticatedUser(
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

    await dataSource.query(
      'INSERT INTO course_cycle_professor (course_cycle_id, professor_user_id, assigned_at) VALUES (?, ?, NOW())',
      [courseCycle.id, professor.user.id],
    );

    // Matricular alumno y forzar limpieza de caché
    await request(app.getHttpServer())
      .post('/api/v1/enrollments')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        userId: student.user.id,
        courseCycleId: courseCycle.id,
        enrollmentTypeCode: 'FULL',
      })
      .expect(201);

    const cacheSvc = app.get(RedisCacheService);
    await cacheSvc.invalidateGroup('*');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/class-events - Crear evento', () => {
    it('debe crear un evento exitosamente como docente asignado', async () => {
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
    it('GET /api/v1/class-events/:id - Obtener detalle', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/class-events/${createdEventId}`)
        .set('Authorization', `Bearer ${student.token}`)
        .expect(200);

      expect(response.body.data.id).toBe(createdEventId);
    });

    it('PATCH /api/v1/class-events/:id - Actualizar evento', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/class-events/${createdEventId}`)
        .set('Authorization', `Bearer ${professor.token}`)
        .send({ title: 'Clase Actualizada' })
        .expect(200);
    });

    it('DELETE /api/v1/class-events/:id/cancel - Cancelar evento', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/class-events/${createdEventId}/cancel`)
        .set('Authorization', `Bearer ${professor.token}`)
        .expect(204);
    });
  });

  describe('GET /api/v1/class-events/my-schedule - Calendario Unificado', () => {
    it('debe retornar el horario para el profesor (Staff bypass)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/class-events/my-schedule')
        .query({ start: formatDate(yesterday), end: formatDate(nextWeek) })
        .set('Authorization', `Bearer ${professor.token}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('debe invalidar el caché del calendario cuando se actualiza un evento', async () => {
      const start = formatDate(yesterday);
      const end = formatDate(nextWeek);

      await request(app.getHttpServer())
        .get('/api/v1/class-events/my-schedule')
        .query({ start, end })
        .set('Authorization', `Bearer ${professor.token}`)
        .expect(200);

      const newTitle = 'Caché Limpio';
      await request(app.getHttpServer())
        .patch(`/api/v1/class-events/${createdEventId}`)
        .set('Authorization', `Bearer ${professor.token}`)
        .send({ title: newTitle })
        .expect(200);

      const res = await request(app.getHttpServer())
        .get('/api/v1/class-events/my-schedule')
        .query({ start, end })
        .set('Authorization', `Bearer ${professor.token}`)
        .expect(200);

      const event = res.body.data.find((e: any) => e.id === createdEventId);
      expect(event.title).toBe(newTitle);
    });
  });
});
