import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialFolder } from './domain/material-folder.entity';
import { FolderStatus } from './domain/folder-status.entity';
import { Material } from './domain/material.entity';
import { MaterialStatus } from './domain/material-status.entity';
import { FileResource } from './domain/file-resource.entity';
import { FileVersion } from './domain/file-version.entity';
import { MaterialFolderRepository } from './infrastructure/material-folder.repository';
import { FolderStatusRepository } from './infrastructure/folder-status.repository';
import { MaterialRepository } from './infrastructure/material.repository';
import { MaterialStatusRepository } from './infrastructure/material-status.repository';
import { FileResourceRepository } from './infrastructure/file-resource.repository';
import { FileVersionRepository } from './infrastructure/file-version.repository';
import { MaterialsService } from './application/materials.service';
import { MaterialsController } from './presentation/materials.controller';
import { AuthModule } from '@modules/auth/auth.module';
import { EvaluationsModule } from '@modules/evaluations/evaluations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MaterialFolder,
      FolderStatus,
      Material,
      MaterialStatus,
      FileResource,
      FileVersion,
    ]),
    AuthModule,
    EvaluationsModule,
  ],
  providers: [
    MaterialFolderRepository,
    FolderStatusRepository,
    MaterialRepository,
    MaterialStatusRepository,
    FileResourceRepository,
    FileVersionRepository,
    MaterialsService,
  ],
  controllers: [MaterialsController],
  exports: [
    MaterialFolderRepository,
    FolderStatusRepository,
    MaterialRepository,
    MaterialsService,
  ],
})
export class MaterialsModule {}