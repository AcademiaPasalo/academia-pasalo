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
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import { ROLE_CODES } from '@common/constants/role-codes.constants';

describe('E2E: Courses Professors (Profesores por Curso)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let seeder: TestSeeder;
  let cacheService: RedisCacheService;

  let admin: { user: User; token: string };
  let professor1: { user: User; token: string };
  let professor2: { user: User; token: string };
  let courseCycle: CourseCycle;

  const now = new Date();
  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

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
    cacheService = app.get(RedisCacheService);
    seeder = new TestSeeder(dataSource, app);

    await cacheService.invalidateGroup('*');
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    const tables = [
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

    admin = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail('admin_cp'),
      [ROLE_CODES.ADMIN],
    );
    professor1 = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail('prof1_cp'),
      [ROLE_CODES.PROFESSOR],
    );
    professor2 = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail('prof2_cp'),
      [ROLE_CODES.PROFESSOR],
    );

    const cycle = await seeder.createCycle(
      `CYCLE-CP-${Date.now()}`,
      formatDate(now),
      formatDate(nextWeek),
    );
    const course = await seeder.createCourse(
      `COURSE-CP-${Date.now()}`,
      'Física Moderna',
    );
    courseCycle = await seeder.linkCourseCycle(course.id, cycle.id);

    // Asignar profesores al curso
    await dataSource.query(
      'INSERT INTO course_cycle_professor (course_cycle_id, professor_user_id, assigned_at) VALUES (?, ?, NOW()), (?, ?, NOW())',
      [courseCycle.id, professor1.user.id, courseCycle.id, professor2.user.id],
    );

    await cacheService.invalidateGroup('*');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/courses/cycle/:id/professors', () => {
    it('debe listar los profesores activos del curso', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/courses/cycle/${courseCycle.id}/professors`)
        .set('Authorization', `Bearer ${professor1.token}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.map((p: any) => p.id)).toContain(
        professor1.user.id,
      );
      expect(response.body.data.map((p: any) => p.id)).toContain(
        professor2.user.id,
      );
    });

    it('debe reflejar el baneo de un profesor de forma inmediata (Integridad + Caché)', async () => {
      // 1. Verificar que está en caché (llamando de nuevo)
      await request(app.getHttpServer())
        .get(`/api/v1/courses/cycle/${courseCycle.id}/professors`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);

      // 2. Banear al profesor 2 vía API
      await request(app.getHttpServer())
        .patch(`/api/v1/users/${professor2.user.id}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ isActive: false })
        .expect(200);

      // 3. Consultar la lista de nuevo
      const response = await request(app.getHttpServer())
        .get(`/api/v1/courses/cycle/${courseCycle.id}/professors`)
        .set('Authorization', `Bearer ${professor1.token}`)
        .expect(200);

      // El profesor 2 ya no debe estar en la lista
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe(professor1.user.id);
    });

    it('debe reflejar la revocación de un profesor del curso', async () => {
      // Revocar al profesor 1 del curso
      await request(app.getHttpServer())
        .delete(
          `/api/v1/courses/cycle/${courseCycle.id}/professors/${professor1.user.id}`,
        )
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(204);

      // Consultar la lista
      const response = await request(app.getHttpServer())
        .get(`/api/v1/courses/cycle/${courseCycle.id}/professors`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);

      // Lista vacía (prof 1 revocado, prof 2 baneado)
      expect(response.body.data).toHaveLength(0);
    });

    it('debe denegar acceso si el usuario no tiene rol adecuado', async () => {
      const student = await seeder.createAuthenticatedUser(
        TestSeeder.generateUniqueEmail('student_cp'),
        [ROLE_CODES.STUDENT],
      );

      await request(app.getHttpServer())
        .get(`/api/v1/courses/cycle/${courseCycle.id}/professors`)
        .set('Authorization', `Bearer ${student.token}`)
        .expect(403);
    });
  });
});
