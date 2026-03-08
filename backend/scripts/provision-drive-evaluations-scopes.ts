import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@src/app.module';
import { DataSource } from 'typeorm';
import { EvaluationDriveAccessProvisioningService } from '@modules/media-access/application/evaluation-drive-access-provisioning.service';

type EvaluationRow = { id: string | number };

async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const dataSource = app.get(DataSource);
    const provisioningService = app.get(EvaluationDriveAccessProvisioningService);

    const evaluations = (await dataSource.query(
      `
      SELECT DISTINCT ev.id
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
      ORDER BY ev.id ASC
      `,
    )) as EvaluationRow[];

    if (!evaluations.length) {
      console.log('No se encontraron evaluaciones objetivo para provisionar.');
      return;
    }

    let ok = 0;
    let failed = 0;
    const failures: string[] = [];

    console.log(`Evaluaciones detectadas: ${evaluations.length}`);

    for (const row of evaluations) {
      const evaluationId = String(row.id);
      try {
        const provisioned =
          await provisioningService.provisionByEvaluationId(evaluationId);

        ok += 1;
        console.log(
          `[OK] evaluationId=${evaluationId} group=${provisioned.viewerGroupEmail} scopeFolder=${provisioned.driveScopeFolderId}`,
        );
      } catch (error) {
        failed += 1;
        const message = error instanceof Error ? error.message : String(error);
        const failure = `[ERROR] evaluationId=${evaluationId} -> ${message}`;
        failures.push(failure);
        console.error(failure);
      }
    }

    console.log('----------------------------------------');
    console.log(`Provision scopes completada. OK=${ok} FAIL=${failed}`);
    if (failures.length) {
      console.log('Errores:');
      for (const item of failures) {
        console.log(item);
      }
      process.exitCode = 1;
    }
  } finally {
    await app.close();
  }
}

void main();
