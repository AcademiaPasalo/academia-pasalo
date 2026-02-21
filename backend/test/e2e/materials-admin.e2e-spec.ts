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
import { Readable } from 'stream';

interface GenericDataResponse<T> {
  data: T;
}

interface PaginatedMaterialsData<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

describe('E2E: Materials Admin Full Flow', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let seeder: TestSeeder;

  let professor: { user: User; token: string };
  let admin: { user: User; token: string };
  let superAdmin: { user: User; token: string };

  let folderId: string;
  let materialToDeleteId: string;
  let requestIdToApprove: string;
  let requestIdToReject: string;

  const storageMock = {
    calculateHash: jest.fn().mockResolvedValue(`hash-admin-${Date.now()}`),
    saveFile: jest.fn().mockImplementation(async (name: string) => {
      return {
        storageProvider: 'LOCAL',
        storageKey: `${Date.now()}-${Math.random().toString(16).slice(2)}-${name}`,
        storageUrl: `/fake/path/${name}`,
      };
    }),
    deleteFile: jest.fn().mockResolvedValue(undefined),
    getFileStream: jest
      .fn()
      .mockResolvedValue(Readable.from(Buffer.from('%PDF-1.4 admin'))),
    onModuleInit: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(StorageService)
      .useValue(storageMock)
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
    await dataSource.query('DELETE FROM file_version');
    await dataSource.query('DELETE FROM file_resource');
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
    await dataSource.query(
      'INSERT INTO course_cycle_professor (course_cycle_id, professor_user_id, assigned_at) VALUES (?, ?, NOW())',
      [courseCycle.id, professor.user.id],
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
    folderId = (folderRes.body as GenericDataResponse<{ id: string }>).data.id;

    const buffer = Buffer.from('%PDF-1.4 content');
    const res1 = await request(app.getHttpServer())
      .post('/api/v1/materials')
      .set('Authorization', `Bearer ${professor.token}`)
      .attach('file', buffer, 'file1.pdf')
      .field('materialFolderId', folderId)
      .field('displayName', 'Material 1')
      .expect(201);
    materialToDeleteId = (res1.body as GenericDataResponse<{ id: string }>).data
      .id;
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('professor can request deletion', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/materials/request-deletion')
      .set('Authorization', `Bearer ${professor.token}`)
      .send({
        entityType: 'material',
        entityId: materialToDeleteId,
        reason: 'Approve me',
      })
      .expect(200);

    const req = await dataSource.getRepository(DeletionRequest).findOneOrFail({
      where: { entityId: materialToDeleteId, reason: 'Approve me' },
    });
    requestIdToApprove = req.id;
  });

  it('professor can create another request for rejection scenario', async () => {
    const secondUpload = await request(app.getHttpServer())
      .post('/api/v1/materials')
      .set('Authorization', `Bearer ${professor.token}`)
      .attach('file', Buffer.from('%PDF-1.4 content 2'), 'file2.pdf')
      .field('materialFolderId', folderId)
      .field('displayName', 'Material 2')
      .expect(201);

    const secondMaterialId = (
      secondUpload.body as GenericDataResponse<{ id: string }>
    ).data.id;

    await request(app.getHttpServer())
      .post('/api/v1/materials/request-deletion')
      .set('Authorization', `Bearer ${professor.token}`)
      .send({
        entityType: 'material',
        entityId: secondMaterialId,
        reason: 'Reject me',
      })
      .expect(200);

    const req = await dataSource.getRepository(DeletionRequest).findOneOrFail({
      where: { entityId: secondMaterialId, reason: 'Reject me' },
    });
    requestIdToReject = req.id;
  });

  it('admin can list pending requests', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/admin/materials/requests/pending')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);

    const ids = (
      res.body as GenericDataResponse<Array<{ id: string }>>
    ).data.map((x) => x.id);
    expect(ids).toContain(requestIdToApprove);
    expect(ids).toContain(requestIdToReject);
  });

  it('admin can list material files with pagination and filters', async () => {
    const paged = await request(app.getHttpServer())
      .get('/api/v1/admin/materials/files?page=1&pageSize=1')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);

    const pagedData = (
      paged.body as GenericDataResponse<PaginatedMaterialsData<any>>
    ).data;
    expect(pagedData.page).toBe(1);
    expect(pagedData.pageSize).toBe(1);
    expect(pagedData.totalItems).toBeGreaterThanOrEqual(2);
    expect(pagedData.items).toHaveLength(1);
    expect(pagedData.items[0].status.code).toBeDefined();
    expect(pagedData.items[0].evaluation.courseCode).toContain('ADM101');
    expect(pagedData.items[0].file.versionNumber).toBeGreaterThanOrEqual(1);

    const filteredByStatus = await request(app.getHttpServer())
      .get('/api/v1/admin/materials/files?statusCode=ACTIVE')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
    const statusData = (
      filteredByStatus.body as GenericDataResponse<PaginatedMaterialsData<any>>
    ).data;
    expect(statusData.items.length).toBeGreaterThan(0);
    expect(statusData.items.every((item: any) => item.status.code === 'ACTIVE')).toBe(
      true,
    );

    const filteredBySearch = await request(app.getHttpServer())
      .get('/api/v1/admin/materials/files?search=Material 2')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
    const searchData = (
      filteredBySearch.body as GenericDataResponse<PaginatedMaterialsData<any>>
    ).data;
    expect(searchData.items.length).toBeGreaterThan(0);
    expect(
      searchData.items.some((item: any) => item.displayName === 'Material 2'),
    ).toBe(true);
  });

  it('non admin roles cannot list material files', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/admin/materials/files')
      .set('Authorization', `Bearer ${professor.token}`)
      .expect(403);
  });

  it('admin can reject request', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/admin/materials/requests/${requestIdToReject}/review`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ action: 'REJECT' })
      .expect(200);
  });

  it('admin can approve request and archive material', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/admin/materials/requests/${requestIdToApprove}/review`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ action: 'APPROVE' })
      .expect(200);

    const mat = await dataSource.getRepository(Material).findOneOrFail({
      where: { id: materialToDeleteId },
      relations: { materialStatus: true },
    });
    expect(mat.materialStatus.code).toBe('ARCHIVED');
  });

  it('second review of same request should fail', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/admin/materials/requests/${requestIdToApprove}/review`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ action: 'APPROVE' })
      .expect(400);
  });

  it('super admin can hard delete archived material', async () => {
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
