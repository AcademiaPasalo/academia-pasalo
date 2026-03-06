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
    const tables = [
      'material_folder',
      'file_resource',
      'file_version',
      'material',
      'class_event',
      'class_event_recording_status',
      'material_status',
      'folder_status',
    ];

    const result: Record<string, unknown> = {};
    for (const table of tables) {
      const rows = await ds.query(`SHOW COLUMNS FROM ${table}`);
      result[table] = rows;
    }

    console.log(JSON.stringify(result, null, 2));
  } finally {
    await app.close();
  }
}

void main();
