import { IsEnum, IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';

export enum DeletionReviewAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export class ReviewDeletionRequestDto {
  @IsEnum(DeletionReviewAction)
  @IsNotEmpty()
  action: DeletionReviewAction;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  adminComment?: string;
}
