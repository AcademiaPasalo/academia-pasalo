import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { technicalSettings } from '@config/technical-settings';
import { EvaluationDriveAccessRepository } from '@modules/media-access/infrastructure/evaluation-drive-access.repository';
import { WorkspaceGroupsService } from '@modules/media-access/application/workspace-groups.service';
import { MEDIA_ACCESS_STAFF_GROUP_METADATA } from '@modules/media-access/domain/media-access.constants';
import { DriveScopeProvisioningService } from '@modules/media-access/application/drive-scope-provisioning.service';

type ReconciliationSummary = {
  scopesProcessed: number;
  scopesWithDrift: number;
  expectedMembersTotal: number;
  actualMembersTotal: number;
  addedMembersTotal: number;
  removedMembersTotal: number;
  staffExpectedMembersTotal: number;
  staffActualMembersTotal: number;
  staffAddedMembersTotal: number;
  staffRemovedMembersTotal: number;
};

type ReconciliationScopeDelta = {
  expectedEmails: string[];
  actualMemberEmails: string[];
  toAdd: string[];
  toRemove: string[];
};

type GroupMember = {
  email?: string;
  role?: string;
};

@Injectable()
export class MediaAccessReconciliationService implements OnApplicationBootstrap {
  private readonly logger = new Logger(MediaAccessReconciliationService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly evaluationDriveAccessRepository: EvaluationDriveAccessRepository,
    private readonly workspaceGroupsService: WorkspaceGroupsService,
    private readonly driveScopeProvisioningService: DriveScopeProvisioningService,
  ) {}

  onApplicationBootstrap(): void {
    // Cron deshabilitado por decision de arquitectura.
    // El fallback queda manual por endpoint admin (por evaluationId).
  }

  async runReconciliation(): Promise<void> {
    const summary = await this.reconcileActiveScopes();
    this.logger.log({
      context: MediaAccessReconciliationService.name,
      message: 'Reconciliación de media access completada',
      ...summary,
    });
  }

  async reconcileActiveScopes(): Promise<ReconciliationSummary> {
    const scopeBatchSize = Math.max(
      1,
      technicalSettings.mediaAccess.reconciliationScopeBatchSize,
    );
    const mutationDelayMs = Math.max(
      0,
      technicalSettings.mediaAccess.reconciliationMutationDelayMs,
    );
    const summary: ReconciliationSummary = {
      scopesProcessed: 0,
      scopesWithDrift: 0,
      expectedMembersTotal: 0,
      actualMembersTotal: 0,
      addedMembersTotal: 0,
      removedMembersTotal: 0,
      staffExpectedMembersTotal: 0,
      staffActualMembersTotal: 0,
      staffAddedMembersTotal: 0,
      staffRemovedMembersTotal: 0,
    };

    const staffDelta = await this.reconcileStaffViewersGroup();
    summary.staffExpectedMembersTotal = staffDelta.expectedCount;
    summary.staffActualMembersTotal = staffDelta.actualCount;
    summary.staffAddedMembersTotal = staffDelta.addedCount;
    summary.staffRemovedMembersTotal = staffDelta.removedCount;

    let lastScopeId = '0';
    let processedBatches = 0;
    const MAX_SCOPE_BATCHES = 100000;
    while (true) {
      processedBatches += 1;
      if (processedBatches > MAX_SCOPE_BATCHES) {
        throw new Error(
          `Safety stop en reconciliación: excedido máximo de lotes (${MAX_SCOPE_BATCHES})`,
        );
      }

      const scopes =
        await this.evaluationDriveAccessRepository.findActiveByIdCursor(
          lastScopeId,
          scopeBatchSize,
        );
      if (scopes.length === 0) {
        break;
      }

      for (const scope of scopes) {
        await this.ensureStaffGroupReaderPermissionForScope(
          scope.driveScopeFolderId,
        );
        const delta = await this.computeScopeDelta(
          scope.evaluationId,
          scope.viewerGroupEmail,
        );

        summary.scopesProcessed += 1;
        summary.expectedMembersTotal += delta.expectedEmails.length;
        summary.actualMembersTotal += delta.actualMemberEmails.length;

        if (delta.toAdd.length > 0 || delta.toRemove.length > 0) {
          summary.scopesWithDrift += 1;
        }

        for (const memberEmail of delta.toAdd) {
          await this.workspaceGroupsService.ensureMemberInGroup({
            groupEmail: scope.viewerGroupEmail,
            memberEmail,
          });
          summary.addedMembersTotal += 1;
          await this.sleep(mutationDelayMs);
        }

        for (const memberEmail of delta.toRemove) {
          await this.workspaceGroupsService.removeMemberFromGroup({
            groupEmail: scope.viewerGroupEmail,
            memberEmail,
          });
          summary.removedMembersTotal += 1;
          await this.sleep(mutationDelayMs);
        }

        this.logger.log({
          context: MediaAccessReconciliationService.name,
          message: 'Reconciliación procesada para scope de evaluación',
          evaluationId: scope.evaluationId,
          scopeId: scope.id,
          expectedMembers: delta.expectedEmails.length,
          actualMembers: delta.actualMemberEmails.length,
          addedMembers: delta.toAdd.length,
          removedMembers: delta.toRemove.length,
        });
      }

      const nextScopeId = String(scopes[scopes.length - 1].id);
      if (nextScopeId === lastScopeId) {
        throw new Error(
          `Safety stop en reconciliación: cursor no avanza (scopeId=${nextScopeId})`,
        );
      }
      lastScopeId = nextScopeId;
    }

    return summary;
  }

