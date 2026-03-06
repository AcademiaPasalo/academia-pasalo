import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@src/app.module';
import { DataSource } from 'typeorm';
import { EvaluationDriveAccessProvisioningService } from '@modules/media-access/application/evaluation-drive-access-provisioning.service';
import { WorkspaceGroupsService } from '@modules/media-access/application/workspace-groups.service';

type ScopeRow = {
  evaluationId: string | number;
  isActive: number | boolean | string | null;
  scopeFolderId: string | null;
  videosFolderId: string | null;
  documentsFolderId: string | null;
  archivedFolderId: string | null;
  viewerGroupEmail: string | null;
  updatedAt: string | null;
};

type ScriptOptions = {
  evaluationIds: string[];
  apply: boolean;
  reconcileMembers: boolean;
  pruneExtraMembers: boolean;
};

function parseArgs(argv: string[]): ScriptOptions {
  const raw = argv.slice(2).map((item) => String(item || '').trim());
  const evaluationIds: string[] = [];
  let apply = false;
  let reconcileMembers = true;
  let pruneExtraMembers = false;

  for (let i = 0; i < raw.length; i += 1) {
    const arg = raw[i];
    if (!arg) continue;

    if (arg === '--help' || arg === '-h') {
      printUsageAndExit(0);
    } else if (arg === '--apply') {
      apply = true;
    } else if (arg === '--no-reconcile-members') {
      reconcileMembers = false;
    } else if (arg === '--prune-extra-members') {
      pruneExtraMembers = true;
    } else if (arg === '--evaluation-id' || arg === '--evaluation') {
      const next = String(raw[i + 1] || '').trim();
      if (!next) {
        throw new Error(`Falta valor para ${arg}`);
      }
      evaluationIds.push(next);
      i += 1;
    } else if (arg.startsWith('--')) {
      throw new Error(`Flag no soportado: ${arg}`);
    } else {
      evaluationIds.push(arg);
    }
  }

  if (!evaluationIds.length) {
    throw new Error(
      'Debes indicar al menos un evaluationId (ej: 117 o --evaluation-id 117)',
    );
  }

  if (pruneExtraMembers && !reconcileMembers) {
    throw new Error(
      'No puedes usar --prune-extra-members junto con --no-reconcile-members',
    );
  }

  return {
    evaluationIds: Array.from(new Set(evaluationIds.map((id) => id.trim()))),
    apply,
    reconcileMembers,
    pruneExtraMembers,
  };
}

function printUsageAndExit(code: number): never {
  console.log(`
Uso:
  npx ts-node -r tsconfig-paths/register scripts/recover-drive-evaluation-scope.ts <evaluationId...> [--apply] [--prune-extra-members]
  npx ts-node -r tsconfig-paths/register scripts/recover-drive-evaluation-scope.ts --evaluation-id 117 --apply

Comportamiento:
  - Por defecto es DRY-RUN (no escribe nada).
  - --apply ejecuta reprovision de carpetas/grupo para la evaluacion.
  - Reconcilia miembros por defecto (agrega faltantes).
  - --prune-extra-members tambien elimina miembros sobrantes del grupo.
  - --no-reconcile-members desactiva reconciliacion de miembros.
`);
  process.exit(code);
}

async function getScopeRow(
  dataSource: DataSource,
  evaluationId: string,
): Promise<ScopeRow | null> {
  const rows = (await dataSource.query(
    `
    SELECT
      eda.evaluation_id AS evaluationId,
      eda.is_active AS isActive,
      eda.drive_scope_folder_id AS scopeFolderId,
      eda.drive_videos_folder_id AS videosFolderId,
      eda.drive_documents_folder_id AS documentsFolderId,
      eda.drive_archived_folder_id AS archivedFolderId,
      eda.viewer_group_email AS viewerGroupEmail,
      eda.updated_at AS updatedAt
    FROM evaluation_drive_access eda
    WHERE eda.evaluation_id = ?
    LIMIT 1
    `,
    [evaluationId],
  )) as ScopeRow[];

  return rows[0] || null;
}

