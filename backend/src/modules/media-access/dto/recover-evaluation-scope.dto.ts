import { IsBoolean, IsOptional } from 'class-validator';

export class RecoverEvaluationScopeDto {
  @IsOptional()
  @IsBoolean()
  reconcileMembers?: boolean;

  @IsOptional()
  @IsBoolean()
  pruneExtraMembers?: boolean;
}
