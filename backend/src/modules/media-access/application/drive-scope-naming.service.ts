import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MEDIA_ACCESS_DRIVE_FOLDERS } from '@modules/media-access/domain/media-access.constants';

export type DriveEvaluationScopeNames = {
  evaluationId: string;
  scopeKey: string;
  parentFolderNames: string[];
  baseFolderName: string;
  videosFolderName: string;
  documentsFolderName: string;
  archivedFolderName: string;
  viewerGroupEmail: string;
};

export type DriveEvaluationScopeNamingContext = {
  evaluationId: string;
  courseCycleId: string;
  courseCode: string;
  cycleCode: string;
  evaluationTypeCode: string;
  evaluationNumber: number;
};

@Injectable()
export class DriveScopeNamingService {
  constructor(private readonly configService: ConfigService) {}

  buildForEvaluation(
    contextOrEvaluationId: DriveEvaluationScopeNamingContext | string,
  ): DriveEvaluationScopeNames {
    if (typeof contextOrEvaluationId === 'string') {
      const normalizedEvaluationId = this.normalizeNumericId(
        contextOrEvaluationId,
        'evaluationId',
      );
      const workspaceDomain = this.getWorkspaceGroupDomain();
      return {
        evaluationId: normalizedEvaluationId,
        scopeKey: `ev_${normalizedEvaluationId}`,
        parentFolderNames: [MEDIA_ACCESS_DRIVE_FOLDERS.EVALUATIONS_PARENT],
        baseFolderName: `ev_${normalizedEvaluationId}`,
        videosFolderName: MEDIA_ACCESS_DRIVE_FOLDERS.EVALUATION_VIDEOS,
        documentsFolderName: MEDIA_ACCESS_DRIVE_FOLDERS.EVALUATION_DOCUMENTS,
        archivedFolderName: MEDIA_ACCESS_DRIVE_FOLDERS.EVALUATION_ARCHIVED,
        viewerGroupEmail: `ev-${normalizedEvaluationId}-viewers@${workspaceDomain}`,
      };
    }

    const context = contextOrEvaluationId;
    const normalizedEvaluationId = this.normalizeNumericId(
      context.evaluationId,
      'evaluationId',
    );
    const normalizedCourseCycleId = this.normalizeNumericId(
      context.courseCycleId,
      'courseCycleId',
    );
    const normalizedCourseCode = this.normalizeToken(
      context.courseCode,
      'courseCode',
    );
    const normalizedCycleCode = this.normalizeToken(
      context.cycleCode,
      'cycleCode',
    );
    const normalizedEvaluationTypeCode = this.normalizeToken(
      context.evaluationTypeCode,
      'evaluationTypeCode',
    );
    const normalizedEvaluationNumber = this.normalizeEvaluationNumber(
      context.evaluationNumber,
    );
    const workspaceDomain = this.getWorkspaceGroupDomain();

    const courseCycleFolderName = `cc_${normalizedCourseCycleId}_${normalizedCourseCode}`;
    const evaluationFolderName = `ev_${normalizedEvaluationId}_${normalizedEvaluationTypeCode}${normalizedEvaluationNumber}`;

    return {
      evaluationId: normalizedEvaluationId,
      scopeKey: `ev_${normalizedEvaluationId}`,
      parentFolderNames: [
        MEDIA_ACCESS_DRIVE_FOLDERS.EVALUATIONS_PARENT,
        normalizedCycleCode,
        courseCycleFolderName,
      ],
      baseFolderName: evaluationFolderName,
      videosFolderName: MEDIA_ACCESS_DRIVE_FOLDERS.EVALUATION_VIDEOS,
      documentsFolderName: MEDIA_ACCESS_DRIVE_FOLDERS.EVALUATION_DOCUMENTS,
      archivedFolderName: MEDIA_ACCESS_DRIVE_FOLDERS.EVALUATION_ARCHIVED,
      viewerGroupEmail: `ev-${normalizedEvaluationId}-viewers@${workspaceDomain}`,
    };
  }

  private normalizeNumericId(raw: string, fieldName: string): string {
    const normalized = String(raw || '').trim();
    if (!/^\d+$/.test(normalized)) {
      throw new InternalServerErrorException(
        `${fieldName} invalido para naming de Drive`,
      );
    }
    return normalized;
  }

  private normalizeEvaluationNumber(value: number): number {
    if (!Number.isInteger(value) || value < 0) {
      throw new InternalServerErrorException(
        'evaluationNumber invalido para naming de Drive',
      );
    }
    return value;
  }

  private normalizeToken(raw: string, fieldName: string): string {
    const normalized = String(raw || '').trim();
    if (!normalized) {
      throw new InternalServerErrorException(
        `${fieldName} vacio para naming de Drive`,
      );
    }
    const safe = normalized.replace(/[^A-Za-z0-9_-]/g, '-');
    return safe.replace(/-+/g, '-');
  }

  private getWorkspaceGroupDomain(): string {
    const domain = (
      this.configService.get<string>('GOOGLE_WORKSPACE_GROUP_DOMAIN', '') || ''
    )
      .trim()
      .toLowerCase();

    if (!domain) {
      throw new InternalServerErrorException(
        'Falta GOOGLE_WORKSPACE_GROUP_DOMAIN en configuracion',
      );
    }

    return domain;
  }
}
