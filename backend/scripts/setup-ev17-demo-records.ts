import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@src/app.module';
import { DataSource } from 'typeorm';

async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  try {
    const ds = app.get(DataSource);
    const evaluationId = String(process.argv[2] || '117');
    const docFileId = String(
      process.argv[3] || '1d5E-Lz-cNr3FVWMIjRsRIJOTxHAE_yjL',
    );
    const videoFileId = String(
      process.argv[4] || '1too7P5h4LbQIX2pPQDmZTjEbNXLCrZpT',
    );
    const actorUserId = '1';

    const doc = {
      fileId: docFileId,
      name: `demo-doc-ev${evaluationId}.pdf`,
      mimeType: 'application/pdf',
      url: `https://drive.google.com/file/d/${docFileId}/view`,
    };
    const video = {
      fileId: videoFileId,
      url: `https://drive.google.com/file/d/${videoFileId}/view`,
    };

    const folderStatus = await ds.query(
      `SELECT id FROM folder_status WHERE code = 'ACTIVE' LIMIT 1`,
    );
    const materialStatus = await ds.query(
      `SELECT id FROM material_status WHERE code = 'ACTIVE' LIMIT 1`,
    );
    const recordingReady = await ds.query(
      `SELECT id FROM class_event_recording_status WHERE code = 'READY' LIMIT 1`,
    );

    if (!folderStatus[0]?.id || !materialStatus[0]?.id || !recordingReady[0]?.id) {
      throw new Error('Faltan catalogos de estado requeridos');
    }

    const folderName = `Demo Drive Ev${evaluationId}`;
    let folder = await ds.query(
      `SELECT id FROM material_folder WHERE evaluation_id = ? AND name = ? LIMIT 1`,
      [evaluationId, folderName],
    );
    if (!folder[0]?.id) {
      await ds.query(
        `
        INSERT INTO material_folder
          (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
        VALUES
          (?, NULL, ?, ?, NULL, NULL, ?, NOW(), NOW())
        `,
        [evaluationId, folderStatus[0].id, folderName, actorUserId],
      );
      folder = await ds.query(
        `SELECT id FROM material_folder WHERE evaluation_id = ? AND name = ? LIMIT 1`,
        [evaluationId, folderName],
      );
    }
    const folderId = String(folder[0].id);

    let fileResource = await ds.query(
      `SELECT id FROM file_resource WHERE storage_key = ? LIMIT 1`,
      [doc.fileId],
    );
    if (!fileResource[0]?.id) {
      await ds.query(
        `
        INSERT INTO file_resource
          (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
        VALUES
          (?, ?, ?, ?, 'GDRIVE', ?, ?, NOW())
        `,
        [`manual-${doc.fileId}`, doc.name, doc.mimeType, 1, doc.fileId, doc.url],
      );
      fileResource = await ds.query(
        `SELECT id FROM file_resource WHERE storage_key = ? LIMIT 1`,
        [doc.fileId],
      );
    }
    const fileResourceId = String(fileResource[0].id);

    let fileVersion = await ds.query(
      `SELECT id FROM file_version WHERE file_resource_id = ? ORDER BY version_number DESC LIMIT 1`,
      [fileResourceId],
    );
    if (!fileVersion[0]?.id) {
      await ds.query(
        `
        INSERT INTO file_version
          (file_resource_id, version_number, storage_url, created_at, created_by)
        VALUES
          (?, 1, ?, NOW(), ?)
        `,
        [fileResourceId, doc.url, actorUserId],
      );
      fileVersion = await ds.query(
        `SELECT id FROM file_version WHERE file_resource_id = ? ORDER BY version_number DESC LIMIT 1`,
        [fileResourceId],
      );
    }
    const fileVersionId = String(fileVersion[0].id);

    let material = await ds.query(
      `
      SELECT id
      FROM material
      WHERE material_folder_id = ? AND file_resource_id = ?
      LIMIT 1
      `,
      [folderId, fileResourceId],
    );
    if (!material[0]?.id) {
      await ds.query(
        `
        INSERT INTO material
          (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
        VALUES
          (?, NULL, ?, ?, ?, ?, NULL, NULL, ?, NOW(), NOW())
        `,
        [
          folderId,
          fileResourceId,
          fileVersionId,
          materialStatus[0].id,
          `Documento Demo Ev${evaluationId}`,
          actorUserId,
        ],
      );
      material = await ds.query(
        `
        SELECT id
        FROM material
        WHERE material_folder_id = ? AND file_resource_id = ?
        LIMIT 1
        `,
        [folderId, fileResourceId],
      );
    }
    const materialId = String(material[0].id);

    let classEvent = await ds.query(
      `
      SELECT id
      FROM class_event
      WHERE evaluation_id = ? AND recording_url LIKE ?
      LIMIT 1
      `,
      [evaluationId, `%${video.fileId}%`],
    );
    if (!classEvent[0]?.id) {
      const nextSession = await ds.query(
        `SELECT COALESCE(MAX(session_number), 0) + 1 AS nextNum FROM class_event WHERE evaluation_id = ?`,
        [evaluationId],
      );
      const nextSessionNumber = Number(nextSession[0]?.nextNum ?? 1);

      await ds.query(
        `
        INSERT INTO class_event
          (evaluation_id, session_number, title, topic, start_datetime, end_datetime, live_meeting_url, recording_url, recording_status_id, is_cancelled, created_by, created_at, updated_at)
        VALUES
          (?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR), ?, ?, ?, 0, ?, NOW(), NOW())
        `,
        [
          evaluationId,
          nextSessionNumber,
          `Sesion demo video ev${evaluationId}`,
          'Demo grabacion drive',
          'https://meet.google.com/demo-ev17',
          video.url,
          recordingReady[0].id,
          actorUserId,
        ],
      );
      classEvent = await ds.query(
        `
        SELECT id
        FROM class_event
        WHERE evaluation_id = ? AND recording_url LIKE ?
        LIMIT 1
        `,
        [evaluationId, `%${video.fileId}%`],
      );
    }
    const classEventId = String(classEvent[0].id);

    console.log(
      JSON.stringify(
        {
          evaluationId,
          folderId,
          materialId,
          classEventId,
          documentFileId: doc.fileId,
          videoFileId: video.fileId,
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
