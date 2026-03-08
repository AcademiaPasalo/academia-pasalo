import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@src/app.module';
import { DataSource } from 'typeorm';
import { GoogleAuth } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { extractDriveFileIdFromUrl } from '@modules/media-access/domain/media-access-url.util';
import { STORAGE_PROVIDER_CODES } from '@modules/materials/domain/material.constants';

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

type DriveFile = {
  id?: string;
  name?: string;
  mimeType?: string;
  size?: string;
  webViewLink?: string;
};

type DriveSearchResponse = {
  files?: DriveFile[];
};

type EvaluationScopeRow = {
  evaluationId: string | number;
  documentsFolderId: string | null;
};

function normalizeToFileId(raw: string): string {
  const trimmed = String(raw || '').trim();
  if (!trimmed) {
    throw new Error('Falta fileId o URL de Drive');
  }
  const fromUrl = extractDriveFileIdFromUrl(trimmed);
  if (fromUrl) {
    return fromUrl;
  }
  return trimmed;
}

function normalizeDriveFileName(name: string): string {
  return String(name || '')
    .replace(/[\r\n\t]/g, ' ')
    .trim();
}

async function getDriveClient(
  configService: ConfigService,
): Promise<GoogleRequestClient> {
  const keyFile = String(
    configService.get<string>('GOOGLE_APPLICATION_CREDENTIALS', '') || '',
  ).trim();
  if (!keyFile) {
    throw new Error('Falta GOOGLE_APPLICATION_CREDENTIALS');
  }

  const auth = new GoogleAuth({
    keyFile,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  const client = await auth.getClient();
  const requestClient = client as unknown as GoogleRequestClient;
  if (typeof requestClient.request !== 'function') {
    throw new Error('Cliente de Google Drive invalido');
  }
  return requestClient;
}

async function getDriveFileMetadata(
  client: GoogleRequestClient,
  fileId: string,
): Promise<Required<Pick<DriveFile, 'id' | 'name' | 'mimeType'>> &
  Pick<DriveFile, 'size' | 'webViewLink'>> {
  const response = await client.request<DriveFile>({
    url: `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?fields=id,name,mimeType,size,webViewLink&supportsAllDrives=true`,
    method: 'GET',
  });

  const id = String(response.data.id || '').trim();
  const name = normalizeDriveFileName(String(response.data.name || ''));
  const mimeType = String(response.data.mimeType || '').trim();
  if (!id || !name || !mimeType) {
    throw new Error(`Metadata incompleta para fileId=${fileId}`);
  }

  return {
    id,
    name,
    mimeType,
    size: response.data.size,
    webViewLink: response.data.webViewLink,
  };
}

async function findFileInFolderByName(
  client: GoogleRequestClient,
  folderId: string,
  fileName: string,
): Promise<DriveFile | null> {
  const escapedName = fileName.replace(/'/g, "\\'");
  const query = `'${folderId}' in parents and name='${escapedName}' and trashed=false`;
  const response = await client.request<DriveSearchResponse>({
    url: `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,size,webViewLink)&pageSize=2&supportsAllDrives=true&includeItemsFromAllDrives=true`,
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
  return files[0];
}

async function copyFileToFolderKeepingName(
  client: GoogleRequestClient,
  sourceFileId: string,
  targetFolderId: string,
  targetName: string,
): Promise<Required<Pick<DriveFile, 'id' | 'name' | 'mimeType'>> &
  Pick<DriveFile, 'size' | 'webViewLink'>> {
  const existing = await findFileInFolderByName(client, targetFolderId, targetName);
  if (existing?.id && existing.name && existing.mimeType) {
    return {
      id: String(existing.id),
      name: normalizeDriveFileName(String(existing.name)),
      mimeType: String(existing.mimeType),
      size: existing.size,
      webViewLink: existing.webViewLink,
    };
  }

  const response = await client.request<DriveFile>({
    url: `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(sourceFileId)}/copy?supportsAllDrives=true&fields=id,name,mimeType,size,webViewLink`,
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
  const name = normalizeDriveFileName(String(response.data.name || ''));
  const mimeType = String(response.data.mimeType || '').trim();
  if (!id || !name || !mimeType) {
    throw new Error(
      `Copia incompleta para source=${sourceFileId}, folder=${targetFolderId}`,
    );
  }
  return {
    id,
    name,
    mimeType,
    size: response.data.size,
    webViewLink: response.data.webViewLink,
  };
}

async function ensureFolderForEvaluationPath(input: {
  dataSource: DataSource;
  evaluationId: string;
  actorUserId: string;
  folderStatusId: string;
  rootFolderName: string;
  childFolderName: string;
}): Promise<string> {
  const {
    dataSource,
    evaluationId,
    actorUserId,
    folderStatusId,
    rootFolderName,
    childFolderName,
  } = input;

  const rootRows = (await dataSource.query(
    `
      SELECT id
      FROM material_folder
      WHERE evaluation_id = ?
        AND parent_folder_id IS NULL
        AND name = ?
      LIMIT 1
    `,
    [evaluationId, rootFolderName],
  )) as Array<{ id: string | number }>;

  let rootFolderId = String(rootRows[0]?.id || '').trim();
  if (!rootFolderId) {
    await dataSource.query(
      `
        INSERT INTO material_folder
          (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
        VALUES
          (?, NULL, ?, ?, NULL, NULL, ?, NOW(), NOW())
      `,
      [evaluationId, folderStatusId, rootFolderName, actorUserId],
    );
    const createdRootRows = (await dataSource.query(
      `
        SELECT id
        FROM material_folder
        WHERE evaluation_id = ?
          AND parent_folder_id IS NULL
          AND name = ?
        LIMIT 1
      `,
      [evaluationId, rootFolderName],
    )) as Array<{ id: string | number }>;
    rootFolderId = String(createdRootRows[0]?.id || '').trim();
  }

  if (!rootFolderId) {
    throw new Error(
      `No se pudo resolver carpeta raiz ${rootFolderName} para evaluationId=${evaluationId}`,
    );
  }

  const childRows = (await dataSource.query(
    `
      SELECT id
      FROM material_folder
      WHERE evaluation_id = ?
        AND parent_folder_id = ?
        AND name = ?
      LIMIT 1
    `,
    [evaluationId, rootFolderId, childFolderName],
  )) as Array<{ id: string | number }>;

  let childFolderId = String(childRows[0]?.id || '').trim();
  if (!childFolderId) {
    await dataSource.query(
      `
        INSERT INTO material_folder
          (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
        VALUES
          (?, ?, ?, ?, NULL, NULL, ?, NOW(), NOW())
      `,
      [evaluationId, rootFolderId, folderStatusId, childFolderName, actorUserId],
    );
    const createdChildRows = (await dataSource.query(
      `
        SELECT id
        FROM material_folder
        WHERE evaluation_id = ?
          AND parent_folder_id = ?
          AND name = ?
        LIMIT 1
      `,
      [evaluationId, rootFolderId, childFolderName],
    )) as Array<{ id: string | number }>;
    childFolderId = String(createdChildRows[0]?.id || '').trim();
  }

  if (!childFolderId) {
    throw new Error(
      `No se pudo resolver carpeta hija ${childFolderName} para evaluationId=${evaluationId}`,
    );
  }

  return childFolderId;
}

async function ensureFileResourceAndVersion(input: {
  dataSource: DataSource;
  driveFile: Required<Pick<DriveFile, 'id' | 'name' | 'mimeType'>> &
    Pick<DriveFile, 'size' | 'webViewLink'>;
  actorUserId: string;
}): Promise<{ fileResourceId: string; fileVersionId: string }> {
  const { dataSource, driveFile, actorUserId } = input;
  const storageKey = String(driveFile.id).trim();
  const storageUrl =
    String(driveFile.webViewLink || '').trim() ||
    `https://drive.google.com/file/d/${encodeURIComponent(storageKey)}/view`;
  const originalName = normalizeDriveFileName(driveFile.name);
  const mimeType = String(driveFile.mimeType).trim();
  const parsedSize = Number.parseInt(String(driveFile.size || '0'), 10);
  const sizeBytes = Number.isFinite(parsedSize) && parsedSize > 0 ? parsedSize : 1;
  const checksumHash = `gdrive-seed-${storageKey}`;

  let fileResource = (await dataSource.query(
    `
      SELECT id
      FROM file_resource
      WHERE storage_provider = ?
        AND storage_key = ?
      LIMIT 1
    `,
    [STORAGE_PROVIDER_CODES.GDRIVE, storageKey],
  )) as Array<{ id: string | number }>;

  if (!fileResource[0]?.id) {
    await dataSource.query(
      `
        INSERT INTO file_resource
          (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
        VALUES
          (?, ?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        checksumHash,
        originalName,
        mimeType,
        sizeBytes,
        STORAGE_PROVIDER_CODES.GDRIVE,
        storageKey,
        storageUrl,
      ],
    );
    fileResource = (await dataSource.query(
      `
        SELECT id
        FROM file_resource
        WHERE storage_provider = ?
          AND storage_key = ?
        LIMIT 1
      `,
      [STORAGE_PROVIDER_CODES.GDRIVE, storageKey],
    )) as Array<{ id: string | number }>;
  }

  const fileResourceId = String(fileResource[0]?.id || '');
  if (!fileResourceId) {
    throw new Error(`No se pudo resolver file_resource para storageKey=${storageKey}`);
  }

  let fileVersion = (await dataSource.query(
    `
      SELECT id
      FROM file_version
      WHERE file_resource_id = ?
      ORDER BY version_number DESC
      LIMIT 1
    `,
    [fileResourceId],
  )) as Array<{ id: string | number }>;

  if (!fileVersion[0]?.id) {
    await dataSource.query(
      `
        INSERT INTO file_version
          (file_resource_id, version_number, storage_url, created_at, created_by)
        VALUES
          (?, 1, ?, NOW(), ?)
      `,
      [fileResourceId, storageUrl, actorUserId],
    );
    fileVersion = (await dataSource.query(
      `
        SELECT id
        FROM file_version
        WHERE file_resource_id = ?
        ORDER BY version_number DESC
        LIMIT 1
      `,
      [fileResourceId],
    )) as Array<{ id: string | number }>;
  }

  const fileVersionId = String(fileVersion[0]?.id || '');
  if (!fileVersionId) {
    throw new Error(`No se pudo resolver file_version para resourceId=${fileResourceId}`);
  }

  return { fileResourceId, fileVersionId };
}

async function ensureMaterial(input: {
  dataSource: DataSource;
  materialFolderId: string;
  fileResourceId: string;
  fileVersionId: string;
  materialStatusId: string;
  displayName: string;
  actorUserId: string;
}): Promise<void> {
  const {
    dataSource,
    materialFolderId,
    fileResourceId,
    fileVersionId,
    materialStatusId,
    displayName,
    actorUserId,
  } = input;

  const existingRows = (await dataSource.query(
    `
      SELECT id
      FROM material
      WHERE material_folder_id = ?
        AND file_resource_id = ?
      LIMIT 1
    `,
    [materialFolderId, fileResourceId],
  )) as Array<{ id: string | number }>;

  if (existingRows[0]?.id) {
    return;
  }

  await dataSource.query(
    `
      INSERT INTO material
        (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
      VALUES
        (?, NULL, ?, ?, ?, ?, NULL, NULL, ?, NOW(), NOW())
    `,
    [
      materialFolderId,
      fileResourceId,
      fileVersionId,
      materialStatusId,
      displayName,
      actorUserId,
    ],
  );
}

async function main(): Promise<void> {
  const resumenesInput = String(process.argv[2] || '').trim();
  const enunciadosInput = String(process.argv[3] || '').trim();
  if (!resumenesInput || !enunciadosInput) {
    throw new Error(
      'Uso: npx ts-node -r tsconfig-paths/register scripts/seed-drive-additional-materials.ts <resumenesFileIdOrUrl> <enunciadosFileIdOrUrl>',
    );
  }

  const resumenesSourceFileId = normalizeToFileId(resumenesInput);
  const enunciadosSourceFileId = normalizeToFileId(enunciadosInput);

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const dataSource = app.get(DataSource);
    const configService = app.get(ConfigService);
    const driveClient = await getDriveClient(configService);
    const actorUserId = '1';

    const folderStatusRows = (await dataSource.query(
      `SELECT id FROM folder_status WHERE code = 'ACTIVE' LIMIT 1`,
    )) as Array<{ id: string | number }>;
    const materialStatusRows = (await dataSource.query(
      `SELECT id FROM material_status WHERE code = 'ACTIVE' LIMIT 1`,
    )) as Array<{ id: string | number }>;
    if (!folderStatusRows[0]?.id || !materialStatusRows[0]?.id) {
      throw new Error('Faltan catalogos base: folder_status/material_status');
    }
    const folderStatusId = String(folderStatusRows[0].id);
    const materialStatusId = String(materialStatusRows[0].id);

    const scopes = (await dataSource.query(
      `
        SELECT
          eda.evaluation_id AS evaluationId,
          eda.drive_documents_folder_id AS documentsFolderId
        FROM evaluation_drive_access eda
        INNER JOIN evaluation ev ON ev.id = eda.evaluation_id
        INNER JOIN course_cycle cc ON cc.id = ev.course_cycle_id
        WHERE eda.is_active = 1
          AND cc.academic_cycle_id = COALESCE(
            (
              SELECT CAST(ss.setting_value AS UNSIGNED)
              FROM system_setting ss
              WHERE ss.setting_key = 'ACTIVE_CYCLE_ID'
              LIMIT 1
            ),
            (
              SELECT ac.id
              FROM academic_cycle ac
              ORDER BY ac.id DESC
              LIMIT 1
            )
          )
        ORDER BY eda.evaluation_id ASC
      `,
    )) as EvaluationScopeRow[];

    if (scopes.length === 0) {
      throw new Error('No hay scopes activos para el ciclo activo');
    }

    const resumenesMeta = await getDriveFileMetadata(
      driveClient,
      resumenesSourceFileId,
    );
    const enunciadosMeta = await getDriveFileMetadata(
      driveClient,
      enunciadosSourceFileId,
    );

    const summary: Array<{
      evaluationId: string;
      resumenesFolderId: string;
      enunciadosFolderId: string;
      resumenesFileId: string;
      enunciadosFileId: string;
    }> = [];

    for (const scope of scopes) {
      const evaluationId = String(scope.evaluationId || '').trim();
      const documentsFolderId = String(scope.documentsFolderId || '').trim();
      if (!evaluationId || !documentsFolderId) {
        throw new Error(
          `Scope incompleto para evaluationId=${evaluationId}: falta documentsFolderId`,
        );
      }

      const materialAdicionalFolderId = await ensureFolderForEvaluationPath({
        dataSource,
        evaluationId,
        actorUserId,
        folderStatusId,
        rootFolderName: 'Material adicional',
        childFolderName: 'Resumenes',
      });
      const enunciadosFolderId = await ensureFolderForEvaluationPath({
        dataSource,
        evaluationId,
        actorUserId,
        folderStatusId,
        rootFolderName: 'Material adicional',
        childFolderName: 'Enunciados',
      });

      const copiedResumenes = await copyFileToFolderKeepingName(
        driveClient,
        resumenesSourceFileId,
        documentsFolderId,
        resumenesMeta.name,
      );
      const copiedEnunciados = await copyFileToFolderKeepingName(
        driveClient,
        enunciadosSourceFileId,
        documentsFolderId,
        enunciadosMeta.name,
      );

      const resumenesResource = await ensureFileResourceAndVersion({
        dataSource,
        driveFile: copiedResumenes,
        actorUserId,
      });
      const enunciadosResource = await ensureFileResourceAndVersion({
        dataSource,
        driveFile: copiedEnunciados,
        actorUserId,
      });

      await ensureMaterial({
        dataSource,
        materialFolderId: materialAdicionalFolderId,
        fileResourceId: resumenesResource.fileResourceId,
        fileVersionId: resumenesResource.fileVersionId,
        materialStatusId,
        displayName: copiedResumenes.name,
        actorUserId,
      });
      await ensureMaterial({
        dataSource,
        materialFolderId: enunciadosFolderId,
        fileResourceId: enunciadosResource.fileResourceId,
        fileVersionId: enunciadosResource.fileVersionId,
        materialStatusId,
        displayName: copiedEnunciados.name,
        actorUserId,
      });

      summary.push({
        evaluationId,
        resumenesFolderId: materialAdicionalFolderId,
        enunciadosFolderId,
        resumenesFileId: String(copiedResumenes.id),
        enunciadosFileId: String(copiedEnunciados.id),
      });
    }

    console.log(
      JSON.stringify(
        {
          evaluationsProcessed: scopes.length,
          resumenesSourceFileId,
          enunciadosSourceFileId,
          details: summary,
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
