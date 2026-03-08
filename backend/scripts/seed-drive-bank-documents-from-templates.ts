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

type GoogleRequestMethod = 'GET' | 'POST' | 'PATCH';
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

type DriveFile = {
  id?: string;
  name?: string;
  mimeType?: string;
  size?: string;
  webViewLink?: string;
};

type DriveFileLookupResponse = {
  id?: string;
  mimeType?: string;
  trashed?: boolean;
};

type DriveFileListResponse = {
  files?: Array<DriveFile>;
};

const BANK_FOLDER_NAME = 'bank_documents';
const BANK_GROUP_FOLDERS = [
  'Practicas Calificadas',
  'Practicas Dirigidas',
  'Examenes',
];
const TEMPLATE_DOCUMENTS_FOLDER_CANDIDATES = [
  'documents',
  'documentos',
  'documento',
  'docs',
];
const TEMPLATE_SCAN_MAX_DEPTH = 4;
const TEMPLATE_FILES_REQUIRED = 3;

function normalizeId(raw: string | number): string {
  const normalized = String(raw || '').trim();
  if (!/^\d+$/.test(normalized)) {
    throw new Error(`ID invalido detectado: "${raw}"`);
  }
  return normalized;
}

function normalizeDriveFileName(name: string): string {
  return String(name || '')
    .replace(/[\r\n\t]/g, ' ')
    .trim();
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

async function findFolderInParentByName(
  client: GoogleRequestClient,
  parentFolderId: string,
  folderName: string,
): Promise<string | null> {
  const escapedName = folderName.replace(/'/g, "\\'");
  const query = `'${parentFolderId}' in parents and name='${escapedName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const response = await client.request<DriveFileListResponse>({
    url: `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType)&pageSize=2&supportsAllDrives=true&includeItemsFromAllDrives=true`,
    method: 'GET',
  });

  const files = response.data.files || [];
  if (files.length === 0) {
    return null;
  }
  if (files.length > 1) {
    throw new Error(
      `Ambiguedad: mas de una carpeta con nombre ${folderName} bajo ${parentFolderId}`,
    );
  }
  return String(files[0].id || '').trim() || null;
}

async function listChildFolders(
  client: GoogleRequestClient,
  parentFolderId: string,
): Promise<Array<{ id: string; name: string }>> {
  const query = `'${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const response = await client.request<DriveFileListResponse>({
    url: `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)&pageSize=200&supportsAllDrives=true&includeItemsFromAllDrives=true`,
    method: 'GET',
  });
  const files = response.data.files || [];
  return files
    .map((f) => ({
      id: String(f.id || '').trim(),
      name: normalizeDriveFileName(String(f.name || '')),
    }))
    .filter((f) => !!f.id && !!f.name)
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function listFilesInFolder(
  client: GoogleRequestClient,
  folderId: string,
): Promise<Array<{ id: string; name: string; mimeType: string }>> {
  const query = `'${folderId}' in parents and mimeType!='application/vnd.google-apps.folder' and trashed=false`;
  const response = await client.request<DriveFileListResponse>({
    url: `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType)&pageSize=200&supportsAllDrives=true&includeItemsFromAllDrives=true`,
    method: 'GET',
  });
  const files = response.data.files || [];
  return files
    .map((f) => ({
      id: String(f.id || '').trim(),
      name: normalizeDriveFileName(String(f.name || '')),
      mimeType: String(f.mimeType || '').trim(),
    }))
    .filter((f) => !!f.id && !!f.name && !!f.mimeType)
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function collectTemplateFilesRecursively(
  client: GoogleRequestClient,
  rootFolderId: string,
  maxDepth: number,
): Promise<Array<{ id: string; name: string; mimeType: string }>> {
  const queue: Array<{ folderId: string; depth: number }> = [
    { folderId: rootFolderId, depth: 0 },
  ];
  const visited = new Set<string>();
  const collected: Array<{ id: string; name: string; mimeType: string }> = [];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      break;
    }
    if (visited.has(current.folderId)) {
      continue;
    }
    visited.add(current.folderId);

    const files = await listFilesInFolder(client, current.folderId);
    collected.push(
      ...files.filter((file) => !file.mimeType.toLowerCase().startsWith('video/')),
    );

    if (current.depth >= maxDepth) {
      continue;
    }

    const childFolders = await listChildFolders(client, current.folderId);
    for (const child of childFolders) {
      if (!visited.has(child.id)) {
        queue.push({ folderId: child.id, depth: current.depth + 1 });
      }
    }
  }

  return collected.sort((a, b) => a.name.localeCompare(b.name));
}

