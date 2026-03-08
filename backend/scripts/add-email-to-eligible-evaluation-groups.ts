import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@src/app.module';
import { DataSource } from 'typeorm';
import { WorkspaceGroupsService } from '@modules/media-access/application/workspace-groups.service';

type GroupRow = {
  evaluationId: string | number;
  viewerGroupEmail: string | null;
};

async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  try {
    const dataSource = app.get(DataSource);
    const workspaceGroupsService = app.get(WorkspaceGroupsService);

    const userId = Number(process.argv[2] || '1');
    const memberEmail = String(process.argv[3] || '').trim().toLowerCase();

    if (!Number.isInteger(userId) || userId <= 0) {
      throw new Error('userId invalido');
    }
    if (!memberEmail) {
      throw new Error(
        'Uso: npx ts-node -r tsconfig-paths/register scripts/add-email-to-eligible-evaluation-groups.ts <userId> <memberEmail>',
      );
    }

    const eligibleRows = (await dataSource.query(
      `
        SELECT DISTINCT
          ee.evaluation_id AS evaluationId,
          LOWER(TRIM(eda.viewer_group_email)) AS viewerGroupEmail
        FROM enrollment_evaluation ee
        INNER JOIN enrollment e
          ON e.id = ee.enrollment_id
        INNER JOIN enrollment_status es
          ON es.id = e.enrollment_status_id
        INNER JOIN evaluation_drive_access eda
          ON eda.evaluation_id = ee.evaluation_id
         AND eda.is_active = 1
        WHERE e.user_id = ?
          AND es.code = 'ACTIVE'
          AND e.cancelled_at IS NULL
          AND ee.is_active = 1
          AND ee.access_start_date <= NOW()
          AND ee.access_end_date >= NOW()
          AND eda.viewer_group_email IS NOT NULL
          AND TRIM(eda.viewer_group_email) <> ''
        ORDER BY ee.evaluation_id ASC
      `,
      [userId],
    )) as GroupRow[];

    const eligibleGroups = Array.from(
      new Set(
        eligibleRows
          .map((row) => String(row.viewerGroupEmail || '').trim().toLowerCase())
          .filter((email) => !!email),
      ),
    );

    let ensured = 0;
    for (const groupEmail of eligibleGroups) {
      await workspaceGroupsService.ensureMemberInGroup({
        groupEmail,
        memberEmail,
      });
      ensured += 1;
    }

    console.log(
      JSON.stringify(
        {
          mode: 'add-only',
          userId,
          memberEmail,
          eligibleGroupsCount: eligibleGroups.length,
          operationsEnsureMember: ensured,
          eligibleGroups,
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
