import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@src/app.module';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { GoogleAuth } from 'google-auth-library';
import { WorkspaceGroupsService } from '@modules/media-access/application/workspace-groups.service';
import { DriveScopeProvisioningService } from '@modules/media-access/application/drive-scope-provisioning.service';
import { technicalSettings } from '@src/config/technical-settings';
import { ROLE_CODES } from '@common/constants/role-codes.constants';
import { MEDIA_ACCESS_DRIVE_FOLDERS } from '@modules/media-access/domain/media-access.constants';

type CourseCycleRow = {
  courseCycleId: string | number;
  courseCode: string;
  cycleCode: string;
};

type EmailRow = { email: string | null };

type GoogleRequestMethod = 'GET' | 'POST';
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

type DriveFileLookupResponse = {
  id?: string;
  mimeType?: string;
  trashed?: boolean;
};

type DriveFileListResponse = {
  files?: Array<{ id: string }>;
};

type DriveCreateResponse = {
  id?: string;
};

const SIMPLE_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

function normalizeId(raw: string | number): string {
  const normalized = String(raw || '').trim();
  if (!/^\d+$/.test(normalized)) {
    throw new Error(`ID invalido detectado: "${raw}"`);
  }
  return normalized;
}

function normalizeToken(raw: string): string {
  const normalized = String(raw || '').trim();
  if (!normalized) {
    throw new Error('Token vacio para nombre de carpeta');
  }
  return normalized.replace(/[^A-Za-z0-9_-]/g, '-').replace(/-+/g, '-');
}

function isValidEmail(email: string): boolean {
  return SIMPLE_EMAIL_REGEX.test(String(email || '').trim());
}

function buildCourseCycleViewerGroupEmail(
  courseCycleId: string,
  workspaceDomain: string,
): string {
  return `cc-${courseCycleId}-viewers@${workspaceDomain}`;
}

