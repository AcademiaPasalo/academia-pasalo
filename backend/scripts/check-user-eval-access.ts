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
    const evaluationId = '17';

    const evaluationInfo = await ds.query(
      `
      SELECT
        ev.id,
        cc.id AS courseCycleId,
        c.code AS courseCode,
        ac.code AS cycleCode
      FROM evaluation ev
      INNER JOIN course_cycle cc ON cc.id = ev.course_cycle_id
      INNER JOIN course c ON c.id = cc.course_id
      INNER JOIN academic_cycle ac ON ac.id = cc.academic_cycle_id
      WHERE ev.id = ?
      `,
      [evaluationId],
    );

    const accessRows = await ds.query(
      `
      SELECT
        ee.id,
        ee.enrollment_id AS enrollmentId,
        e.user_id AS userId,
        ee.evaluation_id AS evaluationId,
        ee.is_active AS isActive,
        ee.access_start_date AS accessStart,
        ee.access_end_date AS accessEnd,
        et.code AS enrollmentType,
        es.code AS enrollmentStatus
      FROM enrollment_evaluation ee
      INNER JOIN enrollment e ON e.id = ee.enrollment_id
      INNER JOIN enrollment_type et ON et.id = e.enrollment_type_id
      INNER JOIN enrollment_status es ON es.id = e.enrollment_status_id
      WHERE e.user_id = ?
        AND ee.evaluation_id = ?
      ORDER BY ee.id DESC
      `,
      [userId, evaluationId],
    );

    const activeWindowRows = await ds.query(
      `
      SELECT
        COUNT(*) AS activeRows
      FROM enrollment_evaluation ee
      INNER JOIN enrollment e ON e.id = ee.enrollment_id
      INNER JOIN enrollment_status es ON es.id = e.enrollment_status_id
      WHERE e.user_id = ?
        AND ee.evaluation_id = ?
        AND es.code = 'ACTIVE'
        AND ee.is_active = 1
        AND (ee.access_start_date IS NULL OR ee.access_start_date <= NOW())
        AND (ee.access_end_date IS NULL OR ee.access_end_date >= NOW())
      `,
      [userId, evaluationId],
    );

    console.log(
      JSON.stringify(
        {
          evaluationInfo,
          accessRows,
          activeWindowRows,
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
