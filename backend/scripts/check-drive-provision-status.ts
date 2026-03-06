import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@src/app.module';
import { DataSource } from 'typeorm';

async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  try {
    const dataSource = app.get(DataSource);

    const totalEvaluationsRows = (await dataSource.query(
      'SELECT COUNT(*) AS total FROM evaluation',
    )) as Array<{ total: number }>;
    const totalEvaluations = Number(totalEvaluationsRows[0]?.total ?? 0);

    const targetEvaluationsRows = (await dataSource.query(`
      SELECT COUNT(*) AS total
      FROM evaluation ev
      INNER JOIN course_cycle cc ON cc.id = ev.course_cycle_id
      INNER JOIN course c ON c.id = cc.course_id
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
    `)) as Array<{ total: number }>;
    const targetEvaluations = Number(targetEvaluationsRows[0]?.total ?? 0);

    const provisionedRows = (await dataSource.query(`
      SELECT COUNT(*) AS total
      FROM evaluation_drive_access eda
      INNER JOIN evaluation ev ON ev.id = eda.evaluation_id
      INNER JOIN course_cycle cc ON cc.id = ev.course_cycle_id
      INNER JOIN course c ON c.id = cc.course_id
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
        AND eda.is_active = 1
        AND eda.drive_scope_folder_id IS NOT NULL
        AND eda.drive_videos_folder_id IS NOT NULL
        AND eda.drive_documents_folder_id IS NOT NULL
        AND eda.drive_archived_folder_id IS NOT NULL
        AND eda.viewer_group_email IS NOT NULL
    `)) as Array<{ total: number }>;
    const provisioned = Number(provisionedRows[0]?.total ?? 0);

    const sampleRows = (await dataSource.query(`
      SELECT
        ev.id AS evaluationId,
        c.code AS courseCode,
        ac.code AS cycleCode,
        eda.viewer_group_email AS viewerGroupEmail,
        eda.drive_scope_folder_id AS scopeFolderId,
        eda.drive_videos_folder_id AS videosFolderId,
        eda.drive_documents_folder_id AS documentsFolderId,
        eda.drive_archived_folder_id AS archivedFolderId
      FROM evaluation ev
      INNER JOIN course_cycle cc ON cc.id = ev.course_cycle_id
      INNER JOIN course c ON c.id = cc.course_id
      INNER JOIN academic_cycle ac ON ac.id = cc.academic_cycle_id
      LEFT JOIN evaluation_drive_access eda ON eda.evaluation_id = ev.id
      WHERE c.code IN ('MATE101', 'MATE102', 'FIS101', 'QUI101')
        AND cc.academic_cycle_id = COALESCE(
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
      ORDER BY ev.id ASC
      LIMIT 10
    `)) as Array<Record<string, unknown>>;

    console.log(
      JSON.stringify(
        {
          totalEvaluations,
          targetEvaluations,
          provisioned,
          pending: Math.max(targetEvaluations - provisioned, 0),
          sample: sampleRows,
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
