import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evaluation } from '@modules/evaluations/domain/evaluation.entity';
import { DriveScopeNamingService } from '@modules/media-access/application/drive-scope-naming.service';
import { WorkspaceGroupsService } from '@modules/media-access/application/workspace-groups.service';
import { DriveScopeProvisioningService } from '@modules/media-access/application/drive-scope-provisioning.service';
import { EvaluationDriveAccessRepository } from '@modules/media-access/infrastructure/evaluation-drive-access.repository';
import { EvaluationDriveAccess } from '@modules/media-access/domain/evaluation-drive-access.entity';

@Injectable()
export class EvaluationDriveAccessProvisioningService {
  constructor(
    @InjectRepository(Evaluation)
    private readonly evaluationOrmRepository: Repository<Evaluation>,
    private readonly namingService: DriveScopeNamingService,
    private readonly workspaceGroupsService: WorkspaceGroupsService,
    private readonly driveScopeProvisioningService: DriveScopeProvisioningService,
    private readonly evaluationDriveAccessRepository: EvaluationDriveAccessRepository,
  ) {}

  async provisionByEvaluationId(
    evaluationId: string,
  ): Promise<EvaluationDriveAccess> {
    const normalizedEvaluationId = String(evaluationId || '').trim();
    const evaluation = await this.evaluationOrmRepository.findOne({
      where: { id: normalizedEvaluationId },
    });
    if (!evaluation) {
      throw new NotFoundException(
        'Evaluacion no encontrada para provision Drive',
      );
    }

    const names = this.namingService.buildForEvaluation(normalizedEvaluationId);
    await this.evaluationDriveAccessRepository.upsertByEvaluationId({
      evaluationId: names.evaluationId,
      scopeKey: names.scopeKey,
      viewerGroupEmail: names.viewerGroupEmail,
      driveScopeFolderId: null,
      driveVideosFolderId: null,
      driveDocumentsFolderId: null,
      driveArchivedFolderId: null,
      viewerGroupId: null,
      isActive: false,
    });

    const group = await this.workspaceGroupsService.findOrCreateGroup({
      email: names.viewerGroupEmail,
      name: `Evaluacion ${names.evaluationId} viewers`,
      description: `Acceso viewer para contenido de evaluacion ${names.evaluationId}`,
    });

    const folders = await this.driveScopeProvisioningService.provisionFolders({
      baseFolderName: names.baseFolderName,
      videosFolderName: names.videosFolderName,
      documentsFolderName: names.documentsFolderName,
      archivedFolderName: names.archivedFolderName,
    });

    await this.driveScopeProvisioningService.ensureGroupReaderPermission(
      folders.scopeFolderId,
      names.viewerGroupEmail,
    );

    const persisted =
      await this.evaluationDriveAccessRepository.upsertByEvaluationId({
        evaluationId: names.evaluationId,
        scopeKey: names.scopeKey,
        driveScopeFolderId: folders.scopeFolderId,
        driveVideosFolderId: folders.videosFolderId,
        driveDocumentsFolderId: folders.documentsFolderId,
        driveArchivedFolderId: folders.archivedFolderId,
        viewerGroupEmail: names.viewerGroupEmail,
        viewerGroupId: group.id,
        isActive: true,
      });

    return persisted;
  }
}
