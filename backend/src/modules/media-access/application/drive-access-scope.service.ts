import { Injectable } from '@nestjs/common';
import { EvaluationDriveAccessRepository } from '@modules/media-access/infrastructure/evaluation-drive-access.repository';
import {
  DriveEvaluationScopeNames,
  DriveScopeNamingService,
} from '@modules/media-access/application/drive-scope-naming.service';
import { EvaluationDriveAccess } from '@modules/media-access/domain/evaluation-drive-access.entity';

export type DriveEvaluationScopeResolution = {
  names: DriveEvaluationScopeNames;
  persisted: EvaluationDriveAccess | null;
};

@Injectable()
export class DriveAccessScopeService {
  constructor(
    private readonly namingService: DriveScopeNamingService,
    private readonly repository: EvaluationDriveAccessRepository,
  ) {}

  async resolveForEvaluation(
    evaluationId: string,
  ): Promise<DriveEvaluationScopeResolution> {
    const names = this.namingService.buildForEvaluation(evaluationId);
    const persisted = await this.repository.findByEvaluationId(
      names.evaluationId,
    );
    return { names, persisted };
  }
}
