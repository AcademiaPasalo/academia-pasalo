import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@src/app.module';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { WorkspaceGroupsService } from '@modules/media-access/application/workspace-groups.service';

type UserRow = {
  userId: string | number;
  email: string | null;
  isActive: number | string;
};

type CourseCycleRow = {
  courseCycleId: string | number;
};

type EvaluationGroupRow = {
  viewerGroupEmail: string | null;
};

async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  try {
    const dataSource = app.get(DataSource);
    const configService = app.get(ConfigService);
    const workspaceGroupsService = app.get(WorkspaceGroupsService);

    const targetEmail = 'docentepasalo@gmail.com';
    const workspaceDomain = String(
      configService.get<string>('GOOGLE_WORKSPACE_GROUP_DOMAIN', '') || '',
    )
      .trim()
      .toLowerCase();

    if (!workspaceDomain) {
      throw new Error('Falta GOOGLE_WORKSPACE_GROUP_DOMAIN en .env');
    }

    const userRows = (await dataSource.query(
      `
        SELECT
          u.id AS userId,
          LOWER(TRIM(u.email)) AS email,
          u.is_active AS isActive
        FROM user u
        WHERE LOWER(TRIM(u.email)) = ?
        LIMIT 1
      `,
      [targetEmail],
    )) as UserRow[];

    const user = userRows[0];
    if (!user) {
      throw new Error(`No existe usuario para email=${targetEmail}`);
    }
    if (Number(user.isActive) !== 1) {
      throw new Error(`El usuario ${targetEmail} no esta activo`);
    }

    const courseCycleRows = (await dataSource.query(
      `
        SELECT DISTINCT ccp.course_cycle_id AS courseCycleId
        FROM course_cycle_professor ccp
        WHERE ccp.professor_user_id = ?
          AND ccp.revoked_at IS NULL
        ORDER BY ccp.course_cycle_id ASC
      `,
      [user.userId],
    )) as CourseCycleRow[];

    const courseCycleIds = courseCycleRows
      .map((row) => String(row.courseCycleId || '').trim())
      .filter((id) => /^\d+$/.test(id));

    if (courseCycleIds.length === 0) {
      console.log(
        JSON.stringify(
          {
            targetEmail,
            userId: String(user.userId),
            courseCycleIds: [],
            ensuredGroups: [],
            ensuredCount: 0,
            message: 'El profesor no tiene asignaciones activas en course_cycle_professor',
          },
          null,
          2,
        ),
      );
      return;
    }

    const courseCycleViewerGroups = courseCycleIds.map(
      (courseCycleId) => `cc-${courseCycleId}-viewers@${workspaceDomain}`,
    );

    const placeholders = courseCycleIds.map(() => '?').join(', ');
    const evaluationRows = (await dataSource.query(
      `
        SELECT DISTINCT LOWER(TRIM(eda.viewer_group_email)) AS viewerGroupEmail
        FROM evaluation e
        INNER JOIN evaluation_drive_access eda
          ON eda.evaluation_id = e.id
         AND eda.is_active = 1
        WHERE e.course_cycle_id IN (${placeholders})
          AND eda.viewer_group_email IS NOT NULL
          AND TRIM(eda.viewer_group_email) <> ''
      `,
      courseCycleIds,
    )) as EvaluationGroupRow[];

    const evaluationViewerGroups = evaluationRows
      .map((row) => String(row.viewerGroupEmail || '').trim().toLowerCase())
      .filter((email) => email.length > 0);

    const allGroups = Array.from(
      new Set([...courseCycleViewerGroups, ...evaluationViewerGroups]),
    ).sort();

    const ensuredGroups: string[] = [];
    const failedGroups: Array<{ groupEmail: string; error: string }> = [];
    for (const groupEmail of allGroups) {
      try {
        await workspaceGroupsService.ensureMemberInGroup({
          groupEmail,
          memberEmail: targetEmail,
        });
        ensuredGroups.push(groupEmail);
      } catch (error) {
        failedGroups.push({
          groupEmail,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    console.log(
      JSON.stringify(
        {
          targetEmail,
          userId: String(user.userId),
          courseCycleIds,
          courseCycleViewerGroups,
          evaluationViewerGroupsCount: evaluationViewerGroups.length,
          allGroupsCount: allGroups.length,
          ensuredCount: ensuredGroups.length,
          failedCount: failedGroups.length,
          failedGroups,
        },
        null,
        2,
      ),
    );

    if (failedGroups.length > 0) {
      throw new Error(
        `No se pudo sincronizar ${failedGroups.length} grupos para ${targetEmail}`,
      );
    }
  } finally {
    await app.close();
  }
}

void main();

