import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { DeletionRequestRepository } from '@modules/materials/infrastructure/deletion-request.repository';
import { DeletionRequestStatusRepository } from '@modules/materials/infrastructure/deletion-request-status.repository';
import { MaterialRepository } from '@modules/materials/infrastructure/material.repository';
import { MaterialStatusRepository } from '@modules/materials/infrastructure/material-status.repository';
import { DeletionRequest } from '@modules/materials/domain/deletion-request.entity';
import { DeletionReviewAction, ReviewDeletionRequestDto } from '@modules/materials/dto/review-deletion-request.dto';
import { StorageService } from '@infrastructure/storage/storage.service';

@Injectable()
export class MaterialsAdminService {
  private readonly logger = new Logger(MaterialsAdminService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly requestRepository: DeletionRequestRepository,
    private readonly requestStatusRepository: DeletionRequestStatusRepository,
    private readonly materialRepository: MaterialRepository,
    private readonly materialStatusRepository: MaterialStatusRepository,
    private readonly storageService: StorageService,
  ) {}

  async findAllPendingRequests(): Promise<DeletionRequest[]> {
    const pendingStatus = await this.requestStatusRepository.findByCode('PENDING');
    if (!pendingStatus) throw new InternalServerErrorException('Configuración corrupta: Estado PENDING faltante');

    return await this.requestRepository.findAllByStatus(pendingStatus.id);
  }

  async reviewRequest(adminId: string, requestId: string, dto: ReviewDeletionRequestDto): Promise<void> {
    const request = await this.requestRepository.findById(requestId);
    if (!request) throw new NotFoundException('Solicitud no encontrada');

    const pendingStatus = await this.requestStatusRepository.findByCode('PENDING');
    if (request.deletionRequestStatusId !== pendingStatus?.id) {
      throw new BadRequestException('Esta solicitud ya fue revisada');
    }

    await this.dataSource.transaction(async (manager) => {
      if (dto.action === DeletionReviewAction.APPROVE) {
        await this.handleApproval(requestId, request.entityId, adminId, manager);
      } else {
        await this.handleRejection(requestId, adminId, manager);
      }
    });

    this.logger.log({
      message: `Solicitud ${dto.action}`,
      requestId,
      adminId,
      entityId: request.entityId,
    });
  }

  private async handleApproval(requestId: string, materialId: string, adminId: string, manager: EntityManager) {
    const approvedStatus = await this.requestStatusRepository.findByCode('APPROVED');
    const archivedMaterialStatus = await this.materialStatusRepository.findByCode('ARCHIVED');
    
    if (!approvedStatus || !archivedMaterialStatus) {
        throw new InternalServerErrorException('Estados de sistema faltantes (APPROVED/ARCHIVED)');
    }

    await manager.getRepository('DeletionRequest').update(requestId, {
      deletionRequestStatusId: approvedStatus.id,
      reviewedById: adminId,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    });

    await manager.getRepository('Material').update(materialId, {
      materialStatusId: archivedMaterialStatus.id,
      visibleUntil: new Date(),
      updatedAt: new Date(),
    });
  }

  private async handleRejection(requestId: string, adminId: string, manager: EntityManager) {
    const rejectedStatus = await this.requestStatusRepository.findByCode('REJECTED');
    if (!rejectedStatus) throw new InternalServerErrorException('Estado REJECTED faltante');

    await manager.getRepository('DeletionRequest').update(requestId, {
      deletionRequestStatusId: rejectedStatus.id,
      reviewedById: adminId,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async hardDeleteMaterial(adminId: string, materialId: string): Promise<void> {
    const material = await this.materialRepository.findById(materialId);
    if (!material) throw new NotFoundException('Material no encontrado');

    const archivedStatus = await this.materialStatusRepository.findByCode('ARCHIVED');
    if (material.materialStatusId !== archivedStatus?.id) {
      throw new BadRequestException('Solo se pueden eliminar físicamente materiales que estén ARCHIVADOS.');
    }

    await this.dataSource.transaction(async (manager) => {
      const material = await manager.getRepository('Material').findOne({ where: { id: materialId } });
      
      await manager.getRepository('Material').delete(materialId);

      if (material && material.fileVersionId) {
        await manager.getRepository('FileVersion').delete(material.fileVersionId);
      }
    });

    this.logger.warn({
      message: 'Material eliminado físicamente (Hard Delete)',
      materialId,
      adminId,
    });
  }
}
