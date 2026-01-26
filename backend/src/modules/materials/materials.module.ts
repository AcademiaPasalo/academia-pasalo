import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialFolder } from '@modules/materials/domain/material-folder.entity';
import { FolderStatus } from '@modules/materials/domain/folder-status.entity';
import { MaterialFolderRepository } from '@modules/materials/infrastructure/material-folder.repository';
import { FolderStatusRepository } from '@modules/materials/infrastructure/folder-status.repository';
import { MaterialsService } from '@modules/materials/application/materials.service';
import { MaterialsController } from '@modules/materials/presentation/materials.controller';
import { AuthModule } from '@modules/auth/auth.module';
import { EvaluationsModule } from '@modules/evaluations/evaluations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MaterialFolder, FolderStatus]),
    AuthModule,
    EvaluationsModule,
  ],
  providers: [
    MaterialFolderRepository,
    FolderStatusRepository,
    MaterialsService,
  ],
  controllers: [MaterialsController],
  exports: [
    MaterialFolderRepository,
    FolderStatusRepository,
    MaterialsService,
  ],
})
export class MaterialsModule {}
