import {
  IsNotEmpty,
  IsString,
  IsNumberString,
  MaxLength,
  IsIn,
} from 'class-validator';
import { AUDIT_ENTITY_TYPES } from '@modules/audit/interfaces/audit.constants';

export class RequestDeletionDto {
  @IsNotEmpty()
  @IsString()
  @IsIn([AUDIT_ENTITY_TYPES.MATERIAL, AUDIT_ENTITY_TYPES.FOLDER])
  entityType: string;

  @IsNotEmpty()
  @IsNumberString()
  entityId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  reason: string;
}
