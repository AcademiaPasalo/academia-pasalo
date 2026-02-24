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
  let professor3: { user: User; token: string };
  let inactiveProfessor: { user: User; token: string };
  let student: { user: User; token: string };
  let courseCycle: CourseCycle;
  let assignmentCourseCycle: CourseCycle;

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
    professor3 = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail('prof3_cp'),
      [ROLE_CODES.PROFESSOR],
    );
    inactiveProfessor = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail('prof_inactive_cp'),
      [ROLE_CODES.PROFESSOR],
    );
    student = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail('student_cp'),
      [ROLE_CODES.STUDENT],
    );

    const cycle = await seeder.createCycle(
      `CYCLE-CP-${Date.now()}`,
      formatDate(now),
      formatDate(nextWeek),
    );
    const course = await seeder.createCourse(
      `COURSE-CP-${Date.now()}`,
      'Fisica Moderna',
    );
    courseCycle = await seeder.linkCourseCycle(course.id, cycle.id);

    const assignmentCourse = await seeder.createCourse(
      `COURSE-CP-ASG-${Date.now()}`,
      'Algebra Discreta',
    );
    assignmentCourseCycle = await seeder.linkCourseCycle(
      assignmentCourse.id,
      cycle.id,
    );

    await dataSource.query(
      'INSERT INTO course_cycle_professor (course_cycle_id, professor_user_id, assigned_at) VALUES (?, ?, NOW()), (?, ?, NOW())',
      [courseCycle.id, professor1.user.id, courseCycle.id, professor2.user.id],
    );

    await dataSource.query('UPDATE user SET is_active = 0 WHERE id = ?', [
      inactiveProfessor.user.id,
    ]);

    await cacheService.invalidateGroup('*');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/courses/cycle/:id/professors', () => {
    it('debe permitir asignar un profesor activo al curso/ciclo', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/courses/cycle/${assignmentCourseCycle.id}/professors`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ professorUserId: professor3.user.id })
        .expect(201);

      const rows = await dataSource.query<
        Array<{ professor_user_id: string; revoked_at: Date | null }>
      >(
        `SELECT professor_user_id, revoked_at
         FROM course_cycle_professor
         WHERE course_cycle_id = ? AND professor_user_id = ?`,
        [assignmentCourseCycle.id, professor3.user.id],
      );

      expect(rows).toHaveLength(1);
      expect(rows[0].professor_user_id).toBe(professor3.user.id);
      expect(rows[0].revoked_at).toBeNull();
    });

    it('debe rechazar asignacion cuando el usuario no tiene rol PROFESSOR', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/courses/cycle/${assignmentCourseCycle.id}/professors`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ professorUserId: student.user.id })
        .expect(400);
    });

    it('debe rechazar asignacion cuando el profesor esta inactivo', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/courses/cycle/${assignmentCourseCycle.id}/professors`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ professorUserId: inactiveProfessor.user.id })
        .expect(400);
    });
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

    it('debe reflejar el baneo de un profesor de forma inmediata (Integridad + Cache)', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/courses/cycle/${courseCycle.id}/professors`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/api/v1/users/${professor2.user.id}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ isActive: false })
        .expect(200);

      const response = await request(app.getHttpServer())
        .get(`/api/v1/courses/cycle/${courseCycle.id}/professors`)
        .set('Authorization', `Bearer ${professor1.token}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe(professor1.user.id);
    });

    it('debe reflejar la revocacion de un profesor del curso', async () => {
      await request(app.getHttpServer())
        .delete(
          `/api/v1/courses/cycle/${courseCycle.id}/professors/${professor1.user.id}`,
        )
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(204);

      const response = await request(app.getHttpServer())
        .get(`/api/v1/courses/cycle/${courseCycle.id}/professors`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);

      expect(response.body.data).toHaveLength(0);
    });

    it('debe denegar acceso si el usuario no tiene rol adecuado', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/courses/cycle/${courseCycle.id}/professors`)
        .set('Authorization', `Bearer ${student.token}`)
        .expect(403);
    });
  });
});
