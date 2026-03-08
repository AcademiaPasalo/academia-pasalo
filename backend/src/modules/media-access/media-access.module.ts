import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { EvaluationDriveAccess } from '@modules/media-access/domain/evaluation-drive-access.entity';
import { Evaluation } from '@modules/evaluations/domain/evaluation.entity';
import { User } from '@modules/users/domain/user.entity';
import { DriveScopeNamingService } from '@modules/media-access/application/drive-scope-naming.service';
import { DriveAccessScopeService } from '@modules/media-access/application/drive-access-scope.service';
import { EvaluationDriveAccessRepository } from '@modules/media-access/infrastructure/evaluation-drive-access.repository';
import { WorkspaceGroupsService } from '@modules/media-access/application/workspace-groups.service';
import { DriveScopeProvisioningService } from '@modules/media-access/application/drive-scope-provisioning.service';
import { EvaluationDriveAccessProvisioningService } from '@modules/media-access/application/evaluation-drive-access-provisioning.service';
import { MediaAccessMembershipDispatchService } from '@modules/media-access/application/media-access-membership-dispatch.service';
import { MediaAccessReconciliationService } from '@modules/media-access/application/media-access-reconciliation.service';
import { MediaAccessMembershipProcessor } from '@modules/media-access/infrastructure/processors/media-access-membership.processor';
import { QUEUES } from '@infrastructure/queue/queue.constants';
import { MediaAccessAdminController } from '@modules/media-access/presentation/media-access-admin.controller';
import { CourseCycleDriveProvisioningService } from '@modules/media-access/application/course-cycle-drive-provisioning.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([EvaluationDriveAccess, Evaluation, User]),
    BullModule.registerQueue({ name: QUEUES.MEDIA_ACCESS }),
  ],
  controllers: [MediaAccessAdminController],
  providers: [
    DriveScopeNamingService,
    DriveAccessScopeService,
    EvaluationDriveAccessRepository,
    WorkspaceGroupsService,
    DriveScopeProvisioningService,
    EvaluationDriveAccessProvisioningService,
    CourseCycleDriveProvisioningService,
    MediaAccessMembershipDispatchService,
    MediaAccessReconciliationService,
    MediaAccessMembershipProcessor,
  ],
  exports: [
    DriveScopeNamingService,
    DriveAccessScopeService,
    EvaluationDriveAccessRepository,
    WorkspaceGroupsService,
    DriveScopeProvisioningService,
    EvaluationDriveAccessProvisioningService,
    CourseCycleDriveProvisioningService,
    MediaAccessMembershipDispatchService,
    MediaAccessReconciliationService,
  ],
})
export class MediaAccessModule {}
