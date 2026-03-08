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
import { StorageService } from '@infrastructure/storage/storage.service';
import { GoogleAuth, JWT } from 'google-auth-library';
import * as fs from 'fs';

const runLive = process.env.RUN_REAL_DRIVE_E2E === '1';
const describeLive = runLive ? describe : describe.skip;
jest.setTimeout(300000);

type GoogleRequestMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
type GoogleRequest = {
  url: string;
  method: GoogleRequestMethod;
  data?: unknown;
  headers?: Record<string, string>;
};
type GoogleResponse<T> = { data: T };
interface GoogleRequestClient {
  request<T = unknown>(request: GoogleRequest): Promise<GoogleResponse<T>>;
}

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
  let storageService: StorageService;

  let admin: { user: User; token: string };
  let superAdmin: { user: User; token: string };
  let professor: { user: User; token: string };
  let courseCycle: CourseCycle;
  let evaluation: Evaluation;
  let folderId: string;

  let materialAId: string;
  let materialBId: string;
  let sharedFileResourceId: string;
  let driveDocumentsFolderId: string;
  let qaRunFolderId: string;
  let tempViewerGroupEmail: string;
  let tempViewerGroupId: string | null = null;

  const createdMaterials = new Set<string>();
  const runId = `drive-live-${Date.now()}`;
  const runScopedPdfPayload = `%PDF-1.4 live-content-base ${runId}`;
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  function getRequiredEnv(name: string): string {
    const value = String(process.env[name] || '').trim();
    if (!value) {
      throw new Error(`Falta ${name} para live E2E`);
    }
    return value;
  }

  function getWorkspaceDomainFromAdminEmail(adminEmail: string): string {
    const parts = adminEmail.trim().toLowerCase().split('@');
    if (parts.length !== 2 || !parts[1]) {
      throw new Error('GOOGLE_WORKSPACE_ADMIN_EMAIL invalido');
    }
    return parts[1];
  }

  async function getDriveClient(): Promise<GoogleRequestClient> {
    const keyFile = getRequiredEnv('GOOGLE_APPLICATION_CREDENTIALS');
    const auth = new GoogleAuth({
      keyFile,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    const client = await auth.getClient();
    return client as unknown as GoogleRequestClient;
  }

  async function getWorkspaceClient(): Promise<JWT> {
    const keyFile = getRequiredEnv('GOOGLE_APPLICATION_CREDENTIALS');
    const adminEmail = getRequiredEnv('GOOGLE_WORKSPACE_ADMIN_EMAIL');
    const raw = await fs.promises.readFile(keyFile, 'utf8');
    const parsed = JSON.parse(raw) as {
      client_email?: string;
      private_key?: string;
    };
    if (!parsed.client_email || !parsed.private_key) {
      throw new Error('Credenciales de service account invalidas');
    }
    const client = new JWT({
      email: parsed.client_email,
      key: parsed.private_key,
      scopes: [
        'https://www.googleapis.com/auth/admin.directory.group',
        'https://www.googleapis.com/auth/admin.directory.group.member',
      ],
      subject: adminEmail,
    });
    await client.authorize();
    return client;
  }

  async function findOrCreateFolderUnderParent(
    client: GoogleRequestClient,
    parentFolderId: string,
    folderName: string,
  ): Promise<string> {
    const query = `'${parentFolderId}' in parents and name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const search = await client.request<{
      files?: Array<{ id: string }>;
    }>({
      url: `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)&pageSize=2&supportsAllDrives=true&includeItemsFromAllDrives=true`,
      method: 'GET',
    });
    const files = search.data.files || [];
    if (files.length === 1) {
      return files[0].id;
    }
    if (files.length > 1) {
      throw new Error(`Nombre de carpeta ambiguo: ${folderName}`);
    }

    const created = await client.request<{ id?: string }>({
      url: 'https://www.googleapis.com/drive/v3/files?supportsAllDrives=true',
      method: 'POST',
      data: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentFolderId],
      },
      headers: { 'Content-Type': 'application/json' },
    });
    const id = String(created.data.id || '').trim();
    if (!id) {
      throw new Error(`Google Drive no devolvio id para carpeta ${folderName}`);
    }
    return id;
  }

  async function ensureGroupReaderPermissionOnFolder(input: {
    driveClient: GoogleRequestClient;
    folderId: string;
    groupEmail: string;
  }): Promise<void> {
    const normalizedEmail = input.groupEmail.trim().toLowerCase();
    const list = await input.driveClient.request<{
      permissions?: Array<{
        type?: string;
        emailAddress?: string;
      }>;
    }>({
      url: `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(input.folderId)}/permissions?fields=permissions(id,type,emailAddress)&supportsAllDrives=true`,
      method: 'GET',
    });
    const existing = (list.data.permissions || []).find(
      (permission) =>
        permission.type === 'group' &&
        String(permission.emailAddress || '')
          .trim()
          .toLowerCase() === normalizedEmail,
    );
    if (existing) {
      return;
    }

    await input.driveClient.request({
      url: `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(input.folderId)}/permissions?supportsAllDrives=true&sendNotificationEmail=false`,
      method: 'POST',
      data: {
        type: 'group',
        role: 'reader',
        emailAddress: normalizedEmail,
      },
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async function findOrCreateWorkspaceGroup(
    workspaceClient: JWT,
    groupEmail: string,
    groupName: string,
    description: string,
  ): Promise<{ id: string; email: string }> {
    const normalizedEmail = groupEmail.trim().toLowerCase();
    try {
      const existing = await workspaceClient.request<{
        id?: string;
        email?: string;
      }>({
        url: `https://admin.googleapis.com/admin/directory/v1/groups/${encodeURIComponent(normalizedEmail)}`,
        method: 'GET',
      });
      const id = String(existing.data.id || '').trim();
      const email = String(existing.data.email || '')
        .trim()
        .toLowerCase();
      if (id && email) {
        return { id, email };
      }
    } catch (error) {
      const maybeError = error as {
        code?: number;
        response?: { status?: number };
      };
      const status = maybeError.response?.status ?? maybeError.code;
      if (status !== 404) {
        throw error;
      }
    }

    const created = await workspaceClient.request<{
      id?: string;
      email?: string;
    }>({
      url: 'https://admin.googleapis.com/admin/directory/v1/groups',
      method: 'POST',
      data: {
        email: normalizedEmail,
        name: groupName,
        description,
      },
      headers: { 'Content-Type': 'application/json' },
    });
    const id = String(created.data.id || '').trim();
    const email = String(created.data.email || '')
      .trim()
      .toLowerCase();
    if (!id || !email) {
      throw new Error('Google Workspace no devolvio grupo temporal valido');
    }
    return { id, email };
  }

  async function deleteWorkspaceGroupIfExists(
    workspaceClient: JWT,
    groupEmail: string,
  ): Promise<void> {
    const normalizedEmail = groupEmail.trim().toLowerCase();
    try {
      await workspaceClient.request({
        url: `https://admin.googleapis.com/admin/directory/v1/groups/${encodeURIComponent(normalizedEmail)}`,
        method: 'DELETE',
      });
    } catch (error) {
      const maybeError = error as {
        code?: number;
        response?: { status?: number };
      };
      const status = maybeError.response?.status ?? maybeError.code;
      if (status !== 404) {
        throw error;
      }
    }
  }

  async function deleteDriveFileIfExists(
    driveClient: GoogleRequestClient,
    fileId: string,
  ): Promise<void> {
    try {
      await driveClient.request({
        url: `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?supportsAllDrives=true`,
        method: 'DELETE',
      });
    } catch (error) {
      const maybeError = error as {
        code?: number;
        response?: { status?: number };
      };
      const status = maybeError.response?.status ?? maybeError.code;
      if (status !== 404) {
        throw error;
      }
    }
  }

  async function provisionSandboxScopeForEvaluation(
    evaluationId: string,
  ): Promise<{
    scopeFolderId: string;
    documentsFolderId: string;
  }> {
    const rootFolderId = getRequiredEnv('GOOGLE_DRIVE_ROOT_FOLDER_ID');
    const adminEmail = getRequiredEnv('GOOGLE_WORKSPACE_ADMIN_EMAIL');
    const workspaceDomain = getWorkspaceDomainFromAdminEmail(adminEmail);
    const driveClient = await getDriveClient();
    const workspaceClient = await getWorkspaceClient();

    const qaParentFolderId = await findOrCreateFolderUnderParent(
      driveClient,
      rootFolderId,
      'qa_drive_live',
    );
    qaRunFolderId = await findOrCreateFolderUnderParent(
      driveClient,
      qaParentFolderId,
      `run_${runId}`,
    );

    const scopeFolderId = await findOrCreateFolderUnderParent(
      driveClient,
      qaRunFolderId,
      `ev_${evaluationId}`,
    );
    const videosFolderId = await findOrCreateFolderUnderParent(
      driveClient,
      scopeFolderId,
      'videos',
    );
    const documentsFolderId = await findOrCreateFolderUnderParent(
      driveClient,
      scopeFolderId,
      'documentos',
    );
    const archivedFolderId = await findOrCreateFolderUnderParent(
      driveClient,
      scopeFolderId,
      'archivados',
    );

    tempViewerGroupEmail = `e2e-drive-live-${runId}@${workspaceDomain}`;
    const group = await findOrCreateWorkspaceGroup(
      workspaceClient,
      tempViewerGroupEmail,
      `e2e-drive-live-${runId}`,
      `Temporary live e2e group for ${runId}`,
    );
    tempViewerGroupId = group.id;

    await ensureGroupReaderPermissionOnFolder({
      driveClient,
      folderId: scopeFolderId,
      groupEmail: group.email,
    });

    await dataSource.query(
      'DELETE FROM evaluation_drive_access WHERE evaluation_id = ?',
      [evaluationId],
    );
    await dataSource.query(
      `
      INSERT INTO evaluation_drive_access (
        evaluation_id,
        scope_key,
        drive_scope_folder_id,
        drive_videos_folder_id,
        drive_documents_folder_id,
        drive_archived_folder_id,
        viewer_group_email,
        viewer_group_id,
        is_active,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        evaluationId,
        `live_scope_${runId}`,
        scopeFolderId,
        videosFolderId,
        documentsFolderId,
        archivedFolderId,
        group.email,
        group.id,
        1,
      ],
    );

    return { scopeFolderId, documentsFolderId };
  }

  async function cleanupSandboxScopeForEvaluation(
    evaluationId: string,
  ): Promise<void> {
    const errors: string[] = [];

    try {
      await dataSource.query(
        'DELETE FROM evaluation_drive_access WHERE evaluation_id = ?',
        [evaluationId],
      );
    } catch (error) {
      errors.push(
        `No se pudo limpiar evaluation_drive_access: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    if (tempViewerGroupEmail) {
      try {
        const workspaceClient = await getWorkspaceClient();
        await deleteWorkspaceGroupIfExists(
          workspaceClient,
          tempViewerGroupEmail,
        );
      } catch (error) {
        errors.push(
          `No se pudo eliminar grupo temporal ${tempViewerGroupEmail}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    if (qaRunFolderId) {
      try {
        const driveClient = await getDriveClient();
        await deleteDriveFileIfExists(driveClient, qaRunFolderId);
      } catch (error) {
        errors.push(
          `No se pudo eliminar carpeta temporal ${qaRunFolderId}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join(' | '));
    }
  }

  async function waitForDriveDocumentsFolderId(
    evaluationId: string,
  ): Promise<string> {
    const maxAttempts = 240;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const scopeRows = (await dataSource.query(
        'SELECT drive_documents_folder_id AS driveDocumentsFolderId FROM evaluation_drive_access WHERE evaluation_id = ? LIMIT 1',
        [evaluationId],
      )) as Array<{ driveDocumentsFolderId?: string | null }>;
      const folderId = String(
        scopeRows[0]?.driveDocumentsFolderId || '',
      ).trim();
      if (folderId) {
        return folderId;
      }
      await sleep(1000);
    }

    throw new Error(
      `No existe drive_documents_folder_id para la evaluacion ${evaluationId}`,
    );
  }

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
    getRequiredEnv('GOOGLE_APPLICATION_CREDENTIALS');
    getRequiredEnv('GOOGLE_DRIVE_ROOT_FOLDER_ID');
    getRequiredEnv('GOOGLE_WORKSPACE_ADMIN_EMAIL');

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
    storageService = app.get(StorageService);
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

    await provisionSandboxScopeForEvaluation(evaluation.id);

    driveDocumentsFolderId = await waitForDriveDocumentsFolderId(evaluation.id);

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
      await cleanupSandboxScopeForEvaluation(evaluation.id);
      await app.close();
    }
  });

  it('upload real en Drive (provider GDRIVE)', async () => {
    const file = Buffer.from(runScopedPdfPayload);
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
    await expect(
      storageService.isDriveFileDirectlyInFolder(
        material.fileResource.storageKey,
        driveDocumentsFolderId,
      ),
    ).resolves.toBe(true);
  });

  it('dedup real: segundo upload reutiliza el mismo file_resource', async () => {
    const file = Buffer.from(runScopedPdfPayload);
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
      const file = Buffer.from(runScopedPdfPayload);
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
