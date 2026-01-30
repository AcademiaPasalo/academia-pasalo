import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { AppModule } from '@src/app.module';
import { DataSource } from 'typeorm';
import { TestSeeder } from './test-utils';
import { StorageService } from '@infrastructure/storage/storage.service';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { User } from '@modules/users/domain/user.entity';

describe('E2E: Administración de Materiales (Aprobaciones y Limpieza)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let seeder: TestSeeder;

  let superAdmin: { user: User; token: string };
  let admin: { user: User; token: string };
  let professor: { user: User; token: string };
  let student: { user: User; token: string };

  let folderId: string;
  let materialToDeleteId: string;
  let materialToKeepId: string;
  let requestIdToDelete: string;

  const now = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(now.getMonth() + 1);
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(StorageService)
    .useValue({
      calculateHash: jest.fn().mockResolvedValue('hash-' + Math.random()),
      saveFile: jest.fn().mockResolvedValue('/tmp/mock'),
      deleteFile: jest.fn().mockResolvedValue(undefined),
      onModuleInit: jest.fn(),
    })
    .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalInterceptors(new TransformInterceptor(app.get(Reflector)));
    await app.init();

    dataSource = app.get(DataSource);
    seeder = new TestSeeder(dataSource, app);

    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    await dataSource.query('DELETE FROM deletion_request');
    await dataSource.query('DELETE FROM material');
    await dataSource.query('DELETE FROM file_version');
    await dataSource.query('DELETE FROM file_resource');
    await dataSource.query('DELETE FROM material_folder');
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');

    await seeder.ensureMaterialStatuses();
    const cycle = await seeder.createCycle(`2026-ADM-${Date.now()}`, formatDate(now), formatDate(nextMonth));
    const course = await seeder.createCourse(`ADM101-${Date.now()}`, 'Admin 101');
    const courseCycle = await seeder.linkCourseCycle(course.id, cycle.id);
    const evaluation = await seeder.createEvaluation(courseCycle.id, 'PC', 1, formatDate(now), formatDate(nextMonth));

    superAdmin = await seeder.createAuthenticatedUser(TestSeeder.generateUniqueEmail('sa_adm'), ['SUPER_ADMIN']);
    admin = await seeder.createAuthenticatedUser(TestSeeder.generateUniqueEmail('admin_adm'), ['ADMIN']);
    professor = await seeder.createAuthenticatedUser(TestSeeder.generateUniqueEmail('prof_adm'), ['PROFESSOR']);
    student = await seeder.createAuthenticatedUser(TestSeeder.generateUniqueEmail('std_adm'), ['STUDENT']);

    const folderRes = await request(app.getHttpServer())
        .post('/materials/folders')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ evaluationId: evaluation.id, name: 'Root', visibleFrom: new Date().toISOString() });
    
    folderId = folderRes.body.data.id;

    const mat1 = await request(app.getHttpServer())
        .post('/materials')
        .set('Authorization', `Bearer ${professor.token}`)
        .attach('file', Buffer.from('PDF1'), 'borrar.pdf')
        .field('materialFolderId', folderId)
        .field('displayName', 'Para Borrar');
    materialToDeleteId = mat1.body.data.id;

    const mat2 = await request(app.getHttpServer())
        .post('/materials')
        .set('Authorization', `Bearer ${professor.token}`)
        .attach('file', Buffer.from('PDF2'), 'guardar.pdf')
        .field('materialFolderId', folderId)
        .field('displayName', 'Para Guardar');
    materialToKeepId = mat2.body.data.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Fase 1: Solicitud y Listado', () => {
    it('Profesor solicita eliminación de material', async () => {
        await request(app.getHttpServer())
            .post(`/materials/${materialToDeleteId}/request-deletion`)
            .set('Authorization', `Bearer ${professor.token}`)
            .send({ reason: 'Duplicado' })
            .expect(200);
        
        const req = await dataSource.getRepository('DeletionRequest').findOne({ 
            where: { entityId: materialToDeleteId },
            relations: { deletionRequestStatus: true }
        });
        expect(req).toBeDefined();
        expect(req?.deletionRequestStatus.code).toBe('PENDING');
        requestIdToDelete = req!.id;
    });

    it('Admin SI puede ver solicitudes pendientes', async () => {
        const res = await request(app.getHttpServer())
            .get('/admin/materials/requests/pending')
            .set('Authorization', `Bearer ${admin.token}`)
            .expect(200);
        
        expect(Array.isArray(res.body.data)).toBe(true);
        const myRequest = res.body.data.find((r: any) => r.id === requestIdToDelete);
        expect(myRequest).toBeDefined();
    });
  });

  describe('Fase 2: Aprobación y Rechazo', () => {
    it('Admin APRUEBA solicitud -> Material se archiva', async () => {
        await request(app.getHttpServer())
            .post(`/admin/materials/requests/${requestIdToDelete}/review`)
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ action: 'APPROVE', adminComment: 'Proceda' })
            .expect(200);

        const mat = await dataSource.getRepository('Material').findOne({ 
            where: { id: materialToDeleteId },
            relations: { materialStatus: true }
        });
        expect(mat?.materialStatus.code).toBe('ARCHIVED');
        
        const req = await dataSource.getRepository('DeletionRequest').findOne({ 
            where: { id: requestIdToDelete },
            relations: { deletionRequestStatus: true }
        });
        expect(req?.deletionRequestStatus.code).toBe('APPROVED');
    });

    it('Admin RECHAZA solicitud (Material 2)', async () => {
        await request(app.getHttpServer())
            .post(`/materials/${materialToKeepId}/request-deletion`)
            .set('Authorization', `Bearer ${professor.token}`)
            .send({ reason: 'Error' })
            .expect(200);
        
        const reqPending = await dataSource.getRepository('DeletionRequest').findOne({ where: { entityId: materialToKeepId } });

        await request(app.getHttpServer())
            .post(`/admin/materials/requests/${reqPending!.id}/review`)
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ action: 'REJECT', adminComment: 'No procede' })
            .expect(200);

        const mat = await dataSource.getRepository('Material').findOne({ 
            where: { id: materialToKeepId },
            relations: { materialStatus: true }
        });
        expect(mat?.materialStatus.code).toBe('ACTIVE');
    });
  });

  describe('Fase 3: Limpieza Física (Hard Delete)', () => {
    it('SuperAdmin SI puede borrar material ARCHIVADO (200)', async () => {
        await request(app.getHttpServer())
            .delete(`/admin/materials/${materialToDeleteId}/hard-delete`)
            .set('Authorization', `Bearer ${superAdmin.token}`)
            .expect(200);

        const mat = await dataSource.getRepository('Material').findOne({ where: { id: materialToDeleteId } });
        expect(mat).toBeNull();
    });
  });
});
