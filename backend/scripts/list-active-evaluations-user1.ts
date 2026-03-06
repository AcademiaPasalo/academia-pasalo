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
    const userId = '1';

    const rows = await ds.query(
      `
      SELECT
        ee.evaluation_id AS evaluationId,
        c.code AS courseCode,
        ac.code AS cycleCode,
        COUNT(*) AS rowsCount
      FROM enrollment_evaluation ee
      INNER JOIN enrollment e ON e.id = ee.enrollment_id
      INNER JOIN enrollment_status es ON es.id = e.enrollment_status_id
      INNER JOIN evaluation ev ON ev.id = ee.evaluation_id
      INNER JOIN course_cycle cc ON cc.id = ev.course_cycle_id
      INNER JOIN course c ON c.id = cc.course_id
      INNER JOIN academic_cycle ac ON ac.id = cc.academic_cycle_id
      WHERE e.user_id = ?
        AND es.code = 'ACTIVE'
        AND ee.is_active = 1
        AND (ee.access_start_date IS NULL OR ee.access_start_date <= NOW())
        AND (ee.access_end_date IS NULL OR ee.access_end_date >= NOW())
      GROUP BY ee.evaluation_id, c.code, ac.code
      ORDER BY ee.evaluation_id ASC
      `,
      [userId],
    );

    console.log(JSON.stringify(rows, null, 2));
  } finally {
    await app.close();
  }
}

void main();
