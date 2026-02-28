import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { DataSource } from 'typeorm';
import { TestSeeder } from './test-utils';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { User } from '@modules/users/domain/user.entity';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import { ROLE_CODES } from '@common/constants/role-codes.constants';
import { Notification } from '@modules/notifications/domain/notification.entity';
import { UserNotification } from '@modules/notifications/domain/user-notification.entity';

describe('E2E: Notifications (Notificaciones)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let seeder: TestSeeder;

  let student: { user: User; token: string };
  let student2: { user: User; token: string };
  let professor: { user: User; token: string };

  const now = new Date();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
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
      'user_notification',
      'notification',
      'class_event_professor',
      'class_event',
      'academic_event',
      'enrollment_evaluation',
      'enrollment',
      'course_cycle_professor',
      'material',
      'material_folder',
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
      `CYCLE-NOTIF-${Date.now()}`,
      formatDate(yesterday),
      formatDate(nextWeek),
    );
    const course = await seeder.createCourse(
      `COURSE-NOTIF-${Date.now()}`,
      'Curso Notificaciones',
    );
    await seeder.linkCourseCycle(course.id, cycle.id);

    student = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail('notif-student'),
      [ROLE_CODES.STUDENT],
    );
    student2 = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail('notif-student2'),
      [ROLE_CODES.STUDENT],
    );
    professor = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail('notif-prof'),
      [ROLE_CODES.PROFESSOR],
    );
  });

  afterAll(async () => {
    await app.close();
  });

  async function insertNotificationForUser(
    userId: string,
    isRead = false,
  ): Promise<{ notificationId: string }> {
    const notifTypeRepo = dataSource.getRepository('NotificationType');
    let notifType = await notifTypeRepo.findOne({
      where: { code: 'CLASS_SCHEDULED' },
    });
    if (!notifType) {
      notifType = await notifTypeRepo.save(
        notifTypeRepo.create({
          code: 'CLASS_SCHEDULED',
          name: 'Nueva clase programada',
        }),
      );
    }

    const notifRepo = dataSource.getRepository(Notification);
    const notification = await notifRepo.save(
      notifRepo.create({
        notificationTypeId: notifType.id,
        title: 'Clase programada',
        message: 'La clase X ha sido programada.',
        entityType: 'class_event',
        entityId: '1',
        createdAt: new Date(),
      }),
    );

    const unRepo = dataSource.getRepository(UserNotification);
    await unRepo.save(
      unRepo.create({
        userId,
        notificationId: notification.id,
        isRead,
        readAt: isRead ? new Date() : null,
      }),
    );

    return { notificationId: notification.id };
  }

  describe('GET /api/v1/notifications', () => {
    it('devuelve 401 sin token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/notifications')
        .expect(401);
    });

    it('devuelve 200 con lista vacía para usuario sin notificaciones', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${student.token}`)
        .expect(200);

      expect(res.body.statusCode).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    it('devuelve las notificaciones del usuario autenticado', async () => {
      await insertNotificationForUser(student.user.id);

      const res = await request(app.getHttpServer())
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${student.token}`)
        .expect(200);

      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      const notif = res.body.data[0];
      expect(notif).toHaveProperty('notificationId');
      expect(notif).toHaveProperty('type');
      expect(notif).toHaveProperty('title');
      expect(notif).toHaveProperty('isRead');
    });

    it('no devuelve notificaciones de otro usuario', async () => {
      await insertNotificationForUser(student2.user.id);

      const res = await request(app.getHttpServer())
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${professor.token}`)
        .expect(200);

      for (const n of res.body.data as Array<{ notificationId: string }>) {
        const unRepo = dataSource.getRepository(UserNotification);
        const un = await unRepo.findOne({
          where: { notificationId: n.notificationId },
        });
        expect(un?.userId).toBe(professor.user.id);
      }
    });

    it('filtra solo no leídas con onlyUnread=true', async () => {
      const { notificationId } = await insertNotificationForUser(
        student.user.id,
        false,
      );

      const res = await request(app.getHttpServer())
        .get('/api/v1/notifications?onlyUnread=true')
        .set('Authorization', `Bearer ${student.token}`)
        .expect(200);

      const ids = (res.body.data as Array<{ notificationId: string }>).map(
        (n) => n.notificationId,
      );
      expect(ids).toContain(notificationId);

      for (const n of res.body.data as Array<{ isRead: boolean }>) {
        expect(n.isRead).toBe(false);
      }
    });

    it('aplica paginación con limit y offset', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/notifications?limit=1&offset=0')
        .set('Authorization', `Bearer ${student.token}`)
        .expect(200);

      expect(res.body.data.length).toBeLessThanOrEqual(1);
    });

    it('rechaza limit=0 con 400', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/notifications?limit=0')
        .set('Authorization', `Bearer ${student.token}`)
        .expect(400);
    });

    it('rechaza limit=101 con 400', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/notifications?limit=101')
        .set('Authorization', `Bearer ${student.token}`)
        .expect(400);
    });

    it('rechaza offset negativo con 400', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/notifications?offset=-1')
        .set('Authorization', `Bearer ${student.token}`)
        .expect(400);
    });
  });

  describe('GET /api/v1/notifications/unread-count', () => {
    it('devuelve 401 sin token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/notifications/unread-count')
        .expect(401);
    });

    it('devuelve 200 con conteo inicial de no leídas', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/notifications/unread-count')
        .set('Authorization', `Bearer ${professor.token}`)
        .expect(200);

      expect(res.body.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('count');
      expect(typeof res.body.data.count).toBe('number');
    });

    it('el conteo aumenta tras insertar una notificación no leída', async () => {
      const cacheService = app.get(RedisCacheService);
      await cacheService.invalidateGroup(
        `cache:notifications:unread-count:${student2.user.id}`,
      );

      const resBefore = await request(app.getHttpServer())
        .get('/api/v1/notifications/unread-count')
        .set('Authorization', `Bearer ${student2.token}`)
        .expect(200);

      const countBefore: number = resBefore.body.data.count;

      await insertNotificationForUser(student2.user.id, false);
      await cacheService.del(
        `cache:notifications:unread-count:${student2.user.id}`,
      );

      const resAfter = await request(app.getHttpServer())
        .get('/api/v1/notifications/unread-count')
        .set('Authorization', `Bearer ${student2.token}`)
        .expect(200);

      expect(resAfter.body.data.count).toBeGreaterThan(countBefore);
    });
  });

  describe('PATCH /api/v1/notifications/:id/read', () => {
    it('devuelve 401 sin token', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/notifications/123/read')
        .expect(401);
    });

    it('devuelve 204 al marcar una notificación propia como leída', async () => {
      const { notificationId } = await insertNotificationForUser(
        student.user.id,
        false,
      );

      await request(app.getHttpServer())
        .patch(`/api/v1/notifications/${notificationId}/read`)
        .set('Authorization', `Bearer ${student.token}`)
        .expect(204);

      const unRepo = dataSource.getRepository(UserNotification);
      const un = await unRepo.findOne({
        where: { userId: student.user.id, notificationId },
      });
      expect(un?.isRead).toBe(true);
      expect(un?.readAt).not.toBeNull();
    });

    it('devuelve 404 si la notificación no existe o no pertenece al usuario', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/notifications/999999999/read')
        .set('Authorization', `Bearer ${student.token}`)
        .expect(404);
    });

    it('devuelve 404 si otro usuario intenta marcar la notificación de student como leída', async () => {
      const { notificationId } = await insertNotificationForUser(
        student.user.id,
        false,
      );

      await request(app.getHttpServer())
        .patch(`/api/v1/notifications/${notificationId}/read`)
        .set('Authorization', `Bearer ${student2.token}`)
        .expect(404);
    });
  });

  describe('PATCH /api/v1/notifications/read-all', () => {
    it('devuelve 401 sin token', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/notifications/read-all')
        .expect(401);
    });

    it('devuelve 204 y marca todas las notificaciones del usuario como leídas', async () => {
      await insertNotificationForUser(student.user.id, false);
      await insertNotificationForUser(student.user.id, false);

      await request(app.getHttpServer())
        .patch('/api/v1/notifications/read-all')
        .set('Authorization', `Bearer ${student.token}`)
        .expect(204);

      const cacheService = app.get(RedisCacheService);
      await cacheService.del(
        `cache:notifications:unread-count:${student.user.id}`,
      );

      const res = await request(app.getHttpServer())
        .get('/api/v1/notifications/unread-count')
        .set('Authorization', `Bearer ${student.token}`)
        .expect(200);

      expect(res.body.data.count).toBe(0);
    });
  });

  describe('Estructura de respuesta estándar', () => {
    it('GET /notifications devuelve la estructura { statusCode, message, data, timestamp }', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${student.token}`)
        .expect(200);

      expect(res.body).toHaveProperty('statusCode', 200);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('timestamp');
    });

    it('GET /notifications/unread-count devuelve la estructura estándar', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/notifications/unread-count')
        .set('Authorization', `Bearer ${student.token}`)
        .expect(200);

      expect(res.body).toHaveProperty('statusCode', 200);
      expect(res.body).toHaveProperty('message');
      expect(res.body.data).toHaveProperty('count');
      expect(res.body).toHaveProperty('timestamp');
    });
  });
});
