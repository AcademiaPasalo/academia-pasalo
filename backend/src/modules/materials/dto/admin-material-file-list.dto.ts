import { Expose, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class AdminMaterialFileListQueryDto {
  @Expose()
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @Expose()
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @Expose()
  @IsOptional()
  @IsString()
  search?: string;

  @Expose()
  @IsOptional()
  @IsString()
  statusCode?: string;
}

class AdminMaterialFileStatusDto {
  @Expose()
  code: string;

  @Expose()
  name: string;
}

class AdminMaterialFileFolderDto {
  @Expose()
  id: string;

  @Expose()
  name: string;
}

class AdminMaterialFileEvaluationDto {
  @Expose()
  id: string;

  @Expose()
  number: number;

  @Expose()
  evaluationTypeCode: string;

  @Expose()
  evaluationTypeName: string;

  @Expose()
  courseCode: string;

  @Expose()
  courseName: string;

  @Expose()
  academicCycleCode: string;
}

class AdminMaterialFileBinaryDto {
  @Expose()
  resourceId: string;

  @Expose()
  versionId: string;

  @Expose()
  versionNumber: number;

  @Expose()
  originalName: string;

  @Expose()
  mimeType: string;

  @Expose()
  sizeBytes: string;

  @Expose()
  storageProvider: string;
}

class AdminMaterialFileCreatorDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName1: string | null;

  @Expose()
  lastName2: string | null;
}

export class AdminMaterialFileListItemDto {
  @Expose()
  materialId: string;

  @Expose()
  displayName: string;

  @Expose()
  classEventId: string | null;

  @Expose()
  visibleFrom: Date | null;

  @Expose()
  visibleUntil: Date | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date | null;

  @Expose()
  @Type(() => AdminMaterialFileStatusDto)
  status: AdminMaterialFileStatusDto;

  @Expose()
  @Type(() => AdminMaterialFileFolderDto)
  folder: AdminMaterialFileFolderDto;

  @Expose()
  @Type(() => AdminMaterialFileEvaluationDto)
  evaluation: AdminMaterialFileEvaluationDto;

  @Expose()
  @Type(() => AdminMaterialFileBinaryDto)
  file: AdminMaterialFileBinaryDto;

  @Expose()
  @Type(() => AdminMaterialFileCreatorDto)
  createdBy: AdminMaterialFileCreatorDto | null;
}

export class AdminMaterialFileListResponseDto {
  @Expose()
  @Type(() => AdminMaterialFileListItemDto)
  items: AdminMaterialFileListItemDto[];

  @Expose()
  page: number;

  @Expose()
  pageSize: number;

  @Expose()
  totalItems: number;

  @Expose()
  totalPages: number;
}
