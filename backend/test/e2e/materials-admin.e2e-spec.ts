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
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import { DeletionRequest } from '@modules/materials/domain/deletion-request.entity';
import { Material } from '@modules/materials/domain/material.entity';

interface DeletionRequestResponse {
  id: string;
}

interface GenericDataResponse<T> {
  data: T;
}

describe('E2E: Administración de Materiales (Aprobaciones y Limpieza)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let seeder: TestSeeder;

  let professor: { user: User; token: string };
  let admin: { user: User; token: string };
  let superAdmin: { user: User; token: string };

  let folderId: string;
  let materialToDeleteId: string;
  let requestIdToDelete: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(StorageService)
      .useValue({
        calculateHash: jest.fn().mockResolvedValue('hash-admin-' + Date.now()),
        saveFile: jest.fn().mockResolvedValue('/fake/path'),
        deleteFile: jest.fn().mockResolvedValue(undefined),
        onModuleInit: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalInterceptors(new TransformInterceptor(app.get(Reflector)));
    await app.init();

    dataSource = app.get(DataSource);
    const cacheService = app.get(RedisCacheService);
    await cacheService.invalidateGroup('*');
    seeder = new TestSeeder(dataSource, app);

    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    await dataSource.query('DELETE FROM deletion_request');
    await dataSource.query('DELETE FROM material');
    await dataSource.query('DELETE FROM material_folder');
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');

    await seeder.ensureMaterialStatuses();
    const cycle = await seeder.createCycle(
      `2026-ADM-${Date.now()}`,
      '2026-01-01',
      '2026-12-31',
    );
    const course = await seeder.createCourse(
      `ADM101-${Date.now()}`,
      'Admin 101',
    );
    const courseCycle = await seeder.linkCourseCycle(course.id, cycle.id);
    const evaluation = await seeder.createEvaluation(
      courseCycle.id,
      'PC',
      1,
      '2026-01-01',
      '2026-12-31',
    );

    professor = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail('prof_adm'),
      ['PROFESSOR'],
    );
    admin = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail('admin_adm'),
      ['ADMIN'],
    );
    superAdmin = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail('sa_adm'),
      ['SUPER_ADMIN'],
    );

    const folderRes = await request(app.getHttpServer())
      .post('/api/v1/materials/folders')
      .set('Authorization', `Bearer ${professor.token}`)
      .send({
        evaluationId: evaluation.id,
        name: 'Admin Root',
        visibleFrom: new Date().toISOString(),
      })
      .expect(201);

    const folderBody = folderRes.body as GenericDataResponse<{ id: string }>;
    folderId = folderBody.data.id;

    const buffer = Buffer.from('%PDF-1.4 content');
    const res1 = await request(app.getHttpServer())
      .post('/api/v1/materials')
      .set('Authorization', `Bearer ${professor.token}`)
      .attach('file', buffer, 'file1.pdf')
      .field('materialFolderId', folderId)
      .field('displayName', 'Material 1');

    const mat1Body = res1.body as GenericDataResponse<{ id: string }>;
    materialToDeleteId = mat1Body.data.id;

    await request(app.getHttpServer())
      .post('/api/v1/materials')
      .set('Authorization', `Bearer ${professor.token}`)
      .attach('file', buffer, 'file2.pdf')
      .field('materialFolderId', folderId)
      .field('displayName', 'Material 2');
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('Fase 1: Solicitud y Listado', () => {
    it('Profesor solicita eliminación de material', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/materials/request-deletion')
        .set('Authorization', `Bearer ${professor.token}`)
        .send({
          entityType: 'material',
          entityId: materialToDeleteId,
          reason: 'Obsoleto',
        })
        .expect(200);

      const req = await dataSource
        .getRepository(DeletionRequest)
        .findOneOrFail({ where: { entityId: materialToDeleteId } });
      requestIdToDelete = req.id;
      expect(requestIdToDelete).toBeDefined();
    });

    it('Admin puede ver solicitudes pendientes', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/materials/requests/pending')
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);

      const body = res.body as GenericDataResponse<DeletionRequestResponse[]>;
      expect(body.data.some((r) => r.id === requestIdToDelete)).toBe(true);
    });
  });

  describe('Fase 2: Aprobación y Rechazo', () => {
    it('Admin APRUEBA solicitud', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/admin/materials/requests/${requestIdToDelete}/review`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ action: 'APPROVE', adminComment: 'OK' })
        .expect(200);

      const mat = await dataSource.getRepository(Material).findOneOrFail({
        where: { id: materialToDeleteId },
        relations: { materialStatus: true },
      });
      expect(mat.materialStatus.code).toBe('ARCHIVED');
    });
  });

  describe('Fase 3: Borrado Físico', () => {
    it('SuperAdmin puede borrar material ARCHIVADO', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/admin/materials/${materialToDeleteId}/hard-delete`)
        .set('Authorization', `Bearer ${superAdmin.token}`)
        .expect(200);

      const mat = await dataSource
        .getRepository(Material)
        .findOne({ where: { id: materialToDeleteId } });
      expect(mat).toBeNull();
    });
  });
});
