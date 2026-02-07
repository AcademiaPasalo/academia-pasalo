import {
  IsNotEmpty,
  IsString,
  IsNumberString,
  MaxLength,
  IsIn,
} from 'class-validator';

export class RequestDeletionDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['material', 'folder'])
  entityType: 'material' | 'folder';

  @IsNotEmpty()
  @IsNumberString()
  entityId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  reason: string;
}
