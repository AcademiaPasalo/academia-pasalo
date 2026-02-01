import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { DataSource } from 'typeorm';
import { TestSeeder } from './test-utils';
import { StorageService } from '@infrastructure/storage/storage.service';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { User } from '@modules/users/domain/user.entity';
import { CourseCycle } from '@modules/courses/domain/course-cycle.entity';
import { Evaluation } from '@modules/evaluations/domain/evaluation.entity';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';

describe('E2E: Gestión de Materiales y Seguridad', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let seeder: TestSeeder;
  let storageService: StorageService;

  let admin: { user: User; token: string };
  let professor: { user: User; token: string };
  let studentWithAccess: { user: User; token: string };
  let studentWithoutAccess: { user: User; token: string };
  let courseCycle: CourseCycle;
  let evaluation: Evaluation;
  let rootFolderId: string;

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const nextMonth = new Date();
  nextMonth.setMonth(now.getMonth() + 1);
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(StorageService)
    .useValue({
      calculateHash: jest.fn().mockResolvedValue('mock-sha256-hash'),
      saveFile: jest.fn().mockImplementation(async (name, buffer) => {
         const tempPath = path.join(os.tmpdir(), name);
         await fs.promises.writeFile(tempPath, buffer);
         return tempPath;
      }),
      deleteFile: jest.fn().mockResolvedValue(undefined),
      onModuleInit: jest.fn(),
    })
    .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    
    const reflector = app.get(Reflector);
    app.useGlobalInterceptors(new TransformInterceptor(reflector));

    await app.init();

    dataSource = app.get(DataSource);
    storageService = app.get(StorageService);
    const cacheService = app.get(RedisCacheService);
    seeder = new TestSeeder(dataSource, app);

    await cacheService.invalidateGroup('*');
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    const tables = [
      'deletion_request',
      'enrollment_evaluation',
      'enrollment',
      'material',
      'file_version',
      'file_resource',
      'material_folder',
      'evaluation',
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

    await seeder.ensureMaterialStatuses();
    const cycle = await seeder.createCycle(`2026-MAT-${Date.now()}`, formatDate(now), formatDate(nextMonth));
    const course = await seeder.createCourse(`MAT101-${Date.now()}`, 'Materiales 101');
    courseCycle = await seeder.linkCourseCycle(course.id, cycle.id);
    evaluation = await seeder.createEvaluation(courseCycle.id, 'PC', 1, formatDate(yesterday), formatDate(nextMonth));

    admin = await seeder.createAuthenticatedUser(TestSeeder.generateUniqueEmail('admin_mat'), ['ADMIN']);
    professor = await seeder.createAuthenticatedUser(TestSeeder.generateUniqueEmail('prof_mat'), ['PROFESSOR']);
    
    // Asignar profesor al curso
    await dataSource.query(
      'INSERT INTO course_cycle_professor (course_cycle_id, professor_user_id, assigned_at) VALUES (?, ?, NOW())',
      [courseCycle.id, professor.user.id]
    );

    const s1 = await seeder.createAuthenticatedUser(TestSeeder.generateUniqueEmail('student_ok'), ['STUDENT']);
    studentWithAccess = s1;
    await request(app.getHttpServer())
      .post('/api/v1/enrollments')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ userId: s1.user.id, courseCycleId: courseCycle.id, enrollmentTypeCode: 'FULL' })
      .expect(201);

    studentWithoutAccess = await seeder.createAuthenticatedUser(TestSeeder.generateUniqueEmail('student_fail'), ['STUDENT']);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GESTIÓN DE CARPETAS Y ARCHIVOS', () => {
    it('Admin debe poder crear carpeta raíz', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/materials/folders')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          evaluationId: evaluation.id,
          name: 'Material de Clase',
          visibleFrom: new Date().toISOString(),
        })
        .expect(201);
      
      rootFolderId = res.body.data.id;
      expect(rootFolderId).toBeDefined();
    });

    it('Profesor asignado debe poder subir archivo', async () => {
      const buffer = Buffer.from('%PDF-1.4 content');
      await request(app.getHttpServer())
        .post('/api/v1/materials')
        .set('Authorization', `Bearer ${professor.token}`)
        .attach('file', buffer, 'silabo.pdf')
        .field('materialFolderId', rootFolderId)
        .field('displayName', 'Sílabo Oficial')
        .expect(201);
    });
  });

  describe('BLINDAJE DE SEGURIDAD AVANZADA', () => {
    let materialId: string;
    let lockedFolderId: string;
    let otherCourseEvaluation: Evaluation;

    beforeAll(async () => {
      const otherCourse = await seeder.createCourse(`OTHER-${Date.now()}`, 'Curso Ajeno');
      const otherCC = await seeder.linkCourseCycle(otherCourse.id, courseCycle.academicCycleId);
      otherCourseEvaluation = await seeder.createEvaluation(otherCC.id, 'PC', 1, formatDate(yesterday), formatDate(nextMonth));

      const future = new Date();
      future.setFullYear(now.getFullYear() + 1);
      const resFolder = await request(app.getHttpServer())
        .post('/api/v1/materials/folders')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          evaluationId: evaluation.id,
          name: 'Examen Futuro',
          visibleFrom: future.toISOString(),
        })
        .expect(201);
      lockedFolderId = resFolder.body.data.id;

      const buffer = Buffer.from('%PDF-1.4 locked');
      const resMat = await request(app.getHttpServer())
        .post('/api/v1/materials')
        .set('Authorization', `Bearer ${admin.token}`)
        .attach('file', buffer, 'examen.pdf')
        .field('materialFolderId', lockedFolderId)
        .field('displayName', 'Examen Confidencial')
        .expect(201);
      materialId = resMat.body.data.id;
    });

    it('Profesor NO debe poder ver raíces de un curso ajeno (403)', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/materials/folders/evaluation/${otherCourseEvaluation.id}`)
        .set('Authorization', `Bearer ${professor.token}`)
        .expect(403);
    });

    it('Admin SÍ debe poder ver raíces de cualquier curso (Bypass)', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/materials/folders/evaluation/${otherCourseEvaluation.id}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });

    it('Estudiante NO debe poder descargar material si la carpeta es futura (403)', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/materials/${materialId}/download`)
        .set('Authorization', `Bearer ${studentWithAccess.token}`)
        .expect(403);
    });

    it('Estudiante con MATRÍCULA CANCELADA debe recibir 403', async () => {
      const enrollmentRepo = dataSource.getRepository('Enrollment');
      const enrollment = await enrollmentRepo.findOne({ 
        where: { userId: studentWithAccess.user.id, courseCycleId: courseCycle.id } 
      });
      if (enrollment) {
        await enrollmentRepo.update(enrollment.id, { cancelledAt: new Date() });
      }

      // 2. IMPORTANTE: Invalidar el caché de acceso para que el sistema consulte la DB
      const cacheService = app.get(RedisCacheService);
      await cacheService.del(`cache:access:user:${studentWithAccess.user.id}:eval:${evaluation.id}`);

      // 3. Intentar ver carpetas (Debería fallar ahora que la matrícula está cancelada)
      await request(app.getHttpServer())
        .get(`/api/v1/materials/folders/evaluation/${evaluation.id}`)
        .set('Authorization', `Bearer ${studentWithAccess.token}`)
        .expect(403);
    });
  });
});