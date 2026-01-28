import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialFolder } from '@modules/materials/domain/material-folder.entity';
import { FolderStatus } from '@modules/materials/domain/folder-status.entity';
import { Material } from '@modules/materials/domain/material.entity';
import { MaterialStatus } from '@modules/materials/domain/material-status.entity';
import { FileResource } from '@modules/materials/domain/file-resource.entity';
import { FileVersion } from '@modules/materials/domain/file-version.entity';
import { DeletionRequest } from '@modules/materials/domain/deletion-request.entity';
import { DeletionRequestStatus } from '@modules/materials/domain/deletion-request-status.entity';
import { MaterialFolderRepository } from '@modules/materials/infrastructure/material-folder.repository';
import { FolderStatusRepository } from '@modules/materials/infrastructure/folder-status.repository';
import { MaterialRepository } from '@modules/materials/infrastructure/material.repository';
import { MaterialStatusRepository } from '@modules/materials/infrastructure/material-status.repository';
import { FileResourceRepository } from '@modules/materials/infrastructure/file-resource.repository';
import { FileVersionRepository } from '@modules/materials/infrastructure/file-version.repository';
import { DeletionRequestRepository } from '@modules/materials/infrastructure/deletion-request.repository';
import { DeletionRequestStatusRepository } from '@modules/materials/infrastructure/deletion-request-status.repository';
import { MaterialsService } from '@modules/materials/application/materials.service';
import { MaterialFoldersService } from '@modules/materials/application/material-folders.service';
import { MaterialsAdminService } from '@modules/materials/application/materials-admin.service';
import { MaterialsController } from '@modules/materials/presentation/materials.controller';
import { MaterialFoldersController } from '@modules/materials/presentation/material-folders.controller';
import { MaterialsAdminController } from '@modules/materials/presentation/materials-admin.controller';
import { AuthModule } from '@modules/auth/auth.module';
import { EvaluationsModule } from '@modules/evaluations/evaluations.module';
import { EnrollmentsModule } from '@modules/enrollments/enrollments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MaterialFolder,
      FolderStatus,
      Material,
      MaterialStatus,
      FileResource,
      FileVersion,
      DeletionRequest,
      DeletionRequestStatus,
    ]),
    AuthModule,
    EvaluationsModule,
    EnrollmentsModule,
  ],
  providers: [
    MaterialFolderRepository,
    FolderStatusRepository,
    MaterialRepository,
    MaterialStatusRepository,
    FileResourceRepository,
    FileVersionRepository,
    DeletionRequestRepository,
    DeletionRequestStatusRepository,
    MaterialsService,
    MaterialFoldersService,
    MaterialsAdminService,
  ],
  controllers: [MaterialsController, MaterialFoldersController, MaterialsAdminController],
  exports: [
    MaterialFolderRepository,
    FolderStatusRepository,
    MaterialRepository,
    MaterialsService,
    MaterialFoldersService,
    DeletionRequestRepository,
  ],
})
export class MaterialsModule {}