  private async computeScopeDelta(
    evaluationId: string,
    groupEmail: string,
  ): Promise<ReconciliationScopeDelta> {
    const expectedEmailSet = await this.resolveExpectedEmailSet(evaluationId);
    const groupMembers =
      await this.workspaceGroupsService.listGroupMembers(groupEmail);
    const normalizedMembers = this.normalizeGroupMembers(groupMembers);
    const actualEmailSet = new Set(
      normalizedMembers.map((member) => member.email || ''),
    );
    const removableEmailSet = new Set(
      normalizedMembers
        .filter((member) => this.isRemovableMemberRole(member.role))
        .map((member) => member.email || ''),
    );

    const toAdd: string[] = [];
    for (const email of expectedEmailSet) {
      if (!actualEmailSet.has(email)) {
        toAdd.push(email);
      }
    }

    const toRemove: string[] = [];
    for (const email of removableEmailSet) {
      if (!expectedEmailSet.has(email)) {
        toRemove.push(email);
      }
    }

    return {
      expectedEmails: Array.from(expectedEmailSet),
      actualMemberEmails: Array.from(actualEmailSet),
      toAdd,
      toRemove,
    };
  }

  private async resolveExpectedEmailSet(
    evaluationId: string,
  ): Promise<Set<string>> {
    const now = new Date();
    const rows = await this.dataSource.query<Array<{ email: string | null }>>(
      `SELECT DISTINCT LOWER(TRIM(u.email)) AS email
       FROM enrollment_evaluation ee
       INNER JOIN enrollment e ON e.id = ee.enrollment_id
       INNER JOIN user u ON u.id = e.user_id
       WHERE ee.evaluation_id = ?
         AND ee.is_active = 1
         AND ee.access_start_date <= ?
         AND ee.access_end_date >= ?
         AND e.cancelled_at IS NULL
         AND u.is_active = 1
         AND u.email IS NOT NULL
         AND TRIM(u.email) <> ''`,
      [evaluationId, now, now],
    );

    const expectedEmailSet = new Set<string>();
    for (const row of rows) {
      const normalizedEmail = String(row.email || '')
        .trim()
        .toLowerCase();
      if (!normalizedEmail) {
        continue;
      }
      expectedEmailSet.add(normalizedEmail);
    }

    return expectedEmailSet;
  }

  async runStaffViewersSyncOnly(): Promise<{
    expectedCount: number;
    actualCount: number;
    addedCount: number;
    removedCount: number;
  }> {
    return await this.reconcileStaffViewersGroup();
  }

