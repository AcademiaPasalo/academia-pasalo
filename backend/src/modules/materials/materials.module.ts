import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialsService } from './application/materials.service';
import { MaterialsAdminService } from './application/materials-admin.service';
import { MaterialsController } from './presentation/materials.controller';
import { MaterialFoldersController } from './presentation/material-folders.controller';
import { MaterialsAdminController } from './presentation/materials-admin.controller';
import { MaterialFolder } from './domain/material-folder.entity';
import { Material } from './domain/material.entity';
import { FileResource } from './domain/file-resource.entity';
import { FileVersion } from './domain/file-version.entity';
import { DeletionRequest } from './domain/deletion-request.entity';
import { FolderStatus } from './domain/folder-status.entity';
import { MaterialStatus } from './domain/material-status.entity';
import { DeletionRequestStatus } from './domain/deletion-request-status.entity';

import { MaterialFolderRepository } from './infrastructure/material-folder.repository';
import { MaterialRepository } from './infrastructure/material.repository';
import { FileResourceRepository } from './infrastructure/file-resource.repository';
import { FileVersionRepository } from './infrastructure/file-version.repository';
import { DeletionRequestRepository } from './infrastructure/deletion-request.repository';
import { MaterialCatalogRepository } from './infrastructure/material-catalog.repository';
import { StorageModule } from '@infrastructure/storage/storage.module';
import { EnrollmentsModule } from '@modules/enrollments/enrollments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MaterialFolder,
      Material,
      FileResource,
      FileVersion,
      DeletionRequest,
      FolderStatus,
      MaterialStatus,
      DeletionRequestStatus,
    ]),
    StorageModule,
    EnrollmentsModule,
  ],
  controllers: [
    MaterialsController, 
    MaterialFoldersController,
    MaterialsAdminController
  ],
  providers: [
    MaterialsService,
    MaterialsAdminService,
    MaterialFolderRepository,
    MaterialRepository,
    FileResourceRepository,
    FileVersionRepository,
    DeletionRequestRepository,
    MaterialCatalogRepository,
  ],
  exports: [MaterialsService, MaterialsAdminService],
})
export class MaterialsModule {}