async function getExpectedMemberEmails(
  dataSource: DataSource,
  evaluationId: string,
): Promise<string[]> {
  const rows = (await dataSource.query(
    `
    SELECT DISTINCT LOWER(TRIM(u.email)) AS email
    FROM enrollment_evaluation ee
    INNER JOIN enrollment e ON e.id = ee.enrollment_id
    INNER JOIN user u ON u.id = e.user_id
    WHERE ee.evaluation_id = ?
      AND ee.is_active = 1
      AND ee.access_start_date <= NOW()
      AND ee.access_end_date >= NOW()
      AND e.cancelled_at IS NULL
      AND u.email IS NOT NULL
      AND TRIM(u.email) <> ''
    ORDER BY email ASC
    `,
    [evaluationId],
  )) as Array<{ email: string | null }>;

  return rows
    .map((row) => String(row.email || '').trim().toLowerCase())
    .filter((email) => !!email);
}

function normalizeEmailList(input: Array<{ email?: string }>): string[] {
  return input
    .map((item) => String(item.email || '').trim().toLowerCase())
    .filter((email) => !!email);
}

async function main(): Promise<void> {
  let options: ScriptOptions;
  try {
    options = parseArgs(process.argv);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error de argumentos: ${message}`);
    printUsageAndExit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const dataSource = app.get(DataSource);
    const provisioningService = app.get(EvaluationDriveAccessProvisioningService);
    const workspaceGroupsService = app.get(WorkspaceGroupsService);

    console.log(
      JSON.stringify(
        {
          mode: options.apply ? 'APPLY' : 'DRY_RUN',
          evaluationIds: options.evaluationIds,
          reconcileMembers: options.reconcileMembers,
          pruneExtraMembers: options.pruneExtraMembers,
        },
        null,
        2,
      ),
    );

    for (const evaluationId of options.evaluationIds) {
      console.log('--------------------------------------------------');
      console.log(`[START] evaluationId=${evaluationId}`);

      const exists = (await dataSource.query(
        'SELECT id FROM evaluation WHERE id = ? LIMIT 1',
        [evaluationId],
      )) as Array<{ id: string | number }>;
      if (!exists.length) {
        console.log(`[SKIP] evaluacion no existe: ${evaluationId}`);
        continue;
      }

      const before = await getScopeRow(dataSource, evaluationId);
      console.log(
        `[BEFORE] ${JSON.stringify(before || { evaluationId, scope: null })}`,
      );

      if (!options.apply) {
        console.log('[DRY_RUN] no se ejecutaron cambios');
        continue;
      }

      const persisted =
        await provisioningService.provisionByEvaluationId(evaluationId);
      const after = await getScopeRow(dataSource, evaluationId);
      console.log(
        `[AFTER] ${JSON.stringify(
          after || {
            evaluationId,
            scope: 'persisted-but-query-empty',
          },
        )}`,
      );

      if (!options.reconcileMembers) {
        console.log('[INFO] reconciliacion de miembros desactivada');
        continue;
      }

      const groupEmail = String(persisted.viewerGroupEmail || '')
        .trim()
        .toLowerCase();
      if (!groupEmail) {
        throw new Error(
          `Scope sin viewerGroupEmail despues de provision: ${evaluationId}`,
        );
      }

      const expected = await getExpectedMemberEmails(dataSource, evaluationId);
      const currentMembers = normalizeEmailList(
        await workspaceGroupsService.listGroupMembers(groupEmail),
      );
      const expectedSet = new Set(expected);
      const currentSet = new Set(currentMembers);

      const toAdd = expected.filter((email) => !currentSet.has(email));
      const toRemove = options.pruneExtraMembers
        ? currentMembers.filter((email) => !expectedSet.has(email))
        : [];

      for (const email of toAdd) {
        await workspaceGroupsService.ensureMemberInGroup({
          groupEmail,
          memberEmail: email,
        });
      }
      for (const email of toRemove) {
        await workspaceGroupsService.removeMemberFromGroup({
          groupEmail,
          memberEmail: email,
        });
      }

      console.log(
        JSON.stringify(
          {
            evaluationId,
            groupEmail,
            expectedMembers: expected.length,
            currentMembers: currentMembers.length,
            added: toAdd.length,
            removed: toRemove.length,
            pruneApplied: options.pruneExtraMembers,
          },
          null,
          2,
        ),
      );
    }
  } finally {
    await app.close();
  }
}

void main();
