import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@src/app.module';
import { DataSource } from 'typeorm';
import { GoogleAuth } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { extractDriveFileIdFromUrl } from '@modules/media-access/domain/media-access-url.util';
import { STORAGE_PROVIDER_CODES } from '@modules/materials/domain/material.constants';
import { MEDIA_ACCESS_DRIVE_FOLDERS } from '@modules/media-access/domain/media-access.constants';

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

type DriveSearchResponse = {
  files?: DriveFile[];
};

type EvaluationScopeRow = {
  evaluationId: string | number;
  documentsFolderId: string | null;
  videosFolderId: string | null;
};

type ClassEventRow = {
  id: string | number;
  sessionNumber: number;
};

type CourseCycleRow = {
  courseCycleId: string | number;
  courseCode: string;
  cycleCode: string;
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

function normalizeToken(raw: string): string {
  const normalized = String(raw || '').trim();
  if (!normalized) {
    throw new Error('Token vacio para nombre de carpeta');
  }
  return normalized.replace(/[^A-Za-z0-9_-]/g, '-').replace(/-+/g, '-');
}

async function getDriveClient(configService: ConfigService): Promise<GoogleRequestClient> {
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

function getDriveRootFolderId(configService: ConfigService): string {
  const rootFolderId = String(
    configService.get<string>('GOOGLE_DRIVE_ROOT_FOLDER_ID', '') || '',
  ).trim();
  if (!rootFolderId) {
    throw new Error('Falta GOOGLE_DRIVE_ROOT_FOLDER_ID');
  }
  return rootFolderId;
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

async function findFolderInParentByName(
  client: GoogleRequestClient,
  parentFolderId: string,
  folderName: string,
): Promise<DriveFile | null> {
  const escapedName = folderName.replace(/'/g, "\\'");
  const query = `'${parentFolderId}' in parents and name='${escapedName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const response = await client.request<DriveSearchResponse>({
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
  return files[0];
}

async function copyFileToFolder(
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

async function enforceViewerRestrictionOnFile(
  client: GoogleRequestClient,
  fileId: string,
): Promise<void> {
  const normalizedFileId = String(fileId || '').trim();
  if (!normalizedFileId) {
    throw new Error('fileId invalido para aplicar restriccion de viewers');
  }

  try {
    await client.request({
      url: `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(normalizedFileId)}?supportsAllDrives=true`,
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
      `[seed-drive-media-for-active-evaluations] no se pudo aplicar restriccion de copia en fileId=${normalizedFileId}: ${message}`,
    );
  }
}

async function resolveCourseCycleIntroFolderId(input: {
  client: GoogleRequestClient;
  rootFolderId: string;
  courseCycleId: string;
  courseCode: string;
  cycleCode: string;
}): Promise<string> {
  const { client, rootFolderId, courseCycleId, courseCode, cycleCode } = input;

  const courseCyclesParent = await findFolderInParentByName(
    client,
    rootFolderId,
    MEDIA_ACCESS_DRIVE_FOLDERS.COURSE_CYCLES_PARENT,
  );
  if (!courseCyclesParent?.id) {
    throw new Error(
      `No existe carpeta padre ${MEDIA_ACCESS_DRIVE_FOLDERS.COURSE_CYCLES_PARENT} en Drive`,
    );
  }

  const cycleFolder = await findFolderInParentByName(
    client,
    String(courseCyclesParent.id),
    normalizeToken(cycleCode),
  );
  if (!cycleFolder?.id) {
    throw new Error(`No existe carpeta de ciclo ${cycleCode} en Drive`);
  }

  const scopeFolder = await findFolderInParentByName(
    client,
    String(cycleFolder.id),
    `cc_${courseCycleId}_${normalizeToken(courseCode)}`,
  );
  if (!scopeFolder?.id) {
    throw new Error(`No existe carpeta cc_${courseCycleId} en Drive`);
  }

  const introFolder = await findFolderInParentByName(
    client,
    String(scopeFolder.id),
    MEDIA_ACCESS_DRIVE_FOLDERS.COURSE_CYCLE_INTRO_VIDEO,
  );
  if (!introFolder?.id) {
    throw new Error(
      `No existe subcarpeta ${MEDIA_ACCESS_DRIVE_FOLDERS.COURSE_CYCLE_INTRO_VIDEO} para cc_${courseCycleId}`,
    );
  }

  return String(introFolder.id);
}

async function ensureFolderForSessions(
  dataSource: DataSource,
  evaluationId: string,
  actorUserId: string,
  folderStatusId: string,
): Promise<string> {
  const folderName = 'Sesiones';
  const existing = (await dataSource.query(
    `
      SELECT id
      FROM material_folder
      WHERE evaluation_id = ?
        AND parent_folder_id IS NULL
        AND name = ?
      LIMIT 1
    `,
    [evaluationId, folderName],
  )) as Array<{ id: string | number }>;
  if (existing[0]?.id) {
    return String(existing[0].id);
  }

  await dataSource.query(
    `
      INSERT INTO material_folder
        (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
      VALUES
        (?, NULL, ?, ?, NULL, NULL, ?, NOW(), NOW())
    `,
    [evaluationId, folderStatusId, folderName, actorUserId],
  );

  const created = (await dataSource.query(
    `
      SELECT id
      FROM material_folder
      WHERE evaluation_id = ?
        AND parent_folder_id IS NULL
        AND name = ?
      LIMIT 1
    `,
    [evaluationId, folderName],
  )) as Array<{ id: string | number }>;
  if (!created[0]?.id) {
    throw new Error(`No se pudo crear carpeta Sesiones para evaluationId=${evaluationId}`);
  }
  return String(created[0].id);
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

async function main(): Promise<void> {
  const docInput = String(process.argv[2] || '').trim();
  const videoInput = String(process.argv[3] || '').trim();
  if (!docInput || !videoInput) {
    throw new Error(
      'Uso: npx ts-node -r tsconfig-paths/register scripts/seed-drive-media-for-active-evaluations.ts <docFileIdOrUrl> <videoFileIdOrUrl>',
    );
  }

  const docSourceFileId = normalizeToFileId(docInput);
  const videoSourceFileId = normalizeToFileId(videoInput);

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const dataSource = app.get(DataSource);
    const configService = app.get(ConfigService);
    const driveClient = await getDriveClient(configService);
    const rootFolderId = getDriveRootFolderId(configService);

    const actorUserId = '1';
    const folderStatusRows = (await dataSource.query(
      `SELECT id FROM folder_status WHERE code = 'ACTIVE' LIMIT 1`,
    )) as Array<{ id: string | number }>;
    const materialStatusRows = (await dataSource.query(
      `SELECT id FROM material_status WHERE code = 'ACTIVE' LIMIT 1`,
    )) as Array<{ id: string | number }>;
    const recordingStatusRows = (await dataSource.query(
      `SELECT id FROM class_event_recording_status WHERE code = 'READY' LIMIT 1`,
    )) as Array<{ id: string | number }>;
    if (!folderStatusRows[0]?.id || !materialStatusRows[0]?.id || !recordingStatusRows[0]?.id) {
      throw new Error('Faltan catalogos base: folder_status/material_status/recording_status');
    }
    const folderStatusId = String(folderStatusRows[0].id);
    const materialStatusId = String(materialStatusRows[0].id);
    const recordingStatusId = String(recordingStatusRows[0].id);

    const scopes = (await dataSource.query(
      `
        SELECT
          eda.evaluation_id AS evaluationId,
          eda.drive_documents_folder_id AS documentsFolderId,
          eda.drive_videos_folder_id AS videosFolderId
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

    const docMeta = await getDriveFileMetadata(driveClient, docSourceFileId);
    const videoMeta = await getDriveFileMetadata(driveClient, videoSourceFileId);

    let copiedDocuments = 0;
    let copiedVideos = 0;
    let classEventsUpdated = 0;
    let materialsInserted = 0;
    let courseCycleIntroVideosCopied = 0;
    const perEvaluation: Array<{
      evaluationId: string;
      classEvents: number;
      docFileId: string;
      videoFileId: string;
      materialsInserted: number;
      classEventsUpdated: number;
    }> = [];
    const perCourseCycle: Array<{
      courseCycleId: string;
      courseCode: string;
      introVideoFileId: string;
    }> = [];

    for (const scope of scopes) {
      const evaluationId = String(scope.evaluationId);
      const documentsFolderId = String(scope.documentsFolderId || '').trim();
      const videosFolderId = String(scope.videosFolderId || '').trim();
      if (!documentsFolderId || !videosFolderId) {
        throw new Error(
          `Scope incompleto para evaluationId=${evaluationId}: faltan subcarpetas`,
        );
      }

      const docTargetName = normalizeDriveFileName(docMeta.name);
      const videoTargetName = normalizeDriveFileName(videoMeta.name);

      const copiedDoc = await copyFileToFolder(
        driveClient,
        docSourceFileId,
        documentsFolderId,
        docTargetName,
      );
      const copiedVideo = await copyFileToFolder(
        driveClient,
        videoSourceFileId,
        videosFolderId,
        videoTargetName,
      );
      await enforceViewerRestrictionOnFile(driveClient, String(copiedVideo.id));

      copiedDocuments += 1;
      copiedVideos += 1;

      const { fileResourceId, fileVersionId } = await ensureFileResourceAndVersion({
        dataSource,
        driveFile: copiedDoc,
        actorUserId,
      });

      const folderId = await ensureFolderForSessions(
        dataSource,
        evaluationId,
        actorUserId,
        folderStatusId,
      );

      const classEvents = (await dataSource.query(
        `
          SELECT id, session_number AS sessionNumber
          FROM class_event
          WHERE evaluation_id = ?
          ORDER BY session_number ASC
        `,
        [evaluationId],
      )) as ClassEventRow[];

      let insertedForEval = 0;
      for (const classEvent of classEvents) {
        const classEventId = String(classEvent.id);
        const existingMaterial = (await dataSource.query(
          `
            SELECT id
            FROM material
            WHERE class_event_id = ?
              AND file_resource_id = ?
            LIMIT 1
          `,
          [classEventId, fileResourceId],
        )) as Array<{ id: string | number }>;
        if (existingMaterial[0]?.id) {
          continue;
        }

        await dataSource.query(
          `
            INSERT INTO material
              (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
            VALUES
              (?, ?, ?, ?, ?, ?, NULL, NULL, ?, NOW(), NOW())
          `,
          [
            folderId,
            classEventId,
            fileResourceId,
            fileVersionId,
            materialStatusId,
            `Sesion ${classEvent.sessionNumber} - ${copiedDoc.name}`,
            actorUserId,
          ],
        );
        insertedForEval += 1;
      }

      const recordingUrl =
        String(copiedVideo.webViewLink || '').trim() ||
        `https://drive.google.com/file/d/${encodeURIComponent(String(copiedVideo.id))}/view`;

      await dataSource.query(
        `
          UPDATE class_event
          SET recording_url = ?,
              recording_file_id = ?,
              recording_status_id = ?,
              updated_at = NOW()
          WHERE evaluation_id = ?
        `,
        [recordingUrl, String(copiedVideo.id), recordingStatusId, evaluationId],
      );

      materialsInserted += insertedForEval;
      classEventsUpdated += classEvents.length;
      perEvaluation.push({
        evaluationId,
        classEvents: classEvents.length,
        docFileId: String(copiedDoc.id),
        videoFileId: String(copiedVideo.id),
        materialsInserted: insertedForEval,
        classEventsUpdated: classEvents.length,
      });
    }

    const courseCycles = (await dataSource.query(
      `
        SELECT
          cc.id AS courseCycleId,
          c.code AS courseCode,
          ac.code AS cycleCode
        FROM course_cycle cc
        INNER JOIN course c ON c.id = cc.course_id
        INNER JOIN academic_cycle ac ON ac.id = cc.academic_cycle_id
        WHERE c.code IN ('MATE101', 'MATE102', 'FIS101', 'QUI101')
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
        ORDER BY cc.id ASC
      `,
    )) as CourseCycleRow[];

    for (const row of courseCycles) {
      const courseCycleId = String(row.courseCycleId);
      const introFolderId = await resolveCourseCycleIntroFolderId({
        client: driveClient,
        rootFolderId,
        courseCycleId,
        courseCode: String(row.courseCode || '').trim(),
        cycleCode: String(row.cycleCode || '').trim(),
      });
      const introVideoTargetName = normalizeDriveFileName(videoMeta.name);
      const copiedIntroVideo = await copyFileToFolder(
        driveClient,
        videoSourceFileId,
        introFolderId,
        introVideoTargetName,
      );
      await enforceViewerRestrictionOnFile(
        driveClient,
        String(copiedIntroVideo.id),
      );
      const introVideoUrl =
        String(copiedIntroVideo.webViewLink || '').trim() ||
        `https://drive.google.com/file/d/${encodeURIComponent(String(copiedIntroVideo.id))}/view`;

      await dataSource.query(
        `
          UPDATE course_cycle
          SET intro_video_url = ?,
              intro_video_file_id = ?
          WHERE id = ?
        `,
        [introVideoUrl, String(copiedIntroVideo.id), courseCycleId],
      );

      courseCycleIntroVideosCopied += 1;
      perCourseCycle.push({
        courseCycleId,
        courseCode: String(row.courseCode || ''),
        introVideoFileId: String(copiedIntroVideo.id),
      });
    }

    console.log(
      JSON.stringify(
        {
          evaluationsProcessed: scopes.length,
          copiedDocuments,
          copiedVideos,
          courseCycleIntroVideosCopied,
          materialsInserted,
          classEventsUpdated,
          sourceDocFileId: docSourceFileId,
          sourceVideoFileId: videoSourceFileId,
          details: perEvaluation,
          courseCycleDetails: perCourseCycle,
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