async function findFileInFolderByName(
  client: GoogleRequestClient,
  folderId: string,
  fileName: string,
): Promise<string | null> {
  const escapedName = fileName.replace(/'/g, "\\'");
  const query = `'${folderId}' in parents and name='${escapedName}' and trashed=false`;
  const response = await client.request<DriveFileListResponse>({
    url: `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType)&pageSize=2&supportsAllDrives=true&includeItemsFromAllDrives=true`,
    method: 'GET',
  });
  const files = response.data.files || [];
  if (files.length === 0) {
    return null;
  }
  if (files.length > 1) {
    throw new Error(
      `Ambiguedad: mas de un archivo con nombre ${fileName} en folder ${folderId}`,
    );
  }
  return String(files[0].id || '').trim() || null;
}

async function copyFileToFolderKeepingName(
  client: GoogleRequestClient,
  sourceFileId: string,
  targetFolderId: string,
  targetName: string,
): Promise<string> {
  const existingId = await findFileInFolderByName(client, targetFolderId, targetName);
  if (existingId) {
    return existingId;
  }

  const response = await client.request<DriveFile>({
    url: `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(sourceFileId)}/copy?supportsAllDrives=true&fields=id,name,mimeType`,
    method: 'POST',
    data: {
      name: targetName,
      parents: [targetFolderId],
    },
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const id = String(response.data.id || '').trim();
  if (!id) {
    throw new Error(
      `Copia incompleta para source=${sourceFileId}, folder=${targetFolderId}`,
    );
  }
  return id;
}

async function enforceViewerRestrictionOnFile(
  client: GoogleRequestClient,
  fileId: string,
): Promise<void> {
  try {
    await client.request({
      url: `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?supportsAllDrives=true`,
      method: 'PATCH',
      data: {
        copyRequiresWriterPermission: true,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(
      `[seed-drive-bank-documents-from-templates] no se pudo aplicar restriccion de copia en fileId=${fileId}: ${message}`,
    );
  }
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
      throw new Error('No hay course_cycle activos');
    }

    const { client: driveClient, rootFolderId } =
      await getDriveClient(configService);
    await validateRootFolder(driveClient, rootFolderId);

    const templatesFolderId = await findFolderInParentByName(
      driveClient,
      rootFolderId,
      'templates',
    );
    if (!templatesFolderId) {
      throw new Error('No existe carpeta templates bajo root');
    }
    let templateDocumentsFolderId: string | null = null;
    for (const candidate of TEMPLATE_DOCUMENTS_FOLDER_CANDIDATES) {
      const found = await findFolderInParentByName(
        driveClient,
        templatesFolderId,
        candidate,
      );
      if (found) {
        templateDocumentsFolderId = found;
        break;
      }
    }
    if (!templateDocumentsFolderId) {
      templateDocumentsFolderId = templatesFolderId;
    }

    const directTemplateFiles = await listFilesInFolder(
      driveClient,
      templateDocumentsFolderId,
    );
    const templateFiles =
      directTemplateFiles.length >= TEMPLATE_FILES_REQUIRED
        ? directTemplateFiles
        : await collectTemplateFilesRecursively(
            driveClient,
            templatesFolderId,
            TEMPLATE_SCAN_MAX_DEPTH,
          );
    if (templateFiles.length < TEMPLATE_FILES_REQUIRED) {
      throw new Error(
        `templates no tiene suficientes documentos (${templateFiles.length}); se requieren al menos ${TEMPLATE_FILES_REQUIRED}`,
      );
    }
    const selectedTemplateFiles = templateFiles.slice(0, TEMPLATE_FILES_REQUIRED);

    const courseCyclesParentFolderId = await findFolderInParentByName(
      driveClient,
      rootFolderId,
      MEDIA_ACCESS_DRIVE_FOLDERS.COURSE_CYCLES_PARENT,
    );
    if (!courseCyclesParentFolderId) {
      throw new Error(
        `No existe carpeta ${MEDIA_ACCESS_DRIVE_FOLDERS.COURSE_CYCLES_PARENT} en root`,
      );
    }

    let totalCopiesEnsured = 0;
    const details: Array<{
      courseCycleId: string;
      courseCode: string;
      bankLeafFolders: number;
      copiesEnsured: number;
    }> = [];

    for (const cycle of cycles) {
      const courseCycleId = normalizeId(cycle.courseCycleId);
      const cycleFolderId = await findFolderInParentByName(
        driveClient,
        courseCyclesParentFolderId,
        normalizeToken(String(cycle.cycleCode || '')),
      );
      if (!cycleFolderId) {
        throw new Error(
          `No existe carpeta de ciclo ${String(cycle.cycleCode || '').trim()}`,
        );
      }
      const scopeFolderId = await findFolderInParentByName(
        driveClient,
        cycleFolderId,
        `cc_${courseCycleId}_${normalizeToken(String(cycle.courseCode || ''))}`,
      );
      if (!scopeFolderId) {
        throw new Error(`No existe carpeta cc_${courseCycleId} para curso/ciclo`);
      }
      const bankFolderId = await findFolderInParentByName(
        driveClient,
        scopeFolderId,
        BANK_FOLDER_NAME,
      );
      if (!bankFolderId) {
        throw new Error(
          `No existe ${BANK_FOLDER_NAME} para cc_${courseCycleId}`,
        );
      }

      const bankTypeFolders = await listChildFolders(driveClient, bankFolderId);
      const selectedTypeFolders = bankTypeFolders.filter((f) =>
        BANK_GROUP_FOLDERS.includes(f.name),
      );

      let courseCopiesEnsured = 0;
      let bankLeafFolders = 0;
      for (const typeFolder of selectedTypeFolders) {
        const leafFolders = await listChildFolders(driveClient, typeFolder.id);
        for (const leafFolder of leafFolders) {
          bankLeafFolders += 1;
          for (const templateFile of selectedTemplateFiles) {
            const copiedFileId = await copyFileToFolderKeepingName(
              driveClient,
              templateFile.id,
              leafFolder.id,
              templateFile.name,
            );
            await enforceViewerRestrictionOnFile(driveClient, copiedFileId);
            courseCopiesEnsured += 1;
          }
        }
      }

      totalCopiesEnsured += courseCopiesEnsured;
      details.push({
        courseCycleId,
        courseCode: String(cycle.courseCode || ''),
        bankLeafFolders,
        copiesEnsured: courseCopiesEnsured,
      });
    }

    console.log(
      JSON.stringify(
        {
          selectedTemplateFiles,
          processedCourseCycles: cycles.length,
          totalCopiesEnsured,
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
