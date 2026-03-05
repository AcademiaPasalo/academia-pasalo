import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { EvaluationDriveAccess } from '@modules/media-access/domain/evaluation-drive-access.entity';

@Injectable()
export class EvaluationDriveAccessRepository {
  constructor(
    @InjectRepository(EvaluationDriveAccess)
    private readonly ormRepository: Repository<EvaluationDriveAccess>,
  ) {}

  async findByEvaluationId(
    evaluationId: string,
  ): Promise<EvaluationDriveAccess | null> {
    return await this.ormRepository.findOne({ where: { evaluationId } });
  }

  async findActiveByIdCursor(
    afterId: string,
    limit: number,
  ): Promise<EvaluationDriveAccess[]> {
    return await this.ormRepository
      .createQueryBuilder('eda')
      .where('eda.isActive = :isActive', { isActive: true })
      .andWhere('eda.id > :afterId', { afterId })
      .orderBy('eda.id', 'ASC')
      .limit(limit)
      .getMany();
  }

  async upsertByEvaluationId(
    payload: {
      evaluationId: string;
      scopeKey: string;
      viewerGroupEmail: string;
      driveScopeFolderId?: string | null;
      driveVideosFolderId?: string | null;
      driveDocumentsFolderId?: string | null;
      driveArchivedFolderId?: string | null;
      viewerGroupId?: string | null;
      isActive?: boolean;
    },
    manager?: EntityManager,
  ): Promise<EvaluationDriveAccess> {
    const repo = manager
      ? manager.getRepository(EvaluationDriveAccess)
      : this.ormRepository;

    const now = new Date();
    const existing = await repo.findOne({
      where: { evaluationId: payload.evaluationId },
    });

    if (existing) {
      existing.scopeKey = payload.scopeKey;
      existing.viewerGroupEmail = payload.viewerGroupEmail;
      existing.driveScopeFolderId = payload.driveScopeFolderId ?? null;
      existing.driveVideosFolderId = payload.driveVideosFolderId ?? null;
      existing.driveDocumentsFolderId = payload.driveDocumentsFolderId ?? null;
      existing.driveArchivedFolderId = payload.driveArchivedFolderId ?? null;
      existing.viewerGroupId = payload.viewerGroupId ?? null;
      existing.isActive = payload.isActive ?? true;
      existing.updatedAt = now;
      return await repo.save(existing);
    }

    const created = repo.create({
      evaluationId: payload.evaluationId,
      scopeKey: payload.scopeKey,
      viewerGroupEmail: payload.viewerGroupEmail,
      driveScopeFolderId: payload.driveScopeFolderId ?? null,
      driveVideosFolderId: payload.driveVideosFolderId ?? null,
      driveDocumentsFolderId: payload.driveDocumentsFolderId ?? null,
      driveArchivedFolderId: payload.driveArchivedFolderId ?? null,
      viewerGroupId: payload.viewerGroupId ?? null,
      isActive: payload.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    });
    try {
      return await repo.save(created);
    } catch (error) {
      if (!this.isDuplicateEntryError(error)) {
        throw error;
      }

      // Carrera entre workers: otro proceso insertó primero, se convierte en update.
      const concurrent = await repo.findOne({
        where: { evaluationId: payload.evaluationId },
      });
      if (!concurrent) {
        throw error;
      }

      concurrent.scopeKey = payload.scopeKey;
      concurrent.viewerGroupEmail = payload.viewerGroupEmail;
      concurrent.driveScopeFolderId = payload.driveScopeFolderId ?? null;
      concurrent.driveVideosFolderId = payload.driveVideosFolderId ?? null;
      concurrent.driveDocumentsFolderId =
        payload.driveDocumentsFolderId ?? null;
      concurrent.driveArchivedFolderId = payload.driveArchivedFolderId ?? null;
      concurrent.viewerGroupId = payload.viewerGroupId ?? null;
      concurrent.isActive = payload.isActive ?? true;
      concurrent.updatedAt = now;

      return await repo.save(concurrent);
    }
  }

  private isDuplicateEntryError(error: unknown): boolean {
    const maybeError = error as {
      code?: string;
      errno?: number;
      driverError?: { code?: string; errno?: number };
    };
    const code = maybeError.driverError?.code ?? maybeError.code;
    const errno = maybeError.driverError?.errno ?? maybeError.errno;
    return code === 'ER_DUP_ENTRY' || errno === 1062;
  }
}
