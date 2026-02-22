import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { AppModule } from '@src/app.module';
import { DataSource } from 'typeorm';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { TestSeeder } from './test-utils';
import { User } from '@modules/users/domain/user.entity';
import { CourseCycle } from '@modules/courses/domain/course-cycle.entity';
import { Evaluation } from '@modules/evaluations/domain/evaluation.entity';
import { Material } from '@modules/materials/domain/material.entity';
import { FileResource } from '@modules/materials/domain/file-resource.entity';
import { DeletionRequest } from '@modules/materials/domain/deletion-request.entity';
import { ROLE_CODES } from '@common/constants/role-codes.constants';
import { EVALUATION_TYPE_CODES } from '@modules/evaluations/domain/evaluation.constants';

const runLive = process.env.RUN_REAL_DRIVE_E2E === '1';
const describeLive = runLive ? describe : describe.skip;
jest.setTimeout(60000);

interface MaterialResponse {
  data: {
    id: string;
    fileResourceId: string;
  };
}

describeLive('E2E Live: Materials + Google Drive', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let seeder: TestSeeder;

  let admin: { user: User; token: string };
  let superAdmin: { user: User; token: string };
  let professor: { user: User; token: string };
  let courseCycle: CourseCycle;
  let evaluation: Evaluation;
  let folderId: string;

  let materialAId: string;
  let materialBId: string;
  let sharedFileResourceId: string;

  const createdMaterials = new Set<string>();
  const runId = `drive-live-${Date.now()}`;
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  async function requestAndHardDelete(materialId: string): Promise<void> {
    const exists = await dataSource
      .getRepository(Material)
      .findOne({ where: { id: materialId } });
    if (!exists) return;

    await request(app.getHttpServer())
      .post('/api/v1/materials/request-deletion')
      .set('Authorization', `Bearer ${professor.token}`)
      .send({
        entityType: 'material',
        entityId: materialId,
        reason: `cleanup-${runId}-${materialId}`,
      })
      .expect(200);

    const deletionRequest = await dataSource
      .getRepository(DeletionRequest)
      .findOneOrFail({
        where: { entityId: materialId },
        order: { createdAt: 'DESC' },
      });

    await request(app.getHttpServer())
      .post(`/api/v1/admin/materials/requests/${deletionRequest.id}/review`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ action: 'APPROVE' })
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/api/v1/admin/materials/${materialId}/hard-delete`)
      .set('Authorization', `Bearer ${superAdmin.token}`)
      .expect(200);
  }

  beforeAll(async () => {
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      throw new Error('Falta GOOGLE_APPLICATION_CREDENTIALS para live E2E');
    }
    if (!process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID) {
      throw new Error('Falta GOOGLE_DRIVE_ROOT_FOLDER_ID para live E2E');
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalInterceptors(new TransformInterceptor(app.get(Reflector)));
    await app.init();

    dataSource = app.get(DataSource);
    seeder = new TestSeeder(dataSource, app);
    await seeder.ensureMaterialStatuses();

    const cycle = await seeder.createCycle(
      `2026-${runId}`,
      formatDate(yesterday),
      formatDate(nextMonth),
    );
    const course = await seeder.createCourse(
      `COURSE-${runId}`,
      `Drive ${runId}`,
    );
    courseCycle = await seeder.linkCourseCycle(course.id, cycle.id);
    evaluation = await seeder.createEvaluation(
      courseCycle.id,
      EVALUATION_TYPE_CODES.PC,
      1,
      formatDate(yesterday),
      formatDate(nextMonth),
    );

    admin = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail(`admin_${runId}`),
      [ROLE_CODES.ADMIN],
    );
    superAdmin = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail(`superadmin_${runId}`),
      [ROLE_CODES.SUPER_ADMIN],
    );
    professor = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail(`prof_${runId}`),
      [ROLE_CODES.PROFESSOR],
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
        name: `root-${runId}`,
        visibleFrom: new Date().toISOString(),
      })
      .expect(201);
    folderId = folderRes.body.data.id;
  });

  afterAll(async () => {
    if (app) {
      for (const materialId of createdMaterials) {
        try {
          await requestAndHardDelete(materialId);
        } catch {
          // ignore cleanup errors
        }
      }
      await app.close();
    }
  });

  it('upload real en Drive (provider GDRIVE)', async () => {
    const file = Buffer.from('%PDF-1.4 live-content-base');
    const res = await request(app.getHttpServer())
      .post('/api/v1/materials')
      .set('Authorization', `Bearer ${professor.token}`)
      .attach('file', file, `${runId}-base.pdf`)
      .field('materialFolderId', folderId)
      .field('displayName', `${runId} Base`)
      .expect(201);

    const body = res.body as MaterialResponse;
    materialAId = body.data.id;
    createdMaterials.add(materialAId);

    const material = await dataSource.getRepository(Material).findOneOrFail({
      where: { id: materialAId },
      relations: { fileResource: true },
    });
    expect(material.fileResource.storageProvider).toBe('GDRIVE');
    expect(material.fileResource.storageKey).toBeTruthy();
  });

  it('dedup real: segundo upload reutiliza el mismo file_resource', async () => {
    const file = Buffer.from('%PDF-1.4 live-content-base');
    const res = await request(app.getHttpServer())
      .post('/api/v1/materials')
      .set('Authorization', `Bearer ${professor.token}`)
      .attach('file', file, `${runId}-dup.pdf`)
      .field('materialFolderId', folderId)
      .field('displayName', `${runId} Duplicate`)
      .expect(201);

    const body = res.body as MaterialResponse;
    materialBId = body.data.id;
    createdMaterials.add(materialBId);

    const matA = await dataSource.getRepository(Material).findOneOrFail({
      where: { id: materialAId },
    });
    const matB = await dataSource.getRepository(Material).findOneOrFail({
      where: { id: materialBId },
    });
    sharedFileResourceId = matA.fileResourceId;
    expect(matB.fileResourceId).toBe(sharedFileResourceId);
  });

  it('versionado real: agrega 3 versiones y termina en version 4', async () => {
    for (let v = 2; v <= 4; v++) {
      const file = Buffer.from('%PDF-1.4 live-content-base');
      await request(app.getHttpServer())
        .post(`/api/v1/materials/${materialBId}/versions`)
        .set('Authorization', `Bearer ${professor.token}`)
        .attach('file', file, `${runId}-v${v}.pdf`)
        .expect(201);
    }

    const matB = await dataSource.getRepository(Material).findOneOrFail({
      where: { id: materialBId },
      relations: { fileVersion: true },
    });
    expect(matB.fileVersion.versionNumber).toBe(4);
  });

  it('hard-delete de uno no rompe el recurso compartido del otro', async () => {
    await requestAndHardDelete(materialAId);
    createdMaterials.delete(materialAId);

    await request(app.getHttpServer())
      .get(`/api/v1/materials/${materialBId}/download`)
      .set('Authorization', `Bearer ${professor.token}`)
      .expect(200);

    const resource = await dataSource.getRepository(FileResource).findOne({
      where: { id: sharedFileResourceId },
    });
    expect(resource).not.toBeNull();
  });
});
