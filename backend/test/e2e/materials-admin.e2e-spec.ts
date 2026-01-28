import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DataSource } from 'typeorm';
import { TestSeeder } from './test-utils';
import { StorageService } from '@infrastructure/storage/storage.service';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { MaterialsAdminController } from '@modules/materials/presentation/materials-admin.controller';

describe('E2E: Administración de Materiales (Aprobaciones y Limpieza)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let seeder: TestSeeder;

  // Actores
  let superAdmin: any;
  let admin: any;
  let professor: any;
  let student: any;

  // Recursos
  let folderId: string;
  let materialToDeleteId: string;
  let materialToKeepId: string;
  let requestIdToDelete: string;

  // Fechas
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
      calculateHash: jest.fn().mockResolvedValue('hash'),
      saveFile: jest.fn().mockResolvedValue('/tmp/mock'),
      deleteFile: jest.fn().mockResolvedValue(undefined),
      onModuleInit: jest.fn(),
    })
    .compile();

    try {
        const ctrl = moduleFixture.get(MaterialsAdminController);
        console.log('DEBUG: MaterialsAdminController found instance:', !!ctrl);
    } catch (e) {
        console.error('DEBUG: MaterialsAdminController NOT FOUND in moduleFixture');
    }

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalInterceptors(new TransformInterceptor(app.get(Reflector)));
    await app.init();

    dataSource = app.get(DataSource);
    seeder = new TestSeeder(dataSource, app);

    // 1. Setup Base
    await seeder.ensureMaterialStatuses();
    const cycle = await seeder.createCycle(`2026-ADM-${Date.now()}`, formatDate(now), formatDate(nextMonth));
    const course = await seeder.createCourse(`ADM101-${Date.now()}`, 'Admin 101');
    const courseCycle = await seeder.linkCourseCycle(course.id, cycle.id);
    const evaluation = await seeder.createEvaluation(courseCycle.id, 'PC', 1, formatDate(now), formatDate(nextMonth));

    // 2. Usuarios
    superAdmin = await seeder.createAuthenticatedUser(TestSeeder.generateUniqueEmail('sa_adm'), ['SUPER_ADMIN']);
    admin = await seeder.createAuthenticatedUser(TestSeeder.generateUniqueEmail('admin_adm'), ['ADMIN']);
    professor = await seeder.createAuthenticatedUser(TestSeeder.generateUniqueEmail('prof_adm'), ['PROFESSOR']);
    student = await seeder.createAuthenticatedUser(TestSeeder.generateUniqueEmail('std_adm'), ['STUDENT']);

    // 3. Crear Carpeta y Materiales
    const folderRes = await request(app.getHttpServer())
        .post('/materials/folders')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ evaluationId: evaluation.id, name: 'Root', visibleFrom: new Date().toISOString() });
    
    if (folderRes.status !== 201) console.error('Folder create failed', folderRes.body);
    folderId = folderRes.body.data.id;

    // Material 1 (Para borrar)
    const mat1 = await request(app.getHttpServer())
        .post('/materials')
        .set('Authorization', `Bearer ${professor.token}`)
        .attach('file', Buffer.from('PDF'), 'borrar.pdf')
        .field('materialFolderId', folderId)
        .field('displayName', 'Para Borrar');
    materialToDeleteId = mat1.body.data.id;

    // Material 2 (Para rechazar borrado)
    const mat2 = await request(app.getHttpServer())
        .post('/materials')
        .set('Authorization', `Bearer ${professor.token}`)
        .attach('file', Buffer.from('PDF'), 'guardar.pdf')
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
        
        // Verificamos estado en BD
        const req = await dataSource.getRepository('DeletionRequest').findOne({ 
            where: { entityId: materialToDeleteId },
            relations: { status: true }
        });
        expect(req).toBeDefined();
        expect(req?.status.code).toBe('PENDING');
        requestIdToDelete = req!.id;
    });

    it('Alumno NO puede ver solicitudes pendientes (403)', async () => {
        await request(app.getHttpServer())
            .get('/admin/materials/requests/pending')
            .set('Authorization', `Bearer ${student.token}`)
            .expect(403);
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

        // Verificar Material ARCHIVED
        const mat = await dataSource.getRepository('Material').findOne({ 
            where: { id: materialToDeleteId },
            relations: { status: true }
        });
        expect(mat?.status.code).toBe('ARCHIVED');
        
        // Verificar Solicitud APPROVED
        const req = await dataSource.getRepository('DeletionRequest').findOne({ 
            where: { id: requestIdToDelete },
            relations: { status: true }
        });
        expect(req?.status.code).toBe('APPROVED');
    });

    it('Admin RECHAZA solicitud (Material 2)', async () => {
        // 1. Crear solicitud para mat2
        await request(app.getHttpServer())
            .post(`/materials/${materialToKeepId}/request-deletion`)
            .set('Authorization', `Bearer ${professor.token}`)
            .send({ reason: 'Error' })
            .expect(200);
        
        const reqPending = await dataSource.getRepository('DeletionRequest').findOne({ where: { entityId: materialToKeepId } });

        // 2. Rechazar
        await request(app.getHttpServer())
            .post(`/admin/materials/requests/${reqPending!.id}/review`)
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ action: 'REJECT', adminComment: 'No procede' })
            .expect(200);

        // Verificar Material SIGUE ACTIVE
        const mat = await dataSource.getRepository('Material').findOne({ 
            where: { id: materialToKeepId },
            relations: { status: true }
        });
        expect(mat?.status.code).toBe('ACTIVE');
    });
  });

  describe('Fase 3: Limpieza Física (Hard Delete)', () => {
    it('Admin normal NO puede hacer Hard Delete (403)', async () => {
        // Intentar borrar material archivado (mat1)
        await request(app.getHttpServer())
            .delete(`/admin/materials/${materialToDeleteId}/hard-delete`)
            .set('Authorization', `Bearer ${admin.token}`)
            .expect(403);
    });

    it('SuperAdmin NO puede borrar material ACTIVO (400)', async () => {
        // Intentar borrar mat2 (que sigue activo)
        await request(app.getHttpServer())
            .delete(`/admin/materials/${materialToKeepId}/hard-delete`)
            .set('Authorization', `Bearer ${superAdmin.token}`)
            .expect(400); // Bad Request: Debe estar archivado
    });

    it('SuperAdmin SI puede borrar material ARCHIVADO (200)', async () => {
        // Borrar mat1 (archivado)
        await request(app.getHttpServer())
            .delete(`/admin/materials/${materialToDeleteId}/hard-delete`)
            .set('Authorization', `Bearer ${superAdmin.token}`)
            .expect(200);

        // Verificar que ya no existe en BD
        const mat = await dataSource.getRepository('Material').findOne({ where: { id: materialToDeleteId } });
        expect(mat).toBeNull();
    });
  });
});