async function sleep(ms: number): Promise<void> {
  if (ms <= 0) return;
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function getDriveClient(configService: ConfigService): Promise<{
  client: GoogleRequestClient;
  rootFolderId: string;
}> {
  const keyFile = String(
    configService.get<string>('GOOGLE_APPLICATION_CREDENTIALS', '') || '',
  ).trim();
  const rootFolderId = String(
    configService.get<string>('GOOGLE_DRIVE_ROOT_FOLDER_ID', '') || '',
  ).trim();

  if (!keyFile) {
    throw new Error('Falta GOOGLE_APPLICATION_CREDENTIALS');
  }
  if (!rootFolderId) {
    throw new Error('Falta GOOGLE_DRIVE_ROOT_FOLDER_ID');
  }

  const auth = new GoogleAuth({
    keyFile,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  const client = (await auth.getClient()) as unknown as GoogleRequestClient;
  if (typeof client.request !== 'function') {
    throw new Error('Cliente Google Drive invalido');
  }

  return { client, rootFolderId };
}

async function validateRootFolder(
  client: GoogleRequestClient,
  rootFolderId: string,
): Promise<void> {
  const response = await client.request<DriveFileLookupResponse>({
    url: `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(rootFolderId)}?fields=id,mimeType,trashed&supportsAllDrives=true`,
    method: 'GET',
  });
  const root = response.data;
  if (!root.id) {
    throw new Error('GOOGLE_DRIVE_ROOT_FOLDER_ID invalido: no existe');
  }
  if (root.mimeType !== 'application/vnd.google-apps.folder') {
    throw new Error('GOOGLE_DRIVE_ROOT_FOLDER_ID debe apuntar a una carpeta');
  }
  if (root.trashed) {
    throw new Error('GOOGLE_DRIVE_ROOT_FOLDER_ID apunta a carpeta en papelera');
  }
}

async function findOrCreateFolderUnderParent(
  client: GoogleRequestClient,
  parentFolderId: string,
  folderName: string,
): Promise<string> {
  const query = `'${parentFolderId}' in parents and name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const listResponse = await client.request<DriveFileListResponse>({
    url: `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)&pageSize=2&supportsAllDrives=true&includeItemsFromAllDrives=true`,
    method: 'GET',
  });

  const files = listResponse.data.files || [];
  if (files.length === 1) {
    return files[0].id;
  }
  if (files.length > 1) {
    throw new Error(
      `Nombre ambiguo detectado bajo el mismo padre: "${folderName}"`,
    );
  }

  const createResponse = await client.request<DriveCreateResponse>({
    url: 'https://www.googleapis.com/drive/v3/files?supportsAllDrives=true',
    method: 'POST',
    data: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId],
    },
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const createdId = String(createResponse.data.id || '').trim();
  if (!createdId) {
    throw new Error(
      `Google Drive no devolvio id para la carpeta "${folderName}"`,
    );
  }

  return createdId;
}

async function getActiveCourseCycles(dataSource: DataSource): Promise<CourseCycleRow[]> {
  const rows = (await dataSource.query(
    `
      SELECT
        cc.id AS courseCycleId,
        c.code AS courseCode,
        ac.code AS cycleCode
      FROM course_cycle cc
      INNER JOIN course c ON c.id = cc.course_id
      INNER JOIN academic_cycle ac ON ac.id = cc.academic_cycle_id
      WHERE cc.academic_cycle_id = COALESCE(
        (
          SELECT CAST(ss.setting_value AS UNSIGNED)
          FROM system_setting ss
          WHERE ss.setting_key = 'ACTIVE_CYCLE_ID'
          LIMIT 1
        ),
        (
          SELECT ac2.id
          FROM academic_cycle ac2
          ORDER BY ac2.id DESC
          LIMIT 1
        )
      )
      ORDER BY cc.id ASC
    `,
  )) as CourseCycleRow[];

  return rows;
}

async function getEligibleViewerEmails(
  dataSource: DataSource,
  courseCycleId: string,
): Promise<string[]> {
  const rows = (await dataSource.query(
    `
      SELECT DISTINCT LOWER(TRIM(source.email)) AS email
      FROM (
        SELECT u.email
        FROM enrollment e
        INNER JOIN user u ON u.id = e.user_id
        WHERE e.course_cycle_id = ?
          AND e.cancelled_at IS NULL
          AND u.is_active = 1

        UNION ALL

        SELECT u.email
        FROM course_cycle_professor ccp
        INNER JOIN user u ON u.id = ccp.professor_user_id
        WHERE ccp.course_cycle_id = ?
          AND ccp.revoked_at IS NULL
          AND u.is_active = 1
      ) source
      WHERE source.email IS NOT NULL
        AND TRIM(source.email) <> ''
    `,
    [courseCycleId, courseCycleId],
  )) as EmailRow[];

  return rows
    .map((row) => String(row.email || '').trim().toLowerCase())
    .filter((email) => !!email);
}

async function ensureStaffGroupMembers(
  dataSource: DataSource,
  workspaceGroupsService: WorkspaceGroupsService,
  staffGroupEmail: string,
  mutationDelayMs: number,
): Promise<number> {
  const rows = (await dataSource.query(
    `
      SELECT DISTINCT LOWER(TRIM(u.email)) AS email
      FROM user u
      INNER JOIN user_role ur ON ur.user_id = u.id
      INNER JOIN role r ON r.id = ur.role_id
      WHERE u.is_active = 1
        AND r.code IN (?, ?)
        AND u.email IS NOT NULL
        AND TRIM(u.email) <> ''
      ORDER BY u.id ASC
    `,
    [ROLE_CODES.ADMIN, ROLE_CODES.SUPER_ADMIN],
  )) as EmailRow[];

  let added = 0;
  for (const row of rows) {
    const email = String(row.email || '').trim().toLowerCase();
    if (!email || !isValidEmail(email)) {
      continue;
    }
    try {
      await workspaceGroupsService.ensureMemberInGroup({
        groupEmail: staffGroupEmail,
        memberEmail: email,
      });
      added += 1;
      await sleep(mutationDelayMs);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(
        `[WARN] no se pudo agregar staff member ${email} en ${staffGroupEmail}: ${message}`,
      );
    }
  }
  return added;
}

async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const dataSource = app.get(DataSource);
    const configService = app.get(ConfigService);
    const workspaceGroupsService = app.get(WorkspaceGroupsService);
    const driveScopeProvisioningService = app.get(DriveScopeProvisioningService);

    const workspaceDomain = String(
      configService.get<string>('GOOGLE_WORKSPACE_GROUP_DOMAIN', '') || '',
    )
      .trim()
      .toLowerCase();
    if (!workspaceDomain) {
      throw new Error('Falta GOOGLE_WORKSPACE_GROUP_DOMAIN');
    }

    const staffGroupEmail = String(
      technicalSettings.mediaAccess.staffViewersGroupEmail || '',
    )
      .trim()
      .toLowerCase();

    const mutationDelayMs = Math.max(
      0,
      Number(technicalSettings.mediaAccess.reconciliationMutationDelayMs || 0),
    );

    const cycles = await getActiveCourseCycles(dataSource);
    if (!cycles.length) {
      console.log('No se encontraron course_cycle del ciclo activo.');
      return;
    }

    const { client: driveClient, rootFolderId } =
      await getDriveClient(configService);
    await validateRootFolder(driveClient, rootFolderId);
    const courseCyclesParentFolderId = await findOrCreateFolderUnderParent(
      driveClient,
      rootFolderId,
      MEDIA_ACCESS_DRIVE_FOLDERS.COURSE_CYCLES_PARENT,
    );

    if (staffGroupEmail) {
      await workspaceGroupsService.findOrCreateGroup({
        email: staffGroupEmail,
        name: 'Staff Viewers',
        description: 'Acceso global de lectura para ADMIN y SUPER_ADMIN',
      });

      const syncedCount = await ensureStaffGroupMembers(
        dataSource,
        workspaceGroupsService,
        staffGroupEmail,
        mutationDelayMs,
      );
      console.log(
        `[STAFF] miembros sincronizados en ${staffGroupEmail}: ${syncedCount}`,
      );
    }

    let ok = 0;
    let failed = 0;
    const failures: string[] = [];
    console.log(`Course cycles detectados: ${cycles.length}`);

    for (const cycle of cycles) {
      const courseCycleId = normalizeId(cycle.courseCycleId);
      try {
        const viewerGroupEmail = buildCourseCycleViewerGroupEmail(
          courseCycleId,
          workspaceDomain,
        );
        const group = await workspaceGroupsService.findOrCreateGroup({
          email: viewerGroupEmail,
          name: `CC ${courseCycleId} Viewers`,
          description: `Lectura de materiales intro de cc_${courseCycleId}`,
        });

        const cycleFolderId = await findOrCreateFolderUnderParent(
          driveClient,
          courseCyclesParentFolderId,
          normalizeToken(String(cycle.cycleCode || '')),
        );
        const scopeFolderId = await findOrCreateFolderUnderParent(
          driveClient,
          cycleFolderId,
          `cc_${courseCycleId}_${normalizeToken(String(cycle.courseCode || ''))}`,
        );
        const introFolderId = await findOrCreateFolderUnderParent(
          driveClient,
          scopeFolderId,
          MEDIA_ACCESS_DRIVE_FOLDERS.COURSE_CYCLE_INTRO_VIDEO,
        );

        await driveScopeProvisioningService.ensureGroupReaderPermission(
          scopeFolderId,
          group.email,
        );

        if (staffGroupEmail) {
          await driveScopeProvisioningService.ensureGroupReaderPermission(
            scopeFolderId,
            staffGroupEmail,
          );
        }

        const eligibleEmails = await getEligibleViewerEmails(
          dataSource,
          courseCycleId,
        );
        let syncedMembers = 0;
        for (const memberEmail of eligibleEmails) {
          if (!isValidEmail(memberEmail)) {
            console.warn(
              `[WARN] email invalido omitido para cc=${courseCycleId}: ${memberEmail}`,
            );
            continue;
          }
          try {
            await workspaceGroupsService.ensureMemberInGroup({
              groupEmail: group.email,
              memberEmail,
            });
            syncedMembers += 1;
            await sleep(mutationDelayMs);
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn(
              `[WARN] no se pudo agregar member ${memberEmail} a ${group.email}: ${message}`,
            );
          }
        }

        ok += 1;
        console.log(
          `[OK] cc=${courseCycleId} cycle=${cycle.cycleCode} course=${cycle.courseCode} group=${group.email} scope=${scopeFolderId} intro=${introFolderId} membersSynced=${syncedMembers} membersCandidate=${eligibleEmails.length}`,
        );
      } catch (error) {
        failed += 1;
        const message = error instanceof Error ? error.message : String(error);
        const failure = `[ERROR] cc=${courseCycleId} -> ${message}`;
        failures.push(failure);
        console.error(failure);
      }
    }

    console.log('----------------------------------------');
    console.log(`Provision intro scopes completada. OK=${ok} FAIL=${failed}`);
    if (failures.length > 0) {
      console.log('Errores detectados:');
      for (const failure of failures) {
        console.log(failure);
      }
      process.exitCode = 1;
    }
  } finally {
    await app.close();
  }
}

void main();
