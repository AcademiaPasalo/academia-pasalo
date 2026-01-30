import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { AppModule } from '@src/app.module';
import { DataSource } from 'typeorm';
import { TestSeeder } from './test-utils';
import { StorageService } from '@infrastructure/storage/storage.service';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { User } from '@modules/users/domain/user.entity';

describe('E2E: Versionado, Deduplicación e Integridad', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let seeder: TestSeeder;
  let storageService: StorageService;

  let professor: { user: User; token: string };
  let admin: { user: User; token: string };

  let folderId: string;
  let materialId: string;
  let originalFileResourceId: string;

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
      calculateHash: jest.fn().mockImplementation((buffer: Buffer) => {
          if (buffer.toString() === 'DUPLICATE_CONTENT') return 'hash_dup_123';
          if (buffer.toString() === 'VERSION_2') return 'hash_v2_456';
          return 'hash_' + Date.now() + Math.random();
      }),
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
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalInterceptors(new TransformInterceptor(app.get(Reflector)));
    await app.init();

    dataSource = app.get(DataSource);
    storageService = app.get(StorageService);
    seeder = new TestSeeder(dataSource, app);

    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    await dataSource.query('DELETE FROM deletion_request');
    await dataSource.query('DELETE FROM material');
    await dataSource.query('DELETE FROM file_version');
    await dataSource.query('DELETE FROM file_resource');
    await dataSource.query('DELETE FROM material_folder');
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');

    await seeder.ensureMaterialStatuses();
    const cycle = await seeder.createCycle(`2026-VER-${Date.now()}`, formatDate(now), formatDate(nextMonth));
    const course = await seeder.createCourse(`VER101-${Date.now()}`, 'Versionado 101');
    const courseCycle = await seeder.linkCourseCycle(course.id, cycle.id);
    const evaluation = await seeder.createEvaluation(courseCycle.id, 'PC', 1, formatDate(now), formatDate(nextMonth));

    professor = await seeder.createAuthenticatedUser(TestSeeder.generateUniqueEmail('prof_ver'), ['PROFESSOR']);
    admin = await seeder.createAuthenticatedUser(TestSeeder.generateUniqueEmail('admin_ver'), ['ADMIN']);

    const folderRes = await request(app.getHttpServer())
        .post('/materials/folders')
        .set('Authorization', `Bearer ${professor.token}`)
        .send({ 
          evaluationId: evaluation.id, 
          name: 'Root Versioning', 
          visibleFrom: new Date().toISOString() 
        })
        .expect(201);
    
    folderId = folderRes.body.data.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Caso 1: Deduplicación (Ahorro de Espacio)', () => {
    it('Subir Archivo A (Original)', async () => {
        const buffer = Buffer.from('DUPLICATE_CONTENT');
        const res = await request(app.getHttpServer())
            .post('/materials')
            .set('Authorization', `Bearer ${professor.token}`)
            .attach('file', buffer, 'original.txt')
            .field('materialFolderId', folderId)
            .field('displayName', 'Original')
            .expect(201);
        
        materialId = res.body.data.id;
        originalFileResourceId = res.body.data.fileResourceId;
        expect(originalFileResourceId).toBeDefined();
    });

    it('Subir Archivo B (Duplicado) -> Debe reutilizar FileResource', async () => {
        const buffer = Buffer.from('DUPLICATE_CONTENT');
        const res = await request(app.getHttpServer())
            .post('/materials')
            .set('Authorization', `Bearer ${professor.token}`)
            .attach('file', buffer, 'copia.txt')
            .field('materialFolderId', folderId)
            .field('displayName', 'Copia')
            .expect(201);
        
        expect(res.body.data.fileResourceId).toBe(originalFileResourceId);
    });
  });

  describe('Caso 2: Versionado Explícito (Historial)', () => {
    it('Agregar Nueva Versión (v2) a Material Original', async () => {
        const buffer = Buffer.from('VERSION_2');
        
        const res = await request(app.getHttpServer())
            .post(`/materials/${materialId}/versions`)
            .set('Authorization', `Bearer ${professor.token}`)
            .attach('file', buffer, 'v2.txt')
            .expect(201);
        
        expect(res.body.data.id).toBe(materialId);

        const mat = await dataSource.getRepository('Material').findOne({ 
            where: { id: materialId }, 
            relations: { fileVersion: true }
        });

        expect(mat!.fileVersion.versionNumber).toBe(2);
    });
  });

  describe('Caso 3: Integridad y Limpieza (Hard Delete)', () => {
    it('Hard Delete debe borrar el material y SU versión actual', async () => {
        const reqRepo = dataSource.getRepository('DeletionRequest');
        const statusRepo = dataSource.getRepository('DeletionRequestStatus');
        const pending = await statusRepo.findOne({ where: { code: 'PENDING' } });
        
        const req = await reqRepo.save(reqRepo.create({
            requestedById: professor.user.id,
            deletionRequestStatusId: pending!.id,
            entityType: 'material',
            entityId: materialId,
            reason: 'Test Cleanup',
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        await request(app.getHttpServer())
            .post(`/admin/materials/requests/${req.id}/review`)
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ action: 'APPROVE' })
            .expect(200);

        const sa = await seeder.createAuthenticatedUser(TestSeeder.generateUniqueEmail('sa_ver'), ['SUPER_ADMIN']);
        
        await request(app.getHttpServer())
            .delete(`/admin/materials/${materialId}/hard-delete`)
            .set('Authorization', `Bearer ${sa.token}`)
            .expect(200);

        const mat = await dataSource.getRepository('Material').findOne({ where: { id: materialId } });
        expect(mat).toBeNull();
    });
  });
});