  private async reconcileStaffViewersGroup(): Promise<{
    expectedCount: number;
    actualCount: number;
    addedCount: number;
    removedCount: number;
  }> {
    const configuredGroupEmail = this.getConfiguredStaffGroupEmail();
    if (!configuredGroupEmail) {
      return {
        expectedCount: 0,
        actualCount: 0,
        addedCount: 0,
        removedCount: 0,
      };
    }

    const group = await this.workspaceGroupsService.findOrCreateGroup({
      email: configuredGroupEmail,
      name: MEDIA_ACCESS_STAFF_GROUP_METADATA.NAME,
      description: MEDIA_ACCESS_STAFF_GROUP_METADATA.DESCRIPTION,
    });
    const groupEmail = String(group.email || configuredGroupEmail)
      .trim()
      .toLowerCase();

    const expectedEmailSet = await this.resolveExpectedStaffEmailSet();
    const groupMembers =
      await this.workspaceGroupsService.listGroupMembers(groupEmail);
    const normalizedMembers = this.normalizeGroupMembers(groupMembers);
    const actualEmailSet = new Set(
      normalizedMembers.map((member) => member.email || ''),
    );
    const removableEmailSet = new Set(
      normalizedMembers
        .filter((member) => this.isRemovableMemberRole(member.role))
        .map((member) => member.email || ''),
    );

    let addedCount = 0;
    for (const email of expectedEmailSet) {
      if (actualEmailSet.has(email)) {
        continue;
      }
      await this.workspaceGroupsService.ensureMemberInGroup({
        groupEmail,
        memberEmail: email,
      });
      addedCount += 1;
    }

    let removedCount = 0;
    for (const email of removableEmailSet) {
      if (expectedEmailSet.has(email)) {
        continue;
      }
      await this.workspaceGroupsService.removeMemberFromGroup({
        groupEmail,
        memberEmail: email,
      });
      removedCount += 1;
    }

    return {
      expectedCount: expectedEmailSet.size,
      actualCount: actualEmailSet.size,
      addedCount,
      removedCount,
    };
  }

  private async resolveExpectedStaffEmailSet(): Promise<Set<string>> {
    const rows = await this.dataSource.query<Array<{ email: string | null }>>(
      `SELECT DISTINCT LOWER(TRIM(u.email)) AS email
       FROM user u
       INNER JOIN user_role ur ON ur.user_id = u.id
       INNER JOIN role r ON r.id = ur.role_id
       WHERE u.is_active = 1
         AND r.code IN ('ADMIN', 'SUPER_ADMIN')
         AND u.email IS NOT NULL
         AND TRIM(u.email) <> ''`,
    );

    const expectedEmailSet = new Set<string>();
    for (const row of rows) {
      const normalizedEmail = String(row.email || '')
        .trim()
        .toLowerCase();
      if (!normalizedEmail) {
        continue;
      }
      expectedEmailSet.add(normalizedEmail);
    }
    return expectedEmailSet;
  }

  private async ensureStaffGroupReaderPermissionForScope(
    driveScopeFolderId: string | null,
  ): Promise<void> {
    const configuredGroupEmail = this.getConfiguredStaffGroupEmail();
    const normalizedFolderId = String(driveScopeFolderId || '').trim();
    if (!configuredGroupEmail || !normalizedFolderId) {
      return;
    }

    await this.driveScopeProvisioningService.ensureGroupReaderPermission(
      normalizedFolderId,
      configuredGroupEmail,
    );
  }

  private normalizeGroupMembers(members: GroupMember[]): GroupMember[] {
    const deduplicated = new Map<string, GroupMember>();
    for (const member of members) {
      const normalizedEmail = String(member.email || '')
        .trim()
        .toLowerCase();
      if (!normalizedEmail || deduplicated.has(normalizedEmail)) {
        continue;
      }
      deduplicated.set(normalizedEmail, {
        ...member,
        email: normalizedEmail,
      });
    }
    return Array.from(deduplicated.values());
  }

  private isRemovableMemberRole(role?: string): boolean {
    const normalizedRole = String(role || 'MEMBER')
      .trim()
      .toUpperCase();
    return normalizedRole === 'MEMBER';
  }

  private async sleep(ms: number): Promise<void> {
    if (ms <= 0) {
      return;
    }
    await new Promise<void>((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  private getConfiguredStaffGroupEmail(): string {
    return String(
      technicalSettings.mediaAccess.staffViewersGroupEmail ||
        process.env.GOOGLE_WORKSPACE_STAFF_VIEWERS_GROUP_EMAIL ||
        '',
    )
      .trim()
      .toLowerCase();
  }
}
