import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@src/app.module';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { GoogleAuth } from 'google-auth-library';
import { MEDIA_ACCESS_DRIVE_FOLDERS } from '@modules/media-access/domain/media-access.constants';

type CourseCycleRow = {
  courseCycleId: string | number;
  courseCode: string;
  cycleCode: string;
};

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

const BANK_FOLDER_NAME = 'bank_documents';
const BANK_GROUPS = [
  { folderName: 'Practicas Calificadas', prefix: 'PC', count: 4 },
  { folderName: 'Practicas Dirigidas', prefix: 'PD', count: 4 },
  { folderName: 'Examenes', prefix: 'EX', count: 3 },
] as const;

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

async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const dataSource = app.get(DataSource);
    const configService = app.get(ConfigService);

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

    const details: Array<{
      courseCycleId: string;
      courseCode: string;
      cycleCode: string;
      scopeFolderId: string;
      bankFolderId: string;
    }> = [];

    for (const cycle of cycles) {
      const courseCycleId = normalizeId(cycle.courseCycleId);
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
      const bankFolderId = await findOrCreateFolderUnderParent(
        driveClient,
        scopeFolderId,
        BANK_FOLDER_NAME,
      );

      for (const group of BANK_GROUPS) {
        const groupFolderId = await findOrCreateFolderUnderParent(
          driveClient,
          bankFolderId,
          group.folderName,
        );

        for (let i = 1; i <= group.count; i += 1) {
          await findOrCreateFolderUnderParent(
            driveClient,
            groupFolderId,
            `${group.prefix}${i}`,
          );
        }
      }

      details.push({
        courseCycleId,
        courseCode: String(cycle.courseCode || ''),
        cycleCode: String(cycle.cycleCode || ''),
        scopeFolderId,
        bankFolderId,
      });
    }

    console.log(
      JSON.stringify(
        {
          processedCourseCycles: cycles.length,
          bankFolderName: BANK_FOLDER_NAME,
          groups: BANK_GROUPS,
          details,
        },
        null,
        2,
      ),
    );
  } finally {
    await app.close();
  }
}

void main();
