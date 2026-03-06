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
    const docFolderId = (process.argv[2] || '').trim();
    const videoFolderId = (process.argv[3] || '').trim();
    if (!docFolderId || !videoFolderId) {
      throw new Error(
        'Uso: npx ts-node -r tsconfig-paths/register scripts/map-drive-folder-to-evaluation.ts <docFolderId> <videoFolderId>',
      );
    }

    const rows = await ds.query(
      `
      SELECT
        evaluation_id AS evaluationId,
        drive_scope_folder_id AS scopeFolderId,
        drive_videos_folder_id AS videosFolderId,
        drive_documents_folder_id AS documentsFolderId,
        viewer_group_email AS groupEmail
      FROM evaluation_drive_access
      WHERE drive_documents_folder_id = ?
         OR drive_videos_folder_id = ?
         OR drive_scope_folder_id IN (?, ?)
      `,
      [docFolderId, videoFolderId, docFolderId, videoFolderId],
    );

    console.log(JSON.stringify(rows, null, 2));
  } finally {
    await app.close();
  }
}

void main();
