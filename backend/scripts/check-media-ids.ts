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
    const docId = '1d5E-Lz-cNr3FVWMIjRsRIJOTxHAE_yjL';
    const videoId = '1too7P5h4LbQIX2pPQDmZTjEbNXLCrZpT';

    const fileResources = await ds.query(
      `
      SELECT
        fr.id,
        fr.storage_key AS storageKey,
        fr.storage_provider AS storageProvider,
        m.id AS materialId,
        mf.evaluation_id AS evaluationId
      FROM file_resource fr
      LEFT JOIN material m ON m.file_resource_id = fr.id
      LEFT JOIN material_folder mf ON mf.id = m.material_folder_id
      WHERE fr.storage_key IN (?, ?)
      `,
      [docId, videoId],
    );

    const classEvents = await ds.query(
      `
      SELECT id, evaluation_id AS evaluationId, recording_url AS recordingUrl
      FROM class_event
      WHERE recording_url LIKE ?
      `,
      [`%${videoId}%`],
    );

    const evaluation17 = await ds.query(
      `
      SELECT ev.id, cc.id AS courseCycleId
      FROM evaluation ev
      INNER JOIN course_cycle cc ON cc.id = ev.course_cycle_id
      WHERE ev.id = 17
      `,
    );

    console.log(
      JSON.stringify(
        {
          fileResources,
          classEvents,
          evaluation17,